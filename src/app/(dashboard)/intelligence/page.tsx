'use client';

import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useIntelligenceFeed } from '@/hooks/useIntelligenceFeed';
import { DataSourceBadge } from '@/components/shared/DataSourceBadge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  Beaker,
  ShieldCheck,
  FileText,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  RefreshCcw,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type SourceTab = 'all' | 'trials' | 'fda' | 'sec';

const SOURCE_TABS: { id: SourceTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All Sources', icon: Database },
  { id: 'trials', label: 'Clinical Trials', icon: Beaker },
  { id: 'fda', label: 'FDA Approvals', icon: ShieldCheck },
  { id: 'sec', label: 'SEC Filings', icon: FileText },
];

const STATUS_COLORS: Record<string, string> = {
  success: 'text-signal-green',
  running: 'text-teal-400',
  error: 'text-signal-red',
  pending: 'text-slate-500',
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  running: RefreshCcw,
  error: AlertCircle,
  pending: Clock,
};

const PHASE_COLORS: Record<string, string> = {
  PHASE1: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  PHASE2: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  PHASE3: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  PHASE4: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  NA: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

const TRIAL_STATUS_COLORS: Record<string, string> = {
  RECRUITING: 'text-signal-green',
  ACTIVE_NOT_RECRUITING: 'text-teal-400',
  NOT_YET_RECRUITING: 'text-amber-400',
  ENROLLING_BY_INVITATION: 'text-blue-400',
  COMPLETED: 'text-slate-400',
};

function formatPhase(phase: string): string {
  return phase.replace('PHASE', 'Phase ');
}

function formatTrialStatus(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

// ── Data Source Health Cards ──────────────────────────────────────

function DataSourceHealthCard({
  source,
}: {
  source: {
    id: string;
    display_name: string;
    source_url: string;
    last_refreshed_at: string | null;
    next_refresh_at: string | null;
    records_count: number;
    status: string;
    last_error: string | null;
    refresh_frequency: string;
  };
}) {
  const StatusIcon = STATUS_ICONS[source.status] ?? Clock;
  const statusColor = STATUS_COLORS[source.status] ?? 'text-slate-500';

  return (
    <div className="card noise p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('w-4 h-4', statusColor)} />
          <span className="text-sm font-semibold text-white">{source.display_name}</span>
        </div>
        <span
          className={cn(
            'text-2xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border',
            source.status === 'success' && 'bg-signal-green/10 text-signal-green border-signal-green/20',
            source.status === 'error' && 'bg-signal-red/10 text-signal-red border-signal-red/20',
            source.status === 'running' && 'bg-teal-500/10 text-teal-400 border-teal-500/20',
            source.status === 'pending' && 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          )}
        >
          {source.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-2xs text-slate-500 uppercase tracking-wider mb-0.5">Records</p>
          <p className="text-sm font-mono text-white">{source.records_count.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-2xs text-slate-500 uppercase tracking-wider mb-0.5">Frequency</p>
          <p className="text-sm font-mono text-white capitalize">{source.refresh_frequency}</p>
        </div>
        <div>
          <p className="text-2xs text-slate-500 uppercase tracking-wider mb-0.5">Last Refresh</p>
          <p className="text-sm font-mono text-white">
            {source.last_refreshed_at
              ? formatDistanceToNow(new Date(source.last_refreshed_at), { addSuffix: true })
              : 'Never'}
          </p>
        </div>
      </div>

      {source.last_error && (
        <div className="text-2xs text-signal-red bg-signal-red/5 border border-signal-red/10 rounded px-2 py-1.5 mb-2 font-mono">
          {source.last_error.slice(0, 120)}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-navy-700/40">
        <DataSourceBadge source={source.display_name} type="public" url={source.source_url} />
        {source.next_refresh_at && (
          <span className="text-2xs text-slate-600 font-mono">
            Next: {new Date(source.next_refresh_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Clinical Trial Row ───────────────────────────────────────────

function TrialRow({
  trial,
}: {
  trial: {
    nct_id: string;
    title: string;
    status: string;
    phase: string;
    conditions: string[];
    sponsor: string;
    enrollment: number;
    last_update_posted: string;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const phaseClass = PHASE_COLORS[trial.phase] ?? PHASE_COLORS.NA;
  const statusColor = TRIAL_STATUS_COLORS[trial.status] ?? 'text-slate-400';

  return (
    <div className="border-b border-navy-700/30 last:border-0">
      <div
        className="flex items-start gap-3 py-3 px-4 hover:bg-navy-800/30 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-6 h-6 rounded bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
          <Beaker className="w-3.5 h-3.5 text-teal-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-2xs font-mono uppercase px-1.5 py-0.5 rounded border', phaseClass)}>
              {formatPhase(trial.phase)}
            </span>
            <span className={cn('text-2xs font-mono', statusColor)}>{formatTrialStatus(trial.status)}</span>
          </div>
          <p className="text-sm text-slate-200 leading-snug line-clamp-2">{trial.title}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-2xs text-slate-500 font-mono">{trial.nct_id}</span>
            <span className="text-2xs text-slate-500">{trial.sponsor}</span>
            {trial.enrollment > 0 && (
              <span className="text-2xs text-slate-500 font-mono">n={trial.enrollment.toLocaleString()}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xs text-slate-600 font-mono">{trial.last_update_posted}</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-3 pl-13">
          <div className="bg-navy-900/60 border border-navy-700/30 rounded-lg p-3 space-y-2">
            {trial.conditions.length > 0 && (
              <div>
                <span className="text-2xs text-slate-500 uppercase tracking-wider">Conditions</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {trial.conditions.slice(0, 6).map((c) => (
                    <span
                      key={c}
                      className="text-2xs bg-navy-800 text-slate-300 px-2 py-0.5 rounded border border-navy-700/40"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://clinicaltrials.gov/study/${trial.nct_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xs text-teal-500 hover:text-teal-400 flex items-center gap-1"
              >
                View on ClinicalTrials.gov <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── FDA Approval Row ─────────────────────────────────────────────

function FDARow({
  approval,
}: {
  approval: {
    application_number: string;
    brand_name: string | null;
    generic_name: string | null;
    sponsor_name: string | null;
    approval_date: string | null;
    application_type: string;
    active_ingredients: string[];
    submission_type: string | null;
    submission_status: string | null;
  };
}) {
  const typeClass =
    approval.application_type === 'BLA'
      ? 'bg-purple-500/15 text-purple-400 border-purple-500/20'
      : approval.application_type === 'NDA'
        ? 'bg-teal-500/15 text-teal-400 border-teal-500/20'
        : 'bg-slate-500/15 text-slate-400 border-slate-500/20';

  return (
    <div className="flex items-start gap-3 py-3 px-4 border-b border-navy-700/30 last:border-0 hover:bg-navy-800/30 transition-colors">
      <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn('text-2xs font-mono uppercase px-1.5 py-0.5 rounded border', typeClass)}>
            {approval.application_type}
          </span>
          {approval.submission_status && (
            <span className="text-2xs font-mono text-slate-400">{approval.submission_status}</span>
          )}
        </div>
        <p className="text-sm text-slate-200">
          {approval.brand_name && <span className="font-semibold text-white">{approval.brand_name}</span>}
          {approval.brand_name && approval.generic_name && ' — '}
          {approval.generic_name && <span className="text-slate-400">{approval.generic_name}</span>}
          {!approval.brand_name && !approval.generic_name && (
            <span className="text-slate-400">{approval.application_number}</span>
          )}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-2xs text-slate-500 font-mono">{approval.application_number}</span>
          {approval.sponsor_name && <span className="text-2xs text-slate-500">{approval.sponsor_name}</span>}
          {approval.active_ingredients.length > 0 && (
            <span className="text-2xs text-slate-600">{approval.active_ingredients.slice(0, 2).join(', ')}</span>
          )}
        </div>
      </div>
      <div className="shrink-0">
        <span className="text-2xs text-slate-600 font-mono">{approval.approval_date ?? 'N/A'}</span>
      </div>
    </div>
  );
}

// ── SEC Filing Row ───────────────────────────────────────────────

function SECRow({
  filing,
}: {
  filing: {
    accession_number: string;
    company_name: string;
    ticker: string | null;
    form_type: string;
    filed_date: string;
    description: string;
    file_url: string;
    is_deal_related: boolean;
    deal_keywords: string[];
  };
}) {
  return (
    <div className="flex items-start gap-3 py-3 px-4 border-b border-navy-700/30 last:border-0 hover:bg-navy-800/30 transition-colors">
      <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <FileText className="w-3.5 h-3.5 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xs font-mono uppercase px-1.5 py-0.5 rounded border bg-navy-800 text-slate-300 border-navy-700/40">
            {filing.form_type}
          </span>
          {filing.is_deal_related && (
            <span className="text-2xs font-mono uppercase px-1.5 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20">
              Deal Activity
            </span>
          )}
          {filing.ticker && <span className="text-2xs font-mono text-teal-500">${filing.ticker}</span>}
        </div>
        <p className="text-sm text-slate-200 font-semibold">{filing.company_name}</p>
        {filing.description && <p className="text-2xs text-slate-400 mt-0.5 line-clamp-1">{filing.description}</p>}
        {filing.deal_keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {filing.deal_keywords.map((kw) => (
              <span
                key={kw}
                className="text-[9px] font-mono text-amber-400/80 bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-2xs text-slate-600 font-mono">{filing.filed_date}</span>
        <a
          href={filing.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded hover:bg-navy-700/50 transition-colors"
          aria-label="View filing on SEC.gov"
        >
          <ExternalLink className="w-3 h-3 text-slate-500 hover:text-teal-500" />
        </a>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────

export default function IntelligenceFeedPage() {
  const [activeTab, setActiveTab] = useState<SourceTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 400);
  };

  const { sources, trials, fda, sec, counts, isLoading, dataUpdatedAt } = useIntelligenceFeed({
    source: activeTab === 'all' ? undefined : activeTab,
    search: debouncedSearch || undefined,
    limit: 50,
  });

  const totalRecords = counts.trials + counts.fda + counts.sec;

  return (
    <>
      <PageHeader
        title="Market Intelligence"
        subtitle="Live data from ClinicalTrials.gov, FDA, and SEC EDGAR — refreshed automatically"
        actions={
          dataUpdatedAt ? (
            <span className="text-2xs font-mono text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" />
              Updated {formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}
            </span>
          ) : undefined
        }
      />

      {/* Data Source Health */}
      <h2 className="label mb-3 flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-teal-500" />
        Data Pipeline Status
      </h2>
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="h-[160px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {sources.map((source) => (
            <DataSourceHealthCard key={source.id} source={source} />
          ))}
        </div>
      )}

      {/* Source Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1 bg-navy-900/60 rounded-lg border border-navy-700/40 p-1">
          {SOURCE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count =
              tab.id === 'all'
                ? totalRecords
                : tab.id === 'trials'
                  ? counts.trials
                  : tab.id === 'fda'
                    ? counts.fda
                    : counts.sec;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  isActive
                    ? 'bg-navy-700 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-navy-800/50',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                <span className={cn('font-mono text-2xs', isActive ? 'text-teal-400' : 'text-slate-600')}>
                  {count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search trials, drugs, companies..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-navy-900/60 border border-navy-700/40 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDebouncedSearch('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <Filter className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Feed Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="h-[200px]" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Clinical Trials */}
          {(activeTab === 'all' || activeTab === 'trials') && trials.length > 0 && (
            <div className="card noise overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700/40">
                <div className="flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-teal-500" />
                  <h3 className="text-sm font-semibold text-white">Clinical Trials</h3>
                  <span className="text-2xs font-mono text-slate-500">{counts.trials.toLocaleString()} cached</span>
                </div>
                <DataSourceBadge source="ClinicalTrials.gov" type="public" url="https://clinicaltrials.gov" />
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {trials.map((trial) => (
                  <TrialRow key={trial.nct_id} trial={trial} />
                ))}
              </div>
            </div>
          )}

          {/* FDA Approvals */}
          {(activeTab === 'all' || activeTab === 'fda') && fda.length > 0 && (
            <div className="card noise overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700/40">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">FDA Approvals & Submissions</h3>
                  <span className="text-2xs font-mono text-slate-500">{counts.fda.toLocaleString()} cached</span>
                </div>
                <DataSourceBadge source="openFDA" type="public" url="https://open.fda.gov" />
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {fda.map((approval) => (
                  <FDARow key={approval.application_number} approval={approval} />
                ))}
              </div>
            </div>
          )}

          {/* SEC Filings */}
          {(activeTab === 'all' || activeTab === 'sec') && sec.length > 0 && (
            <div className="card noise overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700/40">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">SEC Deal Filings</h3>
                  <span className="text-2xs font-mono text-slate-500">{counts.sec.toLocaleString()} cached</span>
                </div>
                <DataSourceBadge
                  source="SEC EDGAR"
                  type="public"
                  url="https://www.sec.gov/edgar/searchedgar/companysearch"
                />
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {sec.map((filing) => (
                  <SECRow key={filing.accession_number} filing={filing} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {trials.length === 0 && fda.length === 0 && sec.length === 0 && (
            <div className="card noise p-12 text-center flex flex-col items-center">
              <Database className="w-12 h-12 text-navy-600 mb-4" />
              <h3 className="font-display text-lg text-white mb-2">
                {debouncedSearch ? 'No Results Found' : 'Intelligence Feed Loading'}
              </h3>
              <p className="text-sm text-slate-500 max-w-md">
                {debouncedSearch
                  ? `No records match "${debouncedSearch}". Try a different search term.`
                  : 'Data pipelines are populating. Clinical trials, FDA approvals, and SEC filings will appear here once the automated cron jobs complete their first run.'}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
