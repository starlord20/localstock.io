// /lib/bestbuy-api.ts
const BESTBUY_API_KEY = process.env.BESTBUY_API_KEY || process.env.NEXT_PUBLIC_BESTBUY_API_KEY;
const BESTBUY_BASE_URL_STORES = "https://api.bestbuy.com/v1/stores";
const BESTBUY_BASE_URL_PRODUCTS = "https://api.bestbuy.com/v1/products";

interface BestBuyProduct {
	sku: number;
	name: string;
	regularPrice: number;
	salePrice: number;
	image: string;
	inStoreAvailability: boolean;
	storeDistance?: number;
}

async function delay(ms: number) {
	return new Promise((res) => setTimeout(res, ms));
}

async function fetchWithRetry(input: RequestInfo, init?: RequestInit, maxRetries = 5) {
	let attempt = 0;
	let lastErr: unknown = null;
	while (attempt < maxRetries) {
		try {
			const resp = await fetch(input, init);
			if (resp.ok) return resp;

			// If we hit Best Buy rate limit, they return 403 — retry with backoff
			if (resp.status === 403) {
				const text = await resp.text();
				lastErr = new Error(`403: ${text.slice(0, 200)}`);
				// exponential backoff with jitter
				const backoff = Math.min(1000 * Math.pow(2, attempt), 5000);
				const jitter = Math.floor(Math.random() * 200);
				await delay(backoff + jitter);
				attempt++;
				continue;
			}

			// For other 5xx errors, also retry
			if (resp.status >= 500 && resp.status < 600) {
				const backoff = Math.min(500 * Math.pow(2, attempt), 3000);
				await delay(backoff);
				attempt++;
				continue;
			}

			return resp;
		} catch (e) {
			lastErr = e;
			const backoff = Math.min(200 * Math.pow(2, attempt), 2000);
			await delay(backoff);
			attempt++;
			continue;
		}
	}
	throw lastErr;
}

// Optional Redis integration (activated when REDIS_URL env var is present)
let redisClient: any = null;
async function initRedis() {
	if (redisClient) return redisClient;
	const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;
	if (!redisUrl) return null;
	try {
		// lazy-require to avoid dev machines without dependency
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const IORedis = require('ioredis');
		redisClient = new IORedis(redisUrl);
		// ignore errors silently (fallback to in-memory)
		redisClient.on('error', (err: any) => { console.warn('Redis error:', err && err.message ? err.message : err); });
		return redisClient;
	} catch (e) {
		console.warn('ioredis not installed or failed to initialize; falling back to in-memory cache. Install with `npm i ioredis` to enable Redis-backed caching.');
		return null;
	}
}

async function redisGetJson(key: string) {
	try {
		const r = await initRedis();
		if (!r) return null;
		const v = await r.get(key);
		return v ? JSON.parse(v) : null;
	} catch (e) {
		return null;
	}
}

async function redisSetJson(key: string, value: any, ttlMs: number) {
	try {
		const r = await initRedis();
		if (!r) return;
		await r.set(key, JSON.stringify(value), 'PX', ttlMs);
	} catch (e) {
		// noop
	}
}

async function ensureRateAllowed(limitPerSecond: number) {
	const r = await initRedis();
	if (!r) return; // transient fallback: no rate enforcement without redis
	const maxWaitMs = 3000; // cap waiting to avoid hanging
	const start = Date.now();
	while (true) {
		const nowSec = Math.floor(Date.now() / 1000);
		const key = `bestbuy:rate:${nowSec}`;
		// INCR the counter atomically
		const count = await r.incr(key);
		if (count === 1) {
			// set a short TTL to expire the bucket key (2 seconds)
			await r.expire(key, 2);
		}
		if (count <= limitPerSecond) return; // allowed
		// otherwise wait a little and retry until next second or timeout
		const elapsed = Date.now() - start;
		if (elapsed > maxWaitMs) throw new Error('RateLimitExceeded: could not obtain slot within timeout');
		// sleep until next 100ms tick
		await delay(100 + Math.floor(Math.random() * 50));
	}
}

/**
 * Searches the Best Buy API for products near a given location.
 * Uses SKU batching (`sku in(...)`) and retry/backoff to mitigate rate limits.
 */
export async function searchLocalStock(
	query: string,
	zipCode: string,
	page = 1
): Promise<{ products: BestBuyProduct[]; page: number }> {
	if (!BESTBUY_API_KEY) {
		console.error("Best Buy API Key is missing. Check Vercel environment variables.");
		throw new Error("API Key configuration error.");
	}

	const locationFilter = `area(${zipCode},5)`; // 5-mile radius
	const PAGE_SIZE = 10;
	const FILTER_WORDS = ["applecare", "apple care"];

	// Very small in-memory cache to reduce duplicate identical requests during short dev runs
	const CACHE_TTL_MS = 60 * 1000; // 1 minute
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const globalAny: any = globalThis as any;
	if (!globalAny.__bb_cache) globalAny.__bb_cache = new Map<string, { ts: number; value: any }>();
	const cacheKey = `${query}|${zipCode}|${page}`;
	const cached = globalAny.__bb_cache.get(cacheKey);
	if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
		return { products: cached.value.products, page };
	}
	// Try Redis cache if available
	try {
		const rVal = await redisGetJson(cacheKey);
		if (rVal && rVal.value && Date.now() - rVal.ts < CACHE_TTL_MS) {
			globalAny.__bb_cache.set(cacheKey, { ts: rVal.ts, value: rVal.value });
			return { products: rVal.value.products, page };
		}
	} catch (e) {
		// ignore
	}

	// Gather candidate SKUs with a small number of product-search requests (sequential, small delay)
	const maxProductPages = 3;
	const candidateSkus: number[] = [];
	const showFields = [
		'accessories.sku','addToCartUrl','bestSellingRank','categoryPath.id','categoryPath.name','color','condition','customerReviewAverage','customerReviewCount','description','details.name','details.value','dollarSavings','features.feature','freeShipping','frequentlyPurchasedWith.sku','image','includedItemList.includedItem','inStoreAvailability','inStoreAvailabilityText','longDescription','manufacturer','mobileUrl','modelNumber','name','onlineAvailability','onlineAvailabilityText','onSale','percentSavings','preowned','regularPrice','relatedProducts.sku','salePrice','shipping','shippingCost','shortDescription','sku','thumbnailImage','type','upc','url'
	].join(',');

	for (let pidx = 1; pidx <= maxProductPages && candidateSkus.length < PAGE_SIZE; pidx++) {
		const productSearchUrl = `${BESTBUY_BASE_URL_PRODUCTS}((search=${encodeURIComponent(query)})&onSale=true&condition=new&inStoreAvailability=true)?apiKey=${BESTBUY_API_KEY}&format=json&show=${encodeURIComponent(showFields)}&pageSize=${PAGE_SIZE}&page=${pidx}&sort=salePrice.desc`;
		// Avoid bursts: small delay between pages
		if (pidx > 1) await delay(250);
		let prodResp;
		try {
			// Respect distributed rate limit counter (if Redis enabled)
			try {
				await ensureRateAllowed(Number(process.env.BESTBUY_RATE_LIMIT_PER_SEC || '5'));
			} catch (e) {
				// If limiter times out, log and proceed (fetchWithRetry will also retry)
				console.warn('Rate limiter wait failed or timed out, proceeding to fetch:', e);
			}
			prodResp = await fetchWithRetry(productSearchUrl, { next: { revalidate: 300 } });
		} catch (e) {
			console.error('Best Buy product search failed after retries:', e);
			if (pidx === 1) throw e;
			break;
		}

		if (!prodResp.ok) {
			const text = await prodResp.text();
			console.error('Best Buy product search error:', prodResp.status, text);
			if (pidx === 1) throw new Error(`API Request Failed: ${prodResp.status}`);
			break;
		}

		const prodText = await prodResp.text();
		let prodData: any;
		try {
			prodData = JSON.parse(prodText);
		} catch (e) {
			console.error('Best Buy product search: failed to parse JSON', prodText.slice(0,1000));
			continue;
		}

		const filtered = (prodData.products ?? [])
			.filter((p: any) => {
				const name = String(p.name || "").toLowerCase();
				for (const w of FILTER_WORDS) if (name.includes(w)) return false;
				return true;
			})
			.map((p: any) => p.sku)
			.filter(Boolean);

		for (const s of filtered) {
			if (candidateSkus.indexOf(s) === -1) candidateSkus.push(s);
			if (candidateSkus.length >= PAGE_SIZE) break;
		}
	}

	const skus: number[] = candidateSkus.slice(0, PAGE_SIZE);
	if (skus.length === 0) {
		console.log('No matching SKUs for query; returning empty set');
		return { products: [], page };
	}

	// Batch store+product call using sku in(...) to avoid per-second throttling
	const skuList = skus.join(',');
	const apiUrl = `${BESTBUY_BASE_URL_STORES}(${locationFilter})+products(sku in(${skuList}))?apiKey=${BESTBUY_API_KEY}&format=json&show=storeId,name,distance,products.sku,products.name,products.regularPrice,products.salePrice,products.image,products.inStoreAvailability&pageSize=10`;

		try {
		// Ensure slot in distributed rate limiter
		try {
			await ensureRateAllowed(Number(process.env.BESTBUY_RATE_LIMIT_PER_SEC || '5'));
		} catch (e) {
			console.warn('Rate limiter wait failed or timed out, proceeding to fetch:', e);
		}
		const response = await fetchWithRetry(apiUrl, { next: { revalidate: 300 } });

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Best Buy API Error:", response.status, errorText);
			throw new Error(`API Request Failed: ${response.status}`);
		}

		const dataText = await response.text();
		let data: any;
		try {
			data = JSON.parse(dataText);
		} catch (e) {
			console.error('Best Buy API: failed to parse JSON response', dataText.slice(0, 1000));
			return { products: [], page };
		}

		if (data && Array.isArray(data.stores) && data.stores.length > 0) {
			const bySku: Record<string, any> = {};
			for (const store of data.stores) {
				const storeDistance = store.distance;
				const products = store.products ?? [];
				for (const p of products) {
					const sku = p.sku;
					if (!sku) continue;
					if (!p.inStoreAvailability) continue;
					const existing = bySku[sku];
					const entry = {
						sku: sku,
						name: p.name,
						regularPrice: p.regularPrice,
						salePrice: p.salePrice || p.regularPrice,
						image: p.image,
						inStoreAvailability: p.inStoreAvailability,
						storeDistance: storeDistance,
						url: p.url || p.addToCartUrl || null,
					};
					if (!existing || (entry.storeDistance != null && existing.storeDistance == null) || (entry.storeDistance != null && existing.storeDistance != null && entry.storeDistance < existing.storeDistance)) {
						bySku[sku] = entry;
					}
				}
			}

			const result = { products: Object.values(bySku) as BestBuyProduct[], page };
			globalAny.__bb_cache.set(cacheKey, { ts: Date.now(), value: result });
			// set Redis cache if available
			try {
				await redisSetJson(cacheKey, { ts: Date.now(), value: result }, CACHE_TTL_MS);
			} catch (e) {
				// noop
			}
			return result;
		}

		console.log('Best Buy API returned no stores/products. Raw response head:', JSON.stringify(data).slice(0,1000));
		return { products: [], page };

	} catch (err: unknown) {
		console.error("Fetch or Parse Error:", err);
		return { products: [], page };
	}
}

