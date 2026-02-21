'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { cn } from '@/lib/utils/cn';
import { formatMetric } from '@/lib/utils/format';

const COLORS = {
  teal: '#00C9A7',
  tealDark: '#002E27',
  navy: '#0D1B2E',
  navyLight: '#102236',
  slate: '#64748B',
  slateLight: '#94A3B8',
  emerald: '#34D399',
  amber: '#FBBF24',
  text: '#94A3B8',
  grid: '#102236',
};

const BAR_FILLS = {
  TAM: '#475569',   // slate-600
  SAM: '#002E27',   // tealDark
  SOM: '#00C9A7',   // teal
};

interface TAMChartProps {
  tam: { value: number; unit: 'B' | 'M' | 'K'; confidence: string };
  sam: { value: number; unit: 'B' | 'M' | 'K'; confidence: string };
  som: { value: number; unit: 'B' | 'M' | 'K'; confidence: string; range?: [number, number] };
  globalTam?: { value: number; unit: 'B' | 'M' | 'K'; confidence: string };
}

interface ChartDatum {
  name: string;
  value: number;
  unit: 'B' | 'M' | 'K';
  confidence: string;
  fill: string;
}

export default function TAMChart({ tam, sam, som, globalTam }: TAMChartProps) {
  const data: ChartDatum[] = [
    { name: 'TAM', value: tam.value, unit: tam.unit, confidence: tam.confidence, fill: BAR_FILLS.TAM },
    { name: 'SAM', value: sam.value, unit: sam.unit, confidence: sam.confidence, fill: BAR_FILLS.SAM },
    { name: 'SOM', value: som.value, unit: som.unit, confidence: som.confidence, fill: BAR_FILLS.SOM },
  ];

  return (
    <div className="chart-container">
      {/* Global TAM stat displayed above chart when provided */}
      {globalTam && (
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-navy-700">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Global TAM</span>
          <span className="font-mono text-lg text-slate-200 font-medium">
            {formatMetric(globalTam.value, globalTam.unit)}
          </span>
          <span
            className={cn(
              'text-2xs font-mono uppercase',
              globalTam.confidence === 'high' && 'confidence-high',
              globalTam.confidence === 'medium' && 'confidence-medium',
              globalTam.confidence === 'low' && 'confidence-low'
            )}
          >
            {globalTam.confidence}
          </span>
        </div>
      )}

      {/* Section header */}
      <div className="label">TAM / SAM / SOM</div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 80, left: 10, bottom: 10 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={48}
            tick={{ fontSize: 12, fontFamily: '"DM Mono"', fill: COLORS.text }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: COLORS.navyLight }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as ChartDatum;
              return (
                <div className="bg-navy-800 border border-navy-700 rounded-md px-4 py-3 text-xs shadow-elevated">
                  <div className="text-slate-300 font-medium mb-1">{d.name}</div>
                  <div className="font-mono text-white text-sm">
                    {formatMetric(d.value, d.unit)}
                  </div>
                  <div
                    className={cn(
                      'text-2xs font-mono uppercase mt-1',
                      d.confidence === 'high' && 'confidence-high',
                      d.confidence === 'medium' && 'confidence-medium',
                      d.confidence === 'low' && 'confidence-low'
                    )}
                  >
                    {d.confidence} confidence
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={36}>
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
              style={{
                fontFamily: '"DM Mono"',
                fontSize: 13,
                fill: '#F0F4F8',
                fontWeight: 500,
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend with confidence badges */}
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

      {/* SOM range annotation */}
      {som.range && (
        <div className="mt-3 px-2">
          <span className="text-2xs text-slate-500">
            SOM Range: {formatMetric(som.range[0], som.unit)} – {formatMetric(som.range[1], som.unit)}
          </span>
        </div>
      )}
    </div>
  );
}
