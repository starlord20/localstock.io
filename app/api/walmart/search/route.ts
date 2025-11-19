// app/api/walmart/search/route.ts
import { NextResponse } from 'next/server';
import * as crypto from 'crypto';
import fs from 'fs';

// This function loads the private key from environment variables.
// It's adapted from the provided walmart-signature.js script.
function loadPrivateKey(): string {
  const keyPath = process.env.WALMART_PRIVATE_KEY_PATH;
  if (keyPath) {
    // In a serverless function, reading from a file might not be ideal.
    // Prefer loading the key directly from env vars.
    // This is kept for compatibility with the original script's logic.
    return fs.readFileSync(keyPath, 'utf8');
  }

  const key = process.env.WALMART_PRIVATE_KEY;
  if (key) {
    const val = key.trim();
    // If the key is already in PEM format, return it.
    if (/-----BEGIN/.test(val)) return val;
    // Otherwise, assume it's a base64 encoded PKCS#8 DER and wrap it.
    return '-----BEGIN PRIVATE KEY-----\n' + val + '\n-----END PRIVATE KEY-----';
  }
  
  throw new Error('WALMART_PRIVATE_KEY or WALMART_PRIVATE_KEY_PATH must be set');
}

// This function signs a string with the private key.
function signString(privateKeyPem: string, stringToSign: string): string {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(stringToSign, 'utf8');
  sign.end();
  return sign.sign(privateKeyPem, 'base64');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');


  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  const consumerId = process.env.WALMART_CONSUMER_ID;
  const keyVersion = '1'; // As per documentation and script

  if (!consumerId) {
    return NextResponse.json({ error: 'Walmart consumer id is not configured' }, { status: 500 });
  }

  // Load the private key (from path or env). If loading fails, return a clear error.
  let privateKey: string;
  try {
    privateKey = loadPrivateKey();
  } catch (e) {
    return NextResponse.json({ error: 'Walmart API credentials are not configured' }, { status: 500 });
  }

  try {
    // 1. Prepare headers for signing
    const timestamp = process.env.WALMART_INTIMESTAMP || String(Date.now());
    const stringToSign = `${consumerId}\n${timestamp}\n${keyVersion}\n`;

    // 2. Load private key and generate signature
    const signature = signString(privateKey, stringToSign);

    // 3. Prepare headers for the actual request
    const apiHeaders = {
      'WM_SEC.KEY_VERSION': keyVersion,
      'WM_SEC.AUTH_SIGNATURE': signature,
      'WM_CONSUMER.ID': consumerId,
      'WM_CONSUMER.INTIMESTAMP': timestamp,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // 4. Construct the API URL and make the request
    // Use the affiliate proxy endpoint (matches scripts/walmart-test-endpoints.js)
    let apiUrl = `https://developer.api.walmart.com/api-proxy/service/affil/product/v2/search?query=${encodeURIComponent(query)}`;
    if (searchParams.get('zip')) {
      const zipVal = encodeURIComponent(searchParams.get('zip') ?? "");
      apiUrl += `&postalCode=${zipVal}`;
    }

    const response = await fetch(apiUrl, { headers: apiHeaders });

    if (!response.ok) {
      // If response is not OK, try to parse the error body for more info
      const errorBody = await response.text();
      console.error("Walmart API Error:", errorBody);
      return NextResponse.json({ error: `Walmart API responded with status ${response.status}`, details: errorBody }, { status: response.status });
    }

    const data = await response.json();

    // Add convenience affiliateUrl for each item if present
    try {
      if (data && Array.isArray(data.items)) {
        data.items = data.items.map((it: any) => ({
          ...it,
          affiliateUrl: it.productUrl || it.product_url || it.detailUrl || null,
        }));
      }

      // If a zip/postal code was provided, try to fetch per-item store offers using the affiliate product-lookup endpoint
      const zip = searchParams.get('zip');
      if (zip && Array.isArray(data.items) && data.items.length > 0) {
        // Limit parallel lookups to the first N items to avoid rate limits
        const limit = 6;
        const itemsToLookup = data.items.slice(0, limit);

        await Promise.all(itemsToLookup.map(async (it: any) => {
          try {
            const itemId = it.itemId || it.item_id || it.id || it.sku;
            if (!itemId) return;

            // The older product lookup endpoint may require extra permissions (403).
            // Per the Affiliate Marketing API docs, prefer the affiliate-marketing-api path.
            const lookupCandidates = [
              // Preferred Affiliate Marketing API path (per docs)
              `https://developer.api.walmart.com/api-proxy/service/affil/affiliate-marketing-api/v1/product/lookup?itemId=${encodeURIComponent(itemId)}&postalCode=${encodeURIComponent(zip)}`,
              // Fallback to the historical product lookup proxy path
              `https://developer.api.walmart.com/api-proxy/service/affil/product/v1/lookup?itemId=${encodeURIComponent(itemId)}&postalCode=${encodeURIComponent(zip)}`,
            ];

            let lookupData: any = null;
            for (const lookupUrl of lookupCandidates) {
              try {
                const lookupResp = await fetch(lookupUrl, { headers: apiHeaders });
                const text = await lookupResp.text();
                if (!lookupResp.ok) {
                  // If unauthorized, stop trying further and mark as not-authorized
                  if (lookupResp.status === 403 && /youare|notauthorized|YouareNotAuthorized/i.test(text)) {
                    it.storeOffers = { error: 'Not authorized for product lookup (affiliate permissions required)', details: text };
                    lookupData = null;
                    break;
                  }
                  // try next candidate
                  continue;
                }

                try {
                  lookupData = JSON.parse(text);
                } catch (e) {
                  lookupData = text;
                }
                break; // success
              } catch (e) {
                // network/parsing error — try next candidate
                continue;
              }
            }

            if (!lookupData) {
              if (!it.storeOffers) it.storeOffers = { error: 'No lookup data available' };
              return;
            }

            // Attach whatever the lookup returned (stores/offers) to the item
            it.storeOffers = lookupData?.stores ?? lookupData?.offers ?? lookupData;
          } catch (e) {
            it.storeOffers = { error: String(e) };
          }
        }));
      }

    } catch (e) {
      // ignore transformation errors
    }

    return NextResponse.json(data);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error during Walmart API request:", err);
    return NextResponse.json({ error: 'Failed to fetch data from Walmart API', details: msg }, { status: 500 });
  }
}
