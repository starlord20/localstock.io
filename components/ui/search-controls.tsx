"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchControls() {
  const router = useRouter();
  const params = useSearchParams();
  const sort = params?.get('sort') ?? 'price_asc';

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href);
    url.searchParams.set('sort', e.target.value);
    router.replace(url.pathname + url.search);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">Sort:</label>
        <select value={sort} onChange={handleSort} className="text-sm border rounded px-2 py-1">
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="in_stock">In Stock First</option>
        </select>
      </div>
      <div>
        <a href="/" className="text-sm text-gray-500 hover:underline">Reset Filters</a>
      </div>
    </div>
  );
}
