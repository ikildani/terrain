'use client';

import { useState, useEffect } from 'react';
import {
  Beaker,
  FileText,
  Shield,
  Users,
  Lightbulb,
  ExternalLink,
  Loader2,
  AlertCircle,
  Rocket,
  Globe,
  Dna,
  DollarSign,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ScoreBreakdownBar } from './OpportunityScoreBar';
import type { OpportunityScoreBreakdown, DealActivity, CatalystSignal } from '@/lib/analytics/screener';
import { formatNumber, formatDate } from '@/lib/utils/format';

// ── Detail API response types ──────────────────────────────

interface ClinicalTrial {
  nct_id: string;
  title: string;
  status: string;
  phase: string;
  sponsor: string;
  enrollment: number;
  start_date: string;
  completion_date: string;
}

interface SecFiling {
  accession_number: string;
  company_name: string;
  ticker: string;
  form_type: string;
  filed_date: string;
  description: string;
  file_url: string;
  is_deal_related: boolean;
  deal_keywords: string[];
}

interface FdaApproval {
  application_number: string;
  brand_name: string;
  generic_name: string;
  sponsor_name: string;
  approval_date: string;
  application_type: string;
}

interface TopPartner {
  company: string;
  therapeutic_areas: string[];
  bd_activity: string;
  recent_deal?: string;
}

interface EmergingAsset {
  asset_name: string;
  company: string;
  phase: string;
  mechanism: string;
  mechanism_category: string;
  is_first_in_class: boolean;
  is_unpartnered: boolean;
  strengths: string[];
  source: string;
}

interface CommunityInsight {
  community: string;
  prevalence_multiplier: number;
  affected_population_estimate: number;
  key_evidence: string;
  clinical_trial_representation: string;
  modality_gaps: string[];
}

interface SubtypeInfo {
  name: string;
  prevalence_pct: number;
  key_biomarkers: string[];
  standard_of_care: string;
}

interface BiomarkerInfo {
  biomarker: string;
  prevalence_pct: number;
  testing_rate_pct: number;
  test_type: string;
  cdx_drugs: string[];
  clinical_significance: string;
  trending: boolean;
}

interface PricingComparable {
  drug_name: string;
  company: string;
  mechanism_class: string;
  us_launch_wac_annual: number;
  launch_year: number;
  orphan_drug: boolean;
  first_in_class: boolean;
}

interface LoaProfile {
  source: 'indication' | 'therapy_area';
  preclinical: number;
  phase1: number;
  phase2: number;
  phase3: number;
}

interface PatientSegment {
  segment: string;
  description: string;
  pct_of_patients: number;
}

interface DetailData {
  trials: ClinicalTrial[];
  sec_filings: SecFiling[];
  fda_approvals: FdaApproval[];
  top_partners: TopPartner[];
  white_space: string[];
  emerging_assets: EmergingAsset[];
  community_insights: CommunityInsight[];
  subtypes: SubtypeInfo[];
  patient_segments: PatientSegment[];
  mechanisms_of_action: string[];
  lines_of_therapy: string[];
  biomarkers: BiomarkerInfo[];
  pricing_comparables: PricingComparable[];
  loa_profile: LoaProfile | null;
  severity_profile: Record<string, number> | null;
}

// ── Component Props ────────────────────────────────────────

interface OpportunityDetailPanelProps {
  indication: string;
  scoreBreakdown: OpportunityScoreBreakdown;
  scoreExplanations?: Record<string, string>;
  isOpen: boolean;
  dealActivity?: DealActivity;
  catalystSignals?: CatalystSignal[];
  investmentThesis?: string;
  defaultTab?: DetailTab;
}

type DetailTab =
  | 'score'
  | 'investor'
  | 'subtypes'
  | 'biomarkers'
  | 'pricing'
  | 'emerging'
  | 'community'
  | 'trials'
  | 'sec'
  | 'fda'
  | 'context';

const TABS: { id: DetailTab; label: string; icon: typeof Beaker }[] = [
  { id: 'score', label: 'Score Breakdown', icon: Lightbulb },
  { id: 'investor', label: 'Investor View', icon: TrendingUp },
  { id: 'subtypes', label: 'Subtypes & Segments', icon: Layers },
  { id: 'biomarkers', label: 'Biomarkers', icon: Dna },
  { id: 'pricing', label: 'Pricing & Revenue', icon: DollarSign },
  { id: 'emerging', label: 'Emerging Pipeline', icon: Rocket },
  { id: 'community', label: 'Community Insights', icon: Globe },
  { id: 'trials', label: 'Clinical Trials', icon: Beaker },
  { id: 'sec', label: 'SEC Activity', icon: FileText },
  { id: 'fda', label: 'FDA History', icon: Shield },
  { id: 'context', label: 'Context & Partners', icon: Users },
];

function formatWac(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

export function OpportunityDetailPanel({
  indication,
  scoreBreakdown,
  scoreExplanations,
  isOpen,
  dealActivity,
  catalystSignals,
  investmentThesis,
  defaultTab = 'score',
}: OpportunityDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>(defaultTab);
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDetail(null);
    setActiveTab(defaultTab);
  }, [indication, defaultTab]);

  useEffect(() => {
    if (!isOpen || detail) return;

    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/analyze/screener/detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ indication }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Failed to load details');
        setDetail(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load details');
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [isOpen, indication, detail]);

  const tabCounts: Partial<Record<DetailTab, number>> = detail
    ? {
        subtypes: detail.subtypes?.length ?? 0,
        biomarkers: detail.biomarkers?.length ?? 0,
        pricing: detail.pricing_comparables?.length ?? 0,
        emerging: detail.emerging_assets?.length ?? 0,
        community: detail.community_insights?.length ?? 0,
        trials: detail.trials.length,
        sec: detail.sec_filings.length,
        fda: detail.fda_approvals.length,
      }
    : {};

  if (!isOpen) return null;

  return (
    <tr>
      <td colSpan={99} className="p-0">
        <div className="bg-navy-900/60 border-t border-b border-navy-700/40 px-6 py-5">
          {/* Tab navigation */}
          <div className="flex gap-1 mb-4 border-b border-navy-700/40 pb-px overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const count = tabCounts[tab.id];
              const isEmpty = detail && count === 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors whitespace-nowrap',
                    activeTab === tab.id
                      ? 'text-teal-400 bg-navy-800 border-b-2 border-teal-500'
                      : isEmpty
                        ? 'text-slate-600 hover:text-slate-400 hover:bg-navy-800/50'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-navy-800/50',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {detail && count !== undefined && (
                    <span className="ml-1 px-1 py-0.5 rounded bg-navy-700/60 text-[9px] font-mono text-slate-500 tabular-nums">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading intelligence for {indication}...</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2 py-4 px-4 bg-red-500/5 border border-red-500/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* ═══════════ Score Breakdown ═══════════ */}
          {activeTab === 'score' && (
            <div className="space-y-4 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <ScoreBreakdownBar
                    label="Market Attractiveness"
                    score={scoreBreakdown.market_attractiveness}
                    max={30}
                  />
                  {scoreExplanations?.market_attractiveness && (
                    <p className="text-[10px] text-slate-500 mt-1 pl-0.5">{scoreExplanations.market_attractiveness}</p>
                  )}
                </div>
                <div>
                  <ScoreBreakdownBar
                    label="Competitive Openness"
                    score={scoreBreakdown.competitive_openness}
                    max={25}
                  />
                  {scoreExplanations?.competitive_openness && (
                    <p className="text-[10px] text-slate-500 mt-1 pl-0.5">{scoreExplanations.competitive_openness}</p>
                  )}
                </div>
                <div>
                  <ScoreBreakdownBar label="Unmet Need" score={scoreBreakdown.unmet_need} max={20} />
                  {scoreExplanations?.unmet_need && (
                    <p className="text-[10px] text-slate-500 mt-1 pl-0.5">{scoreExplanations.unmet_need}</p>
                  )}
                </div>
                <div>
                  <ScoreBreakdownBar
                    label="Development Feasibility"
                    score={scoreBreakdown.development_feasibility}
                    max={15}
                  />
                  {scoreExplanations?.development_feasibility && (
                    <p className="text-[10px] text-slate-500 mt-1 pl-0.5">
                      {scoreExplanations.development_feasibility}
                    </p>
                  )}
                </div>
                <div>
                  <ScoreBreakdownBar label="Partner Landscape" score={scoreBreakdown.partner_landscape} max={10} />
                  {scoreExplanations?.partner_landscape && (
                    <p className="text-[10px] text-slate-500 mt-1 pl-0.5">{scoreExplanations.partner_landscape}</p>
                  )}
                </div>
              </div>

              {/* LoA profile */}
              {detail?.loa_profile && (
                <div className="pt-3 border-t border-navy-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      Likelihood of Approval
                      <span className="ml-1.5 text-slate-600">
                        ({detail.loa_profile.source === 'indication' ? 'indication-specific' : 'therapy-area avg'})
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-4">
                    {[
                      { label: 'Preclinical', value: detail.loa_profile.preclinical },
                      { label: 'Phase 1', value: detail.loa_profile.phase1 },
                      { label: 'Phase 2', value: detail.loa_profile.phase2 },
                      { label: 'Phase 3', value: detail.loa_profile.phase3 },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <div
                          className={cn(
                            'font-mono text-sm font-medium tabular-nums',
                            item.value >= 0.4
                              ? 'text-emerald-400'
                              : item.value >= 0.15
                                ? 'text-teal-400'
                                : 'text-amber-400',
                          )}
                        >
                          {(item.value * 100).toFixed(0)}%
                        </div>
                        <div className="text-[9px] text-slate-600 mt-0.5">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Severity profile */}
              {detail?.severity_profile && Object.keys(detail.severity_profile).length > 0 && (
                <div className="pt-3 border-t border-navy-700/30">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Severity Distribution
                  </span>
                  <div className="flex gap-2 mt-2">
                    {Object.entries(detail.severity_profile)
                      .sort(([, a], [, b]) => b - a)
                      .map(([key, val]) => (
                        <div key={key} className="flex items-center gap-1.5">
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full',
                              key === 'severe' || key === 'very_severe' || key === 'critical'
                                ? 'bg-red-400'
                                : key === 'moderate'
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400',
                            )}
                          />
                          <span className="text-[10px] text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                          <span className="font-mono text-[10px] text-slate-300">{(val * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ Investor View ═══════════ */}
          {activeTab === 'investor' && (
            <div className="space-y-6">
              {/* Investment thesis */}
              {investmentThesis && (
                <div className="p-4 rounded-lg bg-navy-800/40 border border-navy-700/40">
                  <h4 className="text-xs font-medium text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Investment Thesis
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{investmentThesis}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Deal landscape */}
                <div>
                  <h4 className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    Deal Landscape
                  </h4>
                  {dealActivity && dealActivity.recent_deal_count > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded bg-navy-800/30 border border-navy-700/30">
                          <div className="text-[10px] text-slate-500 font-mono uppercase">Deals Tracked</div>
                          <div className="text-lg font-mono text-white">{dealActivity.recent_deal_count}</div>
                        </div>
                        <div className="p-2 rounded bg-navy-800/30 border border-navy-700/30">
                          <div className="text-[10px] text-slate-500 font-mono uppercase">Velocity</div>
                          <div
                            className={cn(
                              'text-sm font-medium capitalize',
                              dealActivity.deal_velocity_trend === 'accelerating'
                                ? 'text-emerald-400'
                                : dealActivity.deal_velocity_trend === 'decelerating'
                                  ? 'text-red-400'
                                  : 'text-slate-300',
                            )}
                          >
                            {dealActivity.deal_velocity_trend.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-navy-800/30 border border-navy-700/30">
                          <div className="text-[10px] text-slate-500 font-mono uppercase">Avg Upfront</div>
                          <div className="text-sm font-mono text-white">
                            {dealActivity.avg_deal_upfront_m >= 1000
                              ? `$${(dealActivity.avg_deal_upfront_m / 1000).toFixed(1)}B`
                              : `$${dealActivity.avg_deal_upfront_m}M`}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-navy-800/30 border border-navy-700/30">
                          <div className="text-[10px] text-slate-500 font-mono uppercase">Avg Total</div>
                          <div className="text-sm font-mono text-white">
                            {dealActivity.avg_deal_total_m >= 1000
                              ? `$${(dealActivity.avg_deal_total_m / 1000).toFixed(1)}B`
                              : `$${dealActivity.avg_deal_total_m}M`}
                          </div>
                        </div>
                      </div>
                      {dealActivity.notable_deals.length > 0 && (
                        <div>
                          <div className="text-[10px] text-slate-500 font-mono uppercase mb-1.5">
                            Notable Transactions
                          </div>
                          <div className="space-y-1.5">
                            {dealActivity.notable_deals.map((deal, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-1.5 rounded bg-navy-800/20 border border-navy-700/20"
                              >
                                <div>
                                  <span className="text-xs text-slate-200">{deal.company}</span>
                                  <span className="text-[10px] text-slate-500 ml-1.5">{deal.asset}</span>
                                </div>
                                <div className="text-xs font-mono text-emerald-400">
                                  {deal.total_value_m >= 1000
                                    ? `$${(deal.total_value_m / 1000).toFixed(1)}B`
                                    : `$${deal.total_value_m}M`}
                                  <span className="text-[10px] text-slate-500 ml-1">{deal.year}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No comparable deals tracked for this indication.</p>
                  )}
                </div>

                {/* Catalyst signals */}
                <div>
                  <h4 className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Rocket className="w-3.5 h-3.5 text-amber-400" />
                    Catalyst Signals
                  </h4>
                  {catalystSignals && catalystSignals.length > 0 ? (
                    <div className="space-y-2">
                      {catalystSignals.map((catalyst, i) => (
                        <div key={i} className="p-2 rounded-md bg-navy-800/30 border border-navy-700/30">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                                catalyst.impact === 'high'
                                  ? 'bg-emerald-400'
                                  : catalyst.impact === 'medium'
                                    ? 'bg-amber-400'
                                    : 'bg-slate-500',
                              )}
                            />
                            <span className="text-[10px] font-mono text-slate-500 uppercase">
                              {catalyst.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-600 ml-auto">{catalyst.timing}</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{catalyst.signal}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No notable catalysts identified.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ Subtypes & Segments ═══════════ */}
          {activeTab === 'subtypes' && !loading && !error && (
            <div>
              {detail && (detail.subtypes?.length ?? 0) > 0 ? (
                <div className="space-y-4">
                  {/* Subtypes */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      Disease Subtypes
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {detail.subtypes.map((sub) => (
                        <div key={sub.name} className="p-3 rounded-md bg-navy-800/30 border border-navy-700/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-200">{sub.name}</span>
                            <span className="font-mono text-[10px] text-teal-400">{sub.prevalence_pct}%</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mb-1.5">SoC: {sub.standard_of_care}</p>
                          {sub.key_biomarkers.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {sub.key_biomarkers.map((b) => (
                                <span
                                  key={b}
                                  className="px-1 py-0.5 rounded bg-violet-500/10 text-[9px] text-violet-400"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Patient Segments */}
                  {(detail.patient_segments?.length ?? 0) > 0 && (
                    <div className="pt-3 border-t border-navy-700/30">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        Patient Segments
                      </span>
                      <div className="space-y-1.5 mt-2">
                        {detail.patient_segments.map((seg) => (
                          <div key={seg.segment} className="flex items-start gap-3 text-xs">
                            <span className="font-mono text-teal-400 tabular-nums w-10 text-right flex-shrink-0">
                              {seg.pct_of_patients}%
                            </span>
                            <div>
                              <span className="text-slate-300 font-medium">{seg.segment}</span>
                              <span className="text-slate-500 ml-1.5">{seg.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MoA & Lines of Therapy */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-navy-700/30">
                    {(detail.mechanisms_of_action?.length ?? 0) > 0 && (
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                          Mechanisms of Action
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {detail.mechanisms_of_action.map((m) => (
                            <span key={m} className="px-1.5 py-0.5 rounded bg-navy-700/40 text-[10px] text-slate-300">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(detail.lines_of_therapy?.length ?? 0) > 0 && (
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                          Lines of Therapy
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {detail.lines_of_therapy.map((l) => (
                            <span key={l} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-[10px] text-blue-400">
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : detail ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No subtype data available for this indication.
                </div>
              ) : null}
            </div>
          )}

          {/* ═══════════ Biomarkers ═══════════ */}
          {activeTab === 'biomarkers' && !loading && !error && (
            <div>
              {detail && (detail.biomarkers?.length ?? 0) > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-navy-700/40">
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Biomarker
                        </th>
                        <th className="text-right py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Prevalence
                        </th>
                        <th className="text-right py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Testing Rate
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Test Type
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          CDx Drugs
                        </th>
                        <th className="text-left py-2 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Significance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.biomarkers.map((bm) => (
                        <tr key={bm.biomarker} className="border-b border-navy-700/20 hover:bg-navy-800/30">
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-200 font-medium">{bm.biomarker}</span>
                              {bm.trending && (
                                <span className="px-1 py-0.5 rounded bg-emerald-500/10 text-[9px] text-emerald-400 font-medium">
                                  Trending
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-right font-mono text-slate-300 tabular-nums">
                            {bm.prevalence_pct}%
                          </td>
                          <td className="py-2 pr-4 text-right">
                            <span
                              className={cn(
                                'font-mono tabular-nums',
                                bm.testing_rate_pct >= 70
                                  ? 'text-emerald-400'
                                  : bm.testing_rate_pct >= 40
                                    ? 'text-teal-400'
                                    : 'text-amber-400',
                              )}
                            >
                              {bm.testing_rate_pct}%
                            </span>
                          </td>
                          <td className="py-2 pr-4">
                            <span className="px-1.5 py-0.5 rounded bg-navy-700/60 text-slate-300 font-mono text-[10px]">
                              {bm.test_type}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-slate-400 max-w-[180px] truncate">
                            {bm.cdx_drugs.length > 0 ? bm.cdx_drugs.join(', ') : '—'}
                          </td>
                          <td className="py-2 text-slate-400 text-[11px] max-w-[200px]">{bm.clinical_significance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : detail ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No biomarker data available for this indication.
                </div>
              ) : null}
            </div>
          )}

          {/* ═══════════ Pricing & Revenue ═══════════ */}
          {activeTab === 'pricing' && !loading && !error && (
            <div>
              {detail && (detail.pricing_comparables?.length ?? 0) > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-navy-700/40">
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Drug
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Company
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Mechanism
                        </th>
                        <th className="text-right py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          WAC Annual
                        </th>
                        <th className="text-right py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Launch Year
                        </th>
                        <th className="text-left py-2 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Flags
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.pricing_comparables.map((pc) => (
                        <tr
                          key={`${pc.drug_name}-${pc.company}`}
                          className="border-b border-navy-700/20 hover:bg-navy-800/30"
                        >
                          <td className="py-2 pr-4 font-medium text-slate-200">{pc.drug_name}</td>
                          <td className="py-2 pr-4 text-slate-400">{pc.company}</td>
                          <td className="py-2 pr-4 text-slate-400 text-[11px]">{pc.mechanism_class}</td>
                          <td className="py-2 pr-4 text-right font-mono text-slate-200 tabular-nums">
                            {formatWac(pc.us_launch_wac_annual)}
                          </td>
                          <td className="py-2 pr-4 text-right font-mono text-slate-400 tabular-nums">
                            {pc.launch_year}
                          </td>
                          <td className="py-2">
                            <div className="flex gap-1">
                              {pc.orphan_drug && (
                                <span className="px-1 py-0.5 rounded bg-violet-500/10 text-[9px] text-violet-400">
                                  Orphan
                                </span>
                              )}
                              {pc.first_in_class && (
                                <span className="px-1 py-0.5 rounded bg-teal-500/10 text-[9px] text-teal-400">FIC</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Pricing summary */}
                  <div className="flex gap-6 mt-3 pt-3 border-t border-navy-700/30">
                    <div>
                      <span className="text-[9px] text-slate-600 uppercase tracking-wider">Median WAC</span>
                      <div className="font-mono text-sm text-slate-200 mt-0.5">
                        {formatWac(
                          detail.pricing_comparables.map((p) => p.us_launch_wac_annual).sort((a, b) => a - b)[
                            Math.floor(detail.pricing_comparables.length / 2)
                          ] ?? 0,
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-600 uppercase tracking-wider">Range</span>
                      <div className="font-mono text-sm text-slate-200 mt-0.5">
                        {formatWac(Math.min(...detail.pricing_comparables.map((p) => p.us_launch_wac_annual)))} –{' '}
                        {formatWac(Math.max(...detail.pricing_comparables.map((p) => p.us_launch_wac_annual)))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-600 uppercase tracking-wider">FIC Premium</span>
                      <div className="font-mono text-sm text-slate-200 mt-0.5">
                        {(() => {
                          const fic = detail.pricing_comparables.filter((p) => p.first_in_class);
                          const nonFic = detail.pricing_comparables.filter((p) => !p.first_in_class);
                          if (fic.length === 0 || nonFic.length === 0) return '—';
                          const ficMedian = fic.map((p) => p.us_launch_wac_annual).sort((a, b) => a - b)[
                            Math.floor(fic.length / 2)
                          ];
                          const nonFicMedian = nonFic.map((p) => p.us_launch_wac_annual).sort((a, b) => a - b)[
                            Math.floor(nonFic.length / 2)
                          ];
                          const premium = ((ficMedian - nonFicMedian) / nonFicMedian) * 100;
                          return `${premium >= 0 ? '+' : ''}${premium.toFixed(0)}%`;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : detail ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No pricing benchmark data available for this therapy area.
                </div>
              ) : null}
            </div>
          )}

          {/* ═══════════ Emerging Pipeline ═══════════ */}
          {activeTab === 'emerging' && !loading && !error && (
            <div>
              {detail && (detail.emerging_assets?.length ?? 0) > 0 ? (
                <div className="space-y-2">
                  {detail.emerging_assets.map((asset) => (
                    <div
                      key={`${asset.company}-${asset.asset_name}`}
                      className="flex items-start gap-3 p-3 rounded-md bg-navy-800/30 border border-navy-700/30"
                    >
                      <div className="flex-shrink-0 mt-0.5 flex flex-col gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-navy-700/60 text-slate-300 font-mono text-[10px]">
                          {asset.phase}
                        </span>
                        {asset.is_first_in_class && (
                          <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 text-[9px] font-medium">
                            First-in-Class
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-200">{asset.asset_name}</span>
                          <span className="text-[10px] text-slate-500">{asset.company}</span>
                          {asset.is_unpartnered && (
                            <span className="px-1 py-0.5 rounded bg-amber-500/10 text-[9px] text-amber-400 font-medium">
                              Unpartnered
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{asset.mechanism}</p>
                        {asset.strengths.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {asset.strengths.slice(0, 3).map((s, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-emerald-500/5 text-[9px] text-emerald-400/80"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-600 flex-shrink-0">{asset.source}</span>
                    </div>
                  ))}
                </div>
              ) : detail ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No emerging pipeline assets identified for this indication.
                </div>
              ) : null}
            </div>
          )}

          {/* ═══════════ Community Insights ═══════════ */}
          {activeTab === 'community' && !loading && !error && (
            <div>
              {detail && (detail.community_insights?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {detail.community_insights.map((insight, i) => (
                    <div
                      key={`${insight.community}-${i}`}
                      className="p-3 rounded-md bg-navy-800/30 border border-navy-700/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-200">{insight.community}</span>
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded text-[10px] font-mono font-medium',
                              insight.prevalence_multiplier >= 3
                                ? 'bg-red-500/10 text-red-400'
                                : insight.prevalence_multiplier >= 1.5
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'bg-navy-700/60 text-slate-400',
                            )}
                          >
                            {insight.prevalence_multiplier.toFixed(1)}x prevalence
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                            ~{formatNumber(insight.affected_population_estimate)} affected
                          </span>
                          <span
                            className={cn(
                              'px-1 py-0.5 rounded text-[9px] font-medium',
                              insight.clinical_trial_representation === 'underrepresented'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-emerald-500/10 text-emerald-400',
                            )}
                          >
                            {insight.clinical_trial_representation}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">{insight.key_evidence}</p>
                      {insight.modality_gaps.length > 0 && (
                        <div>
                          <span className="text-[9px] text-slate-600 uppercase tracking-wider">Modality gaps:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {insight.modality_gaps.map((gap) => (
                              <span
                                key={gap}
                                className="px-1.5 py-0.5 rounded bg-violet-500/10 text-[9px] text-violet-400"
                              >
                                {gap.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : detail ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No community-specific health disparity data available for this indication.
                </div>
              ) : null}
            </div>
          )}

          {/* ═══════════ Clinical Trials ═══════════ */}
          {activeTab === 'trials' && !loading && !error && (
            <div>
              {detail && detail.trials.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-navy-700/40">
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          NCT ID
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Title
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Phase
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Sponsor
                        </th>
                        <th className="text-right py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Enrollment
                        </th>
                        <th className="text-left py-2 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.trials.map((trial) => (
                        <tr key={trial.nct_id} className="border-b border-navy-700/20 hover:bg-navy-800/30">
                          <td className="py-2 pr-4">
                            <a
                              href={`https://clinicaltrials.gov/study/${trial.nct_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1"
                            >
                              {trial.nct_id}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </td>
                          <td className="py-2 pr-4 text-slate-300 max-w-sm truncate">{trial.title}</td>
                          <td className="py-2 pr-4">
                            <span className="px-1.5 py-0.5 rounded bg-navy-700/60 text-slate-300 font-mono text-[10px]">
                              {trial.phase}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-slate-400">{trial.sponsor}</td>
                          <td className="py-2 pr-4 text-right font-mono text-slate-300">
                            {formatNumber(trial.enrollment)}
                          </td>
                          <td className="py-2">
                            <span
                              className={cn(
                                'px-1.5 py-0.5 rounded text-[10px] font-medium',
                                trial.status === 'Recruiting' || trial.status === 'RECRUITING'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : trial.status === 'Completed' || trial.status === 'COMPLETED'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'bg-navy-700/60 text-slate-400',
                              )}
                            >
                              {trial.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : detail ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No cached clinical trials for this indication.
                </div>
              ) : null}
            </div>
          )}

          {/* ═══════════ SEC Activity ═══════════ */}
          {activeTab === 'sec' && !loading && !error && (
            <div>
              {detail && detail.sec_filings.length > 0 ? (
                <div className="space-y-2">
                  {detail.sec_filings.map((filing) => (
                    <div
                      key={filing.accession_number}
                      className="flex items-start gap-3 p-3 rounded-md bg-navy-800/30 border border-navy-700/30"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[10px] font-mono font-medium',
                            filing.is_deal_related ? 'bg-amber-500/10 text-amber-400' : 'bg-navy-700/60 text-slate-500',
                          )}
                        >
                          {filing.form_type}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-300">{filing.company_name}</span>
                          {filing.ticker && (
                            <span className="font-mono text-[10px] text-slate-500">{filing.ticker}</span>
                          )}
                          <span className="text-[10px] text-slate-600">{formatDate(filing.filed_date)}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{filing.description}</p>
                        {filing.is_deal_related && filing.deal_keywords?.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {filing.deal_keywords.slice(0, 4).map((kw) => (
                              <span
                                key={kw}
                                className="px-1 py-0.5 rounded bg-amber-500/5 text-[9px] text-amber-400/80"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {filing.file_url && (
                        <a
                          href={filing.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-slate-500 hover:text-teal-400"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : detail ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No cached SEC filings for companies in this indication.
                </div>
              ) : null}
            </div>
          )}

          {/* ═══════════ FDA History ═══════════ */}
          {activeTab === 'fda' && !loading && !error && (
            <div>
              {detail && detail.fda_approvals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-navy-700/40">
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Brand Name
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Generic Name
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Sponsor
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Type
                        </th>
                        <th className="text-left py-2 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Approval Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.fda_approvals.map((approval) => (
                        <tr
                          key={approval.application_number}
                          className="border-b border-navy-700/20 hover:bg-navy-800/30"
                        >
                          <td className="py-2 pr-4 font-medium text-slate-200">{approval.brand_name}</td>
                          <td className="py-2 pr-4 text-slate-400">{approval.generic_name}</td>
                          <td className="py-2 pr-4 text-slate-400">{approval.sponsor_name}</td>
                          <td className="py-2 pr-4">
                            <span className="px-1.5 py-0.5 rounded bg-navy-700/60 text-slate-300 font-mono text-[10px]">
                              {approval.application_type}
                            </span>
                          </td>
                          <td className="py-2 text-slate-400 font-mono text-[10px]">
                            {formatDate(approval.approval_date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : detail ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No cached FDA approvals for this indication.
                </div>
              ) : null}
            </div>
          )}

          {/* ═══════════ Context & Partners ═══════════ */}
          {activeTab === 'context' && !loading && !error && detail && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  White Space Opportunities
                </h4>
                {detail.white_space.length > 0 ? (
                  <ul className="space-y-2">
                    {detail.white_space.map((hint, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className="flex-shrink-0 w-1 h-1 mt-1.5 rounded-full bg-amber-400/60" />
                        {hint}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">No notable gaps identified.</p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-400" />
                  Top BD Partners
                </h4>
                {detail.top_partners.length > 0 ? (
                  <div className="space-y-2">
                    {detail.top_partners.map((partner) => (
                      <div key={partner.company} className="p-2 rounded-md bg-navy-800/30 border border-navy-700/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-200">{partner.company}</span>
                          <span
                            className={cn(
                              'text-[10px] font-mono',
                              partner.bd_activity === 'very_active'
                                ? 'text-emerald-400'
                                : partner.bd_activity === 'active'
                                  ? 'text-teal-400'
                                  : 'text-slate-500',
                            )}
                          >
                            {partner.bd_activity.replace('_', ' ')}
                          </span>
                        </div>
                        {partner.recent_deal && (
                          <p className="text-[10px] text-slate-500 mt-0.5">{partner.recent_deal}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No aligned partners identified.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
