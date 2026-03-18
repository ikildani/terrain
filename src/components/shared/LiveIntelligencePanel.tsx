'use client';

import { cn } from '@/lib/utils/cn';
import type { LiveIntelligence, LiveIntelligenceItem } from '@/types';
import { CheckCircle2, Handshake, Microscope, Newspaper, Scale, Target, TrendingUp } from 'lucide-react';

// ────────────────────────────────────────────────────────────
// Live Market Intelligence Panel
// Shows real-time market signals with cited sources.
// Shows a subtle placeholder when no intelligence is available.
// ────────────────────────────────────────────────────────────

interface LiveIntelligencePanelProps {
  intelligence: LiveIntelligence | null | undefined;
}

const SIGNAL_BADGE_CLASSES: Record<string, string> = {
  regulatory: 'bg-blue-500/20 text-blue-400',
  clinical: 'bg-purple-500/20 text-purple-400',
  deal: 'bg-teal-500/20 text-teal-400',
  competitive: 'bg-amber-500/20 text-amber-400',
  market: 'bg-slate-500/20 text-slate-400',
};

const SIGNAL_BORDER_CLASSES: Record<string, string> = {
  regulatory: 'border-l-blue-500',
  clinical: 'border-l-purple-500',
  deal: 'border-l-teal-500',
  competitive: 'border-l-amber-500',
  market: 'border-l-slate-500',
};

const SIGNAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  regulatory: Scale,
  clinical: Microscope,
  deal: Handshake,
  competitive: Target,
  market: TrendingUp,
};

/** Trusted government / institutional source domains. */
const CREDIBLE_DOMAINS = ['fda.gov', 'nih.gov', 'who.int', 'sec.gov'];

function isCredibleSource(url?: string): boolean {
  if (!url) return false;
  return CREDIBLE_DOMAINS.some((d) => url.includes(d));
}

function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function SignalItem({ item }: { item: LiveIntelligenceItem }) {
  const Icon = SIGNAL_ICONS[item.signal_type] || TrendingUp;
  const credible = isCredibleSource(item.source_url);

  return (
    <div
      className={cn(
        'flex items-start gap-3 border-l-2 pl-3',
        SIGNAL_BORDER_CLASSES[item.signal_type] || 'border-l-slate-500',
      )}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-mono uppercase tracking-wider flex-shrink-0 mt-0.5',
          SIGNAL_BADGE_CLASSES[item.signal_type] || SIGNAL_BADGE_CLASSES.market,
        )}
      >
        <Icon className="w-3 h-3" />
        {item.signal_type}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{item.headline}</p>
        <p className="text-xs text-slate-400 italic mt-0.5">{item.detail}</p>
        {item.source_url ? (
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xs text-teal-500 hover:text-teal-400 mt-0.5 inline-flex items-center gap-1"
          >
            {item.source}
            {credible && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            &nearr;
          </a>
        ) : (
          <span className="text-2xs text-slate-600 mt-0.5 inline-block">{item.source}</span>
        )}
      </div>
    </div>
  );
}

export function LiveIntelligencePanel({ intelligence }: LiveIntelligencePanelProps) {
  const hasItems = intelligence?.items && intelligence.items.length > 0;

  if (!hasItems) {
    return (
      <div className="chart-container noise">
        <div className="flex items-center justify-between mb-2">
          <div className="chart-title !mb-0">Live Market Intelligence</div>
        </div>
        <div className="flex items-center gap-3 py-4 text-slate-500">
          <Newspaper className="w-5 h-5" />
          <p className="text-xs">No live market signals available for this indication. Intelligence updates daily.</p>
        </div>
      </div>
    );
  }

  const count = intelligence!.items.length;

  return (
    <div className="chart-container noise">
      <div className="flex items-center justify-between mb-4">
        <div className="chart-title !mb-0">
          Live Market Intelligence{' '}
          <span className="text-2xs font-mono text-slate-500 ml-1">
            ({count} signal{count !== 1 ? 's' : ''})
          </span>
        </div>
        <span className="text-2xs text-slate-500">Updated {timeAgo(intelligence!.fetched_at)}</span>
      </div>
      <div className="space-y-3">
        {intelligence!.items.map((item, i) => (
          <SignalItem key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
