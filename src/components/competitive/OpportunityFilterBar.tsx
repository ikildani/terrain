'use client';

import { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ScreenerFilters {
  therapy_areas: string[];
  min_prevalence: number | undefined;
  max_crowding: number | undefined;
  phases: string[];
  min_opportunity_score: number | undefined;
}

interface OpportunityFilterBarProps {
  filters: ScreenerFilters;
  onFiltersChange: (filters: ScreenerFilters) => void;
  availableTherapyAreas: string[];
  isLoading?: boolean;
  totalCount?: number;
}

const PHASE_OPTIONS = ['Phase 1', 'Phase 1/2', 'Phase 2', 'Phase 2/3', 'Phase 3', 'Approved'];

export function OpportunityFilterBar({
  filters,
  onFiltersChange,
  availableTherapyAreas,
  isLoading,
  totalCount,
}: OpportunityFilterBarProps) {
  const [showTherapyDropdown, setShowTherapyDropdown] = useState(false);
  const [showPhaseDropdown, setShowPhaseDropdown] = useState(false);

  const therapyRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const outsideTherapy = !therapyRef.current?.contains(target);
      const outsidePhase = !phaseRef.current?.contains(target);
      if (outsideTherapy && outsidePhase) {
        setShowTherapyDropdown(false);
        setShowPhaseDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilterCount = [
    filters.therapy_areas.length > 0,
    filters.min_prevalence !== undefined,
    filters.max_crowding !== undefined,
    filters.phases.length > 0,
    filters.min_opportunity_score !== undefined,
  ].filter(Boolean).length;

  function clearAll() {
    onFiltersChange({
      therapy_areas: [],
      min_prevalence: undefined,
      max_crowding: undefined,
      phases: [],
      min_opportunity_score: undefined,
    });
  }

  function toggleTherapyArea(area: string) {
    const current = filters.therapy_areas;
    const next = current.includes(area) ? current.filter((a) => a !== area) : [...current, area];
    onFiltersChange({ ...filters, therapy_areas: next });
  }

  function togglePhase(phase: string) {
    const current = filters.phases;
    const next = current.includes(phase) ? current.filter((p) => p !== phase) : [...current, phase];
    onFiltersChange({ ...filters, phases: next });
  }

  return (
    <div className="card noise p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-300">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-mono">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {totalCount !== undefined && (
            <span className="text-xs text-slate-500 font-mono">
              {totalCount} indication{totalCount !== 1 ? 's' : ''}
            </span>
          )}
          {activeFilterCount > 0 && (
            <button onClick={clearAll} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Therapy Area multi-select dropdown */}
        <div ref={therapyRef} className="relative">
          <button
            onClick={() => {
              setShowTherapyDropdown(!showTherapyDropdown);
              setShowPhaseDropdown(false);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-colors',
              filters.therapy_areas.length > 0
                ? 'border-teal-500/30 bg-teal-500/5 text-teal-400'
                : 'border-navy-700 bg-navy-800/50 text-slate-400 hover:border-navy-600',
            )}
          >
            Therapy Area
            {filters.therapy_areas.length > 0 && (
              <span className="font-mono text-[10px]">({filters.therapy_areas.length})</span>
            )}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showTherapyDropdown && (
            <div className="absolute z-50 top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto rounded-lg border border-navy-700 bg-navy-900 shadow-xl p-2 space-y-0.5">
              {availableTherapyAreas.map((area) => (
                <label
                  key={area}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-navy-800/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.therapy_areas.includes(area)}
                    onChange={() => toggleTherapyArea(area)}
                    className="rounded border-navy-600 bg-navy-800 text-teal-500 focus:ring-teal-500/20 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-300 capitalize">{area}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Phase multi-select dropdown */}
        <div ref={phaseRef} className="relative">
          <button
            onClick={() => {
              setShowPhaseDropdown(!showPhaseDropdown);
              setShowTherapyDropdown(false);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-colors',
              filters.phases.length > 0
                ? 'border-teal-500/30 bg-teal-500/5 text-teal-400'
                : 'border-navy-700 bg-navy-800/50 text-slate-400 hover:border-navy-600',
            )}
          >
            Phase
            {filters.phases.length > 0 && <span className="font-mono text-[10px]">({filters.phases.length})</span>}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showPhaseDropdown && (
            <div className="absolute z-50 top-full left-0 mt-1 w-48 rounded-lg border border-navy-700 bg-navy-900 shadow-xl p-2 space-y-0.5">
              {PHASE_OPTIONS.map((phase) => (
                <label
                  key={phase}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-navy-800/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.phases.includes(phase)}
                    onChange={() => togglePhase(phase)}
                    className="rounded border-navy-600 bg-navy-800 text-teal-500 focus:ring-teal-500/20 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-300">{phase}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Min Opportunity Score */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Min Score</span>
          <input
            type="number"
            min={0}
            max={100}
            step={5}
            value={filters.min_opportunity_score ?? ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                min_opportunity_score: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="0"
            className="w-14 px-2 py-1 rounded-md border border-navy-700 bg-navy-800/50 text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:border-teal-500/30 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
          />
        </div>

        {/* Max Crowding */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Max Crowding</span>
          <input
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={filters.max_crowding ?? ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                max_crowding: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="10"
            className="w-14 px-2 py-1 rounded-md border border-navy-700 bg-navy-800/50 text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:border-teal-500/30 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
          />
        </div>

        {/* Min Global Prevalence */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Min Prev.</span>
          <input
            type="number"
            min={0}
            step={100000}
            value={filters.min_prevalence ?? ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                min_prevalence: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="Any"
            className="w-20 px-2 py-1 rounded-md border border-navy-700 bg-navy-800/50 text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:border-teal-500/30 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Active filter tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {filters.therapy_areas.map((area) => (
            <span
              key={area}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] text-teal-400"
            >
              <span className="capitalize">{area}</span>
              <button onClick={() => toggleTherapyArea(area)} className="hover:text-white">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          {filters.phases.map((phase) => (
            <span
              key={phase}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400"
            >
              {phase}
              <button onClick={() => togglePhase(phase)} className="hover:text-white">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          {filters.min_opportunity_score !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400">
              Score ≥ {filters.min_opportunity_score}
              <button
                onClick={() => onFiltersChange({ ...filters, min_opportunity_score: undefined })}
                className="hover:text-white"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
          {filters.max_crowding !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400">
              Crowding ≤ {filters.max_crowding}
              <button
                onClick={() => onFiltersChange({ ...filters, max_crowding: undefined })}
                className="hover:text-white"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
          {filters.min_prevalence !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-400">
              Prev ≥ {(filters.min_prevalence / 1e6).toFixed(1)}M
              <button
                onClick={() => onFiltersChange({ ...filters, min_prevalence: undefined })}
                className="hover:text-white"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
        </div>
      )}

      {isLoading && (
        <div className="h-0.5 bg-navy-700/40 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500/60 rounded-full animate-pulse w-1/3" />
        </div>
      )}
    </div>
  );
}
