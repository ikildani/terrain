'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { Activity } from 'lucide-react';

const COLORS = {
  teal: '#00C9A7',
  tealFaded: 'rgba(0, 201, 167, 0.08)',
  navy: '#0D1B2E',
  navyLight: '#102236',
  text: '#94A3B8',
  grid: '#102236',
};

interface ActivityTrendChartProps {
  data: { date: string; count: number }[];
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ActivityTrendChart({ data }: ActivityTrendChartProps) {
  const hasActivity = data.some((d) => d.count > 0);
  const total = data.reduce((s, d) => s + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;
  const avg = activeDays > 0 ? +(total / data.length).toFixed(1) : 0;

  return (
    <div className="chart-container noise relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="label">Activity Trend</h3>
          <p className="text-2xs text-slate-600 mt-0.5">Last 30 days</p>
        </div>
        {hasActivity && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-mono text-sm text-white leading-none">{total}</p>
              <p className="text-2xs text-slate-600 mt-0.5">Total</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm text-slate-400 leading-none">{avg}</p>
              <p className="text-2xs text-slate-600 mt-0.5">Avg/day</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm text-teal-400 leading-none">{activeDays}</p>
              <p className="text-2xs text-slate-600 mt-0.5">Active days</p>
            </div>
          </div>
        )}
      </div>

      {!hasActivity ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="w-8 h-8 text-navy-600 mb-3" />
          <p className="text-sm text-slate-500">No activity yet</p>
          <p className="text-xs text-slate-600 mt-1">Run an analysis to see your trend here.</p>
        </div>
      ) : (
        <div role="img" aria-label="Activity trend chart">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDayLabel}
                tick={{ fontSize: 10, fontFamily: '"DM Mono"', fill: COLORS.text }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fontFamily: '"DM Mono"', fill: COLORS.text }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ stroke: COLORS.teal, strokeWidth: 1, strokeDasharray: '3 3' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.[0]) return null;
                  return (
                    <div className="bg-navy-800 border border-navy-700 rounded-md px-4 py-3 text-xs shadow-elevated">
                      <div className="text-slate-400 mb-1">{formatDayLabel(label as string)}</div>
                      <div className="font-mono text-white text-sm">
                        {payload[0].value} {Number(payload[0].value) === 1 ? 'analysis' : 'analyses'}
                      </div>
                    </div>
                  );
                }}
              />
              {avg > 0 && (
                <ReferenceLine
                  y={avg}
                  stroke="#64748B"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{
                    value: `avg ${avg}`,
                    position: 'right',
                    fill: '#64748B',
                    fontSize: 9,
                    fontFamily: '"DM Mono"',
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="count"
                stroke={COLORS.teal}
                strokeWidth={2}
                fill="url(#tealGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: COLORS.teal,
                  stroke: COLORS.navy,
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
