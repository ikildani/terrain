'use client';

import { useState, useCallback } from 'react';
import { BarChart3, Loader2, Download, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { useWorkspace } from '@/hooks/useWorkspace';
import { ComparisonSelector } from '@/components/workspace/ComparisonSelector';
import { ComparisonTable } from '@/components/workspace/ComparisonTable';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Report, ComparisonRow } from '@/types';
import type { ReportSummary } from '@/lib/comparison';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface ComparisonResult {
  reports: ReportSummary[];
  metrics: ComparisonRow[];
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export default function ComparePage() {
  const { activeWorkspaceId, isLoading: wsLoading } = useWorkspace();

  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsFetched, setReportsFetched] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  // ── Fetch workspace reports ───────────────────────────────
  const fetchReports = useCallback(async () => {
    if (!activeWorkspaceId) return;
    setReportsLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/reports?limit=100`);
      if (!res.ok) throw new Error('Failed to fetch reports');

      const json = await res.json();
      if (json.success && json.data) {
        setReports(json.data);
      }
    } catch {
      toast.error('Failed to load workspace reports');
    } finally {
      setReportsLoading(false);
      setReportsFetched(true);
    }
  }, [activeWorkspaceId]);

  // Fetch reports once workspace is available
  if (activeWorkspaceId && !reportsFetched && !reportsLoading) {
    fetchReports();
  }

  // ── Run comparison ────────────────────────────────────────
  const handleCompare = useCallback(async () => {
    if (selected.length < 2) {
      toast.error('Select at least 2 reports to compare');
      return;
    }

    setIsComparing(true);
    try {
      const res = await fetch('/api/reports/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_ids: selected }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? 'Comparison failed');
      }

      const json = await res.json();
      if (json.success && json.data) {
        setComparison(json.data);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Comparison failed');
    } finally {
      setIsComparing(false);
    }
  }, [selected]);

  // ── Export comparison ─────────────────────────────────────
  const handleExport = useCallback(() => {
    if (!comparison) return;

    // Build CSV
    const headers = ['Metric', 'Category', ...comparison.reports.map((r) => r.title)];
    const rows = comparison.metrics.map((row) => [
      row.label,
      row.category,
      ...row.values.map((v) => (v === null ? '' : String(v))),
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terrain-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Comparison exported');
  }, [comparison]);

  // ── Loading state ─────────────────────────────────────────
  if (wsLoading || reportsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!activeWorkspaceId) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
        <BarChart3 className="w-10 h-10 text-slate-600 mb-4" />
        <p className="text-sm text-slate-400 mb-1">No active workspace</p>
        <p className="text-2xs text-slate-600">Join or create a workspace to compare reports.</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 className="w-5 h-5 text-teal-400" />
          <h1 className="text-lg font-semibold text-white font-display">Compare Reports</h1>
        </div>
        <p className="text-sm text-slate-400">Select 2-4 reports to compare key metrics side by side.</p>
      </div>

      {/* Comparison result or selector */}
      {comparison ? (
        <div className="space-y-4">
          {/* Back + export buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setComparison(null);
                setSelected([]);
              }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Select different reports
            </button>

            <button
              onClick={handleExport}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                'bg-navy-800 border border-navy-700/60 text-slate-300 hover:text-white hover:border-navy-600',
              )}
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          <ComparisonTable data={comparison} />
        </div>
      ) : (
        <div className="space-y-4">
          <ComparisonSelector reports={reports} selected={selected} onSelectionChange={setSelected} maxSelection={4} />

          {/* Compare button */}
          <button
            onClick={handleCompare}
            disabled={selected.length < 2 || isComparing}
            className={cn(
              'w-full py-2.5 rounded-lg text-sm font-medium transition-all',
              selected.length >= 2
                ? 'bg-teal-500 text-white hover:bg-teal-400'
                : 'bg-navy-800 text-slate-600 cursor-not-allowed',
            )}
          >
            {isComparing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Comparing...
              </span>
            ) : (
              `Compare ${selected.length} Report${selected.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
