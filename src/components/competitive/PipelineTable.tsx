'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { Competitor, ClinicalPhase } from '@/types';

interface PipelineTableProps {
  competitors: Competitor[];
  title?: string;
}

type SortField =
  | 'company'
  | 'asset_name'
  | 'phase'
  | 'mechanism'
  | 'primary_endpoint'
  | 'key_data'
  | 'partner'
  | 'partnership_deal_value'
  | 'differentiation_score'
  | 'evidence_strength';

type SortDirection = 'asc' | 'desc';

const PHASE_ORDER: Record<ClinicalPhase, number> = {
  Approved: 7,
  'Phase 3': 6,
  'Phase 2/3': 5,
  'Phase 2': 4,
  'Phase 1/2': 3,
  'Phase 1': 2,
  Preclinical: 1,
};

const PHASE_CLASSES: Record<ClinicalPhase, string> = {
  Approved: 'phase-approved',
  'Phase 3': 'phase-3',
  'Phase 2/3': 'phase-2',
  'Phase 2': 'phase-2',
  'Phase 1/2': 'phase-1',
  'Phase 1': 'phase-1',
  Preclinical: 'phase-preclinical',
};

interface ColumnDef {
  key: SortField;
  label: string;
  className?: string;
}

const COLUMNS: ColumnDef[] = [
  { key: 'company', label: 'Company' },
  { key: 'asset_name', label: 'Asset' },
  { key: 'phase', label: 'Phase' },
  { key: 'mechanism', label: 'MoA' },
  { key: 'primary_endpoint', label: 'Endpoint' },
  { key: 'key_data', label: 'Key Data' },
  { key: 'partner', label: 'Partner' },
  { key: 'partnership_deal_value', label: 'Deal Value', className: 'numeric' },
  { key: 'differentiation_score', label: 'Diff. Score', className: 'numeric' },
  { key: 'evidence_strength', label: 'Evidence', className: 'numeric' },
];

function getScoreColorClass(score: number): string {
  if (score >= 7) return 'text-teal-400';
  if (score >= 4) return 'text-signal-amber';
  return 'text-signal-red';
}

export default function PipelineTable({ competitors, title }: PipelineTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sorted = useMemo(() => {
    if (!sortField) return competitors;

    return [...competitors].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (sortField === 'phase') {
        aVal = PHASE_ORDER[a.phase] ?? 0;
        bVal = PHASE_ORDER[b.phase] ?? 0;
      } else if (sortField === 'differentiation_score' || sortField === 'evidence_strength') {
        aVal = a[sortField];
        bVal = b[sortField];
      } else {
        aVal = (a[sortField] as string) ?? '';
        bVal = (b[sortField] as string) ?? '';
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      if (sortDirection === 'asc') {
        return strA.localeCompare(strB);
      }
      return strB.localeCompare(strA);
    });
  }, [competitors, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="inline-block ml-1 h-3 w-3 opacity-40" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="inline-block ml-1 h-3 w-3 text-teal-400" />
    ) : (
      <ChevronDown className="inline-block ml-1 h-3 w-3 text-teal-400" />
    );
  };

  if (competitors.length === 0) {
    return (
      <div className="card">
        {title && <h3 className="chart-title mb-4">{title}</h3>}
        <div className="py-10 text-center">
          <p className="text-slate-500 text-sm">No competitors in this category</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {title && <h3 className="chart-title mb-4">{title}</h3>}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="data-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={col.className}
                >
                  {col.label}
                  <SortIcon field={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((competitor) => (
              <tr key={competitor.id}>
                <td className="text-slate-100 font-medium whitespace-nowrap">
                  {competitor.company}
                </td>
                <td className="text-teal-400 whitespace-nowrap">{competitor.asset_name}</td>
                <td>
                  <span className={`phase-badge ${PHASE_CLASSES[competitor.phase] ?? 'phase-preclinical'}`}>
                    {competitor.phase}
                  </span>
                </td>
                <td className="max-w-[160px] truncate">{competitor.mechanism}</td>
                <td className="max-w-[160px] truncate text-slate-400">
                  {competitor.primary_endpoint || '\u2014'}
                </td>
                <td className="max-w-[200px] truncate text-slate-400">
                  {competitor.key_data || '\u2014'}
                </td>
                <td className="text-slate-400 whitespace-nowrap">
                  {competitor.partner || '\u2014'}
                </td>
                <td className="numeric font-mono text-xs">
                  {competitor.partnership_deal_value || '\u2014'}
                </td>
                <td className={`numeric font-mono text-xs ${getScoreColorClass(competitor.differentiation_score)}`}>
                  {competitor.differentiation_score}
                </td>
                <td className={`numeric font-mono text-xs ${getScoreColorClass(competitor.evidence_strength)}`}>
                  {competitor.evidence_strength}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
