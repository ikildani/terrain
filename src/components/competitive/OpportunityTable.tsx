'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatNumber } from '@/lib/utils/format';
import { OpportunityScoreBar, CrowdingIndicator } from './OpportunityScoreBar';
import { OpportunityDetailPanel } from './OpportunityDetailPanel';
import type { OpportunityRow } from '@/lib/analytics/screener';

// ── Types ──────────────────────────────────────────────────

type SortField =
  | 'opportunity_score'
  | 'global_prevalence'
  | 'crowding_score'
  | 'competitor_count'
  | 'cagr_5yr'
  | 'treatment_rate'
  | 'indication'
  | 'therapy_area';

interface OpportunityTableProps {
  rows: OpportunityRow[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  isLoading?: boolean;
}

// ── Phase distribution bar ─────────────────────────────────

function PhaseBar({ distribution }: { distribution: OpportunityRow['phase_distribution'] }) {
  const total =
    distribution.approved + distribution.phase3 + distribution.phase2 + distribution.phase1 + distribution.preclinical;
  if (total === 0) return <span className="text-[10px] text-slate-600">—</span>;

  const segments = [
    { count: distribution.approved, color: 'bg-emerald-400', label: 'Approved' },
    { count: distribution.phase3, color: 'bg-teal-400', label: 'Ph3' },
    { count: distribution.phase2, color: 'bg-blue-400', label: 'Ph2' },
    { count: distribution.phase1, color: 'bg-violet-400', label: 'Ph1' },
    { count: distribution.preclinical, color: 'bg-slate-500', label: 'Pre' },
  ].filter((s) => s.count > 0);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex h-1.5 w-16 rounded-full overflow-hidden bg-navy-700/40">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={cn('h-full', seg.color)}
            style={{ width: `${(seg.count / total) * 100}%` }}
            title={`${seg.label}: ${seg.count}`}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] text-slate-500 tabular-nums">{total}</span>
    </div>
  );
}

// ── Sort header ────────────────────────────────────────────

function SortHeader({
  field,
  label,
  currentSort,
  currentOrder,
  onSort,
  align = 'left',
}: {
  field: SortField;
  label: string;
  currentSort: string;
  currentOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  align?: 'left' | 'right';
}) {
  const isActive = currentSort === field;

  return (
    <th
      className={cn(
        'py-2.5 pr-3 text-[10px] font-mono uppercase tracking-wider cursor-pointer select-none transition-colors group',
        align === 'right' ? 'text-right' : 'text-left',
        isActive ? 'text-teal-400' : 'text-slate-600 hover:text-slate-400',
      )}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (
          currentOrder === 'desc' ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronUp className="w-3 h-3" />
          )
        ) : (
          <ChevronsUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </span>
    </th>
  );
}

// ── Main Table ─────────────────────────────────────────────

export function OpportunityTable({ rows, sortBy, sortOrder, onSort, isLoading }: OpportunityTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = useCallback((indication: string) => {
    setExpandedRow((prev) => (prev === indication ? null : indication));
  }, []);

  if (rows.length === 0 && !isLoading) {
    return (
      <div className="card noise p-12 text-center">
        <ArrowUpDown className="w-10 h-10 text-navy-600 mx-auto mb-3" />
        <h3 className="font-display text-lg text-white mb-2">No Opportunities Found</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Adjust your filters to see opportunities. Try removing phase or therapy area filters, or lowering the minimum
          score threshold.
        </p>
      </div>
    );
  }

  return (
    <div className="card noise overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-navy-700/60">
              <th className="w-8" />
              <SortHeader
                field="indication"
                label="Indication"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSort={onSort}
              />
              <SortHeader
                field="therapy_area"
                label="Therapy Area"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSort={onSort}
              />
              <SortHeader
                field="opportunity_score"
                label="Score"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSort={onSort}
              />
              <SortHeader
                field="global_prevalence"
                label="Global Prev."
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSort={onSort}
                align="right"
              />
              <SortHeader
                field="crowding_score"
                label="Crowding"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSort={onSort}
              />
              <SortHeader
                field="competitor_count"
                label="Competitors"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSort={onSort}
                align="right"
              />
              <th className="py-2.5 pr-3 text-left text-[10px] font-mono uppercase tracking-wider text-slate-600">
                Phase Dist.
              </th>
              <SortHeader
                field="treatment_rate"
                label="Tx Rate"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSort={onSort}
                align="right"
              />
              <SortHeader
                field="cagr_5yr"
                label="CAGR"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSort={onSort}
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isExpanded = expandedRow === row.indication;
              return (
                <>
                  <tr
                    key={row.indication}
                    onClick={() => toggleRow(row.indication)}
                    className={cn(
                      'border-b border-navy-700/20 cursor-pointer transition-colors',
                      isExpanded ? 'bg-navy-800/40' : 'hover:bg-navy-800/20',
                    )}
                  >
                    {/* Expand chevron */}
                    <td className="pl-3 pr-1 py-2.5">
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 text-slate-500 transition-transform duration-200',
                          isExpanded && 'rotate-180 text-teal-400',
                        )}
                      />
                    </td>

                    {/* Indication */}
                    <td className="py-2.5 pr-3">
                      <div>
                        <span className="text-slate-200 font-medium">{row.indication}</span>
                        {row.top_competitors.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                            {row.top_competitors.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Therapy Area */}
                    <td className="py-2.5 pr-3">
                      <span className="px-1.5 py-0.5 rounded bg-navy-700/40 text-[10px] text-slate-400 capitalize whitespace-nowrap">
                        {row.therapy_area}
                      </span>
                    </td>

                    {/* Opportunity Score */}
                    <td className="py-2.5 pr-3 min-w-[140px]">
                      <OpportunityScoreBar score={row.opportunity_score} size="sm" />
                    </td>

                    {/* Global Prevalence */}
                    <td className="py-2.5 pr-3 text-right font-mono text-slate-300 tabular-nums whitespace-nowrap">
                      {row.global_prevalence >= 1e6
                        ? `${(row.global_prevalence / 1e6).toFixed(1)}M`
                        : row.global_prevalence >= 1e3
                          ? `${(row.global_prevalence / 1e3).toFixed(0)}K`
                          : formatNumber(row.global_prevalence)}
                    </td>

                    {/* Crowding */}
                    <td className="py-2.5 pr-3">
                      <CrowdingIndicator score={row.crowding_score} label={row.crowding_label} />
                    </td>

                    {/* Competitors */}
                    <td className="py-2.5 pr-3 text-right font-mono text-slate-300 tabular-nums">
                      {row.competitor_count}
                    </td>

                    {/* Phase Distribution */}
                    <td className="py-2.5 pr-3">
                      <PhaseBar distribution={row.phase_distribution} />
                    </td>

                    {/* Treatment Rate */}
                    <td className="py-2.5 pr-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <span className={row.treatment_rate < 0.5 ? 'text-amber-400' : 'text-slate-300'}>
                        {(row.treatment_rate * 100).toFixed(0)}%
                      </span>
                    </td>

                    {/* CAGR */}
                    <td className="py-2.5 pr-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <span className={row.cagr_5yr >= 8 ? 'text-emerald-400' : 'text-slate-300'}>
                        {row.cagr_5yr.toFixed(1)}%
                      </span>
                    </td>
                  </tr>

                  {/* Expanded detail panel */}
                  <OpportunityDetailPanel
                    key={`detail-${row.indication}`}
                    indication={row.indication}
                    scoreBreakdown={row.score_breakdown}
                    isOpen={isExpanded}
                  />
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
