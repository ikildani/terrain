import type { MetadataRoute } from 'next';
import { THERAPEUTIC_AREAS } from '@/lib/data/ta-metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://terrain.ambrosiaventures.co';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/therapeutic-areas`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  const taPages: MetadataRoute.Sitemap = THERAPEUTIC_AREAS.map((ta) => ({
    url: `${baseUrl}/therapeutic-areas/${ta.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...taPages];
}
