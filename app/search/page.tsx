// app/search/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string } | Promise<{ q?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const query = sp?.q || "Local Inventory Deals";
  return {
    title: `Find ${query} In Stock Now | LocalStock.online`,
    description: `Check real-time local stock and pricing for ${query} at Best Buy, Walmart, and Target for quick pickup.`,
  };
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { LocationButton } from "@/components/ui/location-button";
import ZipForm from "@/components/ui/zip-form";
import NearStatus from "@/components/ui/near-status";
import SearchControls from "@/components/ui/search-controls";

// A unified interface for our product data, regardless of source
interface Product {
  id: string;
  source: 'Best Buy' | 'Walmart';
  name: string;
  price: number;
  stockStatus: 'IN STOCK' | 'LOW STOCK' | 'UNAVAILABLE' | 'ONLINE ONLY';
  imageUrl?: string;
  productUrl?: string;
  storeDistance?: number;
  storeAvailable?: boolean;
}

// Maps a product from the Best Buy API response to our unified Product interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBestBuyToProduct(item: any): Product {
    return {
      id: `bb-${item.sku}`,
      source: 'Best Buy',
      name: item.name,
      price: (item.salePrice ?? item.regularPrice ?? 0),
      stockStatus: item.inStoreAvailability || item.onlineAvailability ? 'IN STOCK' : 'UNAVAILABLE',
      imageUrl: item.image,
      productUrl: item.url ?? item.addToCartUrl ?? item.url,
      storeDistance: item.storeDistance ?? item.distance ?? undefined,
      storeAvailable: Boolean(item.inStoreAvailability),
    };
}

// Maps a product from the Walmart API response to our unified Product interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWalmartToProduct(item: any): Product {
  return {
    id: `wm-${item.itemId}`,
    source: 'Walmart',
    name: item.name,
    price: item.salePrice ?? item.price ?? 0,
    stockStatus: (item.stock === 'Available' || item.availability === 'IN_STOCK') ? 'IN STOCK' : 'UNAVAILABLE',
    imageUrl: item.thumbnailImage,
    productUrl: item.productUrl ?? item.affiliateUrl ?? item.detailUrl,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string; zip?: string } | Promise<{ q?: string; zip?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params?.q || "Local Inventory Deals";
  const currentPage = Number((params as any)?.page || '1') || 1;
  const allProducts: Product[] = [];
  const errors: string[] = [];

  try {
    const zipParam = params?.zip ? `&zip=${encodeURIComponent(params.zip)}` : '';
    const pageParam = `&page=${currentPage}`;

    const [bestBuyRes, walmartRes] = await Promise.all([
      fetch(`http://localhost:3000/api/bestbuy/search?q=${encodeURIComponent(searchQuery)}${zipParam}${pageParam}`),
      fetch(`http://localhost:3000/api/walmart/search?q=${encodeURIComponent(searchQuery)}${zipParam}`)
    ]);

    if (bestBuyRes.ok) {
      const bestBuyData = await bestBuyRes.json();
      if (bestBuyData.products) {
        allProducts.push(...bestBuyData.products.map((p: any) => ({ ...mapBestBuyToProduct(p), productUrl: p.url || p.productUrl || p.addToCartUrl || '' })));
      }
    } else {
      errors.push('Failed to load results from Best Buy.');
    }

    if (walmartRes.ok) {
      const walmartData = await walmartRes.json();
      // Walmart API nests results under 'items'
      if (walmartData.items) {
        allProducts.push(...walmartData.items.map((p: any) => ({ ...mapWalmartToProduct(p), productUrl: p.productUrl || p.product_url || '' })));
      }
    } else {
      errors.push('Failed to load results from Walmart.');
    }

  } catch (err: unknown) {
    console.error('Search error:', err instanceof Error ? err.message : err);
    errors.push('An unexpected error occurred while searching.');
  }

  // Sort by price, highest first
  allProducts.sort((a, b) => b.price - a.price);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 min-h-screen bg-white text-gray-900">
      {/* --- Left Column: Search & Filters --- */}
      <div className="col-span-1 p-4 md:p-6 border-r border-gray-200 bg-gray-50">
        <h3 className="text-xl font-bold mb-4">Search</h3>
        <form action="/search" className="flex w-full items-center space-x-2 pb-4 border-b border-gray-200">
          <Input
            type="text"
            name="q"
            defaultValue={searchQuery}
            className="h-10 text-md flex-1 bg-white"
            aria-label="Search for a product"
          />
          <Button type="submit" size="default" className="h-10 bg-blue-600 hover:bg-blue-700">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <h3 className="text-xl font-bold my-4">Refine Location</h3>
        <ZipForm defaultQ={searchQuery} defaultZip={params?.zip} />
        <span className="text-xs text-gray-500 text-center mb-4 block">-- OR --</span>
        <LocationButton />
      </div>

      {/* --- Center Column: Results --- */}
      <div className="col-span-1 md:col-span-2 p-4 md:p-6">
        <h2 className="text-xl font-semibold mt-4">Results for {searchQuery}</h2>
        <NearStatus />

        <SearchControls />
        <div className="flex items-center gap-2 mt-3 mb-2">
          <span className="text-sm text-gray-600">Best Buy page: {currentPage}</span>
          <div className="ml-auto">
            {currentPage > 1 && (
              <a href={`/search?q=${encodeURIComponent(searchQuery)}${params?.zip ? `&zip=${encodeURIComponent(params.zip)}` : ''}&page=${currentPage - 1}`} className="text-sm px-3 py-1 border rounded mr-2">Prev</a>
            )}
            <a href={`/search?q=${encodeURIComponent(searchQuery)}${params?.zip ? `&zip=${encodeURIComponent(params.zip)}` : ''}&page=${currentPage + 1}`} className="text-sm px-3 py-1 border rounded">Next</a>
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto">
          {errors.map((error, i) => (
            <p key={i} className="text-red-500 bg-red-50 p-2 rounded">{error}</p>
          ))}

          {allProducts.length > 0 ? allProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-10 flex-shrink-0">
                        <Image
                          src={product.source === 'Best Buy' ? '/logos/bestbuy.png' : '/logos/walmart.svg'}
                          alt={`${product.source} logo`}
                          width={80}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="truncate">{product.name}</CardTitle>
                        <CardDescription>
                          Sold by: <strong>{product.source}</strong>
                          {product.storeDistance ? (
                            <span className="block text-xs text-gray-500">• ~{product.storeDistance.toFixed(1)} mi</span>
                          ) : null}
                          {product.storeAvailable ? (
                            <span className="block text-xs text-green-600">• Available in store</span>
                          ) : null}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
              <CardContent className="flex justify-between items-center">
                <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                <span
                  className={`font-semibold px-2 py-1 rounded-full text-xs ${
                    product.stockStatus === "IN STOCK" ? "bg-green-100 text-green-700" :
                    product.stockStatus === "LOW STOCK" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}
                >
                  {product.stockStatus}
                </span>
                <div className="flex flex-col items-end text-right">
                  {product.productUrl ? (
                    <a href={`/api/affiliate/redirect?target=${encodeURIComponent(product.productUrl)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View on {product.source}</a>
                  ) : (
                    <span className="text-sm text-gray-500">No retailer link</span>
                  )}
                  <a href={product.productUrl ? `/api/affiliate/redirect?target=${encodeURIComponent(product.productUrl)}` : '#'} target={product.productUrl ? '_blank' : undefined} rel={product.productUrl ? 'noopener noreferrer' : undefined} className="text-xs text-gray-500 mt-1">Check availability</a>
                </div>
              </CardContent>
            </Card>
          )) : errors.length === 0 && <p>No results found.</p>}
        </div>
      </div>
    </div>
  );
}