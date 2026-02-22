'use client';

import { DollarSign } from 'lucide-react';
import type { Competitor, ClinicalPhase } from '@/types';

interface CompetitorCardProps {
  competitor: Competitor;
  rank?: number;
}

const PHASE_CLASSES: Record<ClinicalPhase, string> = {
  Approved: 'phase-approved',
  'Phase 3': 'phase-3',
  'Phase 2/3': 'phase-2',
  'Phase 2': 'phase-2',
  'Phase 1/2': 'phase-1',
  'Phase 1': 'phase-1',
  Preclinical: 'phase-preclinical',
};

function ScoreBar({ value, label }: { value: number; label: string }) {
  const percentage = (value / 10) * 100;

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-2xs uppercase tracking-wider text-slate-500 w-16 flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="font-mono text-xs text-slate-100 w-6 text-right">{value}</span>
    </div>
  );
}

export default function CompetitorCard({ competitor, rank }: CompetitorCardProps) {
  const c = competitor;

  return (
    <div className="card noise hover:border-teal-500/20 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          {rank !== undefined && (
            <span className="flex-shrink-0 font-mono text-lg font-medium text-slate-500 leading-tight">
              {String(rank).padStart(2, '0')}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-slate-100 font-medium text-[14px] leading-tight truncate">
              {c.company}
            </p>
            <p className="text-teal-400 text-[13px] leading-tight mt-0.5 truncate">
              {c.asset_name}
              {c.generic_name && (
                <span className="text-slate-500 ml-1.5">({c.generic_name})</span>
              )}
            </p>
          </div>
        </div>
        <span className={`phase-badge flex-shrink-0 ${PHASE_CLASSES[c.phase] ?? 'phase-preclinical'}`}>
          {c.phase}
        </span>
      </div>

      {/* Mechanism + Target */}
      <div className="mb-3">
        <p className="text-slate-400 text-xs">
          {c.mechanism}
          {c.molecular_target && (
            <span className="text-slate-500"> / {c.molecular_target}</span>
          )}
        </p>
      </div>

      {/* Key Data */}
      {c.key_data && (
        <div className="bg-navy-800 rounded-md px-3 py-2.5 mb-3">
          <p className="text-slate-300 text-xs leading-relaxed">{c.key_data}</p>
        </div>
      )}

      {/* Estimated Peak Sales */}
      {c.estimated_peak_sales && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-teal-500/5 border border-teal-500/10 rounded-md">
          <DollarSign className="w-3.5 h-3.5 text-teal-500 shrink-0" />
          <div>
            <p className="text-2xs uppercase tracking-wider text-slate-500">Est. Peak Sales</p>
            <p className="font-mono text-sm text-teal-400">{c.estimated_peak_sales}</p>
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      {(c.strengths.length > 0 || c.weaknesses.length > 0) && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Strengths */}
          <div>
            <p className="text-2xs uppercase tracking-wider text-slate-500 mb-1.5">
              Strengths
            </p>
            <ul className="space-y-1">
              {c.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-signal-green flex-shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
              {c.strengths.length === 0 && (
                <li className="text-xs text-slate-500">{'\u2014'}</li>
              )}
            </ul>
          </div>

          {/* Weaknesses */}
          <div>
            <p className="text-2xs uppercase tracking-wider text-slate-500 mb-1.5">
              Weaknesses
            </p>
            <ul className="space-y-1">
              {c.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-signal-red flex-shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
              {c.weaknesses.length === 0 && (
                <li className="text-xs text-slate-500">{'\u2014'}</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Score Bars */}
      <div className="space-y-2 mb-3">
        <ScoreBar value={c.differentiation_score} label="Diff." />
        <ScoreBar value={c.evidence_strength} label="Evidence" />
      </div>

      {/* NCT IDs */}
      {c.nct_ids && c.nct_ids.length > 0 && (
        <div className="mb-3">
          <p className="text-2xs uppercase tracking-wider text-slate-500 mb-1">Trial IDs</p>
          <div className="flex flex-wrap gap-1.5">
            {c.nct_ids.map((nctId) => (
              <a
                key={nctId}
                href={`https://clinicaltrials.gov/study/${nctId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xs font-mono text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/15 rounded px-2 py-0.5 transition-colors"
              >
                {nctId}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-navy-700/50">
        <div className="flex items-center gap-3 text-xs text-slate-400 min-w-0">
          {c.partner && (
            <span className="truncate">
              <span className="text-slate-500">Partner:</span> {c.partner}
              {c.partnership_deal_value && (
                <span className="font-mono text-teal-400 ml-1">
                  ({c.partnership_deal_value})
                </span>
              )}
            </span>
          )}
        </div>
        <span className="text-2xs text-slate-500 flex-shrink-0 ml-2">{c.source}</span>
      </div>
    </div>
  );
}
