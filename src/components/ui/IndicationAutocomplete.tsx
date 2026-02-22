'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { INDICATION_DATA, type IndicationData } from '@/lib/data/indication-map';
import { cn } from '@/lib/utils/cn';
import { Search, AlertTriangle, Clock, TrendingUp, ChevronsUpDown, CornerDownLeft } from 'lucide-react';

// ── localStorage key for recently used indications ──────────
const RECENT_KEY = 'terrain:recent-indications';
const MAX_RECENT = 5;

function getRecentIndications(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentIndication(name: string) {
  if (typeof window === 'undefined') return;
  const recent = getRecentIndications().filter((n) => n !== name);
  recent.unshift(name);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

// ── Popular indications (highest incidence / most common searches) ──
const POPULAR_NAMES = [
  'Non-Small Cell Lung Cancer',
  'Breast Cancer',
  'Multiple Myeloma',
  'Rheumatoid Arthritis',
  'Atopic Dermatitis',
  'Non-Alcoholic Steatohepatitis',
];

// ── Fuzzy scoring ───────────────────────────────────────────
function fuzzyScore(target: string, query: string): number {
  const t = target.toLowerCase();
  const q = query.toLowerCase();

  // Exact match
  if (t === q) return 100;
  // Starts with
  if (t.startsWith(q)) return 90;
  // Contains as substring
  if (t.includes(q)) return 70;

  // Token matching — each query word that matches a target word
  const queryTokens = q.split(/\s+/);
  const targetTokens = t.split(/\s+/);
  let tokenScore = 0;
  for (const qt of queryTokens) {
    if (qt.length < 2) continue;
    for (const tt of targetTokens) {
      if (tt.startsWith(qt)) { tokenScore += 20; break; }
      if (tt.includes(qt)) { tokenScore += 10; break; }
    }
  }
  if (tokenScore > 0) return Math.min(60, tokenScore);

  // Character-level fuzzy (handles typos) — Levenshtein-inspired
  if (q.length >= 3) {
    let matches = 0;
    let lastIdx = -1;
    for (const ch of q) {
      const idx = t.indexOf(ch, lastIdx + 1);
      if (idx > -1) {
        matches++;
        lastIdx = idx;
      }
    }
    const ratio = matches / q.length;
    if (ratio >= 0.7) return Math.round(ratio * 40);
  }

  return 0;
}

function searchIndications(query: string): IndicationData[] {
  if (query.length < 2) return [];

  const scored = INDICATION_DATA.map((ind) => {
    const nameScore = fuzzyScore(ind.name, query);
    const synonymScore = Math.max(
      ...ind.synonyms.map((s) => fuzzyScore(s, query)),
      0
    );
    return { ind, score: Math.max(nameScore, synonymScore) };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 12).map((s) => s.ind);
}

// ── Highlight matching text ─────────────────────────────────
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (query.length < 2) return <>{text}</>;

  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <span className="text-teal-400 font-medium">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Category grouping ───────────────────────────────────────
interface GroupedResults {
  category: string;
  items: IndicationData[];
}

function groupByTherapyArea(items: IndicationData[]): GroupedResults[] {
  const map = new Map<string, IndicationData[]>();
  for (const item of items) {
    const cat = item.therapy_area
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Other';
    const group = map.get(cat);
    if (group) group.push(item);
    else map.set(cat, [item]);
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
}

// ── Dropdown animation ──────────────────────────────────────
const dropdownVariants = {
  hidden: { opacity: 0, y: -4, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98 },
};

// ── Component ───────────────────────────────────────────────

interface IndicationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  label?: string;
}

export function IndicationAutocomplete({
  value,
  onChange,
  error,
  placeholder,
  label,
}: IndicationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const results = useMemo(() => searchIndications(query), [query]);
  const groupedResults = useMemo(() => groupByTherapyArea(results), [results]);

  const recentIndications = useMemo(() => {
    const names = getRecentIndications();
    return names
      .map((n) => INDICATION_DATA.find((ind) => ind.name === n))
      .filter(Boolean) as IndicationData[];
  }, []);

  const popularIndications = useMemo(
    () =>
      POPULAR_NAMES.map((n) => INDICATION_DATA.find((ind) => ind.name === n)).filter(
        Boolean
      ) as IndicationData[],
    []
  );

  // Show recent/popular when focused with empty or short query
  const showSuggestions = open && query.length < 2;
  const showResults = open && query.length >= 2 && results.length > 0;
  const showNoResults = open && query.length >= 2 && results.length === 0;

  const isValidIndication = INDICATION_DATA.some(
    (ind) => ind.name.toLowerCase() === query.toLowerCase()
  );

  // All selectable items for keyboard nav
  const allItems = useMemo(() => {
    if (showResults) return results;
    if (showSuggestions) {
      const items: IndicationData[] = [];
      if (recentIndications.length > 0) items.push(...recentIndications);
      items.push(...popularIndications.filter((p) => !items.some((i) => i.name === p.name)));
      return items;
    }
    return [];
  }, [showResults, showSuggestions, results, recentIndications, popularIndications]);

  const select = useCallback(
    (name: string) => {
      setQuery(name);
      onChange(name);
      setOpen(false);
      setActiveIndex(-1);
      saveRecentIndication(name);
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || allItems.length === 0) {
      if (e.key === 'ArrowDown' && !open) {
        setOpen(true);
        return;
      }
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

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-autocomplete-item]');
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

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

  function renderItem(ind: IndicationData, i: number, highlight: boolean) {
    return (
      <button
        key={ind.name}
        id={`indication-option-${i}`}
        type="button"
        role="option"
        aria-selected={i === activeIndex}
        data-autocomplete-item
        onMouseDown={() => select(ind.name)}
        onMouseEnter={() => setActiveIndex(i)}
        className={cn(
          'w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors duration-75',
          i === activeIndex ? 'bg-teal-500/10 text-white' : 'text-slate-300 hover:bg-navy-700/70'
        )}
      >
        <span className="text-sm truncate">
          {highlight ? <HighlightMatch text={ind.name} query={query} /> : ind.name}
        </span>
        <span className="text-2xs font-mono text-slate-500 ml-2 shrink-0 uppercase tracking-wider">
          {ind.therapy_area}
        </span>
      </button>
    );
  }

  const listboxId = 'indication-listbox';
  const isOpen = showResults || showSuggestions || showNoResults;

  return (
    <div ref={containerRef} className="relative">
      {label && <label htmlFor="indication-input" className="input-label">{label}</label>}
      <div className="relative mt-1">
        <Search
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none transition-colors duration-150',
            open ? 'text-teal-500' : 'text-slate-500'
          )}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id="indication-input"
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `indication-option-${activeIndex}` : undefined}
          aria-describedby={error ? 'indication-error' : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'e.g., Non-Small Cell Lung Cancer'}
          className={cn(
            'input pl-9',
            open && 'border-teal-500/40 ring-1 ring-teal-500/20',
            error && 'border-signal-red focus:ring-signal-red/30'
          )}
          autoComplete="off"
        />
        {query.length > 3 && !isValidIndication && !open && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {/* Search results dropdown — grouped by therapy area */}
        {showResults && (
          <motion.div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Indication suggestions"
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
                {results.length} of {INDICATION_DATA.length}
              </span>
              <span className="text-2xs font-mono text-slate-600 flex items-center gap-1.5">
                <ChevronsUpDown className="w-2.5 h-2.5" />
                <span>navigate</span>
                <span className="text-slate-700">·</span>
                <CornerDownLeft className="w-2.5 h-2.5" />
                <span>select</span>
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
                {group.items.map((ind, iIdx) =>
                  renderItem(ind, getFlatIndex(gIdx, iIdx), true)
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Recent + Popular suggestions (when no query) */}
        {showSuggestions && (recentIndications.length > 0 || popularIndications.length > 0) && (
          <motion.div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Suggested indications"
            className="absolute z-50 w-full mt-1 bg-navy-800 border border-navy-700 rounded-lg shadow-elevated max-h-80 overflow-y-auto"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
          >
            {recentIndications.length > 0 && (
              <>
                <div className="px-3 py-1.5 flex items-center gap-1.5 border-b border-navy-700/60">
                  <Clock className="w-3 h-3 text-slate-600" />
                  <span className="text-2xs font-mono text-slate-600 uppercase tracking-wider">
                    Recently Used
                  </span>
                </div>
                {recentIndications.map((ind, i) => renderItem(ind, i, false))}
              </>
            )}
            <div className="px-3 py-1.5 flex items-center gap-1.5 border-b border-navy-700/60">
              <TrendingUp className="w-3 h-3 text-slate-600" />
              <span className="text-2xs font-mono text-slate-600 uppercase tracking-wider">
                Popular
              </span>
            </div>
            {popularIndications
              .filter((p) => !recentIndications.some((r) => r.name === p.name))
              .map((ind, i) => renderItem(ind, recentIndications.length + i, false))}
            {/* Footer hint */}
            <div className="px-3 py-1.5 border-t border-navy-700/60 flex items-center justify-between">
              <span className="text-2xs font-mono text-slate-600">
                {INDICATION_DATA.length} indications
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

        {/* No results */}
        {showNoResults && (
          <motion.div
            className="absolute z-50 w-full mt-1 bg-navy-800 border border-navy-700 rounded-lg shadow-elevated"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
          >
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-slate-400">
                No matching indications for &ldquo;<span className="text-slate-300">{query}</span>&rdquo;
              </p>
              <p className="text-2xs text-slate-500 mt-1.5">
                Try a different spelling or use a common abbreviation (e.g., NSCLC, NASH, AML)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p id="indication-error" role="alert" className="text-xs text-signal-red mt-1">{error}</p>}
      {/* Screen reader announcement for results count */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {showResults && `${results.length} suggestion${results.length === 1 ? '' : 's'} available`}
        {showNoResults && 'No matching indications found'}
      </div>
    </div>
  );
}
