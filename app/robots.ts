import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.localstock.online';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Disallow crawling of any temporary/staging links to prevent duplicate content issues
        disallow: '/*.vercel.app', 
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}