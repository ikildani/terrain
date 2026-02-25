'use client';

import { useState, useMemo, Fragment } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, DollarSign, ExternalLink, FlaskConical } from 'lucide-react';
import type { Competitor, ClinicalPhase } from '@/types';

interface PipelineTableProps {
  competitors: Competitor[];
  title?: string;
  noCard?: boolean;
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
  | 'evidence_strength'
  | 'estimated_peak_sales';

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
  { key: 'estimated_peak_sales', label: 'Peak Sales', className: 'numeric' },
];

function getScoreColorClass(score: number): string {
  if (score >= 7) return 'text-teal-400';
  if (score >= 4) return 'text-signal-amber';
  return 'text-signal-red';
}

export default function PipelineTable({ competitors, title, noCard }: PipelineTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleRowClick = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
    const emptyContent = (
      <>
        {title && <h3 className="chart-title mb-4">{title}</h3>}
        <div className="py-10 text-center">
          <p className="text-slate-500 text-sm">No competitors in this category</p>
        </div>
      </>
    );

    if (noCard) return <div>{emptyContent}</div>;
    return <div className="card noise">{emptyContent}</div>;
  }

  const tableContent = (
    <>
      {title && <h3 className="chart-title mb-4">{title}</h3>}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="data-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} onClick={() => handleSort(col.key)} className={col.className}>
                  {col.label}
                  <SortIcon field={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((competitor) => (
              <Fragment key={competitor.id}>
                <tr
                  onClick={() => handleRowClick(competitor.id)}
                  className="cursor-pointer hover:bg-navy-800/50 transition-colors"
                >
                  <td className="text-slate-100 font-medium whitespace-nowrap">{competitor.company}</td>
                  <td className="text-teal-400 whitespace-nowrap">{competitor.asset_name}</td>
                  <td>
                    <span className={`phase-badge ${PHASE_CLASSES[competitor.phase] ?? 'phase-preclinical'}`}>
                      {competitor.phase}
                    </span>
                  </td>
                  <td className="max-w-[160px] truncate">{competitor.mechanism}</td>
                  <td className="max-w-[160px] truncate text-slate-400">{competitor.primary_endpoint || '\u2014'}</td>
                  <td className="max-w-[200px] truncate text-slate-400">{competitor.key_data || '\u2014'}</td>
                  <td className="text-slate-400 whitespace-nowrap">{competitor.partner || '\u2014'}</td>
                  <td className="numeric font-mono text-xs">{competitor.partnership_deal_value || '\u2014'}</td>
                  <td className={`numeric font-mono text-xs ${getScoreColorClass(competitor.differentiation_score)}`}>
                    {competitor.differentiation_score}
                  </td>
                  <td className={`numeric font-mono text-xs ${getScoreColorClass(competitor.evidence_strength)}`}>
                    {competitor.evidence_strength}
                  </td>
                  <td className="numeric font-mono text-xs text-slate-400">
                    {competitor.estimated_peak_sales || '\u2014'}
                  </td>
                </tr>

                {/* Expanded detail row */}
                {expandedId === competitor.id && (
                  <tr className="bg-navy-800/30">
                    <td colSpan={COLUMNS.length} className="!p-0">
                      <div className="px-6 py-5 space-y-4 border-t border-navy-700/30">
                        {/* Key Data (full, unwrapped) */}
                        {competitor.key_data && (
                          <div>
                            <p className="text-2xs uppercase tracking-wider text-slate-500 mb-1">Key Data</p>
                            <p className="text-sm text-slate-300 leading-relaxed">{competitor.key_data}</p>
                          </div>
                        )}

                        {/* Strengths & Weaknesses grid */}
                        <div className="grid grid-cols-2 gap-6">
                          {/* Strengths */}
                          <div>
                            <p className="text-2xs uppercase tracking-wider text-slate-500 mb-1.5">Strengths</p>
                            {competitor.strengths.length > 0 ? (
                              <ul className="space-y-1">
                                {competitor.strengths.map((s, i) => (
                                  <li
                                    key={`strength-${s}-${i}`}
                                    className="flex items-start gap-1.5 text-xs text-slate-300"
                                  >
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-signal-green flex-shrink-0" />
                                    <span>{s}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-slate-500">{'\u2014'}</p>
                            )}
                          </div>

                          {/* Weaknesses */}
                          <div>
                            <p className="text-2xs uppercase tracking-wider text-slate-500 mb-1.5">Weaknesses</p>
                            {competitor.weaknesses.length > 0 ? (
                              <ul className="space-y-1">
                                {competitor.weaknesses.map((w, i) => (
                                  <li
                                    key={`weakness-${w}-${i}`}
                                    className="flex items-start gap-1.5 text-xs text-slate-300"
                                  >
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-signal-red flex-shrink-0" />
                                    <span>{w}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-slate-500">{'\u2014'}</p>
                            )}
                          </div>
                        </div>

                        {/* Peak Sales highlight */}
                        {competitor.estimated_peak_sales && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-teal-500/5 border border-teal-500/10 rounded-md w-fit">
                            <DollarSign className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                            <div>
                              <p className="text-2xs uppercase tracking-wider text-slate-500">Est. Peak Sales</p>
                              <p className="font-mono text-sm text-teal-400">{competitor.estimated_peak_sales}</p>
                            </div>
                          </div>
                        )}

                        {/* Indication Specifics */}
                        {competitor.indication_specifics && (
                          <div>
                            <p className="text-2xs uppercase tracking-wider text-slate-500 mb-1">
                              <FlaskConical className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                              Indication Specifics
                            </p>
                            <p className="text-xs text-slate-300">{competitor.indication_specifics}</p>
                          </div>
                        )}

                        {/* NCT IDs */}
                        {competitor.nct_ids && competitor.nct_ids.length > 0 && (
                          <div>
                            <p className="text-2xs uppercase tracking-wider text-slate-500 mb-1.5">Trial IDs</p>
                            <div className="flex flex-wrap gap-1.5">
                              {competitor.nct_ids.map((nctId) => (
                                <a
                                  key={nctId}
                                  href={`https://clinicaltrials.gov/study/${nctId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-2xs font-mono text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/15 rounded px-2 py-0.5 transition-colors"
                                >
                                  {nctId}
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  if (noCard) return <div>{tableContent}</div>;

  return <div className="card noise overflow-hidden">{tableContent}</div>;
}
