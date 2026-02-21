'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

interface RevenueStream {
  stream: string;
  annual_revenue_per_unit: number;
  total_units_or_procedures: number;
  gross_revenue_m: number;
  contribution_pct: number;
}

interface RevenueStreamChartProps {
  streams: RevenueStream[];
}

const STREAM_COLORS = ['#00C9A7', '#002E27', '#64748B', '#004D40', '#94A3B8'];

export default function RevenueStreamChart({ streams }: RevenueStreamChartProps) {
  const stackedData = streams.reduce<Record<string, number | string>>(
    (acc, s) => {
      acc[s.stream] = s.gross_revenue_m;
      return acc;
    },
    { name: 'Revenue' }
  );

  const data = [stackedData];
  const totalRevenue = streams.reduce((sum, s) => sum + s.gross_revenue_m, 0);

  return (
    <div className="chart-container">
      <div className="chart-title">Revenue Streams Breakdown</div>

      <ResponsiveContainer width="100%" height={120}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
            stroke="rgba(100,116,139,0.08)"
          />
          <XAxis
            type="number"
            tickFormatter={(val) => `$${val}M`}
            tick={{ fontSize: 11, fontFamily: '"DM Mono"', fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-navy-800 border border-navy-700 rounded-md px-4 py-3 text-xs shadow-elevated">
                  {payload.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 mb-1 last:mb-0"
                    >
                      <div
                        className="w-2 h-2 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="text-slate-400">{p.name}:</span>
                      <span className="metric text-white">
                        ${(p.value as number).toFixed(1)}M
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          {streams.map((s, i) => (
            <Bar
              key={s.stream}
              dataKey={s.stream}
              stackId="revenue"
              fill={STREAM_COLORS[i % STREAM_COLORS.length]}
              radius={
                i === 0 && streams.length === 1
                  ? [4, 4, 4, 4]
                  : i === 0
                    ? [4, 0, 0, 4]
                    : i === streams.length - 1
                      ? [0, 4, 4, 0]
                      : [0, 0, 0, 0]
              }
              barSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 mt-4 px-1">
        {streams.map((s, i) => (
          <div key={s.stream} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: STREAM_COLORS[i % STREAM_COLORS.length] }}
            />
            <span className="text-2xs text-slate-400">{s.stream}</span>
            <span className="text-2xs font-mono text-slate-500">
              {formatPercent(s.contribution_pct, 0)}
            </span>
          </div>
        ))}
      </div>

      {/* Detail Table */}
      <div className="mt-5 overflow-x-auto">
        <div className="label mb-3">Stream Details</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Stream</th>
              <th>Rev / Unit</th>
              <th>Units</th>
              <th>Gross Revenue</th>
              <th>Contribution</th>
            </tr>
          </thead>
          <tbody>
            {streams.map((s, i) => (
              <tr key={s.stream}>
                <td>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{
                        backgroundColor: STREAM_COLORS[i % STREAM_COLORS.length],
                      }}
                    />
                    <span className="text-slate-300 font-medium">{s.stream}</span>
                  </div>
                </td>
                <td className="numeric">
                  <span className="metric">{formatCurrency(s.annual_revenue_per_unit)}</span>
                </td>
                <td className="numeric">
                  <span className="metric">{s.total_units_or_procedures.toLocaleString('en-US')}</span>
                </td>
                <td className="numeric">
                  <span className="metric">${s.gross_revenue_m.toFixed(1)}M</span>
                </td>
                <td className="numeric">
                  <span className="metric text-teal-400">
                    {formatPercent(s.contribution_pct, 0)}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="border-t border-navy-600">
              <td className="text-slate-300 font-medium">Total</td>
              <td />
              <td />
              <td className="numeric">
                <span className="metric text-white font-medium">
                  ${totalRevenue.toFixed(1)}M
                </span>
              </td>
              <td className="numeric">
                <span className="metric text-teal-400">100%</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
