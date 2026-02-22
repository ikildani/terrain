'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { INDICATION_DATA } from '@/lib/data/indication-map';

const COLORS = {
  emerald: '#34D399',
  navy: '#0D1B2E',
  navyLight: '#102236',
  text: '#94A3B8',
  grid: '#102236',
};

/** Format therapy_area slug to Title Case */
function formatTherapyArea(area: string): string {
  // Handle special cases
  const overrides: Record<string, string> = {
    oncology: 'Oncology',
    neurology: 'Neurology',
    immunology: 'Immunology',
    rare_disease: 'Rare Disease',
    cardiovascular: 'Cardiovascular',
    infectious_disease: 'Infectious Disease',
    hematology: 'Hematology',
    ophthalmology: 'Ophthalmology',
    pulmonology: 'Pulmonology',
    nephrology: 'Nephrology',
    metabolic: 'Metabolic',
    dermatology: 'Dermatology',
    endocrinology: 'Endocrinology',
    gastroenterology: 'Gastroenterology',
  };
  if (overrides[area]) return overrides[area];
  return area
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function DatabaseCoverageChart() {
  // Group INDICATION_DATA by therapy_area
  const areaMap = new Map<string, number>();
  for (const ind of INDICATION_DATA) {
    const area = ind.therapy_area;
    areaMap.set(area, (areaMap.get(area) ?? 0) + 1);
  }

  const chartData = Array.from(areaMap.entries())
    .map(([area, count]) => ({
      area,
      label: formatTherapyArea(area),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="chart-container noise relative">
      <div className="mb-4">
        <h3 className="label">Database Coverage by Therapy Area</h3>
        <p className="text-2xs text-slate-600 mt-0.5">
          {INDICATION_DATA.length} indications across {chartData.length} therapy areas
        </p>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 36 + 20)}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 4, right: 48, left: 8, bottom: 0 }}
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
            width={140}
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
                    {d.count} {d.count === 1 ? 'indication' : 'indications'}
                  </div>
                </div>
              );
            }}
          />
          <Bar
            dataKey="count"
            fill={COLORS.emerald}
            opacity={0.85}
            radius={[0, 4, 4, 0]}
            barSize={22}
          >
            <LabelList
              dataKey="count"
              position="right"
              style={{
                fontFamily: '"DM Mono"',
                fontSize: 11,
                fill: '#94A3B8',
                fontWeight: 400,
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
