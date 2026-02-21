import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Terrain — Market Opportunity Intelligence',
    template: '%s | Terrain',
  },
  description:
    'Institutional-grade market intelligence for life sciences deal-makers. TAM/SAM/SOM analysis, competitive landscapes, partner matching, and regulatory pathways in under 30 seconds.',
  metadataBase: new URL('https://terrain.ambrosiaventures.co'),
  keywords: [
    'market sizing', 'biotech', 'life sciences', 'TAM SAM SOM',
    'competitive landscape', 'partner discovery', 'biopharma',
    'market intelligence', 'deal sourcing', 'BD licensing',
  ],
  authors: [{ name: 'Ambrosia Ventures', url: 'https://ambrosiaventures.co' }],
  creator: 'Ambrosia Ventures',
  openGraph: {
    title: 'Terrain — Market Opportunity Intelligence',
    description:
      'TAM analysis, competitive landscapes, and partner matching for life sciences professionals. 150+ indications. Results in under 30 seconds.',
    siteName: 'Terrain',
    type: 'website',
    locale: 'en_US',
    url: 'https://terrain.ambrosiaventures.co',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terrain — Market Opportunity Intelligence',
    description:
      'TAM analysis, competitive landscapes, and partner matching for life sciences professionals.',
    creator: '@ambrosiavc',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
