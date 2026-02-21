'use client';

import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Competitor, ClinicalPhase } from '@/types';

interface LandscapeMapProps {
  competitors: Competitor[];
  highlightMechanism?: string;
}

const PHASE_COLORS: Record<ClinicalPhase, string> = {
  Approved: '#34D399',
  'Phase 3': '#00C9A7',
  'Phase 2/3': '#00C9A7',
  'Phase 2': '#FBBF24',
  'Phase 1/2': '#60A5FA',
  'Phase 1': '#60A5FA',
  Preclinical: '#94A3B8',
};

interface ScatterDataPoint {
  x: number;
  y: number;
  asset_name: string;
  company: string;
  phase: ClinicalPhase;
  mechanism: string;
  id: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ScatterDataPoint }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const phaseColor = PHASE_COLORS[data.phase] || '#94A3B8';

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-md px-3.5 py-2.5 shadow-elevated text-xs">
      <p className="text-teal-400 font-medium text-[13px] mb-1">{data.asset_name}</p>
      <p className="text-slate-100 mb-0.5">{data.company}</p>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span
          className="phase-badge"
          style={{ backgroundColor: `${phaseColor}20`, color: phaseColor }}
        >
          {data.phase}
        </span>
      </div>
      <p className="text-slate-400 mb-1">{data.mechanism}</p>
      <div className="flex gap-4 mt-2 pt-2 border-t border-navy-700">
        <div>
          <span className="text-slate-500 text-[10px] uppercase tracking-wider">Diff.</span>
          <span className="font-mono text-slate-100 ml-1.5">{data.x}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] uppercase tracking-wider">Evidence</span>
          <span className="font-mono text-slate-100 ml-1.5">{data.y}</span>
        </div>
      </div>
    </div>
  );
}

export default function LandscapeMap({ competitors, highlightMechanism }: LandscapeMapProps) {
  const scatterData = useMemo<ScatterDataPoint[]>(() => {
    return competitors.map((c) => ({
      x: c.differentiation_score,
      y: c.evidence_strength,
      asset_name: c.asset_name,
      company: c.company,
      phase: c.phase,
      mechanism: c.mechanism,
      id: c.id,
    }));
  }, [competitors]);

  const getFillColor = (point: ScatterDataPoint): string => {
    if (
      highlightMechanism &&
      !point.mechanism.toLowerCase().includes(highlightMechanism.toLowerCase())
    ) {
      return 'rgba(100, 116, 139, 0.35)';
    }
    return PHASE_COLORS[point.phase] || '#94A3B8';
  };

  if (competitors.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-500 text-sm">No competitors to map.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="chart-title">Competitive Landscape Map</h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {Object.entries(PHASE_COLORS).map(([phase, color]) => (
          <div key={phase} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[11px] text-slate-400">{phase}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(100, 116, 139, 0.08)"
          />
          <XAxis
            type="number"
            dataKey="x"
            name="Differentiation"
            domain={[0, 10]}
            ticks={[0, 2, 4, 5, 6, 8, 10]}
            label={{
              value: 'Differentiation Score',
              position: 'insideBottom',
              offset: -10,
              fill: '#64748B',
              fontSize: 11,
              fontFamily: 'DM Mono, monospace',
            }}
            tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'DM Mono, monospace' }}
            stroke="rgba(100, 116, 139, 0.15)"
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Evidence"
            domain={[0, 10]}
            ticks={[0, 2, 4, 5, 6, 8, 10]}
            label={{
              value: 'Evidence Strength',
              angle: -90,
              position: 'insideLeft',
              offset: 5,
              fill: '#64748B',
              fontSize: 11,
              fontFamily: 'DM Mono, monospace',
            }}
            tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'DM Mono, monospace' }}
            stroke="rgba(100, 116, 139, 0.15)"
          />
          <ReferenceLine
            x={5}
            stroke="#102236"
            strokeDasharray="6 4"
            strokeWidth={1}
          />
          <ReferenceLine
            y={5}
            stroke="#102236"
            strokeDasharray="6 4"
            strokeWidth={1}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ strokeDasharray: '3 3', stroke: '#102236' }}
          />
          <Scatter data={scatterData} isAnimationActive={true}>
            {scatterData.map((entry) => (
              <Cell
                key={entry.id}
                fill={getFillColor(entry)}
                r={6}
                stroke={getFillColor(entry)}
                strokeWidth={1}
                fillOpacity={0.85}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Quadrant labels */}
      <div className="grid grid-cols-2 gap-px mt-2 text-[10px] text-slate-500 uppercase tracking-wider">
        <div className="text-left pl-12">Low Diff. / High Evidence</div>
        <div className="text-right pr-4">High Diff. / High Evidence</div>
        <div className="text-left pl-12">Low Diff. / Low Evidence</div>
        <div className="text-right pr-4">High Diff. / Low Evidence</div>
      </div>
    </div>
  );
}
