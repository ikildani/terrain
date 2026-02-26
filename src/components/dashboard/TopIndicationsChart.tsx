'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Crosshair } from 'lucide-react';

const COLORS = {
  amber: '#FBBF24',
  navy: '#0D1B2E',
  navyLight: '#102236',
  text: '#94A3B8',
  grid: '#102236',
};

interface TopIndicationsChartProps {
  data: { indication: string; count: number }[];
}

export default function TopIndicationsChart({ data }: TopIndicationsChartProps) {
  return (
    <div className="chart-container noise relative">
      <div className="mb-4">
        <h3 className="label">Top Indications</h3>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Crosshair className="w-8 h-8 text-navy-600 mb-3" />
          <p className="text-sm text-slate-500">No indication data yet</p>
          <p className="text-xs text-slate-600 mt-1">Analyze indications to see your top focuses.</p>
        </div>
      ) : (
        <div role="img" aria-label="Top indications chart">
          <ResponsiveContainer width="100%" height={Math.max(160, data.length * 40 + 20)}>
            <BarChart layout="vertical" data={data} margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 10, fontFamily: '"DM Mono"', fill: COLORS.text }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="indication"
                width={160}
                tick={{ fontSize: 11, fontFamily: '"Sora"', fill: COLORS.text }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: COLORS.navyLight }}
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-navy-800 border border-navy-700 rounded-md px-4 py-3 text-xs shadow-elevated">
                      <div className="text-slate-400 mb-1">{d.indication}</div>
                      <div className="font-mono text-white text-sm">
                        {d.count} {d.count === 1 ? 'analysis' : 'analyses'}
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" fill={COLORS.amber} opacity={0.85} radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
