'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Competitor } from '@/types';

interface CompanyConcentrationChartProps {
  competitors: Competitor[];
}

interface CompanyCountItem {
  name: string;
  count: number;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-md px-3 py-2 shadow-elevated text-xs">
      <p className="text-slate-100 mb-0.5">{label}</p>
      <p className="font-mono text-teal-400">
        {payload[0].value} {payload[0].value === 1 ? 'asset' : 'assets'}
      </p>
    </div>
  );
}

export default function CompanyConcentrationChart({ competitors }: CompanyConcentrationChartProps) {
  const companyData = useMemo<CompanyCountItem[]>(() => {
    const counts: Record<string, number> = {};
    competitors.forEach((c) => {
      const company = c.company.trim();
      if (company) {
        counts[company] = (counts[company] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }, [competitors]);

  if (competitors.length === 0 || companyData.length === 0) {
    return (
      <div className="card noise p-8 text-center">
        <p className="text-slate-500 text-sm">No competitor data available.</p>
      </div>
    );
  }

  return (
    <div className="card noise">
      <h3 className="chart-title mb-4">Company Concentration</h3>
      <div role="img" aria-label="Company concentration chart">
        <ResponsiveContainer width="100%" height={Math.max(200, companyData.length * 44)}>
          <BarChart data={companyData} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.08)" />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'DM Mono, monospace' }}
              stroke="rgba(100, 116, 139, 0.15)"
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'DM Mono, monospace' }}
              stroke="none"
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(16, 34, 54, 0.4)' }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
              {companyData.map((entry, idx) => (
                <Cell
                  key={entry.name}
                  fill={idx === 0 ? '#00C9A7' : idx < 3 ? '#00E4BF' : '#0D9488'}
                  fillOpacity={idx === 0 ? 0.9 : 0.7 - idx * 0.04}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
