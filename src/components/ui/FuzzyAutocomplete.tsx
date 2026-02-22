'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { Search, Clock, TrendingUp, ChevronUp, CornerDownLeft } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────
export interface SuggestionItem {
  name: string;
  category?: string;
  detail?: string;
}

interface FuzzyAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  items: SuggestionItem[];
  popularItems?: string[];
  storageKey?: string;
  disabled?: boolean;
  error?: string;
}

// ── localStorage helpers ─────────────────────────────────────
const MAX_RECENT = 5;

function getRecent(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function saveRecent(key: string, name: string) {
  if (typeof window === 'undefined') return;
  const recent = getRecent(key).filter((n) => n !== name);
  recent.unshift(name);
  localStorage.setItem(key, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

// ── Fuzzy scoring (searches name + category) ─────────────────
function fuzzyScore(item: SuggestionItem, query: string): number {
  const q = query.toLowerCase();
  const name = item.name.toLowerCase();
  const cat = (item.category || '').toLowerCase();

  // Exact name match
  if (name === q) return 100;
  // Name starts with query
  if (name.startsWith(q)) return 90;
  // Category starts with query (e.g., "checkpoint" matches category "Checkpoint Inhibitor")
  if (cat.startsWith(q)) return 80;
  // Name contains query
  if (name.includes(q)) return 70;
  // Category contains query
  if (cat.includes(q)) return 65;

  // Multi-token matching across name + category
  const queryTokens = q.split(/\s+/);
  const targetTokens = [...name.split(/\s+/), ...cat.split(/\s+/)];
  let tokenScore = 0;
  for (const qt of queryTokens) {
    if (qt.length < 2) continue;
    for (const tt of targetTokens) {
      if (tt.startsWith(qt)) { tokenScore += 20; break; }
      if (tt.includes(qt)) { tokenScore += 10; break; }
    }
  }
  if (tokenScore > 0) return Math.min(60, tokenScore);

  // Character-level fuzzy (for typos)
  if (q.length >= 3) {
    let matches = 0;
    let lastIdx = -1;
    for (const ch of q) {
      const idx = name.indexOf(ch, lastIdx + 1);
      if (idx > -1) { matches++; lastIdx = idx; }
    }
    const ratio = matches / q.length;
    if (ratio >= 0.7) return Math.round(ratio * 40);
  }

  return 0;
}

// ── Multi-segment highlight ──────────────────────────────────
// Highlights all matching segments for multi-token queries
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (query.length < 2) return <>{text}</>;

  const lower = text.toLowerCase();
  const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length >= 2);

  // Collect all match ranges
  const ranges: [number, number][] = [];

  // First try: full query match
  const fullIdx = lower.indexOf(query.toLowerCase());
  if (fullIdx !== -1) {
    ranges.push([fullIdx, fullIdx + query.length]);
  } else {
    // Token-by-token matching
    for (const token of tokens) {
      const idx = lower.indexOf(token);
      if (idx !== -1) {
        ranges.push([idx, idx + token.length]);
      }
    }
  }

  if (ranges.length === 0) return <>{text}</>;

  // Merge overlapping ranges
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    if (ranges[i][0] <= last[1]) {
      last[1] = Math.max(last[1], ranges[i][1]);
    } else {
      merged.push(ranges[i]);
    }
  }

  // Build JSX with highlighted segments
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (cursor < start) {
      parts.push(text.slice(cursor, start));
    }
    parts.push(
      <span key={start} className="text-teal-400 font-medium">
        {text.slice(start, end)}
      </span>
    );
    cursor = end;
  }
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <>{parts}</>;
}

// ── Component ────────────────────────────────────────────────

let idCounter = 0;

export function FuzzyAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  items,
  popularItems,
  storageKey,
  disabled = false,
  error,
}: FuzzyAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const instanceId = useRef(`fuzzy-${++idCounter}`).current;

  useEffect(() => { setQuery(value); }, [value]);

  // Search results
  const results = useMemo(() => {
    if (query.length < 2) return [];
    return items
      .map((item) => ({ item, score: fuzzyScore(item, query) }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((s) => s.item);
  }, [query, items]);

  // Whether query is active but found no results
  const noResults = open && query.length >= 2 && results.length === 0;

  // Recent items
  const recentItems = useMemo(() => {
    if (!storageKey) return [];
    const names = getRecent(storageKey);
    return names
      .map((n) => items.find((it) => it.name === n))
      .filter(Boolean) as SuggestionItem[];
  }, [storageKey, items]);

  // Popular items
  const popular = useMemo(() => {
    if (!popularItems?.length) return [];
    return popularItems
      .map((n) => items.find((it) => it.name === n))
      .filter(Boolean) as SuggestionItem[];
  }, [popularItems, items]);

  const showSuggestions = open && query.length < 2;
  const showResults = open && query.length >= 2 && results.length > 0;

  // All selectable items for keyboard nav
  const allItems = useMemo(() => {
    if (showResults) return results;
    if (showSuggestions) {
      const combined: SuggestionItem[] = [...recentItems];
      for (const p of popular) {
        if (!combined.some((c) => c.name === p.name)) combined.push(p);
      }
      return combined;
    }
    return [];
  }, [showResults, showSuggestions, results, recentItems, popular]);

  const select = useCallback(
    (name: string) => {
      setQuery(name);
      onChange(name);
      setOpen(false);
      setActiveIndex(-1);
      if (storageKey) saveRecent(storageKey, name);
    },
    [onChange, storageKey]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || allItems.length === 0) {
      if (e.key === 'ArrowDown' && !open) { setOpen(true); return; }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      select(allItems[activeIndex].name);
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Tab' && activeIndex >= 0) {
      e.preventDefault();
      select(allItems[activeIndex].name);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const els = listRef.current.querySelectorAll('[data-autocomplete-item]');
      els[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function renderItem(item: SuggestionItem, i: number, highlight: boolean) {
    return (
      <button
        key={item.name}
        id={`${instanceId}-option-${i}`}
        type="button"
        role="option"
        aria-selected={i === activeIndex}
        data-autocomplete-item
        onMouseDown={() => select(item.name)}
        onMouseEnter={() => setActiveIndex(i)}
        className={cn(
          'w-full px-3 py-2 flex items-start gap-2 text-left transition-colors',
          i === activeIndex ? 'bg-navy-700 text-white' : 'text-slate-300 hover:bg-navy-700/70'
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm truncate">
            {highlight ? <HighlightMatch text={item.name} query={query} /> : item.name}
          </div>
          {item.detail && (
            <div className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
              {item.detail}
            </div>
          )}
        </div>
        {item.category && (
          <span className="text-[10px] font-mono text-slate-500 shrink-0 uppercase tracking-wider mt-0.5">
            {item.category}
          </span>
        )}
      </button>
    );
  }

  const listboxId = `${instanceId}-listbox`;
  const isOpen = showResults || noResults || (showSuggestions && allItems.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={`${instanceId}-input`} className="input-label">{label}</label>
      <div className="relative mt-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" aria-hidden="true" />
        <input
          ref={inputRef}
          id={`${instanceId}-input`}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${instanceId}-option-${activeIndex}` : undefined}
          aria-describedby={error ? `${instanceId}-error` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'input pl-9',
            error && 'border-signal-red focus:ring-signal-red/30',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
          autoComplete="off"
        />
      </div>

      {/* Search results */}
      {showResults && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute z-50 w-full mt-1 bg-navy-800 border border-navy-700 rounded-md shadow-elevated max-h-72 overflow-y-auto"
        >
          {/* Match count + keyboard hint */}
          <div className="px-3 py-1.5 flex items-center justify-between border-b border-navy-700/60">
            <span className="text-[10px] font-mono text-slate-500">
              {results.length} of {items.length} match{results.length !== 1 ? 'es' : ''}
            </span>
            <span className="text-[10px] font-mono text-slate-600 flex items-center gap-1">
              <ChevronUp className="w-2.5 h-2.5" />
              <ChevronUp className="w-2.5 h-2.5 rotate-180" />
              navigate
              <span className="mx-0.5">·</span>
              <CornerDownLeft className="w-2.5 h-2.5" />
              select
            </span>
          </div>
          {results.map((item, i) => renderItem(item, i, true))}
        </div>
      )}

      {/* No results state */}
      {noResults && (
        <div
          id={listboxId}
          className="absolute z-50 w-full mt-1 bg-navy-800 border border-navy-700 rounded-md shadow-elevated"
        >
          <div className="px-3 py-3 text-center">
            <p className="text-xs text-slate-400">No suggestions for &ldquo;{query}&rdquo;</p>
            <p className="text-[10px] text-slate-500 mt-1">You can still use this as a custom value</p>
          </div>
        </div>
      )}

      {/* Recent + Popular */}
      {showSuggestions && allItems.length > 0 && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={`Suggested ${label.toLowerCase()}`}
          className="absolute z-50 w-full mt-1 bg-navy-800 border border-navy-700 rounded-md shadow-elevated max-h-72 overflow-y-auto"
        >
          {recentItems.length > 0 && (
            <>
              <div className="px-3 py-1.5 flex items-center gap-1.5 border-b border-navy-700/60">
                <Clock className="w-3 h-3 text-slate-600" />
                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">Recently Used</span>
              </div>
              {recentItems.map((item, i) => renderItem(item, i, false))}
            </>
          )}
          {popular.filter((p) => !recentItems.some((r) => r.name === p.name)).length > 0 && (
            <>
              <div className="px-3 py-1.5 flex items-center gap-1.5 border-b border-navy-700/60">
                <TrendingUp className="w-3 h-3 text-slate-600" />
                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">Popular</span>
              </div>
              {popular
                .filter((p) => !recentItems.some((r) => r.name === p.name))
                .map((item, i) => renderItem(item, recentItems.length + i, false))}
            </>
          )}
          {/* Keyboard hint at bottom */}
          <div className="px-3 py-1.5 border-t border-navy-700/60 flex items-center justify-end">
            <span className="text-[10px] font-mono text-slate-600 flex items-center gap-1">
              <ChevronUp className="w-2.5 h-2.5" />
              <ChevronUp className="w-2.5 h-2.5 rotate-180" />
              navigate
              <span className="mx-0.5">·</span>
              <CornerDownLeft className="w-2.5 h-2.5" />
              select
            </span>
          </div>
        </div>
      )}

      {error && <p id={`${instanceId}-error`} role="alert" className="text-xs text-signal-red mt-1">{error}</p>}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {showResults && `${results.length} suggestion${results.length === 1 ? '' : 's'} available`}
        {noResults && 'No suggestions found. You can use a custom value.'}
      </div>
    </div>
  );
}
