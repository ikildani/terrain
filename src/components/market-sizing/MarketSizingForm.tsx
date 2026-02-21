'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getIndicationSuggestions } from '@/lib/data/indication-map';
import type {
  MarketSizingInput,
  MarketSizingOutput,
  DevelopmentStage,
  GeographyCode,
  PricingAssumption,
} from '@/types';
import type { IndicationData } from '@/lib/data/indication-map';

interface MarketSizingFormProps {
  onResults: (data: MarketSizingOutput, input: MarketSizingInput) => void;
  onLoading: (loading: boolean) => void;
}

const GEOGRAPHIES: { code: GeographyCode; label: string }[] = [
  { code: 'US', label: 'United States' },
  { code: 'EU5', label: 'EU5 (Combined)' },
  { code: 'Germany', label: 'Germany' },
  { code: 'France', label: 'France' },
  { code: 'Italy', label: 'Italy' },
  { code: 'Spain', label: 'Spain' },
  { code: 'UK', label: 'United Kingdom' },
  { code: 'Japan', label: 'Japan' },
  { code: 'China', label: 'China' },
  { code: 'Canada', label: 'Canada' },
  { code: 'Australia', label: 'Australia' },
  { code: 'RoW', label: 'Rest of World' },
];

const STAGES: { value: DevelopmentStage; label: string }[] = [
  { value: 'preclinical', label: 'Preclinical' },
  { value: 'phase1', label: 'Phase 1' },
  { value: 'phase2', label: 'Phase 2' },
  { value: 'phase3', label: 'Phase 3' },
  { value: 'approved', label: 'Approved' },
];

const PRICING_OPTIONS: { value: PricingAssumption; label: string }[] = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'base', label: 'Base' },
  { value: 'premium', label: 'Premium' },
];

export default function MarketSizingForm({ onResults, onLoading }: MarketSizingFormProps) {
  const [indication, setIndication] = useState('');
  const [subtype, setSubtype] = useState('');
  const [geography, setGeography] = useState<GeographyCode[]>(['US']);
  const [developmentStage, setDevelopmentStage] = useState<DevelopmentStage>('phase2');
  const [mechanism, setMechanism] = useState('');
  const [patientSegment, setPatientSegment] = useState('');
  const [pricingAssumption, setPricingAssumption] = useState<PricingAssumption>('base');
  const [launchYear, setLaunchYear] = useState(2028);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<IndicationData[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleIndicationChange(value: string) {
    setIndication(value);
    if (value.length >= 2) {
      const results = getIndicationSuggestions(value);
      setSuggestions(results);
      setDropdownOpen(results.length > 0);
    } else {
      setSuggestions([]);
      setDropdownOpen(false);
    }
  }

  function selectIndication(item: IndicationData) {
    setIndication(item.name);
    setDropdownOpen(false);
    setSuggestions([]);
  }

  function toggleGeography(code: GeographyCode) {
    setGeography((prev) =>
      prev.includes(code)
        ? prev.filter((g) => g !== code)
        : [...prev, code]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!indication.trim()) {
      setError('Please select an indication');
      return;
    }
    if (geography.length === 0) {
      setError('Select at least one geography');
      return;
    }

    const input: MarketSizingInput = {
      indication: indication.trim(),
      subtype: subtype || undefined,
      geography,
      development_stage: developmentStage,
      mechanism: mechanism || undefined,
      patient_segment: patientSegment || undefined,
      pricing_assumption: pricingAssumption,
      launch_year: launchYear,
    };

    setIsSubmitting(true);
    setError(null);
    onLoading(true);

    try {
      const response = await fetch('/api/analyze/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      const json = await response.json();
      if (!json.success) throw new Error(json.error || 'Analysis failed');
      onResults(json.data, input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsSubmitting(false);
      onLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && (
        <div className="text-sm text-signal-red bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Indication Autocomplete */}
      <div ref={dropdownRef} className="relative">
        <label className="input-label">Indication</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={indication}
            onChange={(e) => handleIndicationChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setDropdownOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setDropdownOpen(false);
            }}
            placeholder="Search indications..."
            className="input pl-9"
          />
        </div>
        <p className="text-2xs text-slate-600 mt-1">152 indications in database</p>
        {dropdownOpen && suggestions.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-navy-800 border border-navy-700 rounded-lg shadow-elevated max-h-64 overflow-y-auto">
            {suggestions.slice(0, 8).map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => selectIndication(item)}
                className="w-full text-left px-3 py-2.5 hover:bg-navy-700 transition-colors flex items-center justify-between"
              >
                <span className="text-sm text-slate-200 truncate">{item.name}</span>
                <span className="badge-slate text-[9px] ml-2 flex-shrink-0">
                  {item.therapy_area}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Subtype */}
      <div>
        <label className="input-label">Subtype / Specifics</label>
        <input
          type="text"
          value={subtype}
          onChange={(e) => setSubtype(e.target.value)}
          placeholder="e.g., EGFR+ Stage III/IV"
          className="input"
        />
      </div>

      {/* Geography Multi-select */}
      <div>
        <label className="input-label">Geographies</label>
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          {GEOGRAPHIES.map((geo) => (
            <label
              key={geo.code}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer text-xs transition-colors',
                geography.includes(geo.code)
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                  : 'bg-navy-800 text-slate-400 border border-transparent hover:border-navy-600'
              )}
            >
              <input
                type="checkbox"
                checked={geography.includes(geo.code)}
                onChange={() => toggleGeography(geo.code)}
                className="sr-only"
              />
              <div
                className={cn(
                  'w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0',
                  geography.includes(geo.code)
                    ? 'bg-teal-500 border-teal-500'
                    : 'border-slate-600'
                )}
              >
                {geography.includes(geo.code) && (
                  <svg className="w-2 h-2 text-navy-950" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="truncate">{geo.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Development Stage */}
      <div>
        <label className="input-label">Development Stage</label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {STAGES.map((stage) => (
            <button
              key={stage.value}
              type="button"
              onClick={() => setDevelopmentStage(stage.value)}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-medium border transition-colors',
                developmentStage === stage.value
                  ? 'bg-teal-500/10 border-teal-500/50 text-teal-400'
                  : 'bg-navy-800 border-navy-700 text-slate-400 hover:border-navy-600'
              )}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mechanism of Action */}
      <div>
        <label className="input-label">Mechanism of Action</label>
        <input
          type="text"
          value={mechanism}
          onChange={(e) => setMechanism(e.target.value)}
          placeholder="e.g., KRAS G12C inhibitor"
          className="input"
        />
      </div>

      {/* Patient Segment */}
      <div>
        <label className="input-label">Patient Segment</label>
        <input
          type="text"
          value={patientSegment}
          onChange={(e) => setPatientSegment(e.target.value)}
          placeholder="e.g., 2L+ after platinum-based chemo"
          className="input"
        />
      </div>

      {/* Pricing Assumption */}
      <div>
        <label className="input-label">Pricing Assumption</label>
        <div className="flex gap-1.5 mt-1">
          {PRICING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPricingAssumption(opt.value)}
              className={cn(
                'flex-1 px-3 py-1.5 rounded text-xs font-medium border transition-colors',
                pricingAssumption === opt.value
                  ? 'bg-teal-500/10 border-teal-500/50 text-teal-400'
                  : 'bg-navy-800 border-navy-700 text-slate-400 hover:border-navy-600'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Launch Year */}
      <div>
        <div className="flex items-center justify-between">
          <label className="input-label">Expected Launch Year</label>
          <span className="metric text-sm text-teal-400">{launchYear}</span>
        </div>
        <input
          type="range"
          min={2025}
          max={2035}
          step={1}
          value={launchYear}
          onChange={(e) => setLaunchYear(Number(e.target.value))}
          className="w-full mt-2 accent-teal-500 h-1.5 bg-navy-800 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-teal-sm"
        />
        <div className="flex justify-between text-2xs text-slate-600 mt-1">
          <span>2025</span>
          <span>2035</span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary btn-xl w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Generate Analysis'
        )}
      </button>
    </form>
  );
}
