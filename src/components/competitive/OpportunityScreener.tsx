'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Radar,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Search,
  Download,
  Rocket,
  Dna,
  SlidersHorizontal,
  DollarSign,
  Shield,
  X,
  UserCog,
} from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpportunityFilterBar, type ScreenerFilters } from './OpportunityFilterBar';
import { OpportunityTable } from './OpportunityTable';
import { OpportunityScoreBar } from './OpportunityScoreBar';
import { SkeletonTable, SkeletonMetric } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';
import type { OpportunityRow } from '@/lib/analytics/screener';
import { WEIGHT_PROFILES, DEFAULT_WEIGHT_PROFILE } from '@/lib/analytics/screener';
import { useProfile } from '@/hooks/useProfile';

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

function SummaryStats({
  rows,
  totalCount,
  allRows,
  weightProfile,
}: {
  rows: OpportunityRow[];
  totalCount: number;
  allRows: OpportunityRow[];
  weightProfile?: string;
}) {
  if (allRows.length === 0) return null;

  // Compute stats on ALL rows (full dataset), not just filtered/visible subset
  const avgScore = allRows.reduce((sum, r) => sum + r.opportunity_score, 0) / allRows.length;
  const highOpp = allRows.filter((r) => r.opportunity_score >= 60).length;
  const openMarkets = allRows.filter((r) => r.crowding_score < 4 && r.crowding_label !== 'no_data').length;
  const therapyAreas = new Set(allRows.map((r) => r.therapy_area)).size;
  const totalUnpartneredFic = allRows.reduce((sum, r) => sum + (r.unpartnered_fic_count ?? 0), 0);
  const totalNovelMoa = allRows.reduce((sum, r) => sum + (r.novel_mechanism_count ?? 0), 0);

  // Lens-specific computed stats
  const totalDeals = allRows.reduce((sum, r) => sum + (r.deal_activity?.recent_deal_count ?? 0), 0);
  const withCatalysts = allRows.filter((r) => (r.catalyst_signals?.length ?? 0) > 0).length;
  const withHighCatalysts = allRows.filter((r) => r.catalyst_signals?.some((c) => c.impact === 'high') ?? false).length;
  const withPatentCliffs = allRows.filter((r) => r.nearest_patent_cliff_year !== null).length;

  // Common first 3 cards (Screened, Avg Score, High Opportunity)
  const commonCards = (
    <>
      <div className="stat-card">
        <div className="flex items-center gap-1.5 mb-2">
          <Radar className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Screened</span>
        </div>
        <div className="font-mono text-xl text-white font-medium">{totalCount}</div>
        <p className="text-[10px] text-slate-500 mt-1">across {therapyAreas} TAs</p>
      </div>

      <div className="stat-card">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Avg Score</span>
        </div>
        <div className="flex items-center gap-2">
          <OpportunityScoreBar score={avgScore} size="lg" className="flex-1" />
        </div>
        <p className="text-[10px] text-slate-500 mt-1">composite</p>
      </div>

      <div className="stat-card">
        <div className="flex items-center gap-1.5 mb-2">
          <Target className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">High Opportunity</span>
        </div>
        <div className="font-mono text-xl text-emerald-400 font-medium">{highOpp}</div>
        <p className="text-[10px] text-slate-500 mt-1">scoring 60+</p>
      </div>
    </>
  );

  // Lens-specific last 3 cards
  function lensCards() {
    if (weightProfile === 'investor') {
      return (
        <>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Deal Activity</span>
            </div>
            <div className="font-mono text-xl text-emerald-400 font-medium">{totalDeals}</div>
            <p className="text-[10px] text-slate-500 mt-1">transactions tracked</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <Rocket className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">High Catalysts</span>
            </div>
            <div className="font-mono text-xl text-amber-400 font-medium">{withHighCatalysts}</div>
            <p className="text-[10px] text-slate-500 mt-1">of {withCatalysts} with signals</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Patent Cliffs</span>
            </div>
            <div className="font-mono text-xl text-teal-400 font-medium">{withPatentCliffs}</div>
            <p className="text-[10px] text-slate-500 mt-1">with LOE exposure</p>
          </div>
        </>
      );
    }

    if (weightProfile === 'competitive_entry') {
      return (
        <>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Open Markets</span>
            </div>
            <div className="font-mono text-xl text-teal-400 font-medium">{openMarkets}</div>
            <p className="text-[10px] text-slate-500 mt-1">crowding &lt; 4</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <Rocket className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Unpartnered FIC</span>
            </div>
            <div className="font-mono text-xl text-teal-400 font-medium">{totalUnpartneredFic}</div>
            <p className="text-[10px] text-slate-500 mt-1">scouting targets</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <Dna className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Novel MoA</span>
            </div>
            <div className="font-mono text-xl text-violet-400 font-medium">{totalNovelMoa}</div>
            <p className="text-[10px] text-slate-500 mt-1">differentiated assets</p>
          </div>
        </>
      );
    }

    if (weightProfile === 'big_pharma_bd') {
      return (
        <>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Deal Flow</span>
            </div>
            <div className="font-mono text-xl text-emerald-400 font-medium">{totalDeals}</div>
            <p className="text-[10px] text-slate-500 mt-1">recent transactions</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <Rocket className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Unpartnered FIC</span>
            </div>
            <div className="font-mono text-xl text-teal-400 font-medium">{totalUnpartneredFic}</div>
            <p className="text-[10px] text-slate-500 mt-1">in-licensing targets</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Patent Cliffs</span>
            </div>
            <div className="font-mono text-xl text-teal-400 font-medium">{withPatentCliffs}</div>
            <p className="text-[10px] text-slate-500 mt-1">replacement opportunity</p>
          </div>
        </>
      );
    }

    if (weightProfile === 'corp_dev') {
      return (
        <>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Patent Cliffs</span>
            </div>
            <div className="font-mono text-xl text-amber-400 font-medium">{withPatentCliffs}</div>
            <p className="text-[10px] text-slate-500 mt-1">acquisition windows</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">M&A Activity</span>
            </div>
            <div className="font-mono text-xl text-emerald-400 font-medium">{totalDeals}</div>
            <p className="text-[10px] text-slate-500 mt-1">transactions tracked</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <Rocket className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">High Catalysts</span>
            </div>
            <div className="font-mono text-xl text-amber-400 font-medium">{withHighCatalysts}</div>
            <p className="text-[10px] text-slate-500 mt-1">timing signals</p>
          </div>
        </>
      );
    }

    if (weightProfile === 'analyst') {
      const highConfidence = allRows.filter((r) => r.data_confidence === 'high').length;
      return (
        <>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Open Markets</span>
            </div>
            <div className="font-mono text-xl text-teal-400 font-medium">{openMarkets}</div>
            <p className="text-[10px] text-slate-500 mt-1">crowding &lt; 4</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Deal Flow</span>
            </div>
            <div className="font-mono text-xl text-emerald-400 font-medium">{totalDeals}</div>
            <p className="text-[10px] text-slate-500 mt-1">transactions tracked</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">High Confidence</span>
            </div>
            <div className="font-mono text-xl text-teal-400 font-medium">{highConfidence}</div>
            <p className="text-[10px] text-slate-500 mt-1">robust data</p>
          </div>
        </>
      );
    }

    // Default (balanced, rare_disease, etc.)
    return (
      <>
        <div className="stat-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Open Markets</span>
          </div>
          <div className="font-mono text-xl text-teal-400 font-medium">{openMarkets}</div>
          <p className="text-[10px] text-slate-500 mt-1">crowding &lt; 4</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Rocket className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Unpartnered FIC</span>
          </div>
          <div className="font-mono text-xl text-teal-400 font-medium">{totalUnpartneredFic}</div>
          <p className="text-[10px] text-slate-500 mt-1">scouting targets</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Dna className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Novel MoA</span>
          </div>
          <div className="font-mono text-xl text-violet-400 font-medium">{totalNovelMoa}</div>
          <p className="text-[10px] text-slate-500 mt-1">differentiated assets</p>
        </div>
      </>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {commonCards}
      {lensCards()}
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
    <EmptyState
      icon={BarChart3}
      heading="Opportunity Screener"
      description={
        <>
          Cross-query 214 indications against competitive density, global prevalence, unmet need, and partner landscape.
          Click <strong className="text-slate-300">Screen Opportunities</strong> to generate a ranked opportunity map.
        </>
      }
    />
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
    'Market Attractiveness',
    'Competitive Openness',
    'Unmet Need',
    'Development Feasibility',
    'Partner Landscape',
    'Global Prevalence',
    'US Prevalence',
    'Crowding Score',
    'Crowding Label',
    'Competitors',
    'Treatment Rate %',
    'Diagnosis Rate %',
    'CAGR 5yr %',
    'Median WAC',
    'Revenue Potential',
    'Biomarker Count',
    'Key Biomarkers',
    'Subtype Count',
    'Unpartnered FIC',
    'Novel MoA',
    'Emerging Assets',
    'Community Disparities',
    'Data Confidence',
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
        r.score_breakdown.market_attractiveness.toFixed(1),
        r.score_breakdown.competitive_openness.toFixed(1),
        r.score_breakdown.unmet_need.toFixed(1),
        r.score_breakdown.development_feasibility.toFixed(1),
        r.score_breakdown.partner_landscape.toFixed(1),
        r.global_prevalence,
        r.us_prevalence,
        r.crowding_score.toFixed(1),
        r.crowding_label,
        r.competitor_count,
        (r.treatment_rate * 100).toFixed(0),
        (r.diagnosis_rate * 100).toFixed(0),
        r.cagr_5yr.toFixed(1),
        r.median_wac ?? '',
        r.revenue_potential_label ?? '',
        r.biomarker_count ?? 0,
        `"${(r.key_biomarkers ?? []).join('; ')}"`,
        r.subtype_count ?? 0,
        r.unpartnered_fic_count ?? 0,
        r.novel_mechanism_count ?? 0,
        r.emerging_asset_count,
        r.community_disparities.length,
        r.data_confidence,
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
  const { role } = useProfile();
  const [filters, setFilters] = useState<ScreenerFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<string>('opportunity_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [offset, setOffset] = useState(0);
  const [rows, setRows] = useState<OpportunityRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [weightProfile, setWeightProfile] = useState<string>(DEFAULT_WEIGHT_PROFILE);
  const [showRoleCallout, setShowRoleCallout] = useState(false);
  const roleInitialized = useRef(false);

  // Auto-select lens based on user's profile role
  useEffect(() => {
    if (roleInitialized.current) return;
    if (!role) return;
    const ROLE_TO_LENS: Record<string, string> = {
      investor: 'investor',
      founder: 'competitive_entry',
      bd_executive: 'big_pharma_bd',
      corp_dev: 'corp_dev',
      analyst: 'analyst',
      consultant: 'analyst',
    };
    const lens = ROLE_TO_LENS[role];
    if (lens) {
      roleInitialized.current = true;
      setWeightProfile(lens);
      setShowRoleCallout(true);
    }
  }, [role]);

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
      weight_profile?: string;
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
          weight_profile: params.weight_profile,
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
      mutation.mutate({
        filters,
        sort_by: sortBy,
        sort_order: sortOrder,
        offset: newOffset,
        weight_profile: weightProfile,
      });
    },
    [filters, sortBy, sortOrder, weightProfile, mutation],
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
    mutation.mutate({ filters, sort_by: field, sort_order: newOrder, offset: 0, weight_profile: weightProfile });
  }

  function handleFiltersChange(newFilters: ScreenerFilters) {
    setFilters(newFilters);
  }

  function handleApplyFilters() {
    setOffset(0);
    mutation.mutate({ filters, sort_by: sortBy, sort_order: sortOrder, offset: 0, weight_profile: weightProfile });
  }

  function handleWeightProfileChange(profile: string) {
    setWeightProfile(profile);
    setOffset(0);
    setShowRoleCallout(true);
    mutation.mutate({ filters, sort_by: sortBy, sort_order: sortOrder, offset: 0, weight_profile: profile });
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

      {/* Strategic lens selector */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mr-1">Strategic Lens</span>
          {Object.entries(WEIGHT_PROFILES).map(([key, profile]) => (
            <button
              key={key}
              onClick={() => handleWeightProfileChange(key)}
              title={profile.description}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border',
                weightProfile === key
                  ? 'bg-teal-500/15 text-teal-400 border-teal-500/30'
                  : 'bg-navy-800 text-slate-400 border-navy-700 hover:border-slate-500',
              )}
            >
              {profile.label}
            </button>
          ))}
        </div>
        {WEIGHT_PROFILES[weightProfile] && (
          <p className="text-[10px] text-slate-500 pl-5 ml-0.5">{WEIGHT_PROFILES[weightProfile].description}</p>
        )}
      </div>

      {/* Role nudge — shown when user has no role set (never completed onboarding) */}
      {role === null && hasSearched && !isLoading && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-navy-800/60 border border-navy-700/40">
          <UserCog className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <p className="text-xs text-slate-400 flex-1">
            <span className="font-medium text-slate-300">Personalize your view</span>
            <span className="text-slate-500">
              {' '}
              &mdash; set your role in{' '}
              <a href="/onboarding" className="text-teal-400 hover:text-teal-300 underline underline-offset-2">
                onboarding
              </a>{' '}
              to auto-select the right lens and see role-specific insights.
            </span>
          </p>
        </div>
      )}

      {/* Role-aware callout (auto-selected or manual lens switch) */}
      {showRoleCallout &&
        (() => {
          const LENS_CALLOUTS: Record<string, { title: string; description: string; icon: typeof TrendingUp }> = {
            investor: {
              title: 'Viewing as Investor',
              description:
                'deal comps, catalyst signals, and investment thesis for every indication. Expand any row to see the full Investor View.',
              icon: TrendingUp,
            },
            competitive_entry: {
              title: 'Viewing as Founder',
              description:
                'competitive white space, unpartnered first-in-class assets, and market entry windows. Scores emphasize open markets over sheer size.',
              icon: Target,
            },
            big_pharma_bd: {
              title: 'Viewing as BD',
              description:
                'large addressable markets, active partner landscape, and in-licensing targets. Scores emphasize market attractiveness and deal flow.',
              icon: Users,
            },
            corp_dev: {
              title: 'Viewing as Corp Dev / M&A',
              description:
                'acquisition targets, patent cliff exposure, and pipeline gaps. Scores emphasize development feasibility and market consolidation opportunities.',
              icon: Shield,
            },
            analyst: {
              title: 'Viewing as Analyst',
              description:
                'comprehensive, research-grade coverage with balanced weighting across all dimensions. Maximum data density for diligence workflows.',
              icon: Radar,
            },
            rare_disease: {
              title: 'Rare Disease Focus',
              description:
                'orphan drug opportunities with high unmet need and regulatory tailwinds. Scores prioritize clinical need and feasibility over market size.',
              icon: Dna,
            },
          };
          const callout = LENS_CALLOUTS[weightProfile];
          if (!callout) return null;
          const Icon = callout.icon;
          return (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-teal-500/8 border border-teal-500/20">
              <Icon className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <p className="text-xs text-teal-300 flex-1">
                <span className="font-medium">{callout.title}</span>
                <span className="text-teal-400/70"> &mdash; {callout.description}</span>
              </p>
              <button
                onClick={() => setShowRoleCallout(false)}
                className="text-teal-500/50 hover:text-teal-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })()}

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
      {hasSearched && !isLoading && (
        <SummaryStats rows={filteredRows} totalCount={totalCount} allRows={rows} weightProfile={weightProfile} />
      )}

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
            weightProfile={weightProfile}
          />
          {!searchQuery.trim() && (
            <Pagination offset={offset} limit={PAGE_SIZE} total={totalCount} onPageChange={runScreener} />
          )}
        </>
      )}

      {/* Empty state (only before first search) */}
      {!hasSearched && !isLoading && <ScreenerEmptyState />}
    </div>
  );
}
