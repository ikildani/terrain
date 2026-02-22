'use client';

import { cn } from '@/lib/utils/cn';
import type { PartnerScoreBreakdown } from '@/types';

interface PartnerMatchScoreProps {
  score: number;
  breakdown: PartnerScoreBreakdown;
  compact?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-signal-green';
  if (score >= 65) return 'text-teal-400';
  if (score >= 50) return 'text-signal-amber';
  if (score >= 35) return 'text-slate-400';
  return 'text-slate-500';
}

function getBarColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.7) return 'bg-signal-green';
  if (pct >= 0.5) return 'bg-teal-500';
  if (pct >= 0.3) return 'bg-signal-amber';
  return 'bg-slate-600';
}

const DIMENSIONS: { key: keyof PartnerScoreBreakdown; label: string; max: number }[] = [
  { key: 'therapeutic_alignment', label: 'Therapeutic Alignment', max: 25 },
  { key: 'pipeline_gap', label: 'Pipeline Gap', max: 25 },
  { key: 'deal_history', label: 'Deal History', max: 20 },
  { key: 'geography_fit', label: 'Geography Fit', max: 15 },
  { key: 'financial_capacity', label: 'Financial Capacity', max: 15 },
];

export default function PartnerMatchScore({ score, breakdown, compact }: PartnerMatchScoreProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-12 h-12">
          <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-navy-700"
            />
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${(score / 100) * 97.39} 97.39`}
              className={getScoreColor(score)}
              strokeLinecap="round"
            />
          </svg>
          <span className={cn(
            'absolute inset-0 flex items-center justify-center text-xs font-mono font-medium',
            getScoreColor(score)
          )}>
            {score}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Overall Score */}
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14">
          <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-navy-700"
            />
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${(score / 100) * 97.39} 97.39`}
              className={getScoreColor(score)}
              strokeLinecap="round"
            />
          </svg>
          <span className={cn(
            'absolute inset-0 flex items-center justify-center text-sm font-mono font-semibold',
            getScoreColor(score)
          )}>
            {score}
          </span>
        </div>
        <div>
          <p className="text-xs text-slate-400">Match Score</p>
          <p className={cn('text-sm font-medium', getScoreColor(score))}>
            {score >= 80 ? 'Excellent' : score >= 65 ? 'Strong' : score >= 50 ? 'Good' : score >= 35 ? 'Moderate' : 'Low'}
          </p>
        </div>
      </div>

      {/* Score Breakdown Bars */}
      <div className="space-y-2">
        {DIMENSIONS.map((dim) => {
          const value = breakdown[dim.key];
          const pct = (value / dim.max) * 100;
          return (
            <div key={dim.key}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{dim.label}</span>
                <span className="text-[10px] font-mono text-slate-400">{value}/{dim.max}</span>
              </div>
              <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', getBarColor(value, dim.max))}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
