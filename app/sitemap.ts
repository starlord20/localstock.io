import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.localstock.online';

export default function sitemap(): MetadataRoute.Sitemap {
  const deals = [
    'bose-qc-ultra-headphones-deal',
    'apple-airpods-4-lowest-price',
    'dell-inspiron-laptop-bf-deal',
    'samsung-85-inch-qled-tv-sale',
    'dyson-v12-detect-slim-vacuum-deal',
  ];

  const dealUrls = deals.map((deal) => ({
    url: `${BASE_URL}/deals/${deal}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.8, // High priority for our time-sensitive deal pages
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: 'hourly' as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    ...dealUrls,
  ];
}