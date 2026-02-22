'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Search, Clock, TrendingUp, X, CornerDownLeft, ChevronsUpDown, Check, Type } from 'lucide-react';

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

  if (name === q) return 100;
  if (name.startsWith(q)) return 90;
  if (cat.startsWith(q)) return 80;
  if (name.includes(q)) return 70;
  if (cat.includes(q)) return 65;

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
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (query.length < 2) return <>{text}</>;

  const lower = text.toLowerCase();
  const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length >= 2);
  const ranges: [number, number][] = [];

  const fullIdx = lower.indexOf(query.toLowerCase());
  if (fullIdx !== -1) {
    ranges.push([fullIdx, fullIdx + query.length]);
  } else {
    for (const token of tokens) {
      const idx = lower.indexOf(token);
      if (idx !== -1) ranges.push([idx, idx + token.length]);
    }
  }

  if (ranges.length === 0) return <>{text}</>;

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

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (cursor < start) parts.push(text.slice(cursor, start));
    parts.push(
      <span key={start} className="text-teal-400 font-medium">{text.slice(start, end)}</span>
    );
    cursor = end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

// ── Category grouping helper ─────────────────────────────────
interface GroupedResults {
  category: string;
  items: SuggestionItem[];
}

function groupByCategory(items: SuggestionItem[]): GroupedResults[] {
  const map = new Map<string, SuggestionItem[]>();
  for (const item of items) {
    const cat = item.category || 'Other';
    const group = map.get(cat);
    if (group) group.push(item);
    else map.set(cat, [item]);
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
}

// ── Ghost text: compute inline completion ────────────────────
function getGhostText(query: string, topResult: SuggestionItem | undefined): string {
  if (!topResult || query.length < 2) return '';
  const name = topResult.name;
  if (name.toLowerCase().startsWith(query.toLowerCase())) {
    return name.slice(query.length);
  }
  return '';
}

// ── Dropdown animation config ────────────────────────────────
const dropdownVariants = {
  hidden: { opacity: 0, y: -4, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98 },
};

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
      .slice(0, 12)
      .map((s) => s.item);
  }, [query, items]);

  // Grouped results for category headers
  const groupedResults = useMemo(() => groupByCategory(results), [results]);

  // Ghost text for inline completion
  const ghostText = useMemo(() => getGhostText(query, results[0]), [query, results]);

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
  const showEmptyHint = showSuggestions && recentItems.length === 0 && popular.length === 0;

  // All selectable items for keyboard nav (flat list across groups)
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
      inputRef.current?.blur();
    },
    [onChange, storageKey]
  );

  const clear = useCallback(() => {
    setQuery('');
    onChange('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Tab with ghost text = accept top result
    if (e.key === 'Tab' && ghostText && results[0]) {
      e.preventDefault();
      select(results[0].name);
      return;
    }

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

  // Compute flat index for an item within grouped results
  function getFlatIndex(groupIdx: number, itemIdx: number): number {
    let flat = 0;
    for (let g = 0; g < groupIdx; g++) {
      flat += groupedResults[g].items.length;
    }
    return flat + itemIdx;
  }

  // Check if item name matches the current committed value
  const isSelected = useCallback(
    (name: string) => value.length > 0 && name.toLowerCase() === value.toLowerCase(),
    [value]
  );

  function renderItem(item: SuggestionItem, flatIdx: number, highlight: boolean) {
    const selected = isSelected(item.name);
    return (
      <button
        key={`${item.name}-${flatIdx}`}
        id={`${instanceId}-option-${flatIdx}`}
        type="button"
        role="option"
        aria-selected={flatIdx === activeIndex}
        data-autocomplete-item
        onMouseDown={() => select(item.name)}
        onMouseEnter={() => setActiveIndex(flatIdx)}
        className={cn(
          'w-full px-3 py-2.5 flex items-start gap-2 text-left transition-colors duration-75',
          flatIdx === activeIndex
            ? 'bg-teal-500/10 text-white'
            : selected
              ? 'bg-teal-500/5 text-white'
              : 'text-slate-300 hover:bg-navy-700/70'
        )}
      >
        {/* Selected checkmark */}
        {selected && (
          <Check className="w-3 h-3 text-teal-500 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm truncate leading-snug">
            {highlight ? <HighlightMatch text={item.name} query={query} /> : item.name}
          </div>
          {/* Detail + inline category on search results */}
          <div className="flex items-center gap-2 mt-0.5">
            {item.detail && (
              <span className="text-2xs font-mono text-slate-500 truncate">
                {item.detail}
              </span>
            )}
            {item.category && highlight && groupedResults.length <= 1 && (
              <span className="text-2xs font-mono text-slate-600 shrink-0 uppercase tracking-wider">
                {item.category}
              </span>
            )}
          </div>
        </div>
        {/* Category badge in suggestions mode */}
        {item.category && !highlight && (
          <span className="text-2xs font-mono text-slate-500 shrink-0 uppercase tracking-wider mt-0.5">
            {item.category}
          </span>
        )}
      </button>
    );
  }

  const listboxId = `${instanceId}-listbox`;
  const isOpen = showResults || noResults || showEmptyHint || (showSuggestions && allItems.length > 0);
  const hasValue = query.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={`${instanceId}-input`} className="input-label">{label}</label>
      <div className="relative mt-1">
        <Search
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none transition-colors duration-150',
            open ? 'text-teal-500' : 'text-slate-500'
          )}
          aria-hidden="true"
        />

        {/* Ghost text layer — fades in/out */}
        <AnimatePresence>
          {ghostText && open && (
            <motion.div
              className="absolute inset-0 flex items-center pointer-events-none pl-9 pr-9"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <span className="text-sm text-transparent">{query}</span>
              <span className="text-sm text-slate-600">{ghostText}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={inputRef}
          id={`${instanceId}-input`}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-autocomplete="both"
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
            hasValue && !disabled && 'pr-8',
            open && 'border-teal-500/40 ring-1 ring-teal-500/20',
            error && 'border-signal-red focus:ring-signal-red/30',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
          autoComplete="off"
        />

        {/* Clear button */}
        {hasValue && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); clear(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-navy-700 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {/* ── Search results (grouped by category) ── */}
        {showResults && (
          <motion.div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={`${label} suggestions`}
            className="absolute z-50 w-full mt-1 bg-navy-800 border border-navy-700 rounded-lg shadow-elevated max-h-80 overflow-y-auto"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
          >
            {/* Header */}
            <div className="px-3 py-1.5 flex items-center justify-between border-b border-navy-700/60 sticky top-0 bg-navy-800/95 backdrop-blur-sm z-10">
              <span className="text-2xs font-mono text-slate-500">
                {results.length} of {items.length}
              </span>
              <span className="text-2xs font-mono text-slate-600 flex items-center gap-1.5">
                <ChevronsUpDown className="w-2.5 h-2.5" />
                <span>navigate</span>
                <span className="text-slate-700">·</span>
                <CornerDownLeft className="w-2.5 h-2.5" />
                <span>select</span>
                {ghostText && (
                  <>
                    <span className="text-slate-700">·</span>
                    <span className="text-[9px] border border-slate-600 rounded px-1 py-px">tab</span>
                    <span>complete</span>
                  </>
                )}
              </span>
            </div>

            {/* Grouped results */}
            {groupedResults.map((group, gIdx) => (
              <div key={group.category}>
                {groupedResults.length > 1 && (
                  <div className="px-3 py-1 bg-navy-800/80 sticky top-[29px] z-[5]">
                    <span className="text-[9px] font-mono text-teal-500/70 uppercase tracking-widest">
                      {group.category}
                    </span>
                  </div>
                )}
                {group.items.map((item, iIdx) =>
                  renderItem(item, getFlatIndex(gIdx, iIdx), true)
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* ── No results ── */}
        {noResults && (
          <motion.div
            id={listboxId}
            className="absolute z-50 w-full mt-1 bg-navy-800 border border-navy-700 rounded-lg shadow-elevated"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
          >
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-slate-400">No suggestions for &ldquo;<span className="text-slate-300">{query}</span>&rdquo;</p>
              <p className="text-2xs text-slate-500 mt-1.5">Press <span className="text-[9px] font-mono border border-slate-600 rounded px-1 py-px text-slate-400">enter</span> to use as custom value</p>
            </div>
          </motion.div>
        )}

        {/* ── Empty focus hint (no recent, no popular) ── */}
        {showEmptyHint && (
          <motion.div
            id={listboxId}
            className="absolute z-50 w-full mt-1 bg-navy-800 border border-navy-700 rounded-lg shadow-elevated"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
          >
            <div className="px-3 py-3 flex items-center gap-2 text-center justify-center">
              <Type className="w-3 h-3 text-slate-600" />
              <span className="text-[11px] text-slate-500">Start typing to search {items.length} suggestions</span>
            </div>
          </motion.div>
        )}

        {/* ── Recent + Popular ── */}
        {showSuggestions && allItems.length > 0 && (
          <motion.div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={`Suggested ${label.toLowerCase()}`}
            className="absolute z-50 w-full mt-1 bg-navy-800 border border-navy-700 rounded-lg shadow-elevated max-h-80 overflow-y-auto"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
          >
            {recentItems.length > 0 && (
              <>
                <div className="px-3 py-1.5 flex items-center gap-1.5 border-b border-navy-700/60">
                  <Clock className="w-3 h-3 text-slate-600" />
                  <span className="text-2xs font-mono text-slate-600 uppercase tracking-wider">Recent</span>
                </div>
                {recentItems.map((item, i) => renderItem(item, i, false))}
              </>
            )}
            {popular.filter((p) => !recentItems.some((r) => r.name === p.name)).length > 0 && (
              <>
                <div className="px-3 py-1.5 flex items-center gap-1.5 border-b border-navy-700/60">
                  <TrendingUp className="w-3 h-3 text-slate-600" />
                  <span className="text-2xs font-mono text-slate-600 uppercase tracking-wider">Popular</span>
                </div>
                {popular
                  .filter((p) => !recentItems.some((r) => r.name === p.name))
                  .map((item, i) => renderItem(item, recentItems.length + i, false))}
              </>
            )}
            {/* Footer hint */}
            <div className="px-3 py-1.5 border-t border-navy-700/60 flex items-center justify-between">
              <span className="text-2xs font-mono text-slate-600">
                {items.length} total suggestions
              </span>
              <span className="text-2xs font-mono text-slate-600 flex items-center gap-1.5">
                <ChevronsUpDown className="w-2.5 h-2.5" />
                <span>navigate</span>
                <span className="text-slate-700">·</span>
                <CornerDownLeft className="w-2.5 h-2.5" />
                <span>select</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p id={`${instanceId}-error`} role="alert" className="text-xs text-signal-red mt-1">{error}</p>}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {showResults && `${results.length} suggestion${results.length === 1 ? '' : 's'} available`}
        {noResults && 'No suggestions found. You can use a custom value.'}
      </div>
    </div>
  );
}
