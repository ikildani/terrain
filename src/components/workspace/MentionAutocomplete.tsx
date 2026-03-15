'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import type { WorkspaceMember } from '@/types';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface MentionAutocompleteProps {
  query: string;
  members: WorkspaceMember[];
  onSelect: (member: WorkspaceMember) => void;
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export function MentionAutocomplete({ query, members, onSelect }: MentionAutocompleteProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter members by query
  const filtered = members.filter((m) => {
    const q = query.toLowerCase();
    const name = (m.full_name ?? '').toLowerCase();
    const email = (m.email ?? '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  // Reset active index when query or results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query, filtered.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (filtered.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect(filtered[activeIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        // Parent will handle closing
      }
    },
    [filtered, activeIndex, onSelect],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const activeEl = list.children[activeIndex] as HTMLElement | undefined;
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={listRef}
      className="absolute bottom-full left-0 mb-1 z-50 w-64 max-h-48 overflow-y-auto bg-navy-800 border border-navy-700 rounded-lg shadow-xl py-1"
    >
      {filtered.map((member, idx) => (
        <button
          key={member.user_id}
          onClick={() => onSelect(member)}
          onMouseEnter={() => setActiveIndex(idx)}
          className={cn(
            'flex flex-col w-full px-3 py-2 text-left transition-colors',
            idx === activeIndex ? 'bg-teal-500/10 text-teal-400' : 'text-slate-300 hover:bg-navy-700',
          )}
        >
          <span className="text-xs font-medium truncate">{member.full_name || 'Unnamed'}</span>
          <span className="text-2xs text-slate-500 truncate">{member.email}</span>
        </button>
      ))}
    </div>
  );
}
