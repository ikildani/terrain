'use client';

import { useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { MentionAutocomplete } from './MentionAutocomplete';
import type { WorkspaceMember } from '@/types';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface AnnotationInputProps {
  onSubmit: (content: string, mentions: string[]) => void;
  members: WorkspaceMember[];
  placeholder?: string;
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export function AnnotationInput({ onSubmit, members, placeholder }: AnnotationInputProps) {
  const [content, setContent] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIds, setMentionIds] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect @ mentions in the content
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    // Check for @mention trigger
    const cursorPos = e.target.selectionStart;
    const textBefore = value.slice(0, cursorPos);
    const atMatch = textBefore.match(/@(\w*)$/);

    if (atMatch) {
      setMentionQuery(atMatch[1]);
    } else {
      setMentionQuery(null);
    }
  }, []);

  const handleMentionSelect = useCallback(
    (member: WorkspaceMember) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursorPos = textarea.selectionStart;
      const textBefore = content.slice(0, cursorPos);
      const textAfter = content.slice(cursorPos);

      // Replace @query with @name
      const atIndex = textBefore.lastIndexOf('@');
      const displayName = member.full_name || member.email || 'user';
      const newBefore = textBefore.slice(0, atIndex) + `@${displayName} `;
      const newContent = newBefore + textAfter;

      setContent(newContent);
      setMentionQuery(null);

      // Track mentioned user ID
      if (!mentionIds.includes(member.user_id)) {
        setMentionIds((prev) => [...prev, member.user_id]);
      }

      // Refocus textarea
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.selectionStart = newBefore.length;
          textarea.selectionEnd = newBefore.length;
        }
      }, 0);
    },
    [content, mentionIds],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Enter (unless Shift+Enter for newline, or autocomplete is open)
      if (e.key === 'Enter' && !e.shiftKey && mentionQuery === null) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [content, mentionIds, mentionQuery], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSubmit = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed) return;

    // Extract mention UUIDs from content — match @name patterns against members
    const extractedIds: string[] = [...mentionIds];
    for (const member of members) {
      const name = member.full_name || member.email;
      if (name && trimmed.includes(`@${name}`)) {
        if (!extractedIds.includes(member.user_id)) {
          extractedIds.push(member.user_id);
        }
      }
    }

    onSubmit(trimmed, extractedIds);
    setContent('');
    setMentionIds([]);
    setMentionQuery(null);
  }, [content, mentionIds, members, onSubmit]);

  return (
    <div className="relative">
      {/* Mention autocomplete dropdown */}
      {mentionQuery !== null && (
        <MentionAutocomplete query={mentionQuery} members={members} onSelect={handleMentionSelect} />
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'Add a comment... (@ to mention)'}
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-lg px-3 py-2 text-xs text-white',
            'bg-navy-900/80 border border-navy-700/60',
            'placeholder:text-slate-600',
            'focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20',
            'transition-all',
          )}
          style={{ minHeight: '36px', maxHeight: '120px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className={cn(
            'shrink-0 p-2 rounded-lg transition-all',
            content.trim()
              ? 'bg-teal-500 text-white hover:bg-teal-400'
              : 'bg-navy-800 text-slate-600 cursor-not-allowed',
          )}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
