'use client';

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueProjectionYear } from '@/types';

interface MarketGrowthChartProps {
  projections: RevenueProjectionYear[];
  peakSales: { low: number; base: number; high: number };
}

export default function MarketGrowthChart({ projections, peakSales }: MarketGrowthChartProps) {
  // Find peak year for annotation
  const peakIndex = projections.reduce(
    (maxIdx, curr, idx, arr) => (curr.base > arr[maxIdx].base ? idx : maxIdx),
    0
  );
  const peakYear = projections[peakIndex]?.year;

  function formatValue(val: number): string {
    if (val >= 1) return `$${val.toFixed(1)}B`;
    return `$${(val * 1000).toFixed(0)}M`;
  }

  return (
    <div className="chart-container noise">
      <div className="flex items-center justify-between mb-1">
        <div className="chart-title !mb-0">10-Year Revenue Projection</div>
        {peakYear && (
          <span className="text-2xs font-mono text-teal-500">
            Peak: {peakYear}
          </span>
        )}
      </div>

      {/* Peak sales callout */}
      <div className="flex gap-4 mb-4">
        {[
          { label: 'Bear', value: peakSales.low, color: '#64748B' },
          { label: 'Base', value: peakSales.base, color: '#00C9A7' },
          { label: 'Bull', value: peakSales.high, color: '#34D399' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-2xs text-slate-500">{s.label}:</span>
            <span className="metric text-xs text-slate-300">{formatValue(s.value)}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={projections} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00C9A7" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#00C9A7" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(16,34,54,0.8)" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fontFamily: '"DM Mono"', fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatValue(v)}
            tick={{ fontSize: 11, fontFamily: '"DM Mono"', fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload) return null;
              return (
                <div className="bg-navy-800 border border-navy-700 rounded-md px-4 py-3 text-xs shadow-elevated">
                  <div className="font-mono text-slate-300 mb-2">{label}</div>
                  {payload.map((p) => (
                    <div key={p.name} className="flex justify-between gap-6 py-0.5">
                      <span style={{ color: typeof p.stroke === 'string' ? p.stroke : '#94A3B8' }}>
                        {p.name}
                      </span>
                      <span className="metric text-white">
                        {formatValue(Number(p.value) || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          {/* Shaded band between bear and bull */}
          <Area
            type="monotone"
            dataKey="bull"
            stroke="transparent"
            fill="url(#rangeGradient)"
            name="Bull Case"
          />
          <Area
            type="monotone"
            dataKey="bear"
            stroke="transparent"
            fill="#04080F"
            name="Bear Case"
          />
          {/* Scenario lines */}
          <Line
            type="monotone"
            dataKey="bear"
            stroke="#64748B"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            name="Bear Case"
          />
          <Line
            type="monotone"
            dataKey="base"
            stroke="#00C9A7"
            strokeWidth={2.5}
            dot={false}
            name="Base Case"
          />
          <Line
            type="monotone"
            dataKey="bull"
            stroke="#34D399"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            name="Bull Case"
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: 'Sora' }}
            iconType="line"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
