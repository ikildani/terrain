'use client';

import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: number[];
  sparkId: string;
}

export default function SparklineChart({ data, sparkId }: SparklineChartProps) {
  return (
    <div className="mt-1.5 -mx-1" style={{ height: 32 }} role="img" aria-label="Trend sparkline">
      <ResponsiveContainer width="100%" height={32}>
        <AreaChart data={data.map((v, i) => ({ v, i }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={sparkId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00C9A7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00C9A7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke="#00C9A7"
            strokeWidth={1.5}
            fill={`url(#${sparkId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
