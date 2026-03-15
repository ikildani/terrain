'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Search, FolderPlus, FileText, ArrowUpDown, Calendar, SortAsc, SortDesc } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { FolderTree } from './FolderTree';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import type { ReportFolder, WorkspaceRole } from '@/types';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

/** Lightweight report shape returned by the workspace reports API. */
interface WorkspaceReport {
  id: string;
  title: string;
  report_type: string;
  indication: string;
  status: string;
  is_starred: boolean;
  tags: string[];
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ReportLibraryProps {
  workspaceId: string;
  myRole: WorkspaceRole | null;
}

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const REPORT_TYPE_COLORS: Record<string, string> = {
  market_sizing: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  competitive: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  regulatory: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  partners: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  full: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

const REPORT_TYPE_ROUTES: Record<string, string> = {
  market_sizing: '/market-sizing',
  competitive: '/competitive',
  regulatory: '/regulatory',
  partners: '/partners',
};

type SortField = 'created_at' | 'updated_at' | 'title';
type SortOrder = 'asc' | 'desc';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function formatReportType(reportType: string): string {
  return reportType
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getReportTypeBadgeClass(reportType: string): string {
  return REPORT_TYPE_COLORS[reportType] ?? REPORT_TYPE_COLORS.full;
}

function getReportHref(report: { id: string; report_type: string }): string {
  const base = REPORT_TYPE_ROUTES[report.report_type] ?? '/market-sizing';
  return `${base}/${report.id}`;
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export function ReportLibrary({ workspaceId, myRole }: ReportLibraryProps) {
  const [reports, setReports] = useState<WorkspaceReport[]>([]);
  const [folders, setFolders] = useState<ReportFolder[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const canManageFolders = myRole === 'owner' || myRole === 'admin' || myRole === 'analyst';

  // ── Fetch reports ───────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setIsLoadingReports(true);
    try {
      const params = new URLSearchParams({
        sort: sortField,
        order: sortOrder,
        limit: '100',
      });
      if (activeFolderId) {
        params.set('folder_id', activeFolderId);
      }

      const res = await fetch(`/api/workspaces/${workspaceId}/reports?${params}`);
      if (!res.ok) throw new Error('Failed to fetch reports');

      const json = await res.json();
      if (json.success) {
        setReports(json.data ?? []);
      }
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setIsLoadingReports(false);
    }
  }, [workspaceId, sortField, sortOrder, activeFolderId]);

  // ── Fetch folders ───────────────────────────────────────
  const fetchFolders = useCallback(async () => {
    setIsLoadingFolders(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/folders`);
      if (!res.ok) throw new Error('Failed to fetch folders');

      const json = await res.json();
      if (json.success) {
        setFolders(json.data ?? []);
      }
    } catch {
      toast.error('Failed to load folders');
    } finally {
      setIsLoadingFolders(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // ── Folder operations ──────────────────────────────────
  const handleCreateFolder = useCallback(async () => {
    const name = window.prompt('New folder name');
    if (!name?.trim()) return;

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Failed to create folder');
        return;
      }

      toast.success(`Folder "${name.trim()}" created`);
      fetchFolders();
    } catch {
      toast.error('Failed to create folder');
    }
  }, [workspaceId, fetchFolders]);

  const handleRenameFolder = useCallback(
    async (folderId: string, newName: string) => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/folders`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: folderId, name: newName }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error(json.error ?? 'Failed to rename folder');
          return;
        }

        toast.success('Folder renamed');
        fetchFolders();
      } catch {
        toast.error('Failed to rename folder');
      }
    },
    [workspaceId, fetchFolders],
  );

  const handleDeleteFolder = useCallback(
    async (folderId: string) => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/folders?folderId=${folderId}`, {
          method: 'DELETE',
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error(json.error ?? 'Failed to delete folder');
          return;
        }

        toast.success('Folder deleted');
        if (activeFolderId === folderId) {
          setActiveFolderId(null);
        }
        fetchFolders();
        fetchReports();
      } catch {
        toast.error('Failed to delete folder');
      }
    },
    [workspaceId, activeFolderId, fetchFolders, fetchReports],
  );

  // ── Derived data ───────────────────────────────────────
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.indication.toLowerCase().includes(q) ||
        r.report_type.toLowerCase().includes(q),
    );
  }, [reports, searchQuery]);

  // Count reports per folder (from all reports, not just filtered)
  const reportCountsByFolder = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reports) {
      if (r.folder_id) {
        counts[r.folder_id] = (counts[r.folder_id] ?? 0) + 1;
      }
    }
    return counts;
  }, [reports]);

  const isLoading = isLoadingReports || isLoadingFolders;

  // ── Sort menu items ────────────────────────────────────
  const sortOptions: { label: string; field: SortField; order: SortOrder }[] = [
    { label: 'Newest first', field: 'created_at', order: 'desc' },
    { label: 'Oldest first', field: 'created_at', order: 'asc' },
    { label: 'Recently updated', field: 'updated_at', order: 'desc' },
    { label: 'Title A-Z', field: 'title', order: 'asc' },
    { label: 'Title Z-A', field: 'title', order: 'desc' },
  ];

  return (
    <div className="flex gap-6 min-h-[400px]">
      {/* ── Left Panel: Folder Tree ────────────────────────── */}
      <div className="w-[240px] shrink-0">
        <div className="sticky top-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="label text-slate-500">Folders</h3>
            {canManageFolders && (
              <button
                onClick={handleCreateFolder}
                className="p-1 rounded hover:bg-navy-800 transition-colors"
                aria-label="New folder"
              >
                <FolderPlus className="w-3.5 h-3.5 text-slate-500 hover:text-teal-500 transition-colors" />
              </button>
            )}
          </div>

          {isLoadingFolders ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-7 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <FolderTree
              folders={folders}
              activeFolderId={activeFolderId}
              onSelect={setActiveFolderId}
              reportCountsByFolder={reportCountsByFolder}
              totalReportCount={reports.length}
              canManageFolders={canManageFolders}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
            />
          )}
        </div>
      </div>

      {/* ── Right Panel: Report Grid ───────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-navy-900/60 border border-navy-700/40 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1.5 px-3 py-2 bg-navy-900/60 border border-navy-700/40 rounded-lg text-xs text-slate-400 hover:text-white hover:border-navy-600 transition-all"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sort</span>
            </button>

            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 z-40 bg-navy-800 border border-navy-700 rounded-lg shadow-xl py-1 min-w-[160px]">
                {sortOptions.map((opt) => {
                  const isActive = sortField === opt.field && sortOrder === opt.order;
                  return (
                    <button
                      key={`${opt.field}-${opt.order}`}
                      onClick={() => {
                        setSortField(opt.field);
                        setSortOrder(opt.order);
                        setShowSortMenu(false);
                      }}
                      className={cn(
                        'flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors',
                        isActive ? 'text-teal-400 bg-teal-500/10' : 'text-slate-400 hover:text-white hover:bg-navy-700',
                      )}
                    >
                      {opt.order === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* New Folder (mobile) */}
          {canManageFolders && (
            <button
              onClick={handleCreateFolder}
              className="flex items-center gap-1.5 px-3 py-2 bg-navy-900/60 border border-navy-700/40 rounded-lg text-xs text-slate-400 hover:text-white hover:border-navy-600 transition-all sm:hidden"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Report Grid */}
        {isLoadingReports ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card noise animate-pulse">
                <div className="h-3 w-20 bg-navy-700/60 rounded mb-3" />
                <div className="h-5 w-48 bg-navy-700/60 rounded mb-2" />
                <div className="h-3 w-32 bg-navy-700/40 rounded mb-4" />
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 bg-navy-700/40 rounded" />
                  <div className="h-3 w-24 bg-navy-700/30 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <Link
                key={report.id}
                href={getReportHref(report)}
                className="card noise group hover:border-teal-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-teal-sm"
              >
                {/* Report type badge */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${getReportTypeBadgeClass(report.report_type)}`}
                  >
                    {formatReportType(report.report_type)}
                  </span>
                  {report.status === 'draft' && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Draft
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors line-clamp-2 mb-1">
                  {report.title}
                </h4>

                {/* Indication */}
                {report.indication && (
                  <p className="text-xs text-teal-500/80 font-medium mb-3 truncate">{report.indication}</p>
                )}

                {/* Footer: date */}
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-navy-700/30">
                  <Calendar className="w-3 h-3 text-slate-600" />
                  <span className="text-2xs font-mono text-slate-600">
                    {new Date(report.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            heading={searchQuery ? 'No reports match your search' : 'No reports yet'}
            description={
              searchQuery
                ? 'Try adjusting your search terms or clearing the filter.'
                : 'Run an analysis to get started. Reports shared to this workspace will appear here.'
            }
            cta={!searchQuery ? { label: 'New Market Analysis', href: '/market-sizing' } : undefined}
          />
        )}
      </div>

      {/* Close sort menu on outside click */}
      {showSortMenu && <div className="fixed inset-0 z-30" onClick={() => setShowSortMenu(false)} />}
    </div>
  );
}
