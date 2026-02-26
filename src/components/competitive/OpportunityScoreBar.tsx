'use client';

import { cn } from '@/lib/utils/cn';

interface OpportunityScoreBarProps {
  score: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'bg-emerald-400';
  if (score >= 50) return 'bg-teal-400';
  if (score >= 25) return 'bg-amber-400';
  return 'bg-red-400';
}

function getScoreTextColor(score: number): string {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 50) return 'text-teal-400';
  if (score >= 25) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreLabel(score: number): string {
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Moderate';
  if (score >= 25) return 'Weak';
  return 'Low';
}

export function OpportunityScoreBar({
  score,
  max = 100,
  size = 'md',
  showLabel = false,
  className,
}: OpportunityScoreBarProps) {
  const pct = Math.min((score / max) * 100, 100);
  const heights: Record<string, string> = { sm: 'h-1', md: 'h-1.5', lg: 'h-2' };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-mono text-xs font-medium tabular-nums', getScoreTextColor(score))}>
        {score.toFixed(0)}
      </span>
      <div className={cn('flex-1 rounded-full bg-navy-700/60 overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', getScoreColor(score))}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn('text-[10px] font-mono uppercase tracking-wider', getScoreTextColor(score))}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}

interface ScoreBreakdownBarProps {
  label: string;
  score: number;
  max: number;
  className?: string;
}

export function ScoreBreakdownBar({ label, score, max, className }: ScoreBreakdownBarProps) {
  const pct = Math.min((score / max) * 100, 100);

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="font-mono text-xs text-slate-300 tabular-nums">
          {score.toFixed(1)}/{max}
        </span>
      </div>
      <div className="h-1 rounded-full bg-navy-700/60 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getScoreColor((score / max) * 100))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface CrowdingIndicatorProps {
  score: number;
  label: string;
  className?: string;
}

export function CrowdingIndicator({ score, label, className }: CrowdingIndicatorProps) {
  const color =
    score >= 8 ? 'text-red-400' : score >= 6 ? 'text-amber-400' : score >= 3 ? 'text-teal-400' : 'text-emerald-400';

  const displayLabel = label.replace('_', ' ');

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className={cn('font-mono text-xs font-medium tabular-nums', color)}>{score.toFixed(1)}</span>
      <span className="text-[10px] text-slate-500 capitalize">{displayLabel}</span>
    </div>
  );
}
