'use client';

import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { PartnerRedFlag } from '@/types';
import { useState } from 'react';

interface PartnerRedFlagsBadgesProps {
  flags: PartnerRedFlag[];
  /** Show inline badges only (compact mode for partner card header) */
  compact?: boolean;
}

const SEVERITY_STYLES: Record<PartnerRedFlag['severity'], { badge: string; dot: string; border: string }> = {
  high: {
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    dot: 'bg-red-400',
    border: 'border-red-500/20',
  },
  medium: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
    border: 'border-amber-500/20',
  },
  low: {
    badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    dot: 'bg-slate-400',
    border: 'border-slate-500/20',
  },
};

function SeverityBadge({ severity }: { severity: PartnerRedFlag['severity'] }) {
  const label = severity === 'high' ? 'HIGH' : severity === 'medium' ? 'MED' : 'LOW';
  return (
    <span
      className={cn(
        'inline-flex text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border',
        SEVERITY_STYLES[severity].badge,
      )}
    >
      {label}
    </span>
  );
}

export default function PartnerRedFlagsBadges({ flags, compact }: PartnerRedFlagsBadgesProps) {
  const [expanded, setExpanded] = useState(false);

  if (!flags || flags.length === 0) return null;

  const highCount = flags.filter((f) => f.severity === 'high').length;
  const medCount = flags.filter((f) => f.severity === 'medium').length;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {flags.slice(0, 3).map((flag, i) => (
          <span
            key={`${flag.flag}-${i}`}
            className={cn(
              'inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded border',
              SEVERITY_STYLES[flag.severity].badge,
            )}
            title={flag.detail}
          >
            <AlertTriangle className="w-2.5 h-2.5" />
            {flag.flag}
          </span>
        ))}
        {flags.length > 3 && <span className="text-2xs text-slate-500">+{flags.length - 3} more</span>}
      </div>
    );
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs transition-colors hover:text-slate-300"
      >
        <AlertTriangle
          className={cn(
            'w-3.5 h-3.5',
            highCount > 0 ? 'text-red-400' : medCount > 0 ? 'text-amber-400' : 'text-slate-500',
          )}
        />
        <span className={cn(highCount > 0 ? 'text-red-400' : medCount > 0 ? 'text-amber-400' : 'text-slate-400')}>
          {flags.length} Red Flag{flags.length !== 1 ? 's' : ''} Identified
        </span>
        {highCount > 0 && (
          <span className="text-2xs font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{highCount} high</span>
        )}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 animate-fade-in">
          {flags.map((flag, i) => (
            <div
              key={`${flag.flag}-${i}`}
              className={cn('p-3 rounded-md border bg-navy-800/30', SEVERITY_STYLES[flag.severity].border)}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <SeverityBadge severity={flag.severity} />
                <span className="text-xs text-white font-medium">{flag.flag}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{flag.detail}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Info className="w-2.5 h-2.5 text-slate-600" />
                <span className="text-[10px] text-slate-600">{flag.source}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
