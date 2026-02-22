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

interface ProcedureVolumeChartProps {
  procedureVolume: {
    us_annual_procedures: number;
    us_addressable_procedures: number;
    growth_rate_pct: number;
    source: string;
  };
  peakSharePct?: number;
}

const BAR_COLORS = {
  total: '#64748B',
  addressable: '#002E27',
  capturable: '#00C9A7',
};

interface VolumeStage {
  stage: string;
  count: number;
  fill: string;
}

export default function ProcedureVolumeChart({
  procedureVolume,
  peakSharePct,
}: ProcedureVolumeChartProps) {
  const shareRate = (peakSharePct ?? 15) / 100;
  const capturable = Math.round(
    procedureVolume.us_addressable_procedures * shareRate
  );

  const data: VolumeStage[] = [
    {
      stage: 'Total US Procedures',
      count: procedureVolume.us_annual_procedures,
      fill: BAR_COLORS.total,
    },
    {
      stage: 'Addressable Procedures',
      count: procedureVolume.us_addressable_procedures,
      fill: BAR_COLORS.addressable,
    },
    {
      stage: 'Capturable',
      count: capturable,
      fill: BAR_COLORS.capturable,
    },
  ];

  return (
    <div className="chart-container noise">
      <div className="flex items-center justify-between mb-4">
        <div className="chart-title !mb-0">Device Procedure Volume Funnel</div>
        <span className="badge badge-teal">
          {formatPercent(procedureVolume.growth_rate_pct, 1)} CAGR
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 100, left: 10, bottom: 10 }}
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
            stroke="rgba(100,116,139,0.08)"
          />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="stage"
            width={160}
            tick={{ fontSize: 11, fontFamily: 'Sora', fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as VolumeStage;
              const pctOfTotal =
                (d.count / procedureVolume.us_annual_procedures) * 100;
              return (
                <div className="bg-navy-800 border border-navy-700 rounded-md px-4 py-3 text-xs shadow-elevated">
                  <div className="text-slate-300 font-medium mb-1">
                    {d.stage}
                  </div>
                  <div className="metric text-white">
                    {formatNumber(d.count)}
                  </div>
                  <div className="text-slate-500 mt-1">
                    {formatPercent(pctOfTotal, 1)} of total
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={36}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              formatter={(val: number) => formatNumber(val)}
              style={{
                fontFamily: '"DM Mono"',
                fontSize: 12,
                fill: '#F0F4F8',
                fontWeight: 500,
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-6 mt-3 px-2">
        {data.map((d) => (
          <div key={d.stage} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: d.fill }}
            />
            <span className="text-2xs text-slate-500">{d.stage}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-navy-700">
        <span className="text-2xs text-slate-500">
          Peak share assumption: {formatPercent(peakSharePct ?? 15, 0)}
        </span>
        <span className="text-2xs text-slate-500">
          Source: {procedureVolume.source}
        </span>
      </div>
    </div>
  );
}
