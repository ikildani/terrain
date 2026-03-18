'use client';

import { DollarSign, TrendingUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { LicensingTermsEstimate } from '@/types';

interface LicensingTermsCardProps {
  terms: LicensingTermsEstimate;
  stage: string;
}

function formatValue(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`;
  if (value > 0) return `$${Math.round(value)}M`;
  return '--';
}

function RangeBar({ low, base, high, label }: { low: number; base: number; high: number; label: string }) {
  const max = high * 1.1;
  const lowPct = (low / max) * 100;
  const basePct = (base / max) * 100;
  const highPct = (high / max) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-2xs text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="font-mono text-xs text-teal-400">{formatValue(base)}</span>
      </div>
      <div className="relative h-2 bg-navy-700 rounded-full overflow-hidden">
        {/* Full range background */}
        <div
          className="absolute h-full bg-navy-600 rounded-full"
          style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
        />
        {/* Base marker */}
        <div className="absolute h-full w-1 bg-teal-400 rounded-full" style={{ left: `${basePct}%` }} />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[9px] font-mono text-slate-600">{formatValue(low)}</span>
        <span className="text-[9px] font-mono text-slate-600">{formatValue(high)}</span>
      </div>
    </div>
  );
}

function formatStage(stage: string): string {
  const map: Record<string, string> = {
    preclinical: 'Preclinical',
    phase1: 'Phase 1',
    phase2: 'Phase 2',
    phase3: 'Phase 3',
    approved: 'Approved',
  };
  return map[stage] || stage.charAt(0).toUpperCase() + stage.slice(1);
}

export default function LicensingTermsCard({ terms, stage }: LicensingTermsCardProps) {
  const [showComps, setShowComps] = useState(false);

  return (
    <div className="card noise">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-4 h-4 text-teal-500" />
        <h3 className="chart-title">Estimated Licensing Terms — {formatStage(stage)} Asset</h3>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="text-center p-3 bg-navy-800/60 rounded-lg">
          <p className="text-2xs text-slate-600 uppercase tracking-wider">Est. Upfront</p>
          <p className="font-mono text-lg text-teal-400 mt-1">{formatValue(terms.upfront.base)}</p>
          <p className="text-[9px] font-mono text-slate-600 mt-0.5">
            {formatValue(terms.upfront.low)} - {formatValue(terms.upfront.high)}
          </p>
        </div>
        <div className="text-center p-3 bg-navy-800/60 rounded-lg">
          <p className="text-2xs text-slate-600 uppercase tracking-wider">Total Deal Value</p>
          <p className="font-mono text-lg text-white mt-1">{formatValue(terms.total_deal_value.base)}</p>
          <p className="text-[9px] font-mono text-slate-600 mt-0.5">
            {formatValue(terms.total_deal_value.low)} - {formatValue(terms.total_deal_value.high)}
          </p>
        </div>
        <div className="text-center p-3 bg-navy-800/60 rounded-lg">
          <p className="text-2xs text-slate-600 uppercase tracking-wider">Royalty Range</p>
          <p className="font-mono text-lg text-white mt-1">
            {terms.royalty_range.low}-{terms.royalty_range.high}%
          </p>
          <p className="text-[9px] font-mono text-slate-600 mt-0.5">Tiered, on net sales</p>
        </div>
      </div>

      {/* Deal Component Breakdown */}
      <div className="space-y-3 mb-4">
        <RangeBar low={terms.upfront.low} base={terms.upfront.base} high={terms.upfront.high} label="Upfront Payment" />
        <RangeBar
          low={terms.development_milestones.low}
          base={terms.development_milestones.base}
          high={terms.development_milestones.high}
          label="Development Milestones"
        />
        <RangeBar
          low={terms.regulatory_milestones.low}
          base={terms.regulatory_milestones.base}
          high={terms.regulatory_milestones.high}
          label="Regulatory Milestones"
        />
        <RangeBar
          low={terms.commercial_milestones.low}
          base={terms.commercial_milestones.base}
          high={terms.commercial_milestones.high}
          label="Commercial Milestones"
        />
      </div>

      {/* Upfront as % of total */}
      <div className="flex items-center gap-2 p-2.5 bg-navy-800/40 rounded-md mb-4">
        <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs text-slate-400">
          Upfront represents <span className="font-mono text-teal-400">{terms.upfront_as_pct_of_total}%</span> of total
          estimated deal value
        </span>
      </div>

      {/* Rationale */}
      <p className="text-xs text-slate-500 leading-relaxed mb-3">{terms.rationale}</p>

      {/* Comparable Deals */}
      {terms.comparable_deals.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowComps(!showComps)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showComps ? 'rotate-180' : ''}`} />
            {terms.comparable_deals.length} Comparable Transactions
          </button>
          {showComps && (
            <ul className="mt-2 space-y-1.5 animate-fade-in">
              {terms.comparable_deals.map((deal, i) => (
                <li key={i} className="text-[11px] text-slate-400 pl-5 py-1 border-l-2 border-navy-700">
                  {deal}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
