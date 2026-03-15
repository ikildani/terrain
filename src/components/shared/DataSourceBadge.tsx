import { cn } from '@/lib/utils/cn';
import { ExternalLink } from 'lucide-react';

interface DataSourceBadgeProps {
  source: string;
  type?: 'public' | 'proprietary' | 'licensed';
  url?: string;
  className?: string;
  /** ISO date string indicating when the underlying data was last refreshed */
  lastUpdated?: string;
}

const typeColors = {
  public: 'text-signal-green',
  proprietary: 'text-teal-400',
  licensed: 'text-signal-amber',
};

// ── Freshness helpers ────────────────────────────────────────

function getFreshnessColor(isoDate: string): string {
  const ageMs = Date.now() - new Date(isoDate).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays < 7) return 'text-emerald-400'; // Green — fresh
  if (ageDays <= 90) return 'text-amber-400'; // Amber — aging
  return 'text-red-400'; // Red — stale
}

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear}y ago`;
}

function formatExactDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function DataSourceBadge({ source, type = 'public', url, className, lastUpdated }: DataSourceBadgeProps) {
  const freshnessColor = lastUpdated ? getFreshnessColor(lastUpdated) : undefined;

  const content = (
    <span
      className={cn('inline-flex items-center gap-1.5 text-2xs font-mono', typeColors[type], className)}
      title={lastUpdated ? `Data as of ${formatExactDate(lastUpdated)}` : undefined}
    >
      <span
        className={cn('w-1.5 h-1.5 rounded-full', lastUpdated ? freshnessColor : 'bg-current')}
        style={lastUpdated ? { backgroundColor: 'currentColor' } : undefined}
      />
      {source}
      {lastUpdated && (
        <span className={cn('opacity-70', freshnessColor)}>&middot; {formatRelativeTime(lastUpdated)}</span>
      )}
      {url && <ExternalLink className="w-2.5 h-2.5" />}
    </span>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
        {content}
      </a>
    );
  }

  return content;
}
