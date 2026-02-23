'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatMetric, formatCompact, formatCurrency, formatPercent, formatNumber } from '@/lib/utils/format';
import { StatCard } from '@/components/shared/StatCard';
import { DataSourceBadge } from '@/components/shared/DataSourceBadge';
import { ConfidentialFooter } from '@/components/shared/ConfidentialFooter';
import { ExportButton } from '@/components/shared/ExportButton';
import { SaveReportButton } from '@/components/shared/SaveReportButton';
import TAMChart from './TAMChart';
import ProcedureVolumeChart from './ProcedureVolumeChart';
import RevenueStreamChart from './RevenueStreamChart';
import DeviceGeographyTable from './DeviceGeographyTable';
import MarketGrowthChart from './MarketGrowthChart';
import type { DeviceMarketSizingOutput, DeviceMarketSizingInput } from '@/types/devices-diagnostics';

// ────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────

interface DeviceMarketSizingReportProps {
  data: DeviceMarketSizingOutput;
  input: DeviceMarketSizingInput;
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

  return rows;
}

// ────────────────────────────────────────────────────────────
// Coverage badge color helper
// ────────────────────────────────────────────────────────────

function coverageBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === 'covered') return 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20';
  if (s === 'partial' || s === 'coverage_pending')
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
}: DeviceMarketSizingReportProps) {
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const { summary } = data;

  // Compute peak sales from revenue projection for MarketGrowthChart
  const peakBase = Math.max(...data.revenue_projection.map((r) => r.base));
  const peakBear = Math.max(...data.revenue_projection.map((r) => r.bear));
  const peakBull = Math.max(...data.revenue_projection.map((r) => r.bull));

  return (
    <div className="space-y-6 animate-fade-in" data-report-content>
      {/* ──────────────────────── 1. Executive Summary ──────────────────────── */}
      <div className="card noise">
        <h3 className="chart-title">Executive Summary</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The{' '}
          <span className="text-white font-medium">
            {input.procedure_or_condition}
          </span>{' '}
          device market represents a US total addressable market of{' '}
          <span className="metric text-teal-400">
            {formatMetric(summary.us_tam.value, summary.us_tam.unit)}
          </span>
          , with a serviceable addressable market of{' '}
          <span className="metric text-white">
            {formatMetric(summary.us_sam.value, summary.us_sam.unit)}
          </span>{' '}
          and a serviceable obtainable market of{' '}
          <span className="metric text-white">
            {formatMetric(summary.us_som.value, summary.us_som.unit)}
          </span>
          {summary.us_som.range
            ? ` (range: ${formatMetric(summary.us_som.range[0], summary.us_som.unit)}--${formatMetric(summary.us_som.range[1], summary.us_som.unit)})`
            : ''}
          . The market is growing at{' '}
          <span className="metric text-white">{summary.cagr_5yr}%</span> CAGR
          over the next five years, driven by{' '}
          <span className="text-slate-300">
            {summary.market_growth_driver}
          </span>
          . Procedure volume stands at{' '}
          <span className="metric text-white">
            {formatNumber(data.procedure_volume.us_annual_procedures)}
          </span>{' '}
          annual US procedures, of which{' '}
          <span className="metric text-white">
            {formatNumber(data.procedure_volume.us_addressable_procedures)}
          </span>{' '}
          are addressable for the target device profile.
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
          range={summary.us_som.range ? {
            low: formatMetric(summary.us_som.range[0], summary.us_som.unit),
            high: formatMetric(summary.us_som.range[1], summary.us_som.unit),
          } : undefined}
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

      {/* ──────────────────────── 4. Procedure Volume ──────────────────────── */}
      <ProcedureVolumeChart
        procedureVolume={data.procedure_volume}
        peakSharePct={data.adoption_model.peak_market_share.base * 100}
      />

      {/* ──────────────────────── 5. Revenue Streams ──────────────────────── */}
      {data.revenue_streams.length > 0 && (
        <RevenueStreamChart streams={data.revenue_streams} />
      )}

      {/* ──────────────────────── 6. Adoption Model ──────────────────────── */}
      <div className="chart-container noise">
        <div className="chart-title">Adoption Model</div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total US Sites */}
          <div className="p-3 bg-navy-800/50 rounded-md">
            <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">
              Total US Sites
            </div>
            <div className="metric text-lg text-white">
              {formatNumber(data.adoption_model.total_us_sites)}
            </div>
          </div>

          {/* Addressable Sites */}
          <div className="p-3 bg-navy-800/50 rounded-md">
            <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">
              Addressable Sites
            </div>
            <div className="metric text-lg text-white">
              {formatNumber(data.adoption_model.addressable_sites)}
            </div>
          </div>

          {/* Peak Market Share */}
          <div className="p-3 bg-navy-800/50 rounded-md">
            <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">
              Peak Market Share
            </div>
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
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">
                Peak Installed Base
              </div>
              <div className="metric text-lg text-white">
                {formatNumber(data.adoption_model.peak_installed_base)}
              </div>
            </div>
          )}

          {/* Years to Peak */}
          <div className="p-3 bg-navy-800/50 rounded-md">
            <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">
              Years to Peak
            </div>
            <div className="metric text-lg text-white">
              {data.adoption_model.years_to_peak}
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────── 7. Geography ──────────────────────── */}
      {data.geography_breakdown.length > 0 && (
        <DeviceGeographyTable data={data.geography_breakdown} />
      )}

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
                coverageBadgeClass(data.reimbursement_analysis.us_coverage_status)
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
          {data.reimbursement_analysis.drg_codes &&
            data.reimbursement_analysis.drg_codes.length > 0 && (
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
              <span className="metric text-sm text-white">
                {data.reimbursement_analysis.medicare_payment_rate}
              </span>
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
                riskBadgeClass(data.reimbursement_analysis.reimbursement_risk)
              )}
            >
              {data.reimbursement_analysis.reimbursement_risk}
            </span>
          </div>

          {/* Reimbursement Strategy */}
          {data.reimbursement_analysis.reimbursement_strategy && (
            <div className="mt-4 p-3 bg-navy-800/50 rounded-md">
              <h4 className="text-xs text-slate-300 font-medium mb-2">
                Reimbursement Strategy
              </h4>
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
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">
                Total Competitors
              </div>
              <div className="metric text-lg text-white">
                {data.competitive_positioning.total_competitors}
              </div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">
                Market Leader
              </div>
              <div className="text-sm text-slate-300 font-medium">
                {data.competitive_positioning.market_leader}
              </div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">
                Leader Market Share
              </div>
              <div className="metric text-lg text-teal-400">
                {formatPercent(data.competitive_positioning.leader_market_share_pct, 0)}
              </div>
            </div>
          </div>

          {/* ASE Range */}
          <div className="p-3 bg-navy-800/50 rounded-md">
            <div className="text-2xs text-slate-500 uppercase tracking-wider mb-2">
              Average Selling Price Range
            </div>
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
              <h4 className="text-xs text-slate-300 font-medium mb-2">
                Key Differentiation Vectors
              </h4>
              <ul className="space-y-1">
                {data.competitive_positioning.key_differentiation_vectors.map(
                  (v, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-500 flex items-start gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-teal-500/60 mt-1.5 flex-shrink-0" />
                      {v}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────── 10. Revenue Projection ──────────────────────── */}
      {data.revenue_projection.length > 0 && (
        <MarketGrowthChart
          projections={data.revenue_projection}
          peakSales={{ low: peakBear, base: peakBase, high: peakBull }}
        />
      )}

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
            <p className="text-xs text-slate-500 leading-relaxed">
              {data.methodology}
            </p>
          </div>
        )}
      </div>

      {/* ──────────────────────── 12. Data Sources ──────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {data.data_sources.map((source) => (
          <DataSourceBadge
            key={source.name}
            source={source.name}
            type={source.type}
            url={source.url}
          />
        ))}
      </div>

      {/* ──────────────────────── 13. Action Bar ──────────────────────── */}
      <div className="flex items-center gap-3 pt-6 border-t border-navy-700">
        <SaveReportButton
          reportData={{
            title: `${input.procedure_or_condition} Device Market Assessment`,
            report_type: 'market_sizing',
            indication: input.procedure_or_condition,
            inputs: input as unknown as Record<string, unknown>,
            outputs: data as unknown as Record<string, unknown>,
          }}
        />
        <ExportButton
          format="pdf"
          reportTitle={`${input.procedure_or_condition} — Device Market Assessment`}
          reportSubtitle={[input.device_category, input.product_name].filter(Boolean).join(' — ') || undefined}
          filename={`terrain-${input.procedure_or_condition.toLowerCase().replace(/\s+/g, '-')}-device-market-sizing`}
        />
        <ExportButton
          format="csv"
          data={flattenDeviceForCSV(data)}
          filename={`terrain-${input.procedure_or_condition.toLowerCase().replace(/\s+/g, '-')}-device-market-sizing`}
        />
      </div>

      {/* ──────────────────────── 14. Confidential Footer ──────────────────────── */}
      <ConfidentialFooter />
    </div>
  );
}
