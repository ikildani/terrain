'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatNumber, formatPercent } from '@/lib/utils/format';

interface CDxTestingFunnelChartProps {
  funnel: {
    indication_incidence_us: number;
    diagnosed_and_tested_pct: number;
    annual_newly_tested: number;
    biomarker_positive_pct: number;
    biomarker_positive_patients: number;
    treated_on_linked_drug: number;
    monitoring_retests_annual: number;
    total_annual_tests: number;
  };
}

const FUNNEL_COLORS = ['#334155', '#1A3350', '#004D40', '#002E27', '#00897B', '#00C9A7'];

interface FunnelStage {
  stage: string;
  count: number;
  rate: number | null;
  isHighlight: boolean;
  isSeparate: boolean;
}

export default function CDxTestingFunnelChart({ funnel }: CDxTestingFunnelChartProps) {
  // Compute conversion rates between stages
  const treatedRate =
    funnel.biomarker_positive_patients > 0
      ? funnel.treated_on_linked_drug / funnel.biomarker_positive_patients
      : 0;

  const data: FunnelStage[] = [
    {
      stage: 'Indication Incidence',
      count: funnel.indication_incidence_us,
      rate: null,
      isHighlight: false,
      isSeparate: false,
    },
    {
      stage: 'Diagnosed & Tested',
      count: funnel.annual_newly_tested,
      rate: funnel.diagnosed_and_tested_pct / 100,
      isHighlight: false,
      isSeparate: false,
    },
    {
      stage: 'Biomarker Positive',
      count: funnel.biomarker_positive_patients,
      rate: funnel.biomarker_positive_pct / 100,
      isHighlight: false,
      isSeparate: false,
    },
    {
      stage: 'On Linked Drug',
      count: funnel.treated_on_linked_drug,
      rate: treatedRate,
      isHighlight: false,
      isSeparate: false,
    },
    {
      stage: 'Monitoring Retests',
      count: funnel.monitoring_retests_annual,
      rate: null,
      isHighlight: false,
      isSeparate: true,
    },
    {
      stage: 'Total Annual Tests',
      count: funnel.total_annual_tests,
      rate: null,
      isHighlight: true,
      isSeparate: false,
    },
  ];

  return (
    <div className="chart-container noise">
      <div className="chart-title">Patient Testing Funnel</div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 25, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(16,34,54,0.8)" />
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 10, fontFamily: 'Sora', fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={0}
          />
          <YAxis
            tickFormatter={(val) => formatNumber(val)}
            tick={{ fontSize: 11, fontFamily: '"DM Mono"', fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as FunnelStage;
              return (
                <div className="bg-navy-800 border border-navy-700 rounded-md px-4 py-3 text-xs shadow-elevated">
                  <div className="text-slate-300 font-medium mb-1">{d.stage}</div>
                  <div className="metric text-white">{formatNumber(d.count)}</div>
                  {d.rate !== null && d.rate < 1 && (
                    <div className="text-slate-500 mt-1">
                      {formatPercent(d.rate * 100, 0)} of prior stage
                    </div>
                  )}
                  {d.isSeparate && (
                    <div className="text-slate-500 mt-1 italic">
                      Monitoring / resistance retests (additive)
                    </div>
                  )}
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={48}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={FUNNEL_COLORS[i]}
                stroke={entry.isHighlight ? '#00C9A7' : 'none'}
                strokeWidth={entry.isHighlight ? 2 : 0}
                strokeDasharray={entry.isSeparate ? '4 2' : undefined}
              />
            ))}
            <LabelList
              dataKey="count"
              position="top"
              formatter={(val: number) => formatNumber(val)}
              style={{ fontFamily: '"DM Mono"', fontSize: 11, fill: '#94A3B8' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Conversion rates between stages */}
      <div className="flex items-center justify-around mt-1 px-8">
        {/* Empty space for first bar (no conversion) */}
        <div className="text-center flex-1" />
        {/* Diagnosed & Tested rate */}
        <div className="text-center flex-1">
          <span className="text-2xs font-mono text-teal-500">
            {formatPercent(funnel.diagnosed_and_tested_pct, 0)}
          </span>
        </div>
        {/* Biomarker Positive rate */}
        <div className="text-center flex-1">
          <span className="text-2xs font-mono text-teal-500">
            {formatPercent(funnel.biomarker_positive_pct, 0)}
          </span>
        </div>
        {/* On Linked Drug rate */}
        <div className="text-center flex-1">
          <span className="text-2xs font-mono text-teal-500">
            {formatPercent(treatedRate * 100, 0)}
          </span>
        </div>
        {/* Monitoring Retests — no conversion (additive) */}
        <div className="text-center flex-1">
          <span className="text-2xs font-mono text-slate-600">additive</span>
        </div>
        {/* Total — no conversion */}
        <div className="text-center flex-1">
          <span className="text-2xs font-mono text-teal-400">total</span>
        </div>
      </div>

      {/* Legend note for monitoring retests */}
      <div className="mt-4 px-2">
        <span className="text-2xs text-slate-500">
          Monitoring Retests represent annual repeat testing for treatment monitoring and resistance,
          added to newly tested patients to derive Total Annual Tests.
        </span>
      </div>
    </div>
  );
}
