'use client';

import { cn } from '@/lib/utils/cn';
import type { LiveIntelligence } from '@/types';

// ────────────────────────────────────────────────────────────
// Live Market Intelligence Panel
// Shows real-time market signals with cited sources.
// Gracefully hidden when no intelligence is available.
// ────────────────────────────────────────────────────────────

interface LiveIntelligencePanelProps {
  intelligence: LiveIntelligence | null | undefined;
}

const SIGNAL_BADGE_CLASSES: Record<string, string> = {
  regulatory: 'bg-blue-500/12 text-blue-400',
  clinical: 'bg-purple-500/12 text-purple-400',
  deal: 'bg-teal-500/12 text-teal-400',
  competitive: 'bg-amber-500/12 text-amber-400',
  market: 'bg-slate-500/12 text-slate-400',
};

function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function LiveIntelligencePanel({ intelligence }: LiveIntelligencePanelProps) {
  if (!intelligence || !intelligence.items || intelligence.items.length === 0) return null;

  return (
    <div className="chart-container noise">
      <div className="flex items-center justify-between mb-4">
        <div className="chart-title !mb-0">Live Market Intelligence</div>
        <span className="text-2xs text-slate-500">Updated {timeAgo(intelligence.fetched_at)}</span>
      </div>
      <div className="space-y-3">
        {intelligence.items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className={cn(
                'inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-mono uppercase tracking-wider flex-shrink-0 mt-0.5',
                SIGNAL_BADGE_CLASSES[item.signal_type] || SIGNAL_BADGE_CLASSES.market,
              )}
            >
              {item.signal_type}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-white font-medium">{item.headline}</p>
              <p className="text-2xs text-slate-500 mt-0.5">{item.detail}</p>
              {item.source_url ? (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xs text-teal-500 hover:text-teal-400 mt-0.5 inline-block"
                >
                  {item.source} &nearr;
                </a>
              ) : (
                <span className="text-2xs text-slate-600 mt-0.5 inline-block">{item.source}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
