import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { THERAPEUTIC_AREAS, getTABySlug } from '@/lib/data/ta-metadata';

export const revalidate = 86400;

interface Props {
  params: Promise<{ ta: string }>;
}

export async function generateStaticParams() {
  return THERAPEUTIC_AREAS.map((ta) => ({ ta: ta.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ta: slug } = await params;
  const ta = getTABySlug(slug);
  if (!ta) return {};

  const title = `${ta.name} Market Intelligence — Terrain by Ambrosia Ventures`;
  const description = `${ta.description} Covering ${ta.indicationCount} indications and ${ta.competitorCount}+ competitors. Market sizing, competitive landscape, regulatory pathway, and partner analysis.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://terrain.ambrosiaventures.co/therapeutic-areas/${slug}`,
      siteName: 'Terrain — Ambrosia Ventures',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: `https://terrain.ambrosiaventures.co/therapeutic-areas/${slug}` },
  };
}

export default async function TAPage({ params }: Props) {
  const { ta: slug } = await params;
  const ta = getTABySlug(slug);
  if (!ta) notFound();

  const formatName = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#04080f] text-white">
      <nav className="border-b border-[#102236] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="text-lg font-semibold text-[#00c9a7]">
          Terrain
        </Link>
        <div className="flex gap-4 text-sm text-slate-400">
          <Link href="/therapeutic-areas" className="hover:text-white">
            All TAs
          </Link>
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
        <div className="mb-4 text-sm text-slate-500">
          <Link href="/therapeutic-areas" className="hover:text-[#00c9a7]">
            Therapeutic Areas
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">{ta.name}</span>
        </div>

        <h1 className="text-4xl font-bold mb-4 font-['Playfair_Display']">{ta.name} Market Intelligence</h1>
        <p className="text-lg text-slate-300 max-w-3xl mb-12">{ta.description}</p>

        <div className="grid grid-cols-3 gap-6 mb-16">
          <div className="bg-[#07101e] border border-[#102236] rounded-lg p-6">
            <div className="text-3xl font-bold text-[#00c9a7] font-mono">{ta.indicationCount}</div>
            <div className="text-sm text-slate-400 mt-1">Indications Covered</div>
          </div>
          <div className="bg-[#07101e] border border-[#102236] rounded-lg p-6">
            <div className="text-3xl font-bold text-[#00c9a7] font-mono">{ta.competitorCount}+</div>
            <div className="text-sm text-slate-400 mt-1">Competitors Tracked</div>
          </div>
          <div className="bg-[#07101e] border border-[#102236] rounded-lg p-6">
            <div className="text-3xl font-bold text-[#00c9a7] font-mono">5</div>
            <div className="text-sm text-slate-400 mt-1">Analysis Modules</div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Key Indications</h2>
          <div className="flex flex-wrap gap-3">
            {ta.keyIndications.map((ind) => (
              <span
                key={ind}
                className="bg-[#0d1b2e] border border-[#102236] px-4 py-2 rounded-lg text-sm text-slate-300"
              >
                {ind}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">What You Get</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                title: 'Market Sizing',
                desc: 'Patient funnel-based TAM/SAM/SOM with biomarker nesting, payer mix, and geographic decomposition.',
              },
              {
                title: 'Competitive Landscape',
                desc: 'Threat assessment, displacement risk, mechanism analysis, and patent cliff intelligence.',
              },
              {
                title: 'Partner Analysis',
                desc: 'Strategic adjacency scoring across 300+ pharma, biotech, and medtech companies.',
              },
              {
                title: 'Regulatory Pathways',
                desc: 'LOA by phase, designation impact, FDA/EMA pathway analysis with timeline estimates.',
              },
              {
                title: 'Live Intelligence',
                desc: 'Real-time market signals classified by type — competitive, regulatory, clinical, deal.',
              },
              {
                title: 'PDF Reports',
                desc: 'Institutional-grade exportable reports ready for board presentations and partner meetings.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-[#07101e] border border-[#102236] rounded-lg p-5">
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#002e27] to-[#07101e] border border-[#00c9a7]/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Start analyzing {ta.name.toLowerCase()} markets</h2>
          <p className="text-slate-300 mb-6">3 free reports per month. No credit card required.</p>
          <Link
            href="/signup"
            className="inline-block bg-[#00c9a7] text-[#04080f] px-8 py-3 rounded-lg font-semibold text-lg hover:bg-[#00e4bf] transition-colors"
          >
            Get Started Free
          </Link>
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
