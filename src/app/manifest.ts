import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Terrain — Market Opportunity Intelligence',
    short_name: 'Terrain',
    description:
      'Institutional-grade market intelligence for life sciences deal-makers. TAM/SAM/SOM analysis, competitive landscapes, partner matching, and regulatory pathways.',
    start_url: '/',
    display: 'standalone',
    background_color: '#04080F',
    theme_color: '#00C9A7',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
