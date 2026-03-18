'use client';

import { Users } from 'lucide-react';
import type { PatientSegmentation } from '@/types';
import { cn } from '@/lib/utils/cn';
import { UpgradeGate } from '@/components/shared/UpgradeGate';

interface PatientSegmentationTableProps {
  data: PatientSegmentation;
  isPro?: boolean;
}

function getUnmetNeedColor(score: number): string {
  if (score >= 8) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (score >= 6) return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
  if (score >= 4) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return 'bg-red-500/10 text-red-400 border-red-500/20';
}

function getUnmetNeedLabel(score: number): string {
  if (score >= 8) return 'High Opportunity';
  if (score >= 6) return 'Moderate Opportunity';
  if (score >= 4) return 'Limited';
  return 'Saturated';
}

function getDensityBar(density: number): string {
  if (density >= 8) return 'w-[90%] bg-red-500/60';
  if (density >= 6) return 'w-[70%] bg-amber-500/60';
  if (density >= 4) return 'w-[50%] bg-amber-400/40';
  if (density >= 2) return 'w-[30%] bg-emerald-500/40';
  return 'w-[15%] bg-emerald-400/30';
}

function SegmentationContent({ data }: { data: PatientSegmentation }) {
  return (
    <div className="card noise">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-teal-500" />
          <h3 className="chart-title">Patient Population Segmentation</h3>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm text-slate-100">{data.total_addressable_patients.toLocaleString()}</p>
          <p className="text-2xs text-slate-500">Total Addressable Patients</p>
        </div>
      </div>

      {/* Narrative */}
      <p className="text-xs text-slate-400 leading-relaxed mb-4 bg-navy-800/40 rounded-md px-3 py-2 border border-navy-700/30">
        {data.narrative}
      </p>

      {/* Segment Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="data-table w-full">
          <thead>
            <tr>
              <th className="text-left">Segment</th>
              <th className="text-right">Est. Patients</th>
              <th className="text-left">Current SOC</th>
              <th className="text-center">Competitive Density</th>
              <th className="text-center">Unmet Need</th>
              <th className="text-left">White Space Assessment</th>
            </tr>
          </thead>
          <tbody>
            {data.segments.map((segment, i) => (
              <tr key={`seg-${segment.name}-${i}`}>
                <td className="text-slate-100 font-medium text-xs whitespace-nowrap">{segment.name}</td>
                <td className="text-right font-mono text-xs text-slate-300">
                  {segment.estimated_patients.toLocaleString()}
                </td>
                <td className="text-xs text-slate-400 max-w-[180px]">
                  <span className="truncate block">{segment.current_soc}</span>
                </td>
                <td className="text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-16 h-1.5 bg-navy-700/60 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', getDensityBar(segment.competitive_density))} />
                    </div>
                    <span className="font-mono text-2xs text-slate-400">{segment.competitive_density}/10</span>
                  </div>
                </td>
                <td className="text-center">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono font-medium border',
                      getUnmetNeedColor(segment.unmet_need_score),
                    )}
                  >
                    {segment.unmet_need_score}/10
                    <span className="ml-1 text-[9px] opacity-80">{getUnmetNeedLabel(segment.unmet_need_score)}</span>
                  </span>
                </td>
                <td className="text-xs text-slate-400 max-w-[240px]">
                  <span className="line-clamp-2">{segment.white_space_assessment}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-navy-700/30">
        <span className="text-2xs text-slate-500">Unmet Need:</span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-2xs text-slate-500">High Opportunity (8-10)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-2xs text-slate-500">Moderate (4-7)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-2xs text-slate-500">Saturated (1-3)</span>
        </div>
      </div>
    </div>
  );
}

export default function PatientSegmentationTable({ data, isPro = false }: PatientSegmentationTableProps) {
  if (!isPro) {
    return (
      <UpgradeGate feature="Patient Population Segmentation">
        <SegmentationContent data={data} />
      </UpgradeGate>
    );
  }

  return <SegmentationContent data={data} />;
}
