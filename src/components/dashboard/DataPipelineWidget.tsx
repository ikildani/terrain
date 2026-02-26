'use client';

import Link from 'next/link';
import { useIntelligenceFeed } from '@/hooks/useIntelligenceFeed';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCcw,
  ArrowRight,
  Beaker,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  clinicaltrials: Beaker,
  openfda_approvals: ShieldCheck,
  sec_edgar: FileText,
};

const SOURCE_COLORS: Record<string, string> = {
  clinicaltrials: 'text-teal-500 bg-teal-500/10',
  openfda_approvals: 'text-emerald-400 bg-emerald-500/10',
  sec_edgar: 'text-amber-400 bg-amber-500/10',
};

const STATUS_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  success: { icon: CheckCircle2, color: 'text-signal-green', label: 'Synced' },
  running: { icon: RefreshCcw, color: 'text-teal-400', label: 'Syncing' },
  error: { icon: AlertCircle, color: 'text-signal-red', label: 'Error' },
  pending: { icon: Clock, color: 'text-slate-500', label: 'Pending' },
};

export default function DataPipelineWidget() {
  const { sources, counts, isLoading } = useIntelligenceFeed({ limit: 1 });

  if (isLoading) {
    return (
      <div className="card noise animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-3 w-3 bg-navy-700/60 rounded-full" />
          <div className="h-3 w-28 bg-navy-700/60 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 bg-navy-700/40 rounded" />
              <div className="flex-1">
                <div className="h-3 w-24 bg-navy-700/60 rounded mb-1.5" />
                <div className="h-2.5 w-32 bg-navy-700/40 rounded" />
              </div>
              <div className="h-3 w-12 bg-navy-700/40 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalRecords = counts.trials + counts.fda + counts.sec;
  const allHealthy = sources.length > 0 && sources.every((s) => s.status === 'success');
  const hasErrors = sources.some((s) => s.status === 'error');

  return (
    <div className="card noise">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-teal-500" />
          <h3 className="label">Live Data Pipelines</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              allHealthy ? 'bg-signal-green animate-pulse' : hasErrors ? 'bg-signal-red' : 'bg-amber-400',
            )}
          />
          <span className="text-2xs font-mono text-slate-500">{totalRecords.toLocaleString()} records</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {sources.map((source) => {
          const Icon = SOURCE_ICONS[source.id] ?? Beaker;
          const colorClass = SOURCE_COLORS[source.id] ?? 'text-slate-400 bg-slate-500/10';
          const statusCfg = STATUS_CONFIG[source.status] ?? STATUS_CONFIG.pending;
          const StatusIcon = statusCfg.icon;

          return (
            <div key={source.id} className="flex items-center gap-3 group">
              <div
                className={cn('w-7 h-7 rounded-md flex items-center justify-center shrink-0', colorClass.split(' ')[1])}
              >
                <Icon className={cn('w-3.5 h-3.5', colorClass.split(' ')[0])} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white font-medium truncate">{source.display_name}</span>
                  <StatusIcon className={cn('w-3 h-3', statusCfg.color)} />
                </div>
                <p className="text-2xs text-slate-500 font-mono">
                  {source.records_count.toLocaleString()} records
                  {source.last_refreshed_at && (
                    <> &middot; {formatDistanceToNow(new Date(source.last_refreshed_at), { addSuffix: true })}</>
                  )}
                </p>
              </div>
              <span className="text-2xs text-slate-600 font-mono capitalize shrink-0">{source.refresh_frequency}</span>
            </div>
          );
        })}
      </div>

      {sources.length > 0 && (
        <Link
          href="/intelligence"
          className="flex items-center justify-center gap-1.5 w-full mt-4 pt-3 border-t border-navy-700/40 text-xs text-teal-500 hover:text-teal-400 transition-colors"
        >
          View Intelligence Feed <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
