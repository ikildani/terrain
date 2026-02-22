import { cn } from '@/lib/utils/cn';
import { Tooltip } from '@/components/ui/Tooltip';

interface StatCardProps {
  label: string;
  value: string;
  subvalue?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'flat';
  confidence?: 'high' | 'medium' | 'low';
  source?: string;
  range?: { low: string; high: string };
  className?: string;
}

export function StatCard({
  label,
  value,
  subvalue,
  trend,
  trendDirection,
  confidence,
  source,
  range,
  className,
}: StatCardProps) {
  return (
    <div className={cn('stat-card noise', className)}>
      <div className="flex items-center justify-between mb-1">
        <span className="label">{label}</span>
        {confidence && (
          <span
            className={cn(
              'text-2xs font-mono uppercase tracking-wider',
              confidence === 'high' && 'confidence-high',
              confidence === 'medium' && 'confidence-medium',
              confidence === 'low' && 'confidence-low'
            )}
          >
            {confidence}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="metric text-2xl text-white">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trendDirection === 'up' && 'text-signal-green',
              trendDirection === 'down' && 'text-signal-red',
              trendDirection === 'flat' && 'text-slate-500'
            )}
          >
            {trend}
          </span>
        )}
      </div>
      {range && (
        <p className="text-[10px] font-mono text-slate-500 mt-0.5">
          Range: {range.low} – {range.high}
        </p>
      )}
      {subvalue && <p className="text-xs text-slate-500 mt-1">{subvalue}</p>}
      {source && (
        <div className="mt-2 pt-2 border-t border-navy-700">
          <Tooltip content={`Source: ${source}`}>
            <span className="text-2xs text-slate-600 cursor-help hover:text-slate-400 transition-colors">
              Source: {source}
            </span>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
