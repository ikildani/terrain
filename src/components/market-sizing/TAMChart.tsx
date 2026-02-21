'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { cn } from '@/lib/utils/cn';
import { formatMetric } from '@/lib/utils/format';
import type { MarketMetric } from '@/types';

interface TAMChartProps {
  tam: MarketMetric;
  sam: MarketMetric;
  som: MarketMetric;
}

const COLORS = {
  tam: '#1A3350',
  sam: '#004D40',
  som: '#00C9A7',
};

export default function TAMChart({ tam, sam, som }: TAMChartProps) {
  const data = [
    { name: 'TAM', value: tam.value, unit: tam.unit, confidence: tam.confidence, fill: COLORS.tam },
    { name: 'SAM', value: sam.value, unit: sam.unit, confidence: sam.confidence, fill: COLORS.sam },
    { name: 'SOM', value: som.value, unit: som.unit, confidence: som.confidence, fill: COLORS.som },
  ];

  return (
    <div className="chart-container">
      <div className="chart-title">TAM / SAM / SOM Analysis</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 80, left: 10, bottom: 10 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={45}
            tick={{ fontSize: 12, fontFamily: 'DM Mono', fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(val: number) => {
                const item = data.find((d) => d.value === val);
                return formatMetric(val, item?.unit || 'B');
              }}
              style={{ fontFamily: '"DM Mono"', fontSize: 13, fill: '#F0F4F8', fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-6 mt-3 px-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.fill }} />
            <span className="text-2xs text-slate-500">{d.name}</span>
            <span
              className={cn(
                'text-2xs font-mono uppercase',
                d.confidence === 'high' && 'confidence-high',
                d.confidence === 'medium' && 'confidence-medium',
                d.confidence === 'low' && 'confidence-low'
              )}
            >
              {d.confidence}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
