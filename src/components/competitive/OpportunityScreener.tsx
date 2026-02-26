'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Radar, TrendingUp, Users, Target, BarChart3, Search, Download } from 'lucide-react';
import { OpportunityFilterBar, type ScreenerFilters } from './OpportunityFilterBar';
import { OpportunityTable } from './OpportunityTable';
import { OpportunityScoreBar } from './OpportunityScoreBar';
import { SkeletonTable, SkeletonMetric } from '@/components/ui/Skeleton';
import type { OpportunityRow } from '@/lib/analytics/screener';

// ── Types ──────────────────────────────────────────────────

interface ScreenerApiResponse {
  success: boolean;
  data?: {
    opportunities: OpportunityRow[];
    total_count: number;
    filters_applied: Record<string, unknown>;
    generated_at: string;
  };
  error?: string;
}

// ── Summary stat cards ─────────────────────────────────────

function SummaryStats({ rows, totalCount }: { rows: OpportunityRow[]; totalCount: number }) {
  if (rows.length === 0) return null;

  const avgScore = rows.reduce((sum, r) => sum + r.opportunity_score, 0) / rows.length;
  const highOpp = rows.filter((r) => r.opportunity_score >= 60).length;
  const openMarkets = rows.filter((r) => r.crowding_score < 4).length;
  const therapyAreas = new Set(rows.map((r) => r.therapy_area)).size;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="stat-card">
        <div className="flex items-center gap-1.5 mb-2">
          <Radar className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Indications Screened</span>
        </div>
        <div className="font-mono text-xl text-white font-medium">{totalCount}</div>
        <p className="text-[10px] text-slate-500 mt-1">across {therapyAreas} therapy areas</p>
      </div>

      <div className="stat-card">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Avg Score</span>
        </div>
        <div className="flex items-center gap-2">
          <OpportunityScoreBar score={avgScore} size="lg" className="flex-1" />
        </div>
        <p className="text-[10px] text-slate-500 mt-1">composite opportunity score</p>
      </div>

      <div className="stat-card">
        <div className="flex items-center gap-1.5 mb-2">
          <Target className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">High Opportunity</span>
        </div>
        <div className="font-mono text-xl text-emerald-400 font-medium">{highOpp}</div>
        <p className="text-[10px] text-slate-500 mt-1">indications scoring 60+</p>
      </div>

      <div className="stat-card">
        <div className="flex items-center gap-1.5 mb-2">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Open Markets</span>
        </div>
        <div className="font-mono text-xl text-teal-400 font-medium">{openMarkets}</div>
        <p className="text-[10px] text-slate-500 mt-1">crowding score &lt; 4</p>
      </div>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────

function Pagination({
  offset,
  limit,
  total,
  onPageChange,
}: {
  offset: number;
  limit: number;
  total: number;
  onPageChange: (newOffset: number) => void;
}) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-3">
      <span className="text-xs text-slate-500 font-mono">
        {offset + 1}–{Math.min(offset + limit, total)} of {total}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md text-xs border border-navy-700 bg-navy-800/50 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:border-navy-600 hover:text-slate-300 transition-colors"
        >
          Prev
        </button>
        <span className="px-3 py-1 text-xs font-mono text-slate-500">
          {currentPage}/{totalPages}
        </span>
        <button
          onClick={() => onPageChange(offset + limit)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md text-xs border border-navy-700 bg-navy-800/50 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:border-navy-600 hover:text-slate-300 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────

function ScreenerEmptyState() {
  return (
    <div className="card noise p-12 text-center flex flex-col items-center">
      <BarChart3 className="w-12 h-12 text-navy-600 mb-4" />
      <h3 className="font-display text-lg text-white mb-2">Opportunity Screener</h3>
      <p className="text-sm text-slate-500 max-w-md">
        Cross-query 214 indications against competitive density, global prevalence, unmet need, and partner landscape.
        Click <strong className="text-slate-300">Screen Opportunities</strong> to generate a ranked opportunity map.
      </p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

const DEFAULT_FILTERS: ScreenerFilters = {
  therapy_areas: [],
  min_prevalence: undefined,
  max_crowding: undefined,
  phases: [],
  min_opportunity_score: undefined,
};

const AVAILABLE_THERAPY_AREAS = [
  'cardiovascular',
  'dermatology',
  'endocrinology',
  'gastroenterology',
  'hematology',
  'hepatology',
  'immunology',
  'infectious_disease',
  'metabolic',
  'musculoskeletal',
  'nephrology',
  'neurology',
  'oncology',
  'ophthalmology',
  'pain_management',
  'psychiatry',
  'pulmonology',
  'rare_disease',
];

const PAGE_SIZE = 250;

// ── CSV Export ────────────────────────────────────────────

function exportCsv(data: OpportunityRow[]) {
  const headers = [
    'Indication',
    'Therapy Area',
    'Opportunity Score',
    'Global Prevalence',
    'US Prevalence',
    'Crowding Score',
    'Crowding Label',
    'Competitors',
    'Treatment Rate %',
    'Diagnosis Rate %',
    'CAGR 5yr %',
    'Top Competitors',
    'White Space',
  ];
  const csvRows = [headers.join(',')];
  for (const r of data) {
    csvRows.push(
      [
        `"${r.indication}"`,
        r.therapy_area,
        r.opportunity_score.toFixed(1),
        r.global_prevalence,
        r.us_prevalence,
        r.crowding_score.toFixed(1),
        r.crowding_label,
        r.competitor_count,
        (r.treatment_rate * 100).toFixed(0),
        (r.diagnosis_rate * 100).toFixed(0),
        r.cagr_5yr.toFixed(1),
        `"${r.top_competitors.join('; ')}"`,
        `"${r.white_space_hints.join('; ')}"`,
      ].join(','),
    );
  }
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `opportunity-screener-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OpportunityScreener() {
  const [filters, setFilters] = useState<ScreenerFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<string>('opportunity_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [offset, setOffset] = useState(0);
  const [rows, setRows] = useState<OpportunityRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  // Client-side text filtering on indication name
  const filteredRows = searchQuery.trim()
    ? rows.filter((r) => r.indication.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : rows;

  const mutation = useMutation({
    mutationFn: async (params: {
      filters: ScreenerFilters;
      sort_by: string;
      sort_order: 'asc' | 'desc';
      offset: number;
    }): Promise<ScreenerApiResponse> => {
      const apiFilters: Record<string, unknown> = {};
      if (params.filters.therapy_areas.length > 0) apiFilters.therapy_areas = params.filters.therapy_areas;
      if (params.filters.min_prevalence !== undefined) apiFilters.min_prevalence = params.filters.min_prevalence;
      if (params.filters.max_crowding !== undefined) apiFilters.max_crowding = params.filters.max_crowding;
      if (params.filters.phases.length > 0) apiFilters.phases = params.filters.phases;
      if (params.filters.min_opportunity_score !== undefined)
        apiFilters.min_opportunity_score = params.filters.min_opportunity_score;

      const res = await fetch('/api/analyze/screener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: Object.keys(apiFilters).length > 0 ? apiFilters : undefined,
          sort_by: params.sort_by,
          sort_order: params.sort_order,
          limit: PAGE_SIZE,
          offset: params.offset,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Screener analysis failed');
      return json;
    },
    onSuccess: (result) => {
      if (result.data) {
        setRows(result.data.opportunities);
        setTotalCount(result.data.total_count);
        setGeneratedAt(result.data.generated_at);
      }
      setHasSearched(true);
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Screener analysis failed';
      toast.error(msg.includes('limit') ? 'Usage limit reached — upgrade to continue' : msg);
    },
  });

  const runScreener = useCallback(
    (newOffset = 0) => {
      setOffset(newOffset);
      mutation.mutate({ filters, sort_by: sortBy, sort_order: sortOrder, offset: newOffset });
    },
    [filters, sortBy, sortOrder, mutation],
  );

  // Auto-run on initial mount
  useEffect(() => {
    if (!hasSearched && !mutation.isPending) {
      runScreener(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSort(field: string) {
    const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(field);
    setSortOrder(newOrder);
    setOffset(0);
    mutation.mutate({ filters, sort_by: field, sort_order: newOrder, offset: 0 });
  }

  function handleFiltersChange(newFilters: ScreenerFilters) {
    setFilters(newFilters);
  }

  function handleApplyFilters() {
    setOffset(0);
    mutation.mutate({ filters, sort_by: sortBy, sort_order: sortOrder, offset: 0 });
  }

  const isLoading = mutation.isPending;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <OpportunityFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableTherapyAreas={AVAILABLE_THERAPY_AREAS}
        isLoading={isLoading}
        totalCount={hasSearched ? totalCount : undefined}
      />

      {/* Apply filters button + search + export */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => handleApplyFilters()}
          disabled={isLoading}
          className="btn btn-primary text-sm px-6 py-2 inline-flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Screening...
            </>
          ) : (
            <>
              <Radar className="w-4 h-4" />
              Screen Opportunities
            </>
          )}
        </button>

        {hasSearched && !isLoading && (
          <button
            onClick={() => exportCsv(filteredRows)}
            className="btn text-sm px-4 py-2 inline-flex items-center gap-2 border border-navy-700 bg-navy-800/50 text-slate-400 hover:border-navy-600 hover:text-slate-300 transition-colors rounded-md"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}

        {/* Indication text search */}
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search indications..."
            className="pl-8 pr-3 py-2 text-sm bg-navy-800/50 border border-navy-700 rounded-md text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 w-56"
          />
        </div>

        {hasSearched && !isLoading && (
          <span className="text-xs text-slate-500">
            Sorted by <span className="text-slate-400 font-mono">{sortBy.replaceAll('_', ' ')}</span>{' '}
            <span className="text-slate-600">({sortOrder})</span>
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && !hasSearched && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonMetric key={i} />
            ))}
          </div>
          <SkeletonTable rows={10} columns={8} />
        </div>
      )}

      {/* Summary stats */}
      {hasSearched && !isLoading && <SummaryStats rows={filteredRows} totalCount={filteredRows.length} />}

      {/* Generated at timestamp */}
      {hasSearched && !isLoading && generatedAt && (
        <p className="text-[10px] font-mono text-slate-600">
          Screened at {new Date(generatedAt).toLocaleString()} &middot; {filteredRows.length}
          {searchQuery.trim() ? ` of ${totalCount}` : ''} indications
        </p>
      )}

      {/* Results table */}
      {hasSearched && (
        <>
          <OpportunityTable
            rows={filteredRows}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            isLoading={isLoading}
          />
          <Pagination offset={offset} limit={PAGE_SIZE} total={filteredRows.length} onPageChange={runScreener} />
        </>
      )}

      {/* Empty state (only before first search) */}
      {!hasSearched && !isLoading && <ScreenerEmptyState />}
    </div>
  );
}
