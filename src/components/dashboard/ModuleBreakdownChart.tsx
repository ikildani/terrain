'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Layers } from 'lucide-react';

const COLORS = {
  teal: '#00C9A7',
  navy: '#0D1B2E',
  navyLight: '#102236',
  text: '#94A3B8',
  grid: '#102236',
};

interface ModuleBreakdownChartProps {
  data: { feature: string; count: number }[];
}

/** Format snake_case feature names to Title Case */
function formatFeatureName(feature: string): string {
  return feature
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ModuleBreakdownChart({ data }: ModuleBreakdownChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatFeatureName(d.feature),
  }));

  return (
    <div className="chart-container noise relative">
      <div className="mb-4">
        <h3 className="label">Module Usage</h3>
      </div>

      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Layers className="w-8 h-8 text-navy-600 mb-3" />
          <p className="text-sm text-slate-500">No module usage yet</p>
          <p className="text-xs text-slate-600 mt-1">
            Start using modules to see your breakdown.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 40 + 20)}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={COLORS.grid}
              horizontal={false}
            />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 10, fontFamily: '"DM Mono"', fill: COLORS.text }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={120}
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
                    <div className="text-slate-400 mb-1">{d.label}</div>
                    <div className="font-mono text-white text-sm">
                      {d.count} {d.count === 1 ? 'use' : 'uses'}
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="count"
              fill={COLORS.teal}
              opacity={0.85}
              radius={[0, 4, 4, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
