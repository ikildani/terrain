import type { Metadata } from 'next';
import { DM_Serif_Display, Sora, DM_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from './providers';
import './globals.css';

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Terrain — Market Opportunity Intelligence',
    template: '%s | Terrain',
  },
  description:
    'Institutional-grade market intelligence for life sciences deal-makers. TAM/SAM/SOM analysis, competitive landscapes, partner matching, and regulatory pathways in under 30 seconds.',
  metadataBase: new URL('https://terrain.ambrosiaventures.co'),
  keywords: [
    'market sizing',
    'biotech',
    'life sciences',
    'TAM SAM SOM',
    'competitive landscape',
    'partner discovery',
    'biopharma',
    'market intelligence',
    'deal sourcing',
    'BD licensing',
  ],
  authors: [{ name: 'Ambrosia Ventures', url: 'https://ambrosiaventures.co' }],
  creator: 'Ambrosia Ventures',
  openGraph: {
    title: 'Terrain — Know the market before the deal',
    description:
      'TAM analysis, competitive landscapes, and partner matching for biotech professionals — in seconds, not weeks. 150+ indications covered.',
    siteName: 'Terrain by Ambrosia Ventures',
    type: 'website',
    locale: 'en_US',
    url: 'https://terrain.ambrosiaventures.co',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Terrain — Market Opportunity Intelligence for Life Sciences',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terrain — Know the market before the deal',
    description:
      'TAM analysis, competitive landscapes, and partner matching for biotech professionals — in seconds, not weeks.',
    creator: '@ambrosiavc',
    images: ['/twitter-image'],
  },
  alternates: {
    canonical: 'https://terrain.ambrosiaventures.co',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).origin : null;

  return (
    <html lang="en" className={`${dmSerif.variable} ${sora.variable} ${dmMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebApplication',
                  name: 'Terrain',
                  url: 'https://terrain.ambrosiaventures.co',
                  description:
                    'Institutional-grade market intelligence for life sciences deal-makers. TAM/SAM/SOM analysis, competitive landscapes, partner matching, and regulatory pathways.',
                  applicationCategory: 'BusinessApplication',
                  operatingSystem: 'Web',
                  offers: {
                    '@type': 'AggregateOffer',
                    lowPrice: '0',
                    highPrice: '799',
                    priceCurrency: 'USD',
                  },
                  creator: {
                    '@type': 'Organization',
                    name: 'Ambrosia Ventures',
                    url: 'https://ambrosiaventures.co',
                  },
                },
                {
                  '@type': 'Organization',
                  name: 'Ambrosia Ventures',
                  url: 'https://ambrosiaventures.co',
                  description: 'Boutique life sciences M&A and strategy advisory firm.',
                },
              ],
            }),
          }}
        />
        {supabaseHost && <link rel="preconnect" href={supabaseHost} />}
        <link rel="preconnect" href="https://js.stripe.com" />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
