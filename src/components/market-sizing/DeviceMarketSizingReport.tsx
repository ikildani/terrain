'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatMetric, formatCompact, formatCurrency, formatPercent, formatNumber } from '@/lib/utils/format';
import { StatCard } from '@/components/shared/StatCard';
import { DataSourceBadge } from '@/components/shared/DataSourceBadge';
import { ConfidentialFooter } from '@/components/shared/ConfidentialFooter';
import { ExportButton } from '@/components/shared/ExportButton';
import { UpgradeGate } from '@/components/shared/UpgradeGate';
import { useSubscription } from '@/hooks/useSubscription';
import { useProfile } from '@/hooks/useProfile';
import TAMChart from './TAMChart';
import ProcedureVolumeChart from './ProcedureVolumeChart';
import RevenueStreamChart from './RevenueStreamChart';
import DeviceGeographyTable from './DeviceGeographyTable';
import MarketGrowthChart from './MarketGrowthChart';
import RevenueWaterfallChart from './RevenueWaterfallChart';
import type { DeviceMarketSizingOutput, DeviceMarketSizingInput } from '@/types/devices-diagnostics';

// ────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────

interface DeviceMarketSizingReportProps {
  data: DeviceMarketSizingOutput;
  input: DeviceMarketSizingInput;
  previewMode?: boolean;
  onPdfExport?: () => void;
}

// ────────────────────────────────────────────────────────────
// CSV Flattener
// ────────────────────────────────────────────────────────────

function flattenDeviceForCSV(data: DeviceMarketSizingOutput): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];

  // Geography breakdown
  data.geography_breakdown.forEach((g) => {
    rows.push({
      section: 'Geography',
      territory: g.territory,
      tam: formatMetric(g.tam.value, g.tam.unit),
      procedure_volume: g.procedure_volume ?? '',
      reimbursement_environment: g.reimbursement_environment,
      market_note: g.market_note,
    });
  });

  // Revenue streams
  data.revenue_streams.forEach((s) => {
    rows.push({
      section: 'Revenue Stream',
      stream: s.stream,
      annual_revenue_per_unit: s.annual_revenue_per_unit,
      total_units_or_procedures: s.total_units_or_procedures,
      gross_revenue_m: s.gross_revenue_m,
      contribution_pct: s.contribution_pct,
    });
  });

  // Revenue projections
  data.revenue_projection.forEach((y) => {
    rows.push({
      section: 'Revenue Projection',
      year: y.year,
      bear_case: y.bear,
      base_case: y.base,
      bull_case: y.bull,
    });
  });

  // Deal benchmarks
  if (data.deal_benchmark) {
    data.deal_benchmark.comparable_deals.forEach((d) => {
      rows.push({
        section: 'Deal Benchmark',
        acquirer: d.acquirer,
        target: d.target,
        deal_type: d.deal_type,
        value_m: d.value_m ?? '',
        announced_date: d.announced_date,
        rationale: d.rationale,
        source: d.source,
      });
    });
    rows.push({
      section: 'Deal Benchmark Summary',
      median_deal_value_m: data.deal_benchmark.median_deal_value_m,
      median_revenue_multiple: data.deal_benchmark.median_revenue_multiple ?? '',
      deal_count_last_3yr: data.deal_benchmark.deal_count_last_3yr,
      hottest_categories: data.deal_benchmark.hottest_categories.join(', '),
    });
  }

  return rows;
}

// ────────────────────────────────────────────────────────────
// Coverage badge color helper
// ────────────────────────────────────────────────────────────

function coverageBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === 'covered') return 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20';
  if (s === 'partial' || s === 'pending' || s === 'coverage_pending')
    return 'bg-amber-500/12 text-amber-400 border border-amber-500/20';
  return 'bg-red-500/12 text-red-400 border border-red-500/20';
}

function riskBadgeClass(risk: 'low' | 'moderate' | 'high'): string {
  if (risk === 'low') return 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20';
  if (risk === 'moderate') return 'bg-amber-500/12 text-amber-400 border border-amber-500/20';
  return 'bg-red-500/12 text-red-400 border border-red-500/20';
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export default function DeviceMarketSizingReport({
  data,
  input,
  previewMode,
  onPdfExport,
}: DeviceMarketSizingReportProps) {
  const [methodologyOpen, setMethodologyOpen] = useState(previewMode ?? false);
  const { isPro } = useSubscription();
  const { role } = useProfile();
  const { summary } = data;

  // Role-based section visibility for Pro users
  // Investors and analysts see everything — full diligence depth for any niche market
  // Other roles see sections relevant to their function to avoid overload
  const fullDepth = !role || ['investor', 'analyst'].includes(role);
  const showDealSections = fullDepth || ['bd_executive', 'corp_dev', 'consultant'].includes(role!);
  const showClinicalSections = fullDepth || ['founder', 'consultant'].includes(role!);
  const showReimbursementDepth = fullDepth || ['founder', 'bd_executive', 'corp_dev'].includes(role!);
  const showOperationalSections = fullDepth || role === 'founder';

  // Compute peak sales from revenue projection for MarketGrowthChart
  const peakBase = Math.max(0, ...data.revenue_projection.map((r) => r.base ?? 0));
  const peakBear = Math.max(0, ...data.revenue_projection.map((r) => r.bear ?? 0));
  const peakBull = Math.max(0, ...data.revenue_projection.map((r) => r.bull ?? 0));

  return (
    <div className="space-y-6 animate-fade-in" data-report-content>
      {/* ──────────────────────── 1. Executive Summary ──────────────────────── */}
      <div className="card noise">
        <h3 className="chart-title">Executive Summary</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The <span className="text-white font-medium">{input.procedure_or_condition}</span> device market represents a
          US total addressable market of{' '}
          <span className="metric text-teal-400">{formatMetric(summary.us_tam.value, summary.us_tam.unit)}</span>, with
          a serviceable addressable market of{' '}
          <span className="metric text-white">{formatMetric(summary.us_sam.value, summary.us_sam.unit)}</span> and a
          serviceable obtainable market of{' '}
          <span className="metric text-white">{formatMetric(summary.us_som.value, summary.us_som.unit)}</span>
          {summary.us_som.range
            ? ` (range: ${formatMetric(summary.us_som.range[0], summary.us_som.unit)}--${formatMetric(summary.us_som.range[1], summary.us_som.unit)})`
            : ''}
          . The market is growing at <span className="metric text-white">{summary.cagr_5yr}%</span> CAGR over the next
          five years, driven by <span className="text-slate-300">{summary.market_growth_driver}</span>. Procedure volume
          stands at{' '}
          <span className="metric text-white">{formatNumber(data.procedure_volume.us_annual_procedures)}</span> annual
          US procedures, of which{' '}
          <span className="metric text-white">{formatNumber(data.procedure_volume.us_addressable_procedures)}</span> are
          addressable for the target device profile.
        </p>
      </div>

      {/* ──────────────────────── 2. Summary Metrics ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="US TAM"
          value={formatMetric(summary.us_tam.value, summary.us_tam.unit)}
          confidence={summary.us_tam.confidence}
          source="Terrain Analysis"
        />
        <StatCard
          label="US SAM"
          value={formatMetric(summary.us_sam.value, summary.us_sam.unit)}
          confidence="medium"
          source="Terrain Analysis"
        />
        <StatCard
          label="US SOM"
          value={formatMetric(summary.us_som.value, summary.us_som.unit)}
          confidence="medium"
          source="Terrain Analysis"
          range={
            summary.us_som.range
              ? {
                  low: formatMetric(summary.us_som.range[0], summary.us_som.unit),
                  high: formatMetric(summary.us_som.range[1], summary.us_som.unit),
                }
              : undefined
          }
        />
        <StatCard
          label="Global TAM"
          value={formatMetric(summary.global_tam.value, summary.global_tam.unit)}
          trend={`${summary.cagr_5yr}% CAGR`}
          trendDirection="up"
          source="Terrain Analysis + Territory Multipliers"
        />
      </div>

      {/* ──────────────────────── 3. TAM Chart ──────────────────────── */}
      <TAMChart
        tam={{
          value: summary.us_tam.value,
          unit: summary.us_tam.unit,
          confidence: summary.us_tam.confidence,
        }}
        sam={{
          value: summary.us_sam.value,
          unit: summary.us_sam.unit,
          confidence: 'medium',
        }}
        som={{
          value: summary.us_som.value,
          unit: summary.us_som.unit,
          confidence: 'medium',
          range: summary.us_som.range,
        }}
      />

      {/* ──────────────────────── 3b. Revenue Waterfall: TAM → Peak Sales ──────────────────────── */}
      {data.revenue_projection.length > 0 && (
        <RevenueWaterfallChart
          tam_value={summary.us_tam.value}
          tam_unit={summary.us_tam.unit as 'B' | 'M'}
          addressability_factor={
            data.procedure_volume.us_addressable_procedures > 0 && data.procedure_volume.us_annual_procedures > 0
              ? data.procedure_volume.us_addressable_procedures / data.procedure_volume.us_annual_procedures
              : 0.4
          }
          peak_share={data.adoption_model.peak_market_share.base}
          gtn_discount={0.15}
          peak_sales_m={Math.max(...data.revenue_projection.map((r) => r.base))}
        />
      )}

      {/* ──────────────────────── 4. Procedure Volume ──────────────────────── */}
      <ProcedureVolumeChart
        procedureVolume={data.procedure_volume}
        peakSharePct={data.adoption_model.peak_market_share.base * 100}
      />

      {/* ──────────────────────── 5. Revenue Streams ──────────────────────── */}
      {data.revenue_streams.length > 0 && <RevenueStreamChart streams={data.revenue_streams} />}

      {/* ──────────────────────── 6. Adoption Model ──────────────────────── */}
      <div className="chart-container noise">
        <div className="chart-title">Adoption Model</div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total US Sites */}
          <div className="p-3 bg-navy-800/50 rounded-md">
            <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Total US Sites</div>
            <div className="metric text-lg text-white">{formatNumber(data.adoption_model.total_us_sites)}</div>
          </div>

          {/* Addressable Sites */}
          <div className="p-3 bg-navy-800/50 rounded-md">
            <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Addressable Sites</div>
            <div className="metric text-lg text-white">{formatNumber(data.adoption_model.addressable_sites)}</div>
          </div>

          {/* Peak Market Share */}
          <div className="p-3 bg-navy-800/50 rounded-md">
            <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Peak Market Share</div>
            <div className="flex items-baseline gap-2">
              <span className="metric text-lg text-teal-400">
                {formatPercent(data.adoption_model.peak_market_share.base * 100, 0)}
              </span>
              <span className="text-2xs text-slate-500">
                ({formatPercent(data.adoption_model.peak_market_share.low * 100, 0)}
                {' -- '}
                {formatPercent(data.adoption_model.peak_market_share.high * 100, 0)})
              </span>
            </div>
          </div>

          {/* Peak Installed Base (conditional) */}
          {data.adoption_model.peak_installed_base != null && (
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Peak Installed Base</div>
              <div className="metric text-lg text-white">{formatNumber(data.adoption_model.peak_installed_base)}</div>
            </div>
          )}

          {/* Years to Peak */}
          <div className="p-3 bg-navy-800/50 rounded-md">
            <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Years to Peak</div>
            <div className="metric text-lg text-white">{data.adoption_model.years_to_peak}</div>
          </div>
        </div>
      </div>

      {/* ──────────────────────── 7. Geography ──────────────────────── */}
      {data.geography_breakdown.length > 0 && <DeviceGeographyTable data={data.geography_breakdown} />}

      {/* ──────────────────────── 8. Reimbursement Analysis ──────────────────────── */}
      <div className="chart-container noise">
        <div className="chart-title">Reimbursement Analysis</div>
        <div className="space-y-4">
          {/* Coverage status */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Coverage Status:</span>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono uppercase tracking-wider',
                coverageBadgeClass(data.reimbursement_analysis.us_coverage_status),
              )}
            >
              {data.reimbursement_analysis.us_coverage_status}
            </span>
          </div>

          {/* CPT Codes */}
          {data.reimbursement_analysis.primary_cpt_codes &&
            data.reimbursement_analysis.primary_cpt_codes.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-slate-400">CPT Codes:</span>
                {data.reimbursement_analysis.primary_cpt_codes.map((code) => (
                  <span
                    key={code}
                    className="inline-flex items-center px-2 py-0.5 rounded bg-navy-800 border border-navy-700 text-2xs font-mono text-slate-300"
                  >
                    {code}
                  </span>
                ))}
              </div>
            )}

          {/* DRG Codes */}
          {data.reimbursement_analysis.drg_codes && data.reimbursement_analysis.drg_codes.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-slate-400">DRG Codes:</span>
              {data.reimbursement_analysis.drg_codes.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center px-2 py-0.5 rounded bg-navy-800 border border-navy-700 text-2xs font-mono text-slate-300"
                >
                  {code}
                </span>
              ))}
            </div>
          )}

          {/* Medicare Payment Rate */}
          {data.reimbursement_analysis.medicare_payment_rate && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Medicare Payment Rate:</span>
              <span className="metric text-sm text-white">{data.reimbursement_analysis.medicare_payment_rate}</span>
            </div>
          )}

          {/* Private Payer Coverage */}
          <div>
            <span className="text-xs text-slate-400">Private Payer Coverage:</span>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {data.reimbursement_analysis.private_payer_coverage}
            </p>
          </div>

          {/* Reimbursement Risk */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Reimbursement Risk:</span>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono uppercase tracking-wider',
                riskBadgeClass(data.reimbursement_analysis.reimbursement_risk),
              )}
            >
              {data.reimbursement_analysis.reimbursement_risk}
            </span>
          </div>

          {/* Reimbursement Strategy */}
          {data.reimbursement_analysis.reimbursement_strategy && (
            <div className="mt-4 p-3 bg-navy-800/50 rounded-md">
              <h4 className="text-xs text-slate-300 font-medium mb-2">Reimbursement Strategy</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {data.reimbursement_analysis.reimbursement_strategy}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────── 9. Competitive Positioning ──────────────────────── */}
      <div className="chart-container noise">
        <div className="chart-title">Competitive Positioning</div>
        <div className="space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Total Competitors</div>
              <div className="metric text-lg text-white">{data.competitive_positioning.total_competitors}</div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Market Leader</div>
              <div className="text-sm text-slate-300 font-medium">{data.competitive_positioning.market_leader}</div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Leader Market Share</div>
              <div className="metric text-lg text-teal-400">
                {formatPercent(data.competitive_positioning.leader_market_share_pct, 0)}
              </div>
            </div>
          </div>

          {/* ASE Range */}
          <div className="p-3 bg-navy-800/50 rounded-md">
            <div className="text-2xs text-slate-500 uppercase tracking-wider mb-2">Average Selling Price Range</div>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-2xs text-slate-500">Lowest</span>
                <div className="metric text-sm text-slate-400">
                  {formatCurrency(data.competitive_positioning.ase_range.lowest)}
                </div>
              </div>
              <div>
                <span className="text-2xs text-slate-500">Median</span>
                <div className="metric text-sm text-white">
                  {formatCurrency(data.competitive_positioning.ase_range.median)}
                </div>
              </div>
              <div>
                <span className="text-2xs text-slate-500">Highest</span>
                <div className="metric text-sm text-slate-400">
                  {formatCurrency(data.competitive_positioning.ase_range.highest)}
                </div>
              </div>
            </div>
          </div>

          {/* Key Differentiation Vectors */}
          {data.competitive_positioning.key_differentiation_vectors.length > 0 && (
            <div>
              <h4 className="text-xs text-slate-300 font-medium mb-2">Key Differentiation Vectors</h4>
              <ul className="space-y-1">
                {data.competitive_positioning.key_differentiation_vectors.map((v, i) => (
                  <li key={`diff-${v}-${i}`} className="text-xs text-slate-500 flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-teal-500/60 mt-1.5 flex-shrink-0" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────── PRO ANALYTICS ──────────────────────── */}
      {!isPro && !previewMode && (
        <UpgradeGate feature="Advanced device analytics (NTAP economics, competitive share distribution, deal benchmarking, evidence gaps, pricing pressure, technology readiness, clinical superiority, surgeon switching costs, and sensitivity analysis)">
          <div className="space-y-6 opacity-50 pointer-events-none select-none">
            <div className="chart-container noise h-[200px]" />
            <div className="chart-container noise h-[300px]" />
            <div className="chart-container noise h-[200px]" />
          </div>
        </UpgradeGate>
      )}

      {/* ──────────────────────── A. NTAP & Reimbursement Economics ──────────────────────── */}
      {(isPro || previewMode) && showReimbursementDepth && data.reimbursement_analytics && (
        <div className="chart-container noise" data-report-content>
          <div className="chart-title">NTAP &amp; Reimbursement Economics</div>
          <div className="space-y-4">
            {/* Risk score header */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Overall Reimbursement Risk Score:</span>
              <span
                className={cn(
                  'metric text-lg',
                  data.reimbursement_analytics.overall_reimbursement_risk_score <= 3
                    ? 'text-emerald-400'
                    : data.reimbursement_analytics.overall_reimbursement_risk_score <= 6
                      ? 'text-amber-400'
                      : 'text-red-400',
                )}
              >
                {data.reimbursement_analytics.overall_reimbursement_risk_score}/10
              </span>
            </div>

            {/* NTAP Calculation */}
            {data.reimbursement_analytics.ntap && (
              <div className="p-3 bg-navy-800/50 rounded-md space-y-3">
                <h4 className="text-xs text-slate-300 font-medium">NTAP Calculation</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Eligibility</div>
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono uppercase tracking-wider',
                        data.reimbursement_analytics.ntap.eligible
                          ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/12 text-red-400 border border-red-500/20',
                      )}
                    >
                      {data.reimbursement_analytics.ntap.eligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </div>
                  <div>
                    <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Device Cost vs DRG</div>
                    <div className="metric text-sm text-white">
                      {formatCurrency(data.reimbursement_analytics.ntap.device_cost)} /{' '}
                      {formatCurrency(data.reimbursement_analytics.ntap.drg_payment)}
                    </div>
                    <div className="text-2xs text-slate-500">
                      {data.reimbursement_analytics.ntap.drg_payment > 0
                        ? `${formatPercent(
                            (data.reimbursement_analytics.ntap.device_cost /
                              data.reimbursement_analytics.ntap.drg_payment) *
                              100,
                            1,
                          )} of DRG`
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">NTAP Benefit</div>
                    <div className="metric text-sm text-teal-400">
                      {formatCurrency(data.reimbursement_analytics.ntap.ntap_payment)}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Effective Coverage</div>
                    <div className="metric text-sm text-white">
                      {formatPercent(data.reimbursement_analytics.ntap.effective_coverage_pct, 1)}
                    </div>
                  </div>
                </div>
                {data.reimbursement_analytics.ntap.application_deadline && (
                  <div className="text-2xs text-slate-500">
                    Application Deadline:{' '}
                    <span className="text-slate-300">{data.reimbursement_analytics.ntap.application_deadline}</span>
                  </div>
                )}
                <p className="text-xs text-slate-500 leading-relaxed">{data.reimbursement_analytics.ntap.narrative}</p>
              </div>
            )}

            {/* Payer Mix */}
            {data.reimbursement_analytics.payer_mix && (
              <div className="p-3 bg-navy-800/50 rounded-md space-y-3">
                <h4 className="text-xs text-slate-300 font-medium">Payer Mix Breakdown</h4>
                <div className="space-y-2">
                  {data.reimbursement_analytics.payer_mix.payers.map((p) => (
                    <div key={p.payer} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-28 flex-shrink-0">{p.payer}</span>
                      <div className="flex-1 h-3 bg-navy-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500/60 rounded-full"
                          style={{ width: `${Math.min(p.patient_share_pct, 100)}%` }}
                        />
                      </div>
                      <span className="metric text-xs text-white w-12 text-right">
                        {formatPercent(p.patient_share_pct, 0)}
                      </span>
                      <span className="metric text-xs text-slate-400 w-20 text-right">
                        {formatCurrency(p.reimbursement_rate)}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-mono uppercase tracking-wider',
                          coverageBadgeClass(p.coverage_status),
                        )}
                      >
                        {p.coverage_status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-navy-700">
                  <span className="text-xs text-slate-400">Blended Reimbursement Rate:</span>
                  <span className="metric text-sm text-teal-400">
                    {formatCurrency(data.reimbursement_analytics.payer_mix.blended_reimbursement_rate)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {data.reimbursement_analytics.payer_mix.narrative}
                </p>
              </div>
            )}

            {/* Coverage Timeline */}
            {data.reimbursement_analytics.coverage_timeline && (
              <div className="p-3 bg-navy-800/50 rounded-md space-y-3">
                <h4 className="text-xs text-slate-300 font-medium">Coverage Timeline</h4>
                <div className="space-y-2">
                  {data.reimbursement_analytics.coverage_timeline.milestones.map((m, i) => (
                    <div key={`cov-ms-${i}`} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-teal-500/60 flex-shrink-0" />
                      <span className="text-xs text-slate-300 flex-1">{m.milestone}</span>
                      <span className="metric text-xs text-white">{m.estimated_months} mo</span>
                      <span className="metric text-xs text-slate-500">
                        ({formatPercent(m.probability * 100, 0)} prob.)
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-navy-700">
                  <span className="text-xs text-slate-400">Full Coverage Estimate:</span>
                  <span className="metric text-sm text-white">
                    {data.reimbursement_analytics.coverage_timeline.full_coverage_estimate_months} months
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {data.reimbursement_analytics.coverage_timeline.narrative}
                </p>
              </div>
            )}

            {/* Reimbursement Scenarios */}
            {data.reimbursement_analytics.scenarios && data.reimbursement_analytics.scenarios.length > 0 && (
              <div className="p-3 bg-navy-800/50 rounded-md space-y-3">
                <h4 className="text-xs text-slate-300 font-medium">Reimbursement Scenarios</h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {data.reimbursement_analytics.scenarios.map((s) => (
                    <div
                      key={s.scenario}
                      className={cn(
                        'p-3 rounded-md border',
                        s.scenario === 'favorable'
                          ? 'border-emerald-500/20 bg-emerald-500/5'
                          : s.scenario === 'base'
                            ? 'border-navy-700 bg-navy-900/50'
                            : 'border-red-500/20 bg-red-500/5',
                      )}
                    >
                      <div className="text-2xs text-slate-500 uppercase tracking-wider mb-2">
                        {s.scenario === 'favorable'
                          ? 'Optimistic'
                          : s.scenario === 'base'
                            ? 'Base Case'
                            : 'Pessimistic'}
                      </div>
                      <div className="metric text-lg text-white mb-1">{formatCurrency(s.effective_reimbursement)}</div>
                      <div className="text-2xs text-slate-500">
                        Patient Access: <span className="metric">{formatPercent(s.patient_access_pct, 0)}</span>
                      </div>
                      <div className="text-2xs text-slate-500">
                        Revenue Impact: <span className="metric">{s.revenue_impact_multiplier.toFixed(2)}x</span>
                      </div>
                      <p className="text-2xs text-slate-500 mt-2 leading-relaxed">{s.narrative}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────── B. Competitive Share Distribution ──────────────────────── */}
      {(isPro || previewMode) && data.competitive_share_distribution && (
        <div className="chart-container noise" data-report-content>
          <div className="chart-title">Competitive Share Distribution</div>
          <div className="space-y-4">
            {/* Concentration metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Market Concentration</div>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono uppercase tracking-wider',
                    data.competitive_share_distribution.concentration_label === 'Fragmented'
                      ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20'
                      : data.competitive_share_distribution.concentration_label === 'Moderate'
                        ? 'bg-amber-500/12 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/12 text-red-400 border border-red-500/20',
                  )}
                >
                  {data.competitive_share_distribution.concentration_label}
                </span>
              </div>
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">HHI Index</div>
                <div className="metric text-lg text-white">
                  {formatNumber(data.competitive_share_distribution.hhi_index)}
                </div>
              </div>
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Top 3 Combined Share</div>
                <div className="metric text-lg text-teal-400">
                  {formatPercent(data.competitive_share_distribution.top_3_share_pct, 0)}
                </div>
              </div>
            </div>

            {/* Share bars */}
            <div className="space-y-2">
              {data.competitive_share_distribution.competitors.map((c, i) => (
                <div key={`share-${i}`} className="flex items-center gap-3">
                  <span className="text-xs text-slate-300 w-40 flex-shrink-0 truncate" title={c.name}>
                    {c.name}
                  </span>
                  <div className="flex-1 h-4 bg-navy-900 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        i === 0 ? 'bg-teal-500/70' : i < 3 ? 'bg-teal-500/40' : 'bg-slate-600/40',
                      )}
                      style={{ width: `${Math.min(c.estimated_share_pct, 100)}%` }}
                    />
                  </div>
                  <span className="metric text-xs text-white w-12 text-right">
                    {formatPercent(c.estimated_share_pct, 1)}
                  </span>
                </div>
              ))}
            </div>

            {/* Narrative */}
            <p className="text-xs text-slate-500 leading-relaxed">{data.competitive_share_distribution.narrative}</p>
          </div>
        </div>
      )}

      {/* ──────────────────────── C. Evidence Gap Analysis ──────────────────────── */}
      {(isPro || previewMode) && showClinicalSections && data.evidence_gap_analysis && (
        <div className="chart-container noise" data-report-content>
          <div className="chart-title">Evidence Gap Analysis</div>
          <div className="space-y-4">
            {/* Score header */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Overall Evidence Readiness Score:</span>
              <span
                className={cn(
                  'metric text-lg',
                  data.evidence_gap_analysis.overall_evidence_score >= 7
                    ? 'text-emerald-400'
                    : data.evidence_gap_analysis.overall_evidence_score >= 4
                      ? 'text-amber-400'
                      : 'text-red-400',
                )}
              >
                {data.evidence_gap_analysis.overall_evidence_score}/10
              </span>
            </div>

            {/* Gap entries */}
            <div className="space-y-3">
              {data.evidence_gap_analysis.gaps.map((g, i) => (
                <div key={`gap-${i}`} className="p-3 bg-navy-800/50 rounded-md">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-slate-300 font-medium">{g.evidence_type}</span>
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono uppercase tracking-wider',
                        g.gap_severity === 'moderate'
                          ? 'bg-amber-500/12 text-amber-400 border border-amber-500/20'
                          : g.gap_severity === 'significant'
                            ? 'bg-red-500/12 text-red-400 border border-red-500/20'
                            : 'bg-red-500/20 text-red-300 border border-red-400/30',
                      )}
                    >
                      {g.gap_severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-1">
                    <span className="text-slate-400">Current State:</span> {g.current_state}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mb-1">
                    <span className="text-slate-400">Competitive Impact:</span> {g.competitive_impact}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <span className="text-slate-400">Recommendation:</span> {g.recommendation}
                  </p>
                </div>
              ))}
            </div>

            {/* Narrative */}
            <p className="text-xs text-slate-500 leading-relaxed">{data.evidence_gap_analysis.narrative}</p>
          </div>
        </div>
      )}

      {/* ──────────────────────── D. Pricing Pressure Model ──────────────────────── */}
      {(isPro || previewMode) && data.pricing_pressure && (
        <div className="chart-container noise" data-report-content>
          <div className="chart-title">Pricing Pressure Model</div>
          <div className="space-y-4">
            {/* Key metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Current ASP</div>
                <div className="metric text-lg text-white">{formatCurrency(data.pricing_pressure.current_asp)}</div>
              </div>
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Category Median ASP</div>
                <div className="metric text-lg text-slate-300">
                  {formatCurrency(data.pricing_pressure.category_median_asp)}
                </div>
              </div>
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Annual ASP Erosion</div>
                <div
                  className={cn(
                    'metric text-lg',
                    data.pricing_pressure.asp_trend_pct_annual < 0 ? 'text-red-400' : 'text-emerald-400',
                  )}
                >
                  {data.pricing_pressure.asp_trend_pct_annual > 0 ? '+' : ''}
                  {formatPercent(data.pricing_pressure.asp_trend_pct_annual, 1)}
                </div>
              </div>
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Reimbursement Erosion</div>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono uppercase tracking-wider',
                    riskBadgeClass(data.pricing_pressure.reimbursement_erosion_risk),
                  )}
                >
                  {data.pricing_pressure.reimbursement_erosion_risk}
                </span>
              </div>
            </div>

            {/* Pressure scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">GPO Pressure Score</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-navy-900 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        data.pricing_pressure.gpo_pressure_score <= 3
                          ? 'bg-emerald-500/70'
                          : data.pricing_pressure.gpo_pressure_score <= 6
                            ? 'bg-amber-500/70'
                            : 'bg-red-500/70',
                      )}
                      style={{ width: `${data.pricing_pressure.gpo_pressure_score * 10}%` }}
                    />
                  </div>
                  <span className="metric text-xs text-white">{data.pricing_pressure.gpo_pressure_score}/10</span>
                </div>
              </div>
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">
                  Competitive Pricing Pressure
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-navy-900 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        data.pricing_pressure.competitive_pricing_pressure <= 3
                          ? 'bg-emerald-500/70'
                          : data.pricing_pressure.competitive_pricing_pressure <= 6
                            ? 'bg-amber-500/70'
                            : 'bg-red-500/70',
                      )}
                      style={{ width: `${data.pricing_pressure.competitive_pricing_pressure * 10}%` }}
                    />
                  </div>
                  <span className="metric text-xs text-white">
                    {data.pricing_pressure.competitive_pricing_pressure}/10
                  </span>
                </div>
              </div>
            </div>

            {/* 5-year ASP trajectory */}
            {data.pricing_pressure.projected_asp_5yr.length > 0 && (
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-2">
                  5-Year Projected ASP Trajectory
                </div>
                <div className="flex items-end gap-2 h-16">
                  {data.pricing_pressure.projected_asp_5yr.map((asp, i) => {
                    const maxAsp = Math.max(...data.pricing_pressure!.projected_asp_5yr);
                    const heightPct = maxAsp > 0 ? (asp / maxAsp) * 100 : 0;
                    return (
                      <div key={`asp-yr-${i}`} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-2xs metric text-slate-400">{formatCurrency(asp)}</div>
                        <div
                          className="w-full bg-teal-500/40 rounded-t"
                          style={{ height: `${heightPct}%`, minHeight: '4px' }}
                        />
                        <div className="text-2xs text-slate-500">Y{i + 1}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Narrative */}
            <p className="text-xs text-slate-500 leading-relaxed">{data.pricing_pressure.narrative}</p>
          </div>
        </div>
      )}

      {/* ──────────────────────── E. Deal Benchmarking ──────────────────────── */}
      {(isPro || previewMode) && showDealSections && data.deal_benchmark && (
        <div className="chart-container noise" data-report-content>
          <div className="chart-title">Deal Benchmarking</div>
          <div className="space-y-4">
            {/* Summary metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Median Deal Value</div>
                <div className="metric text-lg text-teal-400">
                  {formatCurrency(data.deal_benchmark.median_deal_value_m)}M
                </div>
              </div>
              {data.deal_benchmark.median_revenue_multiple != null && (
                <div className="p-3 bg-navy-800/50 rounded-md">
                  <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Median Revenue Multiple</div>
                  <div className="metric text-lg text-white">
                    {data.deal_benchmark.median_revenue_multiple.toFixed(1)}x
                  </div>
                </div>
              )}
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Deals (Last 3 Years)</div>
                <div className="metric text-lg text-white">{data.deal_benchmark.deal_count_last_3yr}</div>
              </div>
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Hottest Categories</div>
                <div className="flex flex-wrap gap-1">
                  {data.deal_benchmark.hottest_categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center px-1.5 py-0.5 rounded bg-teal-500/12 text-teal-400 border border-teal-500/20 text-2xs font-mono"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Comparable deals table */}
            {data.deal_benchmark.comparable_deals.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-navy-700">
                      <th className="text-2xs text-slate-500 uppercase tracking-wider pb-2 pr-3">Acquirer</th>
                      <th className="text-2xs text-slate-500 uppercase tracking-wider pb-2 pr-3">Target</th>
                      <th className="text-2xs text-slate-500 uppercase tracking-wider pb-2 pr-3">Type</th>
                      <th className="text-2xs text-slate-500 uppercase tracking-wider pb-2 pr-3 text-right">
                        Value ($M)
                      </th>
                      <th className="text-2xs text-slate-500 uppercase tracking-wider pb-2 pr-3">Date</th>
                      <th className="text-2xs text-slate-500 uppercase tracking-wider pb-2">Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.deal_benchmark.comparable_deals.map((d, i) => (
                      <tr key={`deal-${i}`} className="border-b border-navy-700/50">
                        <td className="text-xs text-slate-300 py-2 pr-3">{d.acquirer}</td>
                        <td className="text-xs text-slate-300 py-2 pr-3">{d.target}</td>
                        <td className="py-2 pr-3">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-navy-800 border border-navy-700 text-2xs font-mono text-slate-400">
                            {d.deal_type}
                          </span>
                        </td>
                        <td className="metric text-xs text-white py-2 pr-3 text-right">
                          {d.value_m != null ? formatCurrency(d.value_m) : '--'}
                        </td>
                        <td className="text-xs text-slate-400 py-2 pr-3">{d.announced_date}</td>
                        <td className="text-xs text-slate-500 py-2 max-w-48 truncate" title={d.rationale}>
                          {d.rationale}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Narrative */}
            <p className="text-xs text-slate-500 leading-relaxed">{data.deal_benchmark.narrative}</p>
          </div>
        </div>
      )}

      {/* ──────────────────────── F. Technology Readiness ──────────────────────── */}
      {(isPro || previewMode) && showClinicalSections && data.technology_readiness && (
        <div className="chart-container noise" data-report-content>
          <div className="chart-title">Technology Readiness</div>
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Average TRL</div>
                <div className="metric text-lg text-white">{data.technology_readiness.avg_trl.toFixed(1)}</div>
              </div>
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Highest Threat Competitor</div>
                <div className="text-sm text-red-400 font-medium">
                  {data.technology_readiness.highest_threat_competitor}
                </div>
              </div>
            </div>

            {/* TRL entries */}
            <div className="space-y-2">
              {data.technology_readiness.entries.map((e, i) => (
                <div key={`trl-${i}`} className="p-3 bg-navy-800/50 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-300 font-medium">{e.competitor_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="metric text-xs text-white">TRL {e.trl_level}</span>
                      <span className="text-2xs text-slate-500">{e.trl_label}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-2xs">
                    <div>
                      <span className="text-slate-500">Validation:</span>
                      <div className="text-slate-400">{e.clinical_validation_status}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Manufacturing:</span>
                      <span
                        className={cn(
                          'inline-flex items-center px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ml-1',
                          e.manufacturing_readiness === 'commercial'
                            ? 'bg-emerald-500/12 text-emerald-400'
                            : e.manufacturing_readiness === 'scaled'
                              ? 'bg-teal-500/12 text-teal-400'
                              : e.manufacturing_readiness === 'pilot'
                                ? 'bg-amber-500/12 text-amber-400'
                                : 'bg-slate-500/12 text-slate-400',
                        )}
                      >
                        {e.manufacturing_readiness}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">IP Strength:</span>
                      <span
                        className={cn(
                          'inline-flex items-center px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ml-1',
                          e.ip_strength === 'dominant'
                            ? 'bg-emerald-500/12 text-emerald-400'
                            : e.ip_strength === 'strong'
                              ? 'bg-teal-500/12 text-teal-400'
                              : e.ip_strength === 'moderate'
                                ? 'bg-amber-500/12 text-amber-400'
                                : 'bg-red-500/12 text-red-400',
                        )}
                      >
                        {e.ip_strength}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Years to Market:</span>
                      <span className="metric text-slate-300 ml-1">{e.years_to_market}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xs text-slate-500">Threat Score:</span>
                    <div className="flex-1 h-1.5 bg-navy-900 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          e.threat_score <= 3
                            ? 'bg-emerald-500/70'
                            : e.threat_score <= 6
                              ? 'bg-amber-500/70'
                              : 'bg-red-500/70',
                        )}
                        style={{ width: `${e.threat_score * 10}%` }}
                      />
                    </div>
                    <span className="metric text-2xs text-white">{e.threat_score}/10</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Narrative */}
            <p className="text-xs text-slate-500 leading-relaxed">{data.technology_readiness.narrative}</p>
          </div>
        </div>
      )}

      {/* ──────────────────────── G. Clinical Superiority Matrix ──────────────────────── */}
      {(isPro || previewMode) && showClinicalSections && data.clinical_superiority && (
        <div className="chart-container noise" data-report-content>
          <div className="chart-title">Clinical Superiority Matrix</div>
          <div className="space-y-4">
            {/* Position header */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Your Device Position:</span>
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono uppercase tracking-wider',
                  data.clinical_superiority.user_device_position === 'superior'
                    ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20'
                    : data.clinical_superiority.user_device_position === 'comparable'
                      ? 'bg-amber-500/12 text-amber-400 border border-amber-500/20'
                      : data.clinical_superiority.user_device_position === 'inferior'
                        ? 'bg-red-500/12 text-red-400 border border-red-500/20'
                        : 'bg-slate-500/12 text-slate-400 border border-slate-500/20',
                )}
              >
                {data.clinical_superiority.user_device_position.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 ml-2">Key Differentiator:</span>
              <span className="text-xs text-teal-400">{data.clinical_superiority.key_differentiator}</span>
            </div>

            {/* Comparison table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-navy-700">
                    <th className="text-2xs text-slate-500 uppercase tracking-wider pb-2 pr-3">Device</th>
                    <th className="text-2xs text-slate-500 uppercase tracking-wider pb-2 pr-3">Company</th>
                    <th className="text-2xs text-slate-500 uppercase tracking-wider pb-2 pr-3">Endpoint</th>
                    <th className="text-2xs text-slate-500 uppercase tracking-wider pb-2 pr-3 text-right">Success</th>
                    <th className="text-2xs text-slate-500 uppercase tracking-wider pb-2 pr-3 text-right">
                      Complications
                    </th>
                    <th className="text-2xs text-slate-500 uppercase tracking-wider pb-2 pr-3">Data Quality</th>
                    <th className="text-2xs text-slate-500 uppercase tracking-wider pb-2 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clinical_superiority.entries.map((e, i) => (
                    <tr key={`clin-${i}`} className="border-b border-navy-700/50">
                      <td className="text-xs text-slate-300 py-2 pr-3">{e.competitor_device}</td>
                      <td className="text-xs text-slate-400 py-2 pr-3">{e.company}</td>
                      <td className="text-xs text-slate-400 py-2 pr-3 max-w-32 truncate" title={e.primary_endpoint}>
                        {e.primary_endpoint}
                      </td>
                      <td className="metric text-xs text-white py-2 pr-3 text-right">
                        {e.success_rate_pct != null ? formatPercent(e.success_rate_pct, 1) : '--'}
                      </td>
                      <td className="metric text-xs py-2 pr-3 text-right">
                        {e.complication_rate_pct != null ? (
                          <span
                            className={
                              e.complication_rate_pct <= 5
                                ? 'text-emerald-400'
                                : e.complication_rate_pct <= 15
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                            }
                          >
                            {formatPercent(e.complication_rate_pct, 1)}
                          </span>
                        ) : (
                          '--'
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-navy-800 border border-navy-700 text-2xs font-mono text-slate-400">
                          {e.data_quality}
                        </span>
                      </td>
                      <td className="metric text-xs text-white py-2 text-right">{e.superiority_score}/10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Narrative */}
            <p className="text-xs text-slate-500 leading-relaxed">{data.clinical_superiority.narrative}</p>
          </div>
        </div>
      )}

      {/* ──────────────────────── H. Surgeon Switching Cost ──────────────────────── */}
      {(isPro || previewMode) && showOperationalSections && data.surgeon_switching_cost && (
        <div className="chart-container noise" data-report-content>
          <div className="chart-title">Surgeon Switching Cost Analysis</div>
          <div className="space-y-4">
            {/* Key metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Training Required</div>
                <div className="metric text-lg text-white">
                  {data.surgeon_switching_cost.training_requirement_hours}h
                </div>
                <div className="text-2xs text-slate-500">
                  {data.surgeon_switching_cost.learning_curve_cases} cases to proficiency
                </div>
              </div>
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Workflow Disruption</div>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono uppercase tracking-wider',
                    data.surgeon_switching_cost.or_workflow_change === 'minimal'
                      ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20'
                      : data.surgeon_switching_cost.or_workflow_change === 'moderate'
                        ? 'bg-amber-500/12 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/12 text-red-400 border border-red-500/20',
                  )}
                >
                  {data.surgeon_switching_cost.or_workflow_change}
                </span>
              </div>
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Switching Cost / Site</div>
                <div className="metric text-lg text-white">
                  {formatCurrency(data.surgeon_switching_cost.estimated_switching_cost_per_site)}
                </div>
              </div>
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Switching Friction Score</div>
                <div
                  className={cn(
                    'metric text-lg',
                    data.surgeon_switching_cost.switching_barrier_score <= 3
                      ? 'text-emerald-400'
                      : data.surgeon_switching_cost.switching_barrier_score <= 6
                        ? 'text-amber-400'
                        : 'text-red-400',
                  )}
                >
                  {data.surgeon_switching_cost.switching_barrier_score}/10
                </div>
              </div>
            </div>

            {/* Additional attributes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Credentialing Required</div>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono uppercase tracking-wider',
                    data.surgeon_switching_cost.credentialing_required
                      ? 'bg-amber-500/12 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20',
                  )}
                >
                  {data.surgeon_switching_cost.credentialing_required ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="p-3 bg-navy-800/50 rounded-md">
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">System Compatibility</div>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono uppercase tracking-wider',
                    data.surgeon_switching_cost.compatibility_with_existing_systems === 'full'
                      ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20'
                      : data.surgeon_switching_cost.compatibility_with_existing_systems === 'partial'
                        ? 'bg-amber-500/12 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/12 text-red-400 border border-red-500/20',
                  )}
                >
                  {data.surgeon_switching_cost.compatibility_with_existing_systems}
                </span>
              </div>
            </div>

            {/* Facilitators & Inhibitors */}
            <div className="grid grid-cols-2 gap-4">
              {data.surgeon_switching_cost.switching_facilitators.length > 0 && (
                <div className="p-3 bg-navy-800/50 rounded-md">
                  <h4 className="text-xs text-emerald-400 font-medium mb-2">Switching Facilitators</h4>
                  <ul className="space-y-1">
                    {data.surgeon_switching_cost.switching_facilitators.map((f, i) => (
                      <li key={`fac-${i}`} className="text-xs text-slate-500 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {data.surgeon_switching_cost.switching_inhibitors.length > 0 && (
                <div className="p-3 bg-navy-800/50 rounded-md">
                  <h4 className="text-xs text-red-400 font-medium mb-2">Switching Inhibitors</h4>
                  <ul className="space-y-1">
                    {data.surgeon_switching_cost.switching_inhibitors.map((f, i) => (
                      <li key={`inh-${i}`} className="text-xs text-slate-500 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Narrative */}
            <p className="text-xs text-slate-500 leading-relaxed">{data.surgeon_switching_cost.narrative}</p>
          </div>
        </div>
      )}

      {/* ──────────────────────── 10. Revenue Projection ──────────────────────── */}
      {data.revenue_projection.length > 0 && (
        <MarketGrowthChart
          projections={data.revenue_projection}
          peakSales={{ low: peakBear, base: peakBase, high: peakBull }}
        />
      )}

      {/* ──────────────────────── I. Device Sensitivity Analysis ──────────────────────── */}
      {(isPro || previewMode) &&
        (() => {
          const somBase = data.summary.us_som.value;
          const somUnit = data.summary.us_som.unit;
          const volumeMultipliers = [0.8, 1.0, 1.2] as const;
          const shareMultipliers = [0.7, 1.0, 1.3] as const;
          const volumeLabels = ['80%', '100%', '120%'];
          const shareLabels = ['0.7x', '1.0x', '1.3x'];

          return (
            <div className="chart-container noise" data-report-content>
              <div className="chart-title">Device Sensitivity Analysis</div>
              <p className="text-xs text-slate-500 mb-4">
                3x3 matrix showing SOM sensitivity to procedure volume and market share assumptions. Base case
                highlighted.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-center">
                  <thead>
                    <tr>
                      <th className="text-2xs text-slate-500 uppercase tracking-wider pb-2 pr-3 text-left" rowSpan={2}>
                        Procedure Volume
                      </th>
                      <th className="text-2xs text-slate-500 uppercase tracking-wider pb-1" colSpan={3}>
                        Market Share Multiplier
                      </th>
                    </tr>
                    <tr>
                      {shareLabels.map((label) => (
                        <th key={label} className="text-2xs text-slate-400 font-mono pb-2 px-3">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {volumeMultipliers.map((vm, vi) => (
                      <tr key={`vol-${vi}`} className="border-t border-navy-700/50">
                        <td className="text-xs text-slate-400 font-mono py-2 pr-3 text-left">{volumeLabels[vi]}</td>
                        {shareMultipliers.map((sm, si) => {
                          const isBase = vm === 1.0 && sm === 1.0;
                          const val = somBase * vm * sm;
                          return (
                            <td
                              key={`cell-${vi}-${si}`}
                              className={cn(
                                'metric text-sm py-2 px-3',
                                isBase ? 'text-teal-400 bg-teal-500/8 font-semibold' : 'text-white',
                              )}
                            >
                              {formatMetric(parseFloat(val.toFixed(2)), somUnit)}
                              {isBase && <div className="text-2xs text-teal-500 font-normal mt-0.5">Base</div>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

      {/* ──────────────────────── 11. Methodology ──────────────────────── */}
      <div className="chart-container noise">
        <button
          onClick={() => setMethodologyOpen(!methodologyOpen)}
          className="flex items-center justify-between w-full"
        >
          <span className="chart-title !mb-0">Methodology</span>
          {methodologyOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {methodologyOpen && (
          <div className="mt-4 animate-fade-in">
            <p className="text-xs text-slate-500 leading-relaxed">{data.methodology}</p>
          </div>
        )}
      </div>

      {/* ──────────────────────── 12. Data Sources ──────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {data.data_sources.map((source) => (
          <DataSourceBadge key={source.name} source={source.name} type={source.type} url={source.url} />
        ))}
      </div>

      {/* ──────────────────────── 13. Action Bar ──────────────────────── */}
      {!previewMode && (
        <div className="flex items-center gap-3 pt-6 border-t border-navy-700">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400/80 font-medium px-2">
            <BookmarkCheck className="w-3.5 h-3.5" />
            Auto-saved
          </span>
          <ExportButton
            format="pdf"
            onPdfExport={onPdfExport}
            reportTitle={`${input.procedure_or_condition} — Device Market Assessment`}
            reportSubtitle={[input.device_category, input.product_name].filter(Boolean).join(' — ') || undefined}
            filename={`terrain-${input.procedure_or_condition.toLowerCase().replace(/\s+/g, '-')}-device-market-sizing`}
          />
          <ExportButton
            format="csv"
            data={flattenDeviceForCSV(data)}
            filename={`terrain-${input.procedure_or_condition.toLowerCase().replace(/\s+/g, '-')}-device-market-sizing`}
          />
          <ExportButton
            format="xlsx"
            data={flattenDeviceForCSV(data)}
            filename={`terrain-${input.procedure_or_condition.toLowerCase().replace(/\s+/g, '-')}-device-market-sizing`}
          />
          <ExportButton
            format="email"
            reportTitle={`${input.procedure_or_condition} — Device Market Assessment`}
            reportSubtitle={[input.device_category, input.product_name].filter(Boolean).join(' — ') || undefined}
          />
        </div>
      )}

      {/* ──────────────────────── 14. Confidential Footer ──────────────────────── */}
      <ConfidentialFooter />
    </div>
  );
}
