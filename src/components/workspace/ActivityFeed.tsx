'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Filter, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { ActivityItem, type ActivityRecord } from './ActivityItem';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface ActivityFeedProps {
  workspaceId: string;
}

type FilterMode = 'all' | 'mine';

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All actions' },
  { value: 'analysis_run', label: 'Analyses' },
  { value: 'report_created', label: 'Reports created' },
  { value: 'report_updated', label: 'Reports updated' },
  { value: 'report_deleted', label: 'Reports deleted' },
  { value: 'member_invited', label: 'Members invited' },
  { value: 'member_removed', label: 'Members removed' },
  { value: 'folder_created', label: 'Folders created' },
  { value: 'folder_deleted', label: 'Folders deleted' },
  { value: 'annotation_added', label: 'Annotations' },
  { value: 'template_created', label: 'Templates' },
  { value: 'settings_updated', label: 'Settings' },
];

const PAGE_SIZE = 50;

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export function ActivityFeed({ workspaceId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [actionFilter, setActionFilter] = useState('');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // ── Get current user ID ──────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    void supabase.auth.getUser().then((result: { data: { user: { id: string } | null } }) => {
      setCurrentUserId(result.data.user?.id ?? null);
    });
  }, []);

  // ── Fetch activities ─────────────────────────────────────
  const fetchActivities = useCallback(
    async (offset = 0, append = false) => {
      if (offset === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(offset),
        });

        if (filterMode === 'mine' && currentUserId) {
          params.set('user_id', currentUserId);
        }

        if (actionFilter) {
          params.set('action', actionFilter);
        }

        const res = await fetch(`/api/workspaces/${workspaceId}/activity?${params}`);
        if (!res.ok) throw new Error('Failed to fetch activity');

        const json = await res.json();
        if (json.success && json.data) {
          if (append) {
            setActivities((prev) => [...prev, ...json.data.activities]);
          } else {
            setActivities(json.data.activities);
          }
          setTotal(json.data.total);
        }
      } catch {
        toast.error('Failed to load activity feed');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [workspaceId, filterMode, actionFilter, currentUserId],
  );

  // Re-fetch when filters change
  useEffect(() => {
    fetchActivities(0, false);
  }, [fetchActivities]);

  // ── Realtime subscription ────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`workspace_activities:workspace_id=eq.${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workspace_activities',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          // Refresh from the top to get the new activity with profile data
          fetchActivities(0, false);
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [workspaceId, fetchActivities]);

  // ── Load more handler ────────────────────────────────────
  const handleLoadMore = () => {
    fetchActivities(activities.length, true);
  };

  const hasMore = activities.length < total;

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Filters toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* All / Mine toggle */}
        <div className="flex items-center bg-navy-900/60 border border-navy-700/40 rounded-lg overflow-hidden">
          <button
            onClick={() => setFilterMode('all')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              filterMode === 'all' ? 'bg-teal-500/15 text-teal-400' : 'text-slate-400 hover:text-white',
            )}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilterMode('mine')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              filterMode === 'mine' ? 'bg-teal-500/15 text-teal-400' : 'text-slate-400 hover:text-white',
            )}
          >
            My Activity
          </button>
        </div>

        {/* Action type dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900/60 border border-navy-700/40 rounded-lg text-xs text-slate-400 hover:text-white hover:border-navy-600 transition-all"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{ACTION_OPTIONS.find((o) => o.value === actionFilter)?.label ?? 'All actions'}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showActionMenu && (
            <div className="absolute left-0 top-full mt-1 z-40 bg-navy-800 border border-navy-700 rounded-lg shadow-xl py-1 min-w-[180px] max-h-[300px] overflow-y-auto">
              {ACTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setActionFilter(opt.value);
                    setShowActionMenu(false);
                  }}
                  className={cn(
                    'flex items-center w-full px-3 py-2 text-xs transition-colors',
                    actionFilter === opt.value
                      ? 'text-teal-400 bg-teal-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-navy-700',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Total count */}
        {!isLoading && (
          <span className="text-2xs font-mono text-slate-600 ml-auto">
            {total} {total === 1 ? 'event' : 'events'}
          </span>
        )}
      </div>

      {/* Activity list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-navy-900/40 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-navy-700/60 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-1">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="pt-3 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-navy-900/60 border border-navy-700/40 rounded-lg hover:border-navy-600 transition-all disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>Load more ({total - activities.length} remaining)</>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Filter}
          heading={actionFilter || filterMode === 'mine' ? 'No matching activity' : 'No activity yet'}
          description={
            actionFilter || filterMode === 'mine'
              ? 'Try adjusting your filters to see more activity.'
              : 'Activity will appear here as your team collaborates in this workspace.'
          }
          variant="inline"
        />
      )}

      {/* Close dropdown on outside click */}
      {showActionMenu && <div className="fixed inset-0 z-30" onClick={() => setShowActionMenu(false)} />}
    </div>
  );
}
