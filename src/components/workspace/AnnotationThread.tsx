'use client';

import { useState } from 'react';
import { Check, Reply, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AnnotationInput } from './AnnotationInput';
import type { Annotation, WorkspaceMember } from '@/types';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface AnnotationThreadProps {
  annotation: Annotation;
  replies: Annotation[];
  workspaceId: string;
  members?: WorkspaceMember[];
  currentUserId?: string;
  onReply: (content: string, mentions: string[]) => void;
  onResolve?: (annotationId: string, resolved: boolean) => void;
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return (email ?? '?')[0].toUpperCase();
}

// ────────────────────────────────────────────────────────────
// Single annotation row
// ────────────────────────────────────────────────────────────

function AnnotationRow({
  annotation,
  isReply,
  currentUserId,
  onResolve,
  onReplyClick,
}: {
  annotation: Annotation;
  isReply?: boolean;
  currentUserId?: string;
  onResolve?: (id: string, resolved: boolean) => void;
  onReplyClick?: () => void;
}) {
  const initials = getInitials(annotation.user_name, annotation.user_email);
  const isResolved = annotation.resolved;

  return (
    <div className={cn('flex gap-2.5 py-2', isReply && 'ml-8 border-l border-navy-700/40 pl-3')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-2xs font-medium',
          isResolved ? 'bg-emerald-500/15 text-emerald-400' : 'bg-teal-500/15 text-teal-400',
        )}
      >
        {isResolved ? <Check className="w-3.5 h-3.5" /> : initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-white truncate">
            {annotation.user_name || annotation.user_email || 'Unknown'}
          </span>
          <span className="text-2xs text-slate-600 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {timeAgo(annotation.created_at)}
          </span>
        </div>

        <p
          className={cn(
            'text-xs leading-relaxed break-words',
            isResolved ? 'text-slate-500 line-through' : 'text-slate-300',
          )}
        >
          {annotation.content}
        </p>

        {/* Actions */}
        {!isReply && (
          <div className="flex items-center gap-3 mt-1.5">
            {onReplyClick && (
              <button
                onClick={onReplyClick}
                className="flex items-center gap-1 text-2xs text-slate-500 hover:text-teal-400 transition-colors"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
            )}

            {onResolve && (
              <button
                onClick={() => onResolve(annotation.id, !isResolved)}
                className={cn(
                  'flex items-center gap-1 text-2xs transition-colors',
                  isResolved ? 'text-emerald-400 hover:text-slate-400' : 'text-slate-500 hover:text-emerald-400',
                )}
              >
                <Check className="w-3 h-3" />
                {isResolved ? 'Resolved' : 'Resolve'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Thread component
// ────────────────────────────────────────────────────────────

export function AnnotationThread({
  annotation,
  replies,
  workspaceId: _workspaceId,
  members,
  currentUserId,
  onReply,
  onResolve,
}: AnnotationThreadProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [expanded, setExpanded] = useState(replies.length <= 2);

  const visibleReplies = expanded ? replies : replies.slice(0, 2);
  const hiddenCount = replies.length - visibleReplies.length;

  return (
    <div className="border-b border-navy-700/30 pb-2 last:border-b-0">
      <AnnotationRow
        annotation={annotation}
        currentUserId={currentUserId}
        onResolve={onResolve}
        onReplyClick={() => setShowReplyInput(!showReplyInput)}
      />

      {/* Collapsed replies indicator */}
      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="ml-8 pl-3 text-2xs text-teal-400 hover:text-teal-300 transition-colors py-1"
        >
          Show {hiddenCount} more {hiddenCount === 1 ? 'reply' : 'replies'}
        </button>
      )}

      {/* Replies */}
      {visibleReplies.map((reply) => (
        <AnnotationRow key={reply.id} annotation={reply} isReply currentUserId={currentUserId} />
      ))}

      {/* Reply input */}
      {showReplyInput && (
        <div className="ml-8 pl-3 pt-1">
          <AnnotationInput
            onSubmit={(content, mentions) => {
              onReply(content, mentions);
              setShowReplyInput(false);
            }}
            members={members ?? []}
            placeholder="Reply..."
          />
        </div>
      )}
    </div>
  );
}
