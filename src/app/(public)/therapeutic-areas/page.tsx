import type { Metadata } from 'next';
import Link from 'next/link';
import { THERAPEUTIC_AREAS } from '@/lib/data/ta-metadata';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Therapeutic Areas — Terrain by Ambrosia Ventures',
  description:
    'Market intelligence across 18 therapeutic areas and 236+ indications. Oncology, neurology, immunology, rare disease, cardiovascular, and more.',
  openGraph: {
    title: 'Therapeutic Areas — Terrain',
    description: 'Market intelligence across 18 therapeutic areas and 236+ indications.',
    url: 'https://terrain.ambrosiaventures.co/therapeutic-areas',
    siteName: 'Terrain — Ambrosia Ventures',
  },
  alternates: { canonical: 'https://terrain.ambrosiaventures.co/therapeutic-areas' },
};

export default function TherapeuticAreasPage() {
  const totalIndications = THERAPEUTIC_AREAS.reduce((sum, ta) => sum + ta.indicationCount, 0);
  const totalCompetitors = THERAPEUTIC_AREAS.reduce((sum, ta) => sum + ta.competitorCount, 0);

  return (
    <div className="min-h-screen bg-[#04080f] text-white">
      <nav className="border-b border-[#102236] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="text-lg font-semibold text-[#00c9a7]">
          Terrain
        </Link>
        <div className="flex gap-4 text-sm text-slate-400">
          <Link href="/login" className="hover:text-white">
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-[#00c9a7] text-[#04080f] px-4 py-1.5 rounded font-medium hover:bg-[#00e4bf]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-4 font-['Playfair_Display']">Therapeutic Areas</h1>
        <p className="text-lg text-slate-300 max-w-3xl mb-4">
          Market intelligence across {THERAPEUTIC_AREAS.length} therapeutic areas, {totalIndications} indications, and{' '}
          {totalCompetitors.toLocaleString()}+ tracked competitors.
        </p>
        <p className="text-sm text-slate-500 mb-12">
          Data sourced from ClinicalTrials.gov, FDA, SEC EDGAR, and proprietary databases. Refreshed daily.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {THERAPEUTIC_AREAS.map((ta) => (
            <Link
              key={ta.slug}
              href={`/therapeutic-areas/${ta.slug}`}
              className="group bg-[#07101e] border border-[#102236] rounded-lg p-5 hover:border-[#00c9a7]/40 transition-colors"
            >
              <h2 className="text-lg font-semibold text-white group-hover:text-[#00c9a7] transition-colors mb-2">
                {ta.name}
              </h2>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4">{ta.description}</p>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>
                  <span className="text-slate-300 font-mono">{ta.indicationCount}</span> indications
                </span>
                <span>
                  <span className="text-slate-300 font-mono">{ta.competitorCount}+</span> competitors
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-[#102236] mt-20 py-8 px-6 text-center text-sm text-slate-500">
        Terrain is built by{' '}
        <a href="https://ambrosiaventures.co" className="text-[#00c9a7] hover:underline">
          Ambrosia Ventures
        </a>{' '}
        — life sciences M&amp;A and strategy advisory.
      </footer>
    </div>
  );
}
