import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/settings/',
          '/api/',
          '/onboarding/',
          '/market-sizing/',
          '/competitive/',
          '/partners/',
          '/regulatory/',
          '/reports/',
          '/intelligence/',
          '/alerts/',
        ],
      },
    ],
    sitemap: 'https://terrain.ambrosiaventures.co/sitemap.xml',
  };
}
