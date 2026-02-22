'use client';

import { useState } from 'react';
import { Building2, MapPin, ChevronDown, ChevronUp, Zap, DollarSign, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { PartnerMatch } from '@/types';
import PartnerMatchScore from './PartnerMatchScore';
import DealHistoryTable from './DealHistoryTable';

interface PartnerCardProps {
  partner: PartnerMatch;
}

function CompanyTypeBadge({ type }: { type: PartnerMatch['company_type'] }) {
  const styles: Record<string, string> = {
    'Big Pharma': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    'Mid-Size Pharma': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Specialty Pharma': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Biotech': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <span className={cn(
      'inline-flex text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border',
      styles[type] || 'bg-navy-700 text-slate-400 border-navy-600'
    )}>
      {type}
    </span>
  );
}

export default function PartnerCard({ partner }: PartnerCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card noise hover:border-navy-600 transition-colors">
      {/* Header Row */}
      <div className="flex items-start gap-4">
        {/* Rank Badge */}
        <div className="w-8 h-8 rounded-md bg-navy-700 flex items-center justify-center shrink-0">
          <span className="font-mono text-sm text-slate-300">
            {partner.rank}
          </span>
        </div>

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-base text-white truncate">
              {partner.company}
            </h3>
            <CompanyTypeBadge type={partner.company_type} />
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {partner.hq_location}
            </span>
            {partner.market_cap && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span className="font-mono">{partner.market_cap}</span>
              </span>
            )}
          </div>
        </div>

        {/* Score Ring */}
        <div className="shrink-0">
          <PartnerMatchScore score={partner.match_score} breakdown={partner.score_breakdown} compact />
        </div>
      </div>

      {/* Rationale */}
      <p className="text-xs text-slate-400 mt-3 leading-relaxed">
        {partner.rationale}
      </p>

      {/* Watch Signals */}
      {partner.watch_signals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {partner.watch_signals.map((signal, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/15 rounded px-2 py-0.5"
            >
              <Zap className="w-2.5 h-2.5" />
              {signal}
            </span>
          ))}
        </div>
      )}

      {/* Deal Terms Benchmark (compact row) */}
      <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 bg-navy-800/50 rounded-md">
        <div className="text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider">Typical Upfront</p>
          <p className="font-mono text-xs text-teal-400 mt-0.5">
            {partner.deal_terms_benchmark.typical_upfront}
          </p>
        </div>
        <div className="text-center border-x border-navy-700/50">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider">Milestones</p>
          <p className="font-mono text-xs text-slate-300 mt-0.5">
            {partner.deal_terms_benchmark.typical_milestones}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider">Royalty</p>
          <p className="font-mono text-xs text-slate-300 mt-0.5">
            {partner.deal_terms_benchmark.typical_royalty_range}
          </p>
        </div>
      </div>

      {/* Recent Deals (compact) */}
      {partner.recent_deals.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">
            Recent Relevant Deals
          </p>
          <DealHistoryTable deals={partner.recent_deals} compact />
        </div>
      )}

      {/* Expand / Collapse */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-3 pt-3 border-t border-navy-700/50 flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            Less detail
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            Score breakdown & BD focus
          </>
        )}
      </button>

      {/* Expanded Section */}
      {expanded && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {/* Full Score Breakdown */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
              Why this score
            </p>
            <PartnerMatchScore
              score={partner.match_score}
              breakdown={partner.score_breakdown}
            />
          </div>

          {/* BD Focus / Strategic Priorities */}
          {partner.bd_focus.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">
                Strategic Priorities
              </p>
              <ul className="space-y-1">
                {partner.bd_focus.map((focus, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <TrendingUp className="w-3 h-3 text-teal-500 mt-0.5 shrink-0" />
                    <span>{focus}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Deal History Table */}
          {partner.recent_deals.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">
                Deal History (Detail)
              </p>
              <DealHistoryTable deals={partner.recent_deals} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
