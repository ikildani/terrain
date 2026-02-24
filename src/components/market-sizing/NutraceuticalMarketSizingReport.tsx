'use client';

import { useState, useRef, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  BookmarkCheck,
  ShoppingCart,
  TrendingUp,
  Globe,
  Shield,
  FlaskConical,
  Package,
  Target,
  Database,
  Boxes,
  BarChart3,
} from 'lucide-react';
import { formatMetric, formatCompact, formatCurrency, formatPercent, formatNumber } from '@/lib/utils/format';
import { StatCard } from '@/components/shared/StatCard';
import { DataSourceBadge } from '@/components/shared/DataSourceBadge';
import { ConfidentialFooter } from '@/components/shared/ConfidentialFooter';
import { ExportButton } from '@/components/shared/ExportButton';
import MarketGrowthChart from './MarketGrowthChart';
import type { NutraceuticalMarketSizingOutput } from '@/types';

interface NutraceuticalMarketSizingReportProps {
  data: NutraceuticalMarketSizingOutput;
  input?: Record<string, unknown>;
  previewMode?: boolean;
  onPdfExport?: () => void;
}

function riskBadge(level: string) {
  const isLow = level === 'low';
  const isHigh = level === 'high';
  const cls = isLow
    ? 'bg-signal-green/10 text-signal-green'
    : isHigh
      ? 'bg-signal-red/10 text-signal-red'
      : 'bg-amber-400/10 text-amber-400';
  return <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${cls}`}>{level}</span>;
}

function scoreBadge(score: number, max = 100) {
  const pct = score / max;
  const cls = pct >= 0.7 ? 'text-signal-green' : pct >= 0.4 ? 'text-amber-400' : 'text-signal-red';
  return (
    <span className={`font-mono text-sm ${cls}`}>
      {score}
      <span className="text-slate-600">/{max}</span>
    </span>
  );
}

function flattenForCSV(data: NutraceuticalMarketSizingOutput): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];

  data.channel_revenue.forEach((c) => {
    rows.push({
      section: 'Channel Revenue',
      channel: c.channel,
      share_pct: c.channel_share_pct,
      gross_revenue_m: c.gross_revenue_m,
      net_revenue_m: c.net_revenue_m,
      margin_pct: c.brand_margin_pct,
      cac: c.cac,
      ltv: c.ltv,
    });
  });

  data.geography_breakdown.forEach((g) => {
    rows.push({
      section: 'Geography',
      territory: g.territory,
      tam: `${g.tam.value}${g.tam.unit}`,
      supplement_penetration_pct: g.supplement_penetration_pct,
      regulatory_environment: g.regulatory_environment,
    });
  });

  data.revenue_projection.forEach((y) => {
    rows.push({
      section: 'Revenue Projection',
      year: y.year,
      bear: y.bear,
      base: y.base,
      bull: y.bull,
    });
  });

  return rows;
}

export default function NutraceuticalMarketSizingReport({
  data,
  input,
  previewMode,
  onPdfExport,
}: NutraceuticalMarketSizingReportProps) {
  const [methodologyOpen, setMethodologyOpen] = useState(previewMode ?? false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { summary } = data;

  const ingredientName = (input?.primary_ingredient as string) || 'this ingredient';
  const csvData = useMemo(() => flattenForCSV(data), [data]);

  return (
    <div ref={reportRef} className="space-y-6 animate-fade-in" data-report-content>
      {/* Executive Summary */}
      <div className="card noise">
        <h3 className="chart-title">Executive Summary</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The <span className="text-white font-medium">{ingredientName}</span> nutraceutical market represents a US
          total addressable market of{' '}
          <span className="metric text-teal-400">{formatMetric(summary.us_tam.value, summary.us_tam.unit)}</span>, with
          a serviceable addressable market of{' '}
          <span className="metric text-white">{formatMetric(summary.us_sam.value, summary.us_sam.unit)}</span> and a
          serviceable obtainable market of{' '}
          <span className="metric text-white">{formatMetric(summary.us_som.value, summary.us_som.unit)}</span>
          {summary.us_som.range
            ? ` (range: ${formatMetric(summary.us_som.range[0], summary.us_som.unit)}–${formatMetric(summary.us_som.range[1], summary.us_som.unit)})`
            : ''}
          . The market is growing at <span className="metric text-white">{summary.cagr_5yr}%</span> CAGR driven by{' '}
          {summary.market_growth_driver}. Peak annual revenue is estimated at{' '}
          <span className="metric text-white">{formatCompact(summary.peak_annual_revenue.base)}</span> (base case).
        </p>
      </div>

      {/* Summary Metrics */}
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
          confidence={summary.us_sam.confidence}
          source="Terrain Analysis"
        />
        <StatCard
          label="US SOM"
          value={formatMetric(summary.us_som.value, summary.us_som.unit)}
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
          source="Terrain Analysis"
        />
      </div>

      {/* Consumer Funnel */}
      <div className="chart-container noise">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-teal-500" />
          <span className="chart-title !mb-0">Consumer Funnel</span>
        </div>
        <div className="space-y-2">
          {[
            { label: 'US Adult Population', value: data.consumer_funnel.us_adult_population, pct: null },
            {
              label: 'Supplement Users',
              value: data.consumer_funnel.supplement_users,
              pct: data.consumer_funnel.supplement_users_pct,
            },
            {
              label: 'Health Category Users',
              value: data.consumer_funnel.health_category_users,
              pct: data.consumer_funnel.health_category_penetration_pct,
            },
            {
              label: 'Target Demographic',
              value: data.consumer_funnel.target_demographic_users,
              pct: data.consumer_funnel.demographic_penetration_pct,
            },
            { label: 'Addressable Consumers', value: data.consumer_funnel.addressable_consumers, pct: null },
            { label: 'Capturable Consumers', value: data.consumer_funnel.capturable_consumers, pct: null },
          ].map((step, i, arr) => {
            const maxVal = arr[0].value || 1;
            const widthPct = Math.max(8, (step.value / maxVal) * 100);
            return (
              <div key={step.label} className="flex items-center gap-3">
                <div className="w-40 shrink-0 text-right">
                  <p className="text-2xs text-slate-500">{step.label}</p>
                </div>
                <div className="flex-1 relative">
                  <div
                    className="h-7 rounded-sm flex items-center px-2"
                    style={{
                      width: `${widthPct}%`,
                      background: `rgba(0, 201, 167, ${0.12 + i * 0.04})`,
                      borderLeft: '2px solid rgba(0, 201, 167, 0.5)',
                    }}
                  >
                    <span className="font-mono text-xs text-white">{formatNumber(step.value)}</span>
                    {step.pct !== null && (
                      <span className="font-mono text-[10px] text-slate-500 ml-2">({formatPercent(step.pct, 1)})</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 p-2.5 bg-navy-800/50 rounded-md">
          <p className="text-2xs text-slate-500">
            Avg annual spend per consumer:{' '}
            <span className="text-white font-mono">{formatCurrency(data.consumer_funnel.avg_annual_spend)}</span>
          </p>
        </div>
      </div>

      {/* Channel Revenue */}
      {data.channel_revenue.length > 0 && (
        <div className="chart-container noise">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-4 h-4 text-teal-500" />
            <span className="chart-title !mb-0">Channel Revenue Breakdown</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Share</th>
                  <th>Gross Rev</th>
                  <th>Net Rev</th>
                  <th>Margin</th>
                  <th>CAC</th>
                  <th>LTV</th>
                  <th>LTV:CAC</th>
                </tr>
              </thead>
              <tbody>
                {data.channel_revenue.map((ch) => (
                  <tr key={ch.channel}>
                    <td className="text-slate-300 font-medium capitalize">{ch.channel.replace(/_/g, ' ')}</td>
                    <td className="numeric">{formatPercent(ch.channel_share_pct, 0)}</td>
                    <td className="numeric">{formatCompact(ch.gross_revenue_m * 1e6)}</td>
                    <td className="numeric">{formatCompact(ch.net_revenue_m * 1e6)}</td>
                    <td className="numeric">{formatPercent(ch.brand_margin_pct, 0)}</td>
                    <td className="numeric">{formatCurrency(ch.cac)}</td>
                    <td className="numeric">{formatCurrency(ch.ltv)}</td>
                    <td className="numeric">
                      <span
                        className={
                          ch.ltv_to_cac >= 3
                            ? 'text-signal-green'
                            : ch.ltv_to_cac >= 1.5
                              ? 'text-amber-400'
                              : 'text-signal-red'
                        }
                      >
                        {ch.ltv_to_cac.toFixed(1)}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DTC Unit Economics */}
      {data.dtc_unit_economics && (
        <div className="card noise">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            <h3 className="chart-title !mb-0">DTC Unit Economics</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Monthly Price</p>
              <p className="font-mono text-sm text-white mt-1">
                {formatCurrency(data.dtc_unit_economics.monthly_subscription_price)}
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">CAC</p>
              <p className="font-mono text-sm text-white mt-1">{formatCurrency(data.dtc_unit_economics.cac)}</p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">LTV (12m)</p>
              <p className="font-mono text-sm text-teal-400 mt-1">{formatCurrency(data.dtc_unit_economics.ltv_12m)}</p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Payback</p>
              <p className="font-mono text-sm text-white mt-1">{data.dtc_unit_economics.payback_months} months</p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">6-mo Retention</p>
              <p className="font-mono text-sm text-white mt-1">
                {formatPercent(data.dtc_unit_economics.month_6_retention_pct, 0)}
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">12-mo Retention</p>
              <p className="font-mono text-sm text-white mt-1">
                {formatPercent(data.dtc_unit_economics.month_12_retention_pct, 0)}
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Gross Margin</p>
              <p className="font-mono text-sm text-white mt-1">
                {formatPercent(data.dtc_unit_economics.gross_margin_pct, 0)}
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Break-Even Subs</p>
              <p className="font-mono text-sm text-white mt-1">
                {formatNumber(data.dtc_unit_economics.break_even_subscribers)}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{data.dtc_unit_economics.narrative}</p>
        </div>
      )}

      {/* Amazon Intelligence */}
      {data.amazon_intelligence && (
        <div className="card noise">
          <div className="flex items-center gap-2 mb-4">
            <Boxes className="w-4 h-4 text-teal-500" />
            <h3 className="chart-title !mb-0">Amazon Intelligence</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Top BSR</p>
              <p className="font-mono text-sm text-white mt-1">
                #{formatNumber(data.amazon_intelligence.estimated_category_bsr_range.top)}
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Avg Reviews (Top 10)</p>
              <p className="font-mono text-sm text-white mt-1">
                {formatNumber(data.amazon_intelligence.avg_review_count_top_10)}
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Avg Rating</p>
              <p className="font-mono text-sm text-white mt-1">
                {data.amazon_intelligence.avg_rating_top_10.toFixed(1)}/5.0
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">PPC CPC</p>
              <p className="font-mono text-sm text-white mt-1">
                {formatCurrency(data.amazon_intelligence.ppc_cpc_estimate, 2)}
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">PPC ACoS</p>
              <p className="font-mono text-sm text-white mt-1">
                {formatPercent(data.amazon_intelligence.ppc_acos_estimate_pct, 0)}
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">S&S Adoption</p>
              <p className="font-mono text-sm text-white mt-1">
                {formatPercent(data.amazon_intelligence.subscribe_save_adoption_pct, 0)}
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Top Seller (mo)</p>
              <p className="font-mono text-sm text-teal-400 mt-1">
                ${formatNumber(data.amazon_intelligence.estimated_monthly_revenue_top_seller_k)}K
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Barrier to Entry</p>
              <p className="font-mono text-sm mt-1">{scoreBadge(data.amazon_intelligence.barrier_to_entry_score)}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{data.amazon_intelligence.narrative}</p>
        </div>
      )}

      {/* Subscription Model */}
      {data.subscription_model && (
        <div className="card noise">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-teal-500" />
            <h3 className="chart-title !mb-0">Subscription Model</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Optimal Price</p>
              <p className="font-mono text-sm text-teal-400 mt-1">
                {formatCurrency(data.subscription_model.optimal_price_point)}/mo
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Avg Lifetime</p>
              <p className="font-mono text-sm text-white mt-1">{data.subscription_model.avg_lifetime_months} months</p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Projected MRR (12m)</p>
              <p className="font-mono text-sm text-white mt-1">
                {formatCompact(data.subscription_model.projected_mrr_12m)}
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Projected ARR</p>
              <p className="font-mono text-sm text-white mt-1">
                {formatCompact(data.subscription_model.projected_arr_m * 1e6)}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{data.subscription_model.narrative}</p>
        </div>
      )}

      {/* Geography Breakdown */}
      {data.geography_breakdown.length > 0 && (
        <div className="chart-container noise">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-teal-500" />
            <span className="chart-title !mb-0">Geography Breakdown</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Territory</th>
                  <th>TAM</th>
                  <th>Supplement Penetration</th>
                  <th>Regulatory</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.geography_breakdown.map((geo) => (
                  <tr key={geo.territory}>
                    <td className="text-slate-300 font-medium">{geo.territory}</td>
                    <td className="numeric">{formatMetric(geo.tam.value, geo.tam.unit)}</td>
                    <td className="numeric">{formatPercent(geo.supplement_penetration_pct, 0)}</td>
                    <td>
                      <span className="text-2xs text-slate-500">{geo.regulatory_environment}</span>
                    </td>
                    <td>
                      <span className="text-2xs text-slate-500">{geo.market_note}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue Projection */}
      {data.revenue_projection.length > 0 && (
        <MarketGrowthChart projections={data.revenue_projection} peakSales={summary.peak_annual_revenue} />
      )}

      {/* Competitive Positioning */}
      <div className="card noise">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-teal-500" />
          <h3 className="chart-title !mb-0">Competitive Positioning</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider">Brands in Category</p>
            <p className="font-mono text-sm text-white mt-1">{data.competitive_positioning.total_brands_in_category}</p>
          </div>
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider">Top Brand</p>
            <p className="text-sm text-white mt-1">{data.competitive_positioning.top_brand}</p>
            <p className="text-2xs text-slate-500">
              {formatCompact(data.competitive_positioning.top_brand_estimated_revenue_m * 1e6)} est. rev
            </p>
          </div>
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider">Price Positioning</p>
            <p className="text-sm text-white mt-1 capitalize">
              {data.competitive_positioning.price_positioning.replace(/_/g, ' ')}
            </p>
          </div>
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider">Clinical Evidence</p>
            <p className="text-sm mt-1">
              {data.competitive_positioning.clinical_evidence_differentiator ? (
                <span className="text-signal-green">Differentiator</span>
              ) : (
                <span className="text-slate-500">Standard</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider">Competitive Moat</p>
            <p className="font-mono text-sm mt-1">{scoreBadge(data.competitive_positioning.competitive_moat_score)}</p>
          </div>
          {data.competitive_positioning.amazon_bsr_range && (
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Amazon BSR Range</p>
              <p className="font-mono text-sm text-white mt-1">{data.competitive_positioning.amazon_bsr_range}</p>
            </div>
          )}
        </div>
        {data.competitive_positioning.key_differentiation_vectors.length > 0 && (
          <div className="mb-3">
            <p className="text-2xs text-slate-600 uppercase tracking-wider mb-2">Key Differentiation Vectors</p>
            <div className="flex flex-wrap gap-1.5">
              {data.competitive_positioning.key_differentiation_vectors.map((v) => (
                <span
                  key={v}
                  className="text-2xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-slate-500 leading-relaxed">{data.competitive_positioning.narrative}</p>
      </div>

      {/* Regulatory Assessment */}
      <div className="card noise">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-teal-500" />
          <h3 className="chart-title !mb-0">Regulatory Assessment</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider">Pathway</p>
            <p className="text-sm text-white mt-1">{data.regulatory_assessment.recommended_pathway}</p>
          </div>
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider">NDI Required</p>
            <p className="text-sm mt-1">
              {data.regulatory_assessment.ndi_required ? (
                <span className="text-amber-400">
                  Yes
                  {data.regulatory_assessment.ndi_acceptance_probability_pct != null
                    ? ` (${data.regulatory_assessment.ndi_acceptance_probability_pct}% prob)`
                    : ''}
                </span>
              ) : (
                <span className="text-signal-green">No</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider">FTC Claim Risk</p>
            <p className="mt-1">{riskBadge(data.regulatory_assessment.ftc_claim_risk)}</p>
          </div>
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider">FDA Warning Risk</p>
            <p className="mt-1">{riskBadge(data.regulatory_assessment.fda_warning_letter_risk)}</p>
          </div>
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider">cGMP Cost</p>
            <p className="font-mono text-sm text-white mt-1">
              ${data.regulatory_assessment.cgmp_compliance_cost_k.low}K–$
              {data.regulatory_assessment.cgmp_compliance_cost_k.high}K
            </p>
          </div>
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider">Timeline</p>
            <p className="font-mono text-sm text-white mt-1">
              {data.regulatory_assessment.regulatory_timeline_months.optimistic}–
              {data.regulatory_assessment.regulatory_timeline_months.pessimistic} mo
            </p>
          </div>
        </div>
        {data.regulatory_assessment.certifications_recommended.length > 0 && (
          <div className="mb-3">
            <p className="text-2xs text-slate-600 uppercase tracking-wider mb-2">Recommended Certifications</p>
            <div className="flex flex-wrap gap-1.5">
              {data.regulatory_assessment.certifications_recommended.map((c) => (
                <span
                  key={c}
                  className="text-2xs px-2 py-0.5 rounded bg-navy-800 border border-navy-700 text-slate-300"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
        {data.regulatory_assessment.key_risks.length > 0 && (
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider mb-2">Key Risks</p>
            <div className="space-y-2">
              {data.regulatory_assessment.key_risks.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {riskBadge(r.severity)}
                  <div>
                    <span className="text-slate-300">{r.risk}</span>
                    <span className="text-slate-600 ml-1">— {r.mitigation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clinical Evidence Impact */}
      {data.clinical_evidence_impact && (
        <div className="card noise">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="w-4 h-4 text-teal-500" />
            <h3 className="chart-title !mb-0">Clinical Evidence Impact</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Evidence Level</p>
              <p className="text-sm text-white mt-1 capitalize">{data.clinical_evidence_impact.evidence_level}</p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Pricing Premium</p>
              <p className="font-mono text-sm text-teal-400 mt-1">
                +{formatPercent(data.clinical_evidence_impact.pricing_premium_pct, 0)}
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Practitioner Trust</p>
              <p className="font-mono text-sm mt-1">
                {scoreBadge(data.clinical_evidence_impact.practitioner_trust_score)}
              </p>
            </div>
            {data.clinical_evidence_impact.claim_upgrade_potential && (
              <div>
                <p className="text-2xs text-slate-600 uppercase tracking-wider">Claim Upgrade</p>
                <p className="text-sm text-white mt-1 capitalize">
                  {data.clinical_evidence_impact.claim_upgrade_potential.replace(/_/g, ' ')}
                </p>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{data.clinical_evidence_impact.narrative}</p>
        </div>
      )}

      {/* Ingredient Supply Chain */}
      {data.ingredient_supply_chain && (
        <div className="card noise">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-teal-500" />
            <h3 className="chart-title !mb-0">Ingredient Supply Chain</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Primary Source</p>
              <p className="text-sm text-white mt-1">{data.ingredient_supply_chain.primary_ingredient_source}</p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Source Concentration</p>
              <p className="text-sm text-white mt-1 capitalize">
                {data.ingredient_supply_chain.source_concentration.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Supply Risk</p>
              <p className="mt-1">{riskBadge(data.ingredient_supply_chain.supply_risk)}</p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">COGS Volatility</p>
              <p className="text-sm text-white mt-1 capitalize">{data.ingredient_supply_chain.cogs_volatility}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{data.ingredient_supply_chain.narrative}</p>
        </div>
      )}

      {/* Acquisition Attractiveness */}
      {data.acquisition_attractiveness && (
        <div className="card noise">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            <h3 className="chart-title !mb-0">Acquisition Attractiveness</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Strategic Interest</p>
              <p className="text-sm mt-1 capitalize">
                <span
                  className={
                    data.acquisition_attractiveness.strategic_acquirer_interest === 'high'
                      ? 'text-signal-green'
                      : data.acquisition_attractiveness.strategic_acquirer_interest === 'moderate'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                  }
                >
                  {data.acquisition_attractiveness.strategic_acquirer_interest}
                </span>
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">Revenue Multiple</p>
              <p className="font-mono text-sm text-white mt-1">
                {data.acquisition_attractiveness.revenue_multiple_range.low.toFixed(1)}x–
                {data.acquisition_attractiveness.revenue_multiple_range.high.toFixed(1)}x
              </p>
            </div>
            <div>
              <p className="text-2xs text-slate-600 uppercase tracking-wider">EBITDA Multiple</p>
              <p className="font-mono text-sm text-white mt-1">
                {data.acquisition_attractiveness.ebitda_multiple_range.low.toFixed(1)}x–
                {data.acquisition_attractiveness.ebitda_multiple_range.high.toFixed(1)}x
              </p>
            </div>
          </div>

          {data.acquisition_attractiveness.key_value_drivers.length > 0 && (
            <div className="mb-3">
              <p className="text-2xs text-slate-600 uppercase tracking-wider mb-2">Key Value Drivers</p>
              <div className="flex flex-wrap gap-1.5">
                {data.acquisition_attractiveness.key_value_drivers.map((d) => (
                  <span
                    key={d}
                    className="text-2xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.acquisition_attractiveness.comparable_acquisitions.length > 0 && (
            <div className="mt-4">
              <p className="text-2xs text-slate-600 uppercase tracking-wider mb-2">Comparable Acquisitions</p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Target</th>
                      <th>Acquirer</th>
                      <th>Value</th>
                      <th>Multiple</th>
                      <th>Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.acquisition_attractiveness.comparable_acquisitions.map((acq) => (
                      <tr key={`${acq.target}-${acq.year}`}>
                        <td className="text-slate-300 font-medium">{acq.target}</td>
                        <td>{acq.acquirer}</td>
                        <td className="numeric">{formatCompact(acq.value_m * 1e6)}</td>
                        <td className="numeric">{acq.multiple}</td>
                        <td className="numeric">{acq.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sensitivity Analysis */}
      {data.sensitivity_analysis && data.sensitivity_analysis.length > 0 && (
        <div className="chart-container noise">
          <div className="chart-title">Sensitivity Analysis</div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Low</th>
                  <th>Base</th>
                  <th>High</th>
                  <th>Swing</th>
                </tr>
              </thead>
              <tbody>
                {data.sensitivity_analysis.map((s) => (
                  <tr key={s.variable}>
                    <td className="text-slate-300 font-medium">{s.variable}</td>
                    <td className="numeric">{formatCompact(s.low_som_m * 1e6)}</td>
                    <td className="numeric">{formatCompact(s.base_som_m * 1e6)}</td>
                    <td className="numeric">{formatCompact(s.high_som_m * 1e6)}</td>
                    <td className="numeric">
                      <span className={s.swing_pct > 30 ? 'text-amber-400' : 'text-slate-400'}>
                        ±{formatPercent(s.swing_pct, 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Methodology */}
      <div className="chart-container noise">
        <button
          onClick={() => setMethodologyOpen(!methodologyOpen)}
          className="flex items-center justify-between w-full"
        >
          <span className="chart-title !mb-0">Methodology & Data Sources</span>
          {methodologyOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {methodologyOpen && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <p className="text-xs text-slate-500 leading-relaxed">{data.methodology}</p>
            <div className="flex flex-wrap gap-3">
              {data.data_sources.map((source) => (
                <DataSourceBadge key={source.name} source={source.name} type={source.type} url={source.url} />
              ))}
            </div>
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
            reportTitle={`${ingredientName} — Nutraceutical Market Sizing`}
            reportSubtitle={(input?.health_category as string) || undefined}
            filename={`terrain-${ingredientName.toLowerCase().replace(/\s+/g, '-')}-nutraceutical-market-sizing`}
          />
          <ExportButton
            format="csv"
            data={csvData}
            filename={`terrain-${ingredientName.toLowerCase().replace(/\s+/g, '-')}-nutraceutical-market-sizing`}
          />
          <ExportButton
            format="email"
            reportTitle={`${ingredientName} — Nutraceutical Market Sizing`}
            reportSubtitle={(input?.health_category as string) || undefined}
          />
        </div>
      )}

      <ConfidentialFooter />
    </div>
  );
}
