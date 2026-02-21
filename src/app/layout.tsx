import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Terrain — Market Opportunity Intelligence',
  description:
    'Institutional-grade market intelligence for life sciences deal-makers. Market sizing, competitive landscape, partner discovery, and regulatory intelligence.',
  metadataBase: new URL('https://terrain.ambrosiaventures.co'),
  openGraph: {
    title: 'Terrain — Market Opportunity Intelligence',
    description:
      'Institutional-grade market intelligence for life sciences deal-makers.',
    siteName: 'Terrain',
    type: 'website',
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
