'use client';

import { useState, useMemo } from 'react';
import { Search, Check, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Report } from '@/types';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface ComparisonSelectorProps {
  reports: Report[];
  selected: string[];
  onSelectionChange: (ids: string[]) => void;
  maxSelection: number;
}

// ────────────────────────────────────────────────────────────
// Report type badge colors
// ────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  market_sizing: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  competitive: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  regulatory: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  partners: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  full: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
};

const TYPE_LABELS: Record<string, string> = {
  market_sizing: 'Market Sizing',
  competitive: 'Competitive',
  regulatory: 'Regulatory',
  partners: 'Partners',
  full: 'Full Report',
};

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export function ComparisonSelector({ reports, selected, onSelectionChange, maxSelection }: ComparisonSelectorProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return reports;
    const q = search.toLowerCase();
    return reports.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.indication.toLowerCase().includes(q) ||
        r.report_type.toLowerCase().includes(q),
    );
  }, [reports, search]);

  const toggleReport = (id: string) => {
    if (selected.includes(id)) {
      onSelectionChange(selected.filter((s) => s !== id));
    } else if (selected.length < maxSelection) {
      onSelectionChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reports by title, indication, or type..."
          className={cn(
            'w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white',
            'bg-navy-900/60 border border-navy-700/40',
            'placeholder:text-slate-600',
            'focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20',
            'transition-all',
          )}
        />
      </div>

      {/* Selection status */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {selected.length} of {maxSelection} selected
        </span>
        {selected.length >= 2 && (
          <span className="text-2xs text-teal-400 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Ready to compare
          </span>
        )}
      </div>

      {/* Report list */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-400">No reports match your search.</p>
          </div>
        ) : (
          filtered.map((report) => {
            const isSelected = selected.includes(report.id);
            const isDisabled = !isSelected && selected.length >= maxSelection;

            return (
              <button
                key={report.id}
                onClick={() => !isDisabled && toggleReport(report.id)}
                disabled={isDisabled}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all',
                  isSelected
                    ? 'bg-teal-500/10 border border-teal-500/30'
                    : 'bg-navy-900/40 border border-navy-700/30 hover:border-navy-600',
                  isDisabled && !isSelected && 'opacity-40 cursor-not-allowed',
                )}
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    'w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors',
                    isSelected ? 'bg-teal-500 border-teal-500' : 'border-navy-600 bg-navy-900/60',
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                {/* Report info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white truncate">{report.title}</span>
                    <span
                      className={cn(
                        'inline-flex px-1.5 py-0.5 rounded text-2xs font-medium border',
                        TYPE_COLORS[report.report_type] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/20',
                      )}
                    >
                      {TYPE_LABELS[report.report_type] ?? report.report_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xs text-slate-500 truncate">{report.indication}</span>
                    <span className="text-2xs text-slate-600">{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
