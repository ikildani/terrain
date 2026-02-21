'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { INDICATION_DATA } from '@/lib/data/indication-map';
import { cn } from '@/lib/utils/cn';
import { Search, AlertTriangle } from 'lucide-react';

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

  // Sync query when value prop changes externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const results =
    query.length >= 2
      ? INDICATION_DATA.filter(
          (ind) =>
            ind.name.toLowerCase().includes(query.toLowerCase()) ||
            ind.synonyms.some((s) =>
              s.toLowerCase().includes(query.toLowerCase())
            )
        ).slice(0, 8)
      : [];

  const isValidIndication = INDICATION_DATA.some(
    (ind) => ind.name.toLowerCase() === query.toLowerCase()
  );

  const select = useCallback(
    (name: string) => {
      setQuery(name);
      onChange(name);
      setOpen(false);
      setActiveIndex(-1);
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      select(results[activeIndex].name);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-autocomplete-item]');
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="input-label">{label}</label>
      )}
      <div className="relative mt-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'e.g., Non-Small Cell Lung Cancer'}
          className={cn(
            'input pl-9',
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

      {open && results.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-navy-800 border border-navy-700 rounded-md shadow-elevated max-h-72 overflow-y-auto"
        >
          {results.map((ind, i) => (
            <button
              key={ind.name}
              type="button"
              data-autocomplete-item
              onMouseDown={() => select(ind.name)}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                'w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors',
                i === activeIndex
                  ? 'bg-navy-700 text-white'
                  : 'text-slate-300 hover:bg-navy-700/70'
              )}
            >
              <span className="text-sm truncate">{ind.name}</span>
              <span className="text-[10px] font-mono text-slate-500 ml-2 shrink-0 uppercase tracking-wider">
                {ind.therapy_area}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-navy-800 border border-navy-700 rounded-md px-3 py-2.5">
          <span className="text-xs text-slate-500">
            No matching indications found
          </span>
        </div>
      )}

      {error && <p className="text-xs text-signal-red mt-1">{error}</p>}
    </div>
  );
}
