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
import PatientFunnelChart from './PatientFunnelChart';
import GeographyBreakdown from './GeographyBreakdown';
import MarketGrowthChart from './MarketGrowthChart';
import SensitivityTable from './SensitivityTable';
import type { MarketSizingOutput, MarketSizingInput } from '@/types';

interface MarketSizingReportProps {
  data: MarketSizingOutput;
  input: MarketSizingInput;
  previewMode?: boolean;
  onPdfExport?: () => void;
}

function flattenForCSV(data: MarketSizingOutput): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];

  // Geography breakdown
  data.geography_breakdown.forEach((g) => {
    rows.push({
      section: 'Geography',
      territory: g.territory,
      tam: formatMetric(g.tam.value, g.tam.unit),
      multiplier: g.market_multiplier,
      regulatory_status: g.regulatory_status,
    });
  });

  // Pricing comparables
  data.pricing_analysis.comparable_drugs.forEach((d) => {
    rows.push({
      section: 'Comparable Drug',
      drug_name: d.name,
      company: d.company,
      launch_year: d.launch_year,
      launch_wac: d.launch_wac,
      current_net_price: d.current_net_price,
      indication: d.indication,
      mechanism: d.mechanism,
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

export default function MarketSizingReport({ data, input, previewMode, onPdfExport }: MarketSizingReportProps) {
  const [methodologyOpen, setMethodologyOpen] = useState(previewMode ?? false);
  const { isPro } = useSubscription();
  const { role } = useProfile();
  const { summary } = data;

  // Role-based section visibility for Pro users
  // Investors and analysts see everything — full diligence depth for any niche market
  const fullDepth = !role || ['investor', 'analyst'].includes(role);
  const showDealSections = fullDepth || ['bd_executive', 'corp_dev', 'consultant'].includes(role!);
  const showManufacturing = fullDepth || ['founder', 'consultant'].includes(role!);

  return (
    <div className="space-y-6 animate-fade-in" data-report-content>
      {/* Executive Summary */}
      <div className="card noise">
        <h3 className="chart-title">Executive Summary</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The <span className="text-white font-medium">{input.indication}</span> market
          {input.subtype ? ` (${input.subtype})` : ''} represents a US total addressable market of{' '}
          <span className="metric text-teal-400">{formatMetric(summary.tam_us.value, summary.tam_us.unit)}</span>, with
          a serviceable addressable market of{' '}
          <span className="metric text-white">{formatMetric(summary.sam_us.value, summary.sam_us.unit)}</span> and a
          serviceable obtainable market of{' '}
          <span className="metric text-white">{formatMetric(summary.som_us.value, summary.som_us.unit)}</span>
          {summary.som_us.range
            ? ` (range: ${formatMetric(summary.som_us.range[0], summary.som_us.unit)}–${formatMetric(summary.som_us.range[1], summary.som_us.unit)})`
            : ''}
          . The market is growing at <span className="metric text-white">{summary.cagr_5yr}%</span> CAGR over the next
          five years. Peak sales are estimated at{' '}
          <span className="metric text-white">{formatCompact(summary.peak_sales_estimate.base)}</span> (base case), with
          a range of {formatCompact(summary.peak_sales_estimate.low)} to{' '}
          {formatCompact(summary.peak_sales_estimate.high)}.
          {data.patient_funnel.addressable > 0 &&
            ` Approximately ${data.patient_funnel.addressable.toLocaleString()} addressable patients
            in the US form the basis of this analysis.`}
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="US TAM"
          value={formatMetric(summary.tam_us.value, summary.tam_us.unit)}
          confidence={summary.tam_us.confidence}
          source="Terrain Analysis"
          range={
            summary.tam_us.range
              ? {
                  low: formatMetric(summary.tam_us.range[0], summary.tam_us.unit),
                  high: formatMetric(summary.tam_us.range[1], summary.tam_us.unit),
                }
              : undefined
          }
        />
        <StatCard
          label="US SAM"
          value={formatMetric(summary.sam_us.value, summary.sam_us.unit)}
          confidence={summary.sam_us.confidence}
          source="Terrain Analysis"
        />
        <StatCard
          label="US SOM"
          value={formatMetric(summary.som_us.value, summary.som_us.unit)}
          confidence={summary.som_us.confidence}
          source="Terrain Analysis"
          range={
            summary.som_us.range
              ? {
                  low: formatMetric(summary.som_us.range[0], summary.som_us.unit),
                  high: formatMetric(summary.som_us.range[1], summary.som_us.unit),
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

      {/* TAM Chart */}
      <TAMChart tam={summary.tam_us} sam={summary.sam_us} som={summary.som_us} />

      {/* Patient Funnel */}
      <PatientFunnelChart funnel={data.patient_funnel} />

      {/* Geography Breakdown */}
      {data.geography_breakdown.length > 0 && <GeographyBreakdown data={data.geography_breakdown} />}

      {/* Revenue Projection */}
      {data.revenue_projection.length > 0 && (
        <MarketGrowthChart
          projections={data.revenue_projection}
          peakSales={{
            low: summary.peak_sales_estimate?.low ?? 0,
            base: summary.peak_sales_estimate?.base ?? 0,
            high: summary.peak_sales_estimate?.high ?? 0,
          }}
        />
      )}

      {/* ──────────────────────── PRO ANALYTICS ──────────────────────── */}
      {!isPro && !previewMode && (
        <UpgradeGate feature="Advanced analytics (sensitivity analysis, payer-tier pricing, regulatory pathway, label expansion, manufacturing constraints, and pricing comparables)">
          <div className="space-y-6 opacity-50 pointer-events-none select-none">
            <div className="chart-container noise h-[200px]" />
            <div className="chart-container noise h-[300px]" />
            <div className="chart-container noise h-[200px]" />
          </div>
        </UpgradeGate>
      )}

      {/* Sensitivity Analysis */}
      {(isPro || previewMode) && data.patient_funnel.addressable > 0 && (
        <SensitivityTable
          addressablePatients={data.patient_funnel.addressable}
          netPrice={
            data.pricing_analysis.recommended_wac.base * (1 - (data.pricing_analysis.gross_to_net_estimate || 0.3))
          }
          baseSharePct={data.patient_funnel.capturable_rate / 100}
        />
      )}

      {/* Pricing Comparables */}
      {(isPro || previewMode) && data.pricing_analysis.comparable_drugs.length > 0 && (
        <div className="chart-container noise">
          <div className="chart-title">Pricing Comparables</div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Drug</th>
                  <th>Company</th>
                  <th>Launch</th>
                  <th>WAC</th>
                  <th>Net Price</th>
                  <th>Indication</th>
                </tr>
              </thead>
              <tbody>
                {data.pricing_analysis.comparable_drugs.map((drug) => (
                  <tr key={drug.name}>
                    <td className="text-slate-300 font-medium">{drug.name}</td>
                    <td>{drug.company}</td>
                    <td className="numeric">{drug.launch_year}</td>
                    <td className="numeric">{formatCurrency(drug.launch_wac)}</td>
                    <td className="numeric">{formatCurrency(drug.current_net_price)}</td>
                    <td>
                      <span className="text-2xs text-slate-500">{drug.indication}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-navy-800/50 rounded-md">
            <p className="text-xs text-slate-400">
              <span className="text-slate-300 font-medium">Recommended WAC: </span>
              Conservative {formatCurrency(data.pricing_analysis.recommended_wac.conservative)} · Base{' '}
              {formatCurrency(data.pricing_analysis.recommended_wac.base)} · Premium{' '}
              {formatCurrency(data.pricing_analysis.recommended_wac.premium)}
            </p>
            <p className="text-2xs text-slate-500 mt-1">
              Gross-to-net estimate: {formatPercent(data.pricing_analysis.gross_to_net_estimate * 100, 0)}
            </p>
          </div>
        </div>
      )}

      {/* ──────────────────────── Regulatory Pathway Analysis ──────────────────────── */}
      {(isPro || previewMode) && data.regulatory_pathway_analysis && (
        <div className="chart-container noise">
          <div className="chart-title">Regulatory Pathway Analysis</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Base LoA</div>
              <div className="metric text-lg text-slate-400">
                {formatPercent(data.regulatory_pathway_analysis.base_loa * 100, 1)}
              </div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Pathway Modifier</div>
              <div className="metric text-lg text-white">{data.regulatory_pathway_analysis.pathway_modifier}x</div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Adjusted LoA</div>
              <div className="metric text-lg text-teal-400">
                {formatPercent(data.regulatory_pathway_analysis.adjusted_loa * 100, 1)}
              </div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Designations</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.regulatory_pathway_analysis.designations.length > 0 ? (
                  data.regulatory_pathway_analysis.designations.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-mono bg-teal-500/12 text-teal-400 border border-teal-500/20"
                    >
                      {d}
                    </span>
                  ))
                ) : (
                  <span className="text-2xs text-slate-500">Standard</span>
                )}
              </div>
            </div>
          </div>
          {data.regulatory_pathway_analysis.inferred && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xs font-mono text-amber-400/70 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                Inferred
              </span>
              <span className="text-2xs text-slate-500">Designations inferred from indication characteristics</span>
            </div>
          )}
          <p className="text-xs text-slate-500 leading-relaxed">{data.regulatory_pathway_analysis.rationale}</p>
        </div>
      )}

      {/* ──────────────────────── Payer-Tier Pricing ──────────────────────── */}
      {(isPro || previewMode) && data.payer_tier_pricing && data.payer_tier_pricing.length > 0 && (
        <div className="chart-container noise">
          <div className="chart-title">Payer-Tier Pricing Analysis</div>
          {/* Year 1 tier breakdown */}
          {(() => {
            const yr1 = data.payer_tier_pricing[0];
            return (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-navy-800/50 rounded-md flex-1">
                    <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">WAC (List Price)</div>
                    <div className="metric text-lg text-white">{formatCurrency(yr1.wac)}</div>
                  </div>
                  <div className="p-3 bg-navy-800/50 rounded-md flex-1">
                    <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Blended Net Price</div>
                    <div className="metric text-lg text-teal-400">{formatCurrency(yr1.blended_net_price)}</div>
                  </div>
                  <div className="p-3 bg-navy-800/50 rounded-md flex-1">
                    <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Effective GTN</div>
                    <div className="metric text-lg text-amber-400">{yr1.effective_gtn_pct}%</div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Payer Tier</th>
                        <th>Volume Share</th>
                        <th>Discount</th>
                        <th>Net Price</th>
                        <th>Rationale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yr1.tiers.map((tier) => (
                        <tr key={tier.payer_tier}>
                          <td className="text-slate-300 font-medium">{tier.payer_tier}</td>
                          <td className="numeric">{tier.share_pct}%</td>
                          <td className="numeric">{tier.discount_pct}%</td>
                          <td className="numeric">{formatCurrency(tier.net_price)}</td>
                          <td>
                            <span className="text-2xs text-slate-500">{tier.rationale}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* GTN trajectory over 10 years */}
                <div className="mt-4 pt-3 border-t border-navy-700">
                  <div className="text-2xs text-slate-500 uppercase tracking-wider mb-2">Effective GTN Trajectory</div>
                  <div className="flex gap-2 flex-wrap">
                    {data.payer_tier_pricing.map((yr) => (
                      <div key={yr.year} className="text-center">
                        <div className="text-2xs font-mono text-slate-500">{yr.year}</div>
                        <div
                          className={cn(
                            'metric text-xs',
                            yr.effective_gtn_pct > 40
                              ? 'text-red-400'
                              : yr.effective_gtn_pct > 30
                                ? 'text-amber-400'
                                : 'text-emerald-400',
                          )}
                        >
                          {yr.effective_gtn_pct}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ──────────────────────── Label Expansion Opportunities ──────────────────────── */}
      {(isPro || previewMode) &&
        showDealSections &&
        data.label_expansion_opportunities &&
        data.label_expansion_opportunities.length > 0 && (
          <div className="chart-container noise">
            <div className="chart-title">Label Expansion Opportunities</div>
            <div className="space-y-4">
              {data.label_expansion_opportunities.map((exp) => (
                <div key={exp.indication} className="p-4 bg-navy-800/50 rounded-md border border-navy-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm text-white font-medium">{exp.indication}</span>
                      <span className="text-2xs text-slate-500 ml-2">({exp.therapy_area})</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono bg-teal-500/12 text-teal-400 border border-teal-500/20">
                      {formatPercent(exp.probability * 100, 0)} probability
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-2xs text-slate-500 uppercase tracking-wider">Additional Patients</div>
                      <div className="metric text-sm text-white">
                        {formatNumber(exp.additional_addressable_patients)}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xs text-slate-500 uppercase tracking-wider">Expected Approval</div>
                      <div className="metric text-sm text-white">{exp.expected_approval_year}</div>
                    </div>
                    <div>
                      <div className="text-2xs text-slate-500 uppercase tracking-wider">Incremental Peak Revenue</div>
                      <div className="metric text-sm text-teal-400">${exp.incremental_peak_revenue_m}M</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{exp.rationale}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* ──────────────────────── Manufacturing Constraints ──────────────────────── */}
      {(isPro || previewMode) &&
        showManufacturing &&
        data.manufacturing_constraint &&
        data.manufacturing_constraint.constrained_years.length > 0 && (
          <div className="chart-container noise">
            <div className="chart-title">Manufacturing Capacity Constraints</div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-slate-400">Product Type:</span>
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono uppercase tracking-wider',
                  data.manufacturing_constraint.product_type === 'cell_gene_therapy'
                    ? 'bg-red-500/12 text-red-400 border border-red-500/20'
                    : data.manufacturing_constraint.product_type === 'biologic'
                      ? 'bg-amber-500/12 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20',
                )}
              >
                {data.manufacturing_constraint.product_type.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {data.manufacturing_constraint.constrained_years.map((yr) => (
                <div key={yr.year} className="p-3 bg-navy-800/50 rounded-md">
                  <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Year {yr.year}</div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        'metric text-lg',
                        yr.capacity_pct < 50
                          ? 'text-red-400'
                          : yr.capacity_pct < 80
                            ? 'text-amber-400'
                            : 'text-emerald-400',
                      )}
                    >
                      {yr.capacity_pct}%
                    </span>
                    <span className="text-2xs text-slate-500">capacity</span>
                  </div>
                  <div className="text-2xs font-mono text-slate-500 mt-1">Cap: ${yr.revenue_cap_m}M</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{data.manufacturing_constraint.narrative}</p>
          </div>
        )}

      {/* ──────────────────────── Competitive Mechanism Analysis ──────────────────────── */}
      {(isPro || previewMode) && data.competitive_mechanism_analysis && (
        <div className="chart-container noise">
          <div className="flex items-center justify-between mb-4">
            <div className="chart-title !mb-0">Competitive Mechanism Analysis</div>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono uppercase tracking-wider',
                data.competitive_mechanism_analysis.overall_mechanism_crowding === 'high'
                  ? 'bg-red-500/12 text-red-400 border border-red-500/20'
                  : data.competitive_mechanism_analysis.overall_mechanism_crowding === 'moderate'
                    ? 'bg-amber-500/12 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20',
              )}
            >
              {data.competitive_mechanism_analysis.overall_mechanism_crowding} crowding
            </span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Mechanism-Weighted Erosion</div>
              <div className="metric text-lg text-amber-400">
                {data.competitive_mechanism_analysis.mechanism_weighted_erosion_pct.toFixed(1)}%
              </div>
            </div>
          </div>
          {data.competitive_mechanism_analysis.competitors.length > 0 && (
            <div className="overflow-x-auto mb-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Competitor</th>
                    <th>Mechanism</th>
                    <th>Relationship</th>
                    <th>Similarity</th>
                    <th>Erosion Impact</th>
                    <th>Market Effect</th>
                  </tr>
                </thead>
                <tbody>
                  {data.competitive_mechanism_analysis.competitors.map((c) => (
                    <tr key={c.name}>
                      <td className="text-slate-300 font-medium">{c.name}</td>
                      <td>
                        <span className="text-2xs text-slate-500">{c.mechanism}</span>
                      </td>
                      <td>
                        <span
                          className={cn(
                            'inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-mono',
                            c.relationship === 'same_mechanism'
                              ? 'bg-red-500/12 text-red-400'
                              : c.relationship === 'same_target'
                                ? 'bg-amber-500/12 text-amber-400'
                                : c.relationship === 'same_pathway'
                                  ? 'bg-amber-500/10 text-amber-300'
                                  : 'bg-emerald-500/12 text-emerald-400',
                          )}
                        >
                          {c.relationship.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="numeric">{formatPercent(c.similarity_score * 100, 0)}</td>
                      <td className="numeric">{c.erosion_impact_pct.toFixed(1)}%</td>
                      <td>
                        <span
                          className={cn(
                            'text-2xs font-mono',
                            c.market_effect === 'cannibalistic'
                              ? 'text-red-400'
                              : c.market_effect === 'additive'
                                ? 'text-emerald-400'
                                : 'text-amber-400',
                          )}
                        >
                          {c.market_effect}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-slate-500 leading-relaxed">
            {data.competitive_mechanism_analysis.differentiation_narrative}
          </p>
        </div>
      )}

      {/* ──────────────────────── Patent Cliff Analysis ──────────────────────── */}
      {(isPro || previewMode) && data.patent_cliff_analysis && (
        <div className="chart-container noise">
          <div className="chart-title">Patent Cliff & LOE Analysis</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Product Type</div>
              <div className="text-sm text-white font-medium">
                {data.patent_cliff_analysis.product_type.replace(/_/g, ' ')}
              </div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Estimated LOE Year</div>
              <div className="metric text-lg text-white">{data.patent_cliff_analysis.estimated_loe_year}</div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Exclusivity Type</div>
              <div className="text-2xs text-slate-300">{data.patent_cliff_analysis.exclusivity_type}</div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Peak-to-Trough Decline</div>
              <div
                className={cn(
                  'metric text-lg',
                  data.patent_cliff_analysis.peak_to_trough_decline_pct > 60
                    ? 'text-red-400'
                    : data.patent_cliff_analysis.peak_to_trough_decline_pct > 30
                      ? 'text-amber-400'
                      : 'text-emerald-400',
                )}
              >
                {data.patent_cliff_analysis.peak_to_trough_decline_pct}%
              </div>
            </div>
          </div>
          {data.patent_cliff_analysis.erosion_profile.length > 0 && (
            <div className="mb-4">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-2">Revenue Retention Post-LOE</div>
              <div className="flex gap-2 flex-wrap">
                {data.patent_cliff_analysis.erosion_profile.map((yr) => (
                  <div key={yr.year} className="text-center">
                    <div className="text-2xs font-mono text-slate-500">{yr.year}</div>
                    <div
                      className={cn(
                        'metric text-xs',
                        yr.retained_pct < 50
                          ? 'text-red-400'
                          : yr.retained_pct < 80
                            ? 'text-amber-400'
                            : 'text-emerald-400',
                      )}
                    >
                      {yr.retained_pct}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-slate-500 leading-relaxed">{data.patent_cliff_analysis.narrative}</p>
        </div>
      )}

      {/* ──────────────────────── One-Time Treatment Model ──────────────────────── */}
      {(isPro || previewMode) && data.one_time_treatment_model?.is_one_time && (
        <div className="chart-container noise">
          <div className="flex items-center gap-3 mb-4">
            <div className="chart-title !mb-0">One-Time Treatment Revenue Model</div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono bg-purple-500/12 text-purple-400 border border-purple-500/20">
              Gene / Cell Therapy
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Prevalent Pool</div>
              <div className="metric text-lg text-white">
                {formatNumber(data.one_time_treatment_model.prevalent_pool)}
              </div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Annual New Cases</div>
              <div className="metric text-lg text-white">
                {formatNumber(data.one_time_treatment_model.annual_new_cases)}
              </div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Pool Depletion</div>
              <div className="metric text-lg text-amber-400">
                {data.one_time_treatment_model.pool_depletion_years} years
              </div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Steady-State Revenue</div>
              <div className="metric text-lg text-teal-400">
                ${data.one_time_treatment_model.steady_state_revenue_m}M/yr
              </div>
            </div>
          </div>
          {data.one_time_treatment_model.revenue_by_year.length > 0 && (
            <div className="overflow-x-auto mb-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Patients Treated</th>
                    <th>Revenue ($M)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.one_time_treatment_model.revenue_by_year.map((yr) => (
                    <tr key={yr.year}>
                      <td className="numeric">{yr.year}</td>
                      <td className="numeric">{formatNumber(yr.patients_treated)}</td>
                      <td className="numeric">${yr.revenue_m}M</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-slate-500 leading-relaxed">{data.one_time_treatment_model.narrative}</p>
        </div>
      )}

      {/* ──────────────────────── Pediatric Analysis ──────────────────────── */}
      {(isPro || previewMode) && data.pediatric_analysis?.is_pediatric_focused && (
        <div className="chart-container noise">
          <div className="flex items-center gap-3 mb-4">
            <div className="chart-title !mb-0">Pediatric Population Analysis</div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono bg-blue-500/12 text-blue-400 border border-blue-500/20">
              Pediatric
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Pediatric Prevalence</div>
              <div className="metric text-lg text-white">
                {formatNumber(data.pediatric_analysis.pediatric_prevalence)}
              </div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Adult Prevalence</div>
              <div className="metric text-lg text-slate-400">
                {formatNumber(data.pediatric_analysis.adult_prevalence)}
              </div>
            </div>
            <div className="p-3 bg-navy-800/50 rounded-md">
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Pricing Adjustment</div>
              <div className="metric text-lg text-amber-400">{data.pediatric_analysis.pricing_adjustment}x</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{data.pediatric_analysis.rationale}</p>
        </div>
      )}

      {/* Methodology */}
      <div className="chart-container noise">
        <button
          onClick={() => setMethodologyOpen(!methodologyOpen)}
          className="flex items-center justify-between w-full"
        >
          <span className="chart-title !mb-0">Methodology & Assumptions</span>
          {methodologyOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {methodologyOpen && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <div>
              <h4 className="text-xs text-slate-300 font-medium mb-2">Approach</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{data.methodology}</p>
            </div>
            {data.assumptions.length > 0 && (
              <div>
                <h4 className="text-xs text-slate-300 font-medium mb-2">Key Assumptions</h4>
                <ul className="space-y-1">
                  {data.assumptions.map((a, i) => (
                    <li key={`assumption-${a}-${i}`} className="text-xs text-slate-500 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-teal-500/60 mt-1.5 flex-shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data Sources */}
      <div className="flex flex-wrap gap-3">
        {data.data_sources.map((source) => (
          <DataSourceBadge key={source.name} source={source.name} type={source.type} url={source.url} />
        ))}
      </div>

      {/* Action Bar */}
      {!previewMode && (
        <div className="flex items-center gap-3 pt-6 border-t border-navy-700">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400/80 font-medium px-2">
            <BookmarkCheck className="w-3.5 h-3.5" />
            Auto-saved
          </span>
          <ExportButton
            format="pdf"
            onPdfExport={onPdfExport}
            reportTitle={`${input.indication} — Market Sizing`}
            reportSubtitle={[input.subtype, input.mechanism].filter(Boolean).join(' — ') || undefined}
            filename={`terrain-${input.indication.toLowerCase().replace(/\s+/g, '-')}-market-sizing`}
          />
          <ExportButton
            format="csv"
            data={flattenForCSV(data)}
            filename={`terrain-${input.indication.toLowerCase().replace(/\s+/g, '-')}-market-sizing`}
          />
          <ExportButton
            format="xlsx"
            data={flattenForCSV(data)}
            filename={`terrain-${input.indication.toLowerCase().replace(/\s+/g, '-')}-market-sizing`}
          />
          <ExportButton
            format="email"
            reportTitle={`${input.indication} — Market Sizing`}
            reportSubtitle={[input.subtype, input.mechanism].filter(Boolean).join(' — ') || undefined}
          />
        </div>
      )}

      <ConfidentialFooter />
    </div>
  );
}
