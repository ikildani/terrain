'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatMetric, formatCurrency, formatPercent } from '@/lib/utils/format';
import { StatCard } from '@/components/shared/StatCard';
import { DataSourceBadge } from '@/components/shared/DataSourceBadge';
import { ConfidentialFooter } from '@/components/shared/ConfidentialFooter';
import { ExportButton } from '@/components/shared/ExportButton';
import { SaveReportButton } from '@/components/shared/SaveReportButton';
import TAMChart from './TAMChart';
import PatientFunnelChart from './PatientFunnelChart';
import GeographyBreakdown from './GeographyBreakdown';
import MarketGrowthChart from './MarketGrowthChart';
import type { MarketSizingOutput, MarketSizingInput } from '@/types';

interface MarketSizingReportProps {
  data: MarketSizingOutput;
  input: MarketSizingInput;
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

export default function MarketSizingReport({ data, input }: MarketSizingReportProps) {
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const { summary } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="US TAM"
          value={formatMetric(summary.tam_us.value, summary.tam_us.unit)}
          confidence={summary.tam_us.confidence}
          source="Terrain Analysis"
        />
        <StatCard
          label="US SAM"
          value={formatMetric(summary.sam_us.value, summary.sam_us.unit)}
          confidence={summary.sam_us.confidence}
        />
        <StatCard
          label="US SOM"
          value={formatMetric(summary.som_us.value, summary.som_us.unit)}
          confidence={summary.som_us.confidence}
          subvalue={
            summary.som_us.range
              ? `Range: ${formatMetric(summary.som_us.range[0], 'B')} – ${formatMetric(summary.som_us.range[1], 'B')}`
              : undefined
          }
        />
        <StatCard
          label="Global TAM"
          value={formatMetric(summary.global_tam.value, summary.global_tam.unit)}
          trend={`${summary.cagr_5yr}% CAGR`}
          trendDirection="up"
        />
      </div>

      {/* TAM Chart */}
      <TAMChart tam={summary.tam_us} sam={summary.sam_us} som={summary.som_us} />

      {/* Patient Funnel */}
      <PatientFunnelChart funnel={data.patient_funnel} />

      {/* Geography Breakdown */}
      {data.geography_breakdown.length > 0 && (
        <GeographyBreakdown data={data.geography_breakdown} />
      )}

      {/* Revenue Projection */}
      {data.revenue_projection.length > 0 && (
        <MarketGrowthChart
          projections={data.revenue_projection}
          peakSales={summary.peak_sales_estimate}
        />
      )}

      {/* Pricing Comparables */}
      {data.pricing_analysis.comparable_drugs.length > 0 && (
        <div className="chart-container">
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
              Conservative {formatCurrency(data.pricing_analysis.recommended_wac.conservative)} ·
              Base {formatCurrency(data.pricing_analysis.recommended_wac.base)} ·
              Premium {formatCurrency(data.pricing_analysis.recommended_wac.premium)}
            </p>
            <p className="text-2xs text-slate-500 mt-1">
              Gross-to-net estimate: {formatPercent(data.pricing_analysis.gross_to_net_estimate * 100, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Methodology */}
      <div className="chart-container">
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
                    <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
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
          <DataSourceBadge
            key={source.name}
            source={source.name}
            type={source.type}
            url={source.url}
          />
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3 pt-6 border-t border-navy-700">
        <SaveReportButton
          reportData={{
            title: `${input.indication} Market Assessment`,
            report_type: 'market_sizing',
            indication: input.indication,
            inputs: input as unknown as Record<string, unknown>,
            outputs: data as unknown as Record<string, unknown>,
          }}
        />
        <ExportButton format="pdf" />
        <ExportButton
          format="csv"
          data={flattenForCSV(data)}
          filename={`terrain-${input.indication.toLowerCase().replace(/\s+/g, '-')}-market-sizing`}
        />
      </div>

      <ConfidentialFooter />
    </div>
  );
}
