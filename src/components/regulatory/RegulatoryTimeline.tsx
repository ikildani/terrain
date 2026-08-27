'use client';

import { cn } from '@/lib/utils/cn';
import type { ComparableApproval } from '@/types';

interface TimelinePhase {
  name: string;
  durationMonths: number;
  risk: 'low' | 'medium' | 'high';
  cumulative: number;
}

interface RegulatoryTimelineProps {
  totalMonths: { optimistic: number; realistic: number; pessimistic: number };
  comparableApprovals?: ComparableApproval[];
  hasBreakthroughDesignation?: boolean;
  hasOrphanDesignation?: boolean;
}

const RISK_COLORS = {
  low: 'bg-signal-green',
  medium: 'bg-signal-amber',
  high: 'bg-signal-red',
} as const;

const RISK_BORDER = {
  low: 'border-signal-green/30',
  medium: 'border-signal-amber/30',
  high: 'border-signal-red/30',
} as const;

const RISK_TEXT = {
  low: 'text-signal-green',
  medium: 'text-signal-amber',
  high: 'text-signal-red',
} as const;

function buildPhases(realistic: number, hasBreakthrough: boolean): TimelinePhase[] {
  const indFiling = 6;
  const phase1 = hasBreakthrough ? 10 : 12;
  const phase2 = hasBreakthrough ? 18 : 24;
  const phase3 = hasBreakthrough ? 24 : 30;
  const ndaPrep = 6;
  const fdaReview = hasBreakthrough ? 8 : 12;

  const total = indFiling + phase1 + phase2 + phase3 + ndaPrep + fdaReview;
  const scale = realistic / total;

  const phases: TimelinePhase[] = [];
  let cum = 0;
  const add = (name: string, dur: number, risk: 'low' | 'medium' | 'high') => {
    const scaled = Math.round(dur * scale);
    phases.push({ name, durationMonths: scaled, risk, cumulative: cum });
    cum += scaled;
  };

  add('IND Filing', indFiling, 'low');
  add('Phase 1', phase1, 'medium');
  add('Phase 2', phase2, 'high');
  add('Phase 3', phase3, 'high');
  add('NDA/BLA Filing', ndaPrep, 'low');
  add('FDA Review', fdaReview, 'medium');

  return phases;
}

export default function RegulatoryTimeline({
  totalMonths,
  comparableApprovals,
  hasBreakthroughDesignation,
  hasOrphanDesignation,
}: RegulatoryTimelineProps) {
  const phases = buildPhases(totalMonths.realistic, !!hasBreakthroughDesignation);
  const maxMonths = totalMonths.pessimistic + 12;

  const comps = (comparableApprovals || []).filter((c) => c.timeline_months && c.timeline_months > 0).slice(0, 4);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white">Regulatory Timeline</h3>
          <p className="text-2xs text-slate-500 mt-0.5">IND to approval — realistic estimate</p>
        </div>
        <div className="flex items-center gap-4">
          {hasBreakthroughDesignation && <span className="badge badge-teal text-2xs">Breakthrough</span>}
          {hasOrphanDesignation && <span className="badge badge-amber text-2xs">Orphan</span>}
          <div className="flex items-center gap-3 text-2xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-signal-green" />
              Low risk
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-signal-amber" />
              Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-signal-red" />
              High risk
            </span>
          </div>
        </div>
      </div>

      {/* Timeline range summary */}
      <div className="flex gap-6 mb-5">
        {[
          { label: 'Optimistic', value: totalMonths.optimistic, sub: `${Math.round(totalMonths.optimistic / 12)}yr` },
          {
            label: 'Realistic',
            value: totalMonths.realistic,
            sub: `${Math.round(totalMonths.realistic / 12)}yr`,
            highlight: true,
          },
          {
            label: 'Pessimistic',
            value: totalMonths.pessimistic,
            sub: `${Math.round(totalMonths.pessimistic / 12)}yr`,
          },
        ].map((s) => (
          <div key={s.label}>
            <span className="text-2xs text-slate-500 uppercase tracking-wider">{s.label}</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={cn('metric text-lg', s.highlight ? 'text-teal-400' : 'text-slate-300')}>{s.value}</span>
              <span className="text-xs text-slate-500">months</span>
              <span className="text-2xs text-slate-600">({s.sub})</span>
            </div>
          </div>
        ))}
      </div>

      {/* Gantt bars */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-0.5 h-10">
          {phases.map((p) => {
            const widthPct = (p.durationMonths / maxMonths) * 100;
            return (
              <div
                key={p.name}
                className={cn(
                  'h-full rounded-sm flex items-center justify-center border relative group',
                  RISK_COLORS[p.risk],
                  RISK_BORDER[p.risk],
                  widthPct < 8 ? 'px-0.5' : 'px-2',
                )}
                style={{ width: `${widthPct}%`, opacity: 0.85 }}
              >
                {widthPct >= 8 && <span className="text-2xs font-medium text-navy-950 truncate">{p.name}</span>}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap bg-navy-800 border border-navy-700 rounded px-2 py-1 text-2xs text-slate-300 shadow-elevated pointer-events-none">
                  {p.name}: {p.durationMonths}mo ({RISK_TEXT[p.risk].replace('text-signal-', '')} risk)
                </div>
              </div>
            );
          })}
        </div>

        {/* Month markers */}
        <div className="flex justify-between text-2xs font-mono text-slate-600 px-0.5">
          <span>0</span>
          {[12, 24, 36, 48, 60, 72]
            .filter((m) => m <= maxMonths)
            .map((m) => (
              <span key={m} style={{ marginLeft: `${(m / maxMonths) * 100 - (m === 12 ? 5 : 10)}%` }}>
                {m}mo
              </span>
            ))}
        </div>
      </div>

      {/* Comparable approvals */}
      {comps.length > 0 && (
        <div className="mt-6 pt-4 border-t border-navy-700/60">
          <h4 className="label mb-3">Comparable Approval Timelines</h4>
          <div className="space-y-2">
            {comps.map((c, i) => {
              const widthPct = ((c.timeline_months || 0) / maxMonths) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-2xs text-slate-500 w-28 truncate flex-shrink-0">
                    {c.drug} ({c.company})
                  </span>
                  <div className="flex-1 h-3 bg-navy-800 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-slate-600/50 rounded-sm"
                      style={{ width: `${Math.min(widthPct, 100)}%` }}
                    />
                  </div>
                  <span className="metric text-2xs text-slate-400 w-12 text-right flex-shrink-0">
                    {c.timeline_months}mo
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
