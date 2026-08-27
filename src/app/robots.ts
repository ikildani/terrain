import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://terrain.ambrosiaventures.co';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/therapeutic-areas/', '/llms.txt'],
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
          '/alerts/',
        ],
      },
      {
        userAgent: ['GPTBot', 'Claude-Web', 'PerplexityBot', 'Applebot-Extended'],
        allow: ['/', '/therapeutic-areas/', '/llms.txt'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
