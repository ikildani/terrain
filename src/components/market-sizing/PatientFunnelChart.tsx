'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList, CartesianGrid, Tooltip } from 'recharts';
import { formatNumber, formatPercent } from '@/lib/utils/format';
import { DataSourceBadge } from '@/components/shared/DataSourceBadge';
import type { PatientFunnel } from '@/types';

interface PatientFunnelChartProps {
  funnel: PatientFunnel;
}

const FUNNEL_COLORS = ['#334155', '#1A3350', '#004D40', '#002E27', '#00C9A7'];

interface FunnelStage {
  stage: string;
  count: number;
  rate: number;
}

export default function PatientFunnelChart({ funnel }: PatientFunnelChartProps) {
  const data: FunnelStage[] = [
    { stage: 'Prevalence', count: funnel.us_prevalence, rate: 1.0 },
    { stage: 'Diagnosed', count: funnel.diagnosed, rate: funnel.diagnosed_rate },
    { stage: 'Treated', count: funnel.treated, rate: funnel.treated_rate },
    { stage: 'Addressable', count: funnel.addressable, rate: funnel.addressable_rate },
    { stage: 'Capturable', count: funnel.capturable, rate: funnel.capturable_rate },
  ];

  return (
    <div className="chart-container noise">
      <div className="chart-title">Patient Population Funnel (US)</div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 25, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(16,34,54,0.8)" />
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 11, fontFamily: 'Sora', fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
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
                  {d.rate < 1 && (
                    <div className="text-slate-500 mt-1">{formatPercent(d.rate * 100, 0)} of prior stage</div>
                  )}
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={52}>
            {data.map((_, i) => (
              <Cell key={i} fill={FUNNEL_COLORS[i]} />
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
      {/* Conversion rates */}
      <div className="flex justify-around mt-1 px-12">
        {data.slice(1).map((d, i) => (
          <div key={`${d.stage}-rate-${i}`} className="text-center">
            <span className="text-2xs font-mono text-teal-500">{formatPercent(d.rate * 100, 0)}</span>
          </div>
        ))}
      </div>

      {/* Source attribution */}
      <div className="mt-4 pt-3 border-t border-navy-700 flex flex-wrap gap-3">
        <DataSourceBadge source="WHO GBD" type="public" />
        <DataSourceBadge source="Terrain Epidemiology" type="proprietary" />
      </div>
    </div>
  );
}
