'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Competitor, ClinicalPhase } from '@/types';

interface PipelineDistributionChartProps {
  competitors: Competitor[];
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

const PHASE_DISPLAY_ORDER: ClinicalPhase[] = [
  'Approved',
  'Phase 3',
  'Phase 2/3',
  'Phase 2',
  'Phase 1/2',
  'Phase 1',
  'Preclinical',
];

const MECHANISM_COLORS = [
  '#00C9A7',
  '#60A5FA',
  '#FBBF24',
  '#34D399',
  '#F87171',
  '#A78BFA',
  '#F472B6',
  '#38BDF8',
  '#FB923C',
  '#94A3B8',
];

interface PhaseDistItem {
  name: string;
  count: number;
  color: string;
}

interface MechanismDistItem {
  name: string;
  count: number;
  color: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { color?: string } }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-md px-3 py-2 shadow-elevated text-xs">
      <p className="text-slate-100 mb-0.5">{label}</p>
      <p className="font-mono text-teal-400">
        {payload[0].value} {payload[0].value === 1 ? 'program' : 'programs'}
      </p>
    </div>
  );
}

export default function PipelineDistributionChart({ competitors }: PipelineDistributionChartProps) {
  const phaseData = useMemo<PhaseDistItem[]>(() => {
    const counts: Record<string, number> = {};
    competitors.forEach((c) => {
      counts[c.phase] = (counts[c.phase] || 0) + 1;
    });

    return PHASE_DISPLAY_ORDER.filter((phase) => counts[phase] && counts[phase] > 0).map(
      (phase) => ({
        name: phase,
        count: counts[phase],
        color: PHASE_COLORS[phase],
      })
    );
  }, [competitors]);

  const mechanismData = useMemo<MechanismDistItem[]>(() => {
    const counts: Record<string, number> = {};
    competitors.forEach((c) => {
      const mech = c.mechanism.trim();
      if (mech) {
        counts[mech] = (counts[mech] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => ({
        name,
        count,
        color: MECHANISM_COLORS[idx % MECHANISM_COLORS.length],
      }));
  }, [competitors]);

  if (competitors.length === 0) {
    return (
      <div className="card noise p-8 text-center">
        <p className="text-slate-500 text-sm">No competitor data available.</p>
      </div>
    );
  }

  return (
    <div className="card noise">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Phase Distribution */}
        <div>
          <h3 className="chart-title">Phase Distribution</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, phaseData.length * 44)}>
            <BarChart
              data={phaseData}
              layout="vertical"
              margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke="rgba(100, 116, 139, 0.08)"
              />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'DM Mono, monospace' }}
                stroke="rgba(100, 116, 139, 0.15)"
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'DM Mono, monospace' }}
                stroke="none"
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(16, 34, 54, 0.4)' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                {phaseData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mechanism Distribution */}
        <div>
          <h3 className="chart-title">Mechanism Distribution</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, mechanismData.length * 44)}>
            <BarChart
              data={mechanismData}
              layout="vertical"
              margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke="rgba(100, 116, 139, 0.08)"
              />
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
                {mechanismData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
