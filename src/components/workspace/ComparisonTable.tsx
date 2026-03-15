'use client';

import { Fragment, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import type { ComparisonRow } from '@/types';
import type { ReportSummary } from '@/lib/comparison';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface ComparisonTableProps {
  data: {
    reports: ReportSummary[];
    metrics: ComparisonRow[];
  };
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

/** Find the "best" (highest numeric) value index in a row — highlight it in teal. */
function findBestValueIndex(row: ComparisonRow): number | null {
  // Only highlight numeric values for relevant categories
  if (row.format === 'text') return null;

  let bestIdx: number | null = null;
  let bestVal = -Infinity;

  for (let i = 0; i < row.values.length; i++) {
    const v = row.values[i];
    const num = typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v.replace(/[$,BMK%]/g, '')) : NaN;
    if (!isNaN(num) && num > bestVal) {
      bestVal = num;
      bestIdx = i;
    }
  }

  // Only highlight if there are different values
  const uniqueNums = new Set(
    row.values
      .map((v) => {
        const num = typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v.replace(/[$,BMK%]/g, '')) : NaN;
        return isNaN(num) ? null : num;
      })
      .filter((n) => n !== null),
  );

  return uniqueNums.size > 1 ? bestIdx : null;
}

function formatValue(value: string | number | null, format?: ComparisonRow['format']): string {
  if (value === null || value === undefined) return '--';
  if (typeof value === 'string') return value;

  switch (format) {
    case 'currency':
      if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
      return `$${value.toLocaleString()}`;
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'number':
      return value.toLocaleString();
    default:
      return String(value);
  }
}

// ────────────────────────────────────────────────────────────
// Category header styling
// ────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  'Market Size': 'text-teal-400 border-teal-500/20',
  'Patient Funnel': 'text-blue-400 border-blue-500/20',
  Pricing: 'text-amber-400 border-amber-500/20',
  Competitive: 'text-red-400 border-red-500/20',
  Regulatory: 'text-purple-400 border-purple-500/20',
};

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export function ComparisonTable({ data }: ComparisonTableProps) {
  const { reports, metrics } = data;

  // Group metrics by category
  const grouped = useMemo(() => {
    const groups: { category: string; rows: ComparisonRow[] }[] = [];
    let currentCategory = '';
    let currentRows: ComparisonRow[] = [];

    for (const row of metrics) {
      if (row.category !== currentCategory) {
        if (currentRows.length > 0) {
          groups.push({ category: currentCategory, rows: currentRows });
        }
        currentCategory = row.category;
        currentRows = [];
      }
      currentRows.push(row);
    }

    if (currentRows.length > 0) {
      groups.push({ category: currentCategory, rows: currentRows });
    }

    return groups;
  }, [metrics]);

  if (metrics.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-slate-400">No comparable metrics found between these reports.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-navy-700/40">
      <table className="w-full">
        {/* Header: report names */}
        <thead>
          <tr className="border-b border-navy-700/60">
            <th className="sticky left-0 z-10 bg-navy-800 px-4 py-3 text-left text-xs font-medium text-slate-400 w-48">
              Metric
            </th>
            {reports.map((r) => (
              <th key={r.id} className="px-4 py-3 text-left min-w-[160px]">
                <div className="text-xs font-medium text-white truncate">{r.title}</div>
                <div className="text-2xs text-slate-500 truncate mt-0.5">{r.indication}</div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {grouped.map(({ category, rows }) => (
            <Fragment key={`section-${category}`}>
              {/* Category header row */}
              <tr>
                <td
                  colSpan={reports.length + 1}
                  className={cn(
                    'px-4 py-2 text-2xs font-semibold uppercase tracking-wider border-t',
                    CATEGORY_COLORS[category] ?? 'text-slate-400 border-slate-700/20',
                  )}
                >
                  {category}
                </td>
              </tr>
              {/* Metric rows */}
              {rows.map((row, rowIdx) => {
                const bestIdx = findBestValueIndex(row);
                return (
                  <tr
                    key={row.label}
                    className={cn(
                      'border-t border-navy-700/20 transition-colors hover:bg-navy-800/40',
                      rowIdx % 2 === 0 ? 'bg-navy-900/20' : 'bg-navy-900/40',
                    )}
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-4 py-2 text-xs text-slate-300 font-medium">
                      {row.label}
                    </td>
                    {row.values.map((val, colIdx) => (
                      <td
                        key={colIdx}
                        className={cn(
                          'px-4 py-2 text-xs font-mono',
                          val === null ? 'text-slate-600' : 'text-white',
                          colIdx === bestIdx && 'text-teal-400 font-semibold',
                        )}
                      >
                        {formatValue(val, row.format)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
