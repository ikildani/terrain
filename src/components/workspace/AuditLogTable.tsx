'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/Skeleton';
import { AuditLogFilters, type AuditFilters } from '@/components/workspace/AuditLogFilters';
import { cn } from '@/lib/utils/cn';
import type { AuditEntry, WorkspaceMember } from '@/types';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface AuditLogTableProps {
  workspaceId: string;
  members: WorkspaceMember[];
}

const PAGE_SIZE = 50;

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getDisplayName(name?: string, email?: string): string {
  if (name) return name;
  if (email) return email.split('@')[0] ?? email;
  return 'System';
}

function renderDiff(label: string, value: Record<string, unknown> | null) {
  if (!value || Object.keys(value).length === 0) return null;
  return (
    <div className="mt-1">
      <span className="text-2xs font-mono text-slate-600 uppercase">{label}:</span>
      <pre className="text-2xs font-mono text-slate-400 mt-0.5 whitespace-pre-wrap break-all">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export function AuditLogTable({ workspaceId, members }: AuditLogTableProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditFilters>({
    from: '',
    to: '',
    user_id: '',
    action: '',
  });

  // ── Fetch entries ────────────────────────────────────────
  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(offset));

      if (filters.user_id) params.set('user_id', filters.user_id);
      if (filters.action) params.set('action', filters.action);
      if (filters.from) params.set('from', new Date(filters.from).toISOString());
      if (filters.to) {
        const toDate = new Date(filters.to);
        toDate.setHours(23, 59, 59, 999);
        params.set('to', toDate.toISOString());
      }

      const res = await fetch(`/api/workspaces/${workspaceId}/audit?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch audit log');

      const json = await res.json();
      if (json.success) {
        setEntries(json.data.entries);
        setTotal(json.data.total);
      }
    } catch {
      toast.error('Failed to load audit log');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, offset, filters]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // ── Filter change handler ────────────────────────────────
  function handleFilterChange(updated: AuditFilters) {
    setFilters(updated);
    setOffset(0);
  }

  // ── CSV export handler ───────────────────────────────────
  async function handleExportCSV() {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '10000');
      params.set('offset', '0');
      if (filters.user_id) params.set('user_id', filters.user_id);
      if (filters.action) params.set('action', filters.action);
      if (filters.from) params.set('from', new Date(filters.from).toISOString());
      if (filters.to) {
        const toDate = new Date(filters.to);
        toDate.setHours(23, 59, 59, 999);
        params.set('to', toDate.toISOString());
      }

      const res = await fetch(`/api/workspaces/${workspaceId}/audit?${params.toString()}`, {
        headers: { Accept: 'text/csv' },
      });

      if (!res.ok) throw new Error('Export failed');

      const csv = await res.text();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success('Audit log exported');
    } catch {
      toast.error('Failed to export audit log');
    } finally {
      setIsExporting(false);
    }
  }

  // ── Pagination ───────────────────────────────────────────
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  // ── Loading skeleton ─────────────────────────────────────
  if (isLoading && entries.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex gap-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-36" />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="card noise animate-pulse p-3 flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <AuditLogFilters
        onFilterChange={handleFilterChange}
        members={members}
        onExportCSV={handleExportCSV}
        isExporting={isExporting}
      />

      {/* Table */}
      <div className="card noise overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-700">
                <th className="px-4 py-3 text-left text-2xs font-semibold text-slate-500 uppercase tracking-wider w-8" />
                <th className="px-4 py-3 text-left text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-4 py-3 text-left text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500 text-sm">
                    No audit log entries found.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  const hasDiff = entry.old_value || entry.new_value;

                  return (
                    <tr key={entry.id} className="group">
                      <td colSpan={6} className="p-0">
                        <button
                          onClick={() => hasDiff && setExpandedId(isExpanded ? null : entry.id)}
                          className={cn(
                            'w-full text-left px-0 py-0 transition-colors',
                            hasDiff ? 'cursor-pointer hover:bg-navy-900/40' : 'cursor-default',
                          )}
                          aria-expanded={isExpanded}
                          aria-label={hasDiff ? 'Toggle details' : undefined}
                          disabled={!hasDiff}
                        >
                          <div className="flex items-center">
                            <div className="px-4 py-2.5 w-8 shrink-0">
                              {hasDiff ? (
                                isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                                )
                              ) : null}
                            </div>
                            <div className="px-4 py-2.5 font-mono text-2xs text-slate-400 whitespace-nowrap w-44 shrink-0">
                              {formatTimestamp(entry.created_at)}
                            </div>
                            <div className="px-4 py-2.5 text-slate-300 w-40 truncate shrink-0">
                              {getDisplayName(entry.user_name, entry.user_email)}
                            </div>
                            <div className="px-4 py-2.5 w-40 shrink-0">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                {formatAction(entry.action)}
                              </span>
                            </div>
                            <div className="px-4 py-2.5 text-slate-400 text-2xs font-mono w-40 truncate shrink-0">
                              {entry.resource_type
                                ? `${entry.resource_type}/${entry.resource_id?.slice(0, 8) ?? ''}`
                                : '-'}
                            </div>
                            <div className="px-4 py-2.5 text-slate-500 text-2xs font-mono whitespace-nowrap">
                              {entry.ip_address ?? '-'}
                            </div>
                          </div>
                        </button>

                        {/* Expanded diff */}
                        {isExpanded && hasDiff && (
                          <div className="px-12 pb-3 bg-navy-900/30 border-t border-navy-700/30">
                            <div className="grid grid-cols-2 gap-4 pt-3">
                              {renderDiff('Previous value', entry.old_value)}
                              {renderDiff('New value', entry.new_value)}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-navy-700">
            <p className="text-2xs text-slate-500 font-mono">
              {offset + 1}-{Math.min(offset + PAGE_SIZE, total)} of {total} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={offset === 0}
                className="btn btn-sm bg-navy-800 border border-navy-700 text-slate-400 disabled:opacity-40 hover:text-white text-xs"
              >
                Previous
              </button>
              <span className="text-2xs text-slate-500 font-mono">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={offset + PAGE_SIZE >= total}
                className="btn btn-sm bg-navy-800 border border-navy-700 text-slate-400 disabled:opacity-40 hover:text-white text-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
