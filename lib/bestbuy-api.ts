// /lib/bestbuy-api.ts
const BESTBUY_API_KEY = process.env.NEXT_PUBLIC_BESTBUY_API_KEY;
const BESTBUY_BASE_URL = "https://api.bestbuy.com/v1/products";

interface BestBuyProduct {
  sku: number;
  name: string;
  regularPrice: number;
  salePrice: number;
  image: string;
  inStoreAvailability: boolean;
  storeDistance?: number;
}

/**
 * Searches the Best Buy API for products near a given location.
 * @param query - The product search term (e.g., "Bose QuietComfort Ultra").
 * @param zipCode - The user's 5-digit zip code.
 * @returns A promise resolving to an array of BestBuyProduct results.
 */
export async function searchLocalStock(
  query: string,
  zipCode: string
): Promise<BestBuyProduct[]> {
  // 1. CRITICAL CHECK: Ensure the key exists
  if (!BESTBUY_API_KEY) {
    console.error("Best Buy API Key is missing. Check Vercel environment variables.");
    throw new Error("API Key configuration error.");
  }

  // 2. Construct the API Filter (Searching by name AND filtering by location)
  const productSearch = `search=${encodeURIComponent(query)}`;
  const locationFilter = `(area(${zipCode},5))`; // Search within a 5-mile radius

  const apiUrl = `${BESTBUY_BASE_URL}(${productSearch}&${locationFilter})?apiKey=${BESTBUY_API_KEY}&format=json&show=sku,name,regularPrice,salePrice,image,inStoreAvailability,storeType,distance&pageSize=10`;

  console.log("Fetching Best Buy API:", apiUrl);

  try {
    const response = await fetch(apiUrl, { next: { revalidate: 300 } }); // Revalidate every 5 minutes for fresh stock
    
    if (!response.ok) {
      // Handle API errors (e.g., rate limits, invalid zip)
      const errorText = await response.text();
      console.error("Best Buy API Error:", response.status, errorText);
      throw new Error(`API Request Failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.products) {
        return []; // No results found
    }

    // 3. Map the raw data to our clean interface
    return data.products.map((p: any) => ({
      sku: p.sku,
      name: p.name,
      regularPrice: p.regularPrice,
      salePrice: p.salePrice || p.regularPrice, // Use sale price if available
      image: p.image,
      // Best Buy API can return multiple stores; we simplify for MVP
      inStoreAvailability: p.inStoreAvailability, 
      storeDistance: p.distance,
    }));

  } catch (error) {
    console.error("Fetch or Parse Error:", error);
    // Return a graceful empty array on failure
    return []; 
  }
}