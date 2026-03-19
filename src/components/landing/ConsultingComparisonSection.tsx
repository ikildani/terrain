'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Section } from './Section';

// ────────────────────────────────────────────────────────────
// CONSULTING COMPARISON TABLE
// ────────────────────────────────────────────────────────────

const COMPARISON_ROWS = [
  {
    dimension: 'Time to insight',
    terrain: '90 seconds',
    mckinsey: '3\u20136 weeks',
    boutique: '2\u20134 weeks',
  },
  {
    dimension: 'Cost',
    terrain: '$149/mo',
    mckinsey: '$500K\u2013$2M',
    boutique: '$50K\u2013$200K',
  },
  {
    dimension: 'Indications covered',
    terrain: '982+',
    mckinsey: '1\u20133 per engagement',
    boutique: '5\u201310',
  },
  {
    dimension: 'Data sources',
    terrain: '6+ live feeds',
    mckinsey: 'Manual research',
    boutique: 'Mixed',
  },
  {
    dimension: 'Update frequency',
    terrain: 'Real-time',
    mckinsey: 'Static deliverable',
    boutique: 'Quarterly',
  },
  {
    dimension: 'Deal comps',
    terrain: '416 transactions',
    mckinsey: '10\u201320 curated',
    boutique: '20\u201350',
  },
] as const;

export function ConsultingComparisonSection() {
  return (
    <Section className="py-24 px-6 border-t border-navy-700/60">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">Why Terrain</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
            Replace a $500K engagement with a $149/mo subscription.
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto">
            Terrain delivers institutional-grade market intelligence at a fraction of the cost and time of traditional
            consulting — with broader coverage, real-time data, and instant updates.
          </p>
        </div>

        <div className="card noise p-0 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-navy-700/60">
            <div className="px-5 py-4" />
            <div className="px-5 py-4 text-center bg-teal-500/5 border-l border-navy-700/60">
              <span className="text-xs font-mono text-teal-500 uppercase tracking-wider font-medium">Terrain</span>
            </div>
            <div className="px-5 py-4 text-center border-l border-navy-700/60">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">McKinsey / BCG</span>
            </div>
            <div className="px-5 py-4 text-center border-l border-navy-700/60">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Boutique Advisory</span>
            </div>
          </div>

          {/* Rows */}
          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={row.dimension}
              className={`grid grid-cols-[1.5fr_1fr_1fr_1fr] ${
                i < COMPARISON_ROWS.length - 1 ? 'border-b border-navy-700/60' : ''
              }`}
            >
              <div className="px-5 py-3.5 text-xs text-slate-300 font-medium flex items-center">{row.dimension}</div>
              <div className="px-5 py-3.5 text-center border-l border-navy-700/60 bg-teal-500/5">
                <span className="text-xs font-mono text-teal-400 font-medium">{row.terrain}</span>
              </div>
              <div className="px-5 py-3.5 text-center border-l border-navy-700/60">
                <span className="text-xs font-mono text-slate-500">{row.mckinsey}</span>
              </div>
              <div className="px-5 py-3.5 text-center border-l border-navy-700/60">
                <span className="text-xs font-mono text-slate-500">{row.boutique}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn btn-primary text-sm px-8 py-3 inline-flex items-center gap-2">
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-500" />3 free reports/month
              </span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
