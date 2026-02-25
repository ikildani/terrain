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
    description: 'TAM analysis, competitive landscapes, and partner matching for life sciences professionals.',
    creator: '@ambrosiavc',
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
