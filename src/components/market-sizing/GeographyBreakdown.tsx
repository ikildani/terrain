'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { formatMetric, formatNumber, formatPercent } from '@/lib/utils/format';
import type { GeographyBreakdownItem } from '@/types';

interface GeographyBreakdownProps {
  data: GeographyBreakdownItem[];
}

export default function GeographyBreakdown({ data }: GeographyBreakdownProps) {
  const chartData = data.map((d) => ({
    territory: d.territory,
    value: d.tam.unit === 'B' ? d.tam.value : d.tam.value / 1000,
    displayValue: formatMetric(d.tam.value, d.tam.unit),
  }));

  return (
    <div className="chart-container">
      <div className="chart-title">Geography Breakdown</div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={data.length * 38 + 40}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 70, left: 10, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="territory"
            width={110}
            tick={{ fontSize: 11, fontFamily: 'Sora', fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as (typeof chartData)[0];
              return (
                <div className="bg-navy-800 border border-navy-700 rounded-md px-4 py-3 text-xs shadow-elevated">
                  <div className="text-slate-300 font-medium">{d.territory}</div>
                  <div className="metric text-white mt-1">{d.displayValue}</div>
                </div>
              );
            }}
          />
          <Bar
            dataKey="value"
            fill="#00C9A7"
            radius={[0, 4, 4, 0]}
            barSize={22}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Data table */}
      <div className="mt-4 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Territory</th>
              <th>TAM</th>
              <th>Population</th>
              <th>Multiplier</th>
              <th>Regulatory</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.territory}>
                <td className="text-slate-300 font-medium">{row.territory}</td>
                <td className="numeric">{formatMetric(row.tam.value, row.tam.unit)}</td>
                <td className="numeric">{formatNumber(row.population / 1_000_000, 1)}M</td>
                <td className="numeric">{row.market_multiplier.toFixed(2)}x</td>
                <td>
                  <span className="text-2xs text-slate-500">{row.regulatory_status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
