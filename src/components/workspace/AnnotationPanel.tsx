'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { X, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { AnnotationThread } from './AnnotationThread';
import { AnnotationInput } from './AnnotationInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { Annotation } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface AnnotationPanelProps {
  reportId: string;
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export function AnnotationPanel({ reportId, workspaceId, isOpen, onClose }: AnnotationPanelProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { members } = useWorkspace();

  // ── Get current user ──────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    void supabase.auth.getUser().then((result: { data: { user: { id: string } | null } }) => {
      setCurrentUserId(result.data.user?.id ?? null);
    });
  }, []);

  // ── Fetch annotations ─────────────────────────────────────
  const fetchAnnotations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/annotations`);
      if (!res.ok) throw new Error('Failed to fetch annotations');

      const json = await res.json();
      if (json.success && json.data) {
        setAnnotations(json.data);
      }
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (isOpen) {
      fetchAnnotations();
    }
  }, [isOpen, fetchAnnotations]);

  // ── Realtime subscription ─────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`report_annotations:report_id=eq.${reportId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'report_annotations',
          filter: `report_id=eq.${reportId}`,
        },
        () => {
          // Refresh to get full profile data
          fetchAnnotations();
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
  }, [isOpen, reportId, fetchAnnotations]);

  // ── Group annotations by section ──────────────────────────
  const { grouped, totalCount } = useMemo(() => {
    const topLevel = annotations.filter((a) => !a.parent_id);
    const repliesMap = new Map<string, Annotation[]>();

    for (const a of annotations) {
      if (a.parent_id) {
        const existing = repliesMap.get(a.parent_id) ?? [];
        existing.push(a);
        repliesMap.set(a.parent_id, existing);
      }
    }

    // Group by section_key
    const sections = new Map<string, { annotation: Annotation; replies: Annotation[] }[]>();
    for (const a of topLevel) {
      const key = a.section_key ?? 'General';
      const existing = sections.get(key) ?? [];
      existing.push({ annotation: a, replies: repliesMap.get(a.id) ?? [] });
      sections.set(key, existing);
    }

    return { grouped: sections, totalCount: annotations.length };
  }, [annotations]);

  // ── Submit new annotation ─────────────────────────────────
  const handleSubmit = useCallback(
    async (content: string, mentions: string[], parentId?: string) => {
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/reports/${reportId}/annotations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            mentions,
            parent_id: parentId,
          }),
        });

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          throw new Error(json?.error ?? 'Failed to post comment');
        }

        // Will be picked up by Realtime, but do an optimistic refresh
        await fetchAnnotations();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to post comment');
      } finally {
        setIsSubmitting(false);
      }
    },
    [reportId, fetchAnnotations],
  );

  // ── Resolve / unresolve ───────────────────────────────────
  const handleResolve = useCallback(
    async (annotationId: string, resolved: boolean) => {
      try {
        const res = await fetch(`/api/reports/${reportId}/annotations/${annotationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolved }),
        });

        if (!res.ok) throw new Error('Failed to update');
        await fetchAnnotations();
      } catch {
        toast.error('Failed to update annotation');
      }
    },
    [reportId, fetchAnnotations],
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <div
      className={cn(
        'fixed top-0 right-0 h-full w-[400px] z-50',
        'bg-navy-900 border-l border-navy-700/60',
        'shadow-2xl shadow-black/40',
        'transition-transform duration-300 ease-in-out',
        'flex flex-col',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700/40">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-medium text-white">Comments</span>
          {totalCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-teal-500/15 text-teal-400 text-2xs font-mono">
              {totalCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2.5 animate-pulse">
                <div className="w-7 h-7 rounded-full bg-navy-700/60 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="w-8 h-8 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400 mb-1">No comments yet</p>
            <p className="text-2xs text-slate-600">Be the first to add a comment on this report.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {Array.from(grouped.entries()).map(([sectionKey, threads]) => (
              <div key={sectionKey}>
                {/* Section header */}
                <div className="sticky top-0 z-10 bg-navy-900/95 backdrop-blur-sm py-1.5 mb-1">
                  <span className="text-2xs font-medium text-slate-500 uppercase tracking-wider">{sectionKey}</span>
                </div>

                {threads.map(({ annotation, replies }) => (
                  <AnnotationThread
                    key={annotation.id}
                    annotation={annotation}
                    replies={replies}
                    workspaceId={workspaceId}
                    members={members}
                    currentUserId={currentUserId ?? undefined}
                    onReply={(content, mentions) => handleSubmit(content, mentions, annotation.id)}
                    onResolve={handleResolve}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-navy-700/40">
        {isSubmitting && (
          <div className="flex items-center gap-2 text-2xs text-slate-500 mb-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Posting...
          </div>
        )}
        <AnnotationInput
          onSubmit={(content, mentions) => handleSubmit(content, mentions)}
          members={members}
          placeholder="Add a comment... (@ to mention)"
        />
      </div>
    </div>
  );
}
