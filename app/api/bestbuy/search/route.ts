// app/api/bestbuy/search/route.ts
import { NextResponse } from 'next/server';
import { searchLocalStock } from '@/lib/bestbuy-api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const zip = searchParams.get('zip') || undefined;
  const page = Number(searchParams.get('page') || '1') || 1;

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  // If zip is provided, use our local-stock helper which queries Best Buy with a location filter
  if (zip) {
    try {
      const res = await searchLocalStock(query, zip, page);
      // res: { products, page }
      return NextResponse.json(res);
    } catch (err) {
      console.error('BestBuy local search error:', err);
      return NextResponse.json({ error: 'Failed to fetch Best Buy local stock' }, { status: 500 });
    }
  }

  // Fallback: use public product search endpoint
  const apiKey = process.env.BESTBUY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Best Buy API key is not configured' }, { status: 500 });
  }

  const url = `https://api.bestbuy.com/v1/products((search=${encodeURIComponent(query)})&onSale=true&condition=new&inStoreAvailability=true)?apiKey=${apiKey}&format=json&show=sku,name,salePrice,regularPrice,image,url`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('BestBuy API fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch data from Best Buy API' }, { status: 500 });
  }
}

// https://api.bestbuy.com/v1/products((search=airpods)&onSale=true&condition=new&inStoreAvailability=true)?