'use client';

import { useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import { IndicationAutocomplete } from '@/components/ui/IndicationAutocomplete';
import { cn } from '@/lib/utils/cn';
import type { DevelopmentStage } from '@/types';

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

export interface PartnerFormData {
  indication: string;
  mechanism?: string;
  development_stage: DevelopmentStage;
  geography_rights: string[];
  deal_types: ('licensing' | 'co-development' | 'acquisition' | 'co-promotion')[];
}

interface PartnerSearchFormProps {
  onSubmit: (data: PartnerFormData) => void;
  isLoading: boolean;
}

// ────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────

const DEVELOPMENT_STAGES: { value: DevelopmentStage; label: string }[] = [
  { value: 'preclinical', label: 'Preclinical' },
  { value: 'phase1', label: 'Phase 1' },
  { value: 'phase2', label: 'Phase 2' },
  { value: 'phase3', label: 'Phase 3' },
  { value: 'approved', label: 'Approved' },
];

const GEOGRAPHIES = [
  { value: 'US', label: 'United States' },
  { value: 'EU5', label: 'EU5 (DE, FR, IT, ES, UK)' },
  { value: 'Japan', label: 'Japan' },
  { value: 'China', label: 'China' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Global', label: 'Global (all territories)' },
];

const DEAL_TYPES: { value: 'licensing' | 'co-development' | 'acquisition' | 'co-promotion'; label: string }[] = [
  { value: 'licensing', label: 'Licensing' },
  { value: 'co-development', label: 'Co-Development' },
  { value: 'acquisition', label: 'Acquisition' },
  { value: 'co-promotion', label: 'Co-Promotion' },
];

// ────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────

export default function PartnerSearchForm({ onSubmit, isLoading }: PartnerSearchFormProps) {
  const [indication, setIndication] = useState('');
  const [mechanism, setMechanism] = useState('');
  const [stage, setStage] = useState<DevelopmentStage>('phase2');
  const [geos, setGeos] = useState<string[]>(['US']);
  const [dealTypes, setDealTypes] = useState<('licensing' | 'co-development' | 'acquisition' | 'co-promotion')[]>(['licensing']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleGeo(value: string) {
    // If Global is toggled on, clear others; if specific toggled, remove Global
    if (value === 'Global') {
      setGeos((prev) => prev.includes('Global') ? [] : ['Global']);
    } else {
      setGeos((prev) => {
        const filtered = prev.filter((g) => g !== 'Global');
        return filtered.includes(value)
          ? filtered.filter((g) => g !== value)
          : [...filtered, value];
      });
    }
  }

  function toggleDealType(value: typeof dealTypes[number]) {
    setDealTypes((prev) =>
      prev.includes(value)
        ? prev.filter((dt) => dt !== value)
        : [...prev, value]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!indication.trim()) newErrors.indication = 'Indication is required';
    if (geos.length === 0) newErrors.geos = 'Select at least one geography';
    if (dealTypes.length === 0) newErrors.dealTypes = 'Select at least one deal type';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      indication: indication.trim(),
      mechanism: mechanism.trim() || undefined,
      development_stage: stage,
      geography_rights: geos,
      deal_types: dealTypes,
    });
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Indication */}
        <IndicationAutocomplete
          value={indication}
          onChange={setIndication}
          error={errors.indication}
          label="Indication"
          placeholder="e.g., Non-Small Cell Lung Cancer"
        />

        {/* Mechanism of Action */}
        <div>
          <label htmlFor="partner-mechanism" className="input-label">
            Mechanism of Action
          </label>
          <input
            id="partner-mechanism"
            type="text"
            className="input"
            placeholder="e.g., KRAS G12C inhibitor, ADC, bispecific"
            value={mechanism}
            onChange={(e) => setMechanism(e.target.value)}
          />
          <p className="text-[10px] text-slate-600 mt-1">Optional. Improves matching precision.</p>
        </div>

        {/* Development Stage */}
        <div>
          <label className="input-label">Development Stage</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {DEVELOPMENT_STAGES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStage(s.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  stage === s.value
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'bg-navy-800 text-slate-400 border border-navy-700 hover:border-navy-600 hover:text-slate-300'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Geography Rights */}
        <div>
          <label className="input-label">Geography Rights Offered</label>
          {errors.geos && <p className="text-xs text-signal-red mt-0.5">{errors.geos}</p>}
          <div className="space-y-1.5 mt-1.5">
            {GEOGRAPHIES.map((geo) => (
              <label
                key={geo.value}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-all',
                  geos.includes(geo.value)
                    ? 'bg-teal-500/10 border border-teal-500/20'
                    : 'bg-navy-800/50 border border-navy-700/50 hover:border-navy-600'
                )}
              >
                <input
                  type="checkbox"
                  checked={geos.includes(geo.value)}
                  onChange={() => toggleGeo(geo.value)}
                  className="accent-teal-500 w-3.5 h-3.5"
                />
                <span className={cn(
                  'text-xs',
                  geos.includes(geo.value) ? 'text-teal-400' : 'text-slate-400'
                )}>
                  {geo.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Deal Type */}
        <div>
          <label className="input-label">Deal Type</label>
          {errors.dealTypes && <p className="text-xs text-signal-red mt-0.5">{errors.dealTypes}</p>}
          <div className="flex flex-wrap gap-2 mt-1.5">
            {DEAL_TYPES.map((dt) => (
              <button
                key={dt.value}
                type="button"
                onClick={() => toggleDealType(dt.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  dealTypes.includes(dt.value)
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'bg-navy-800 text-slate-400 border border-navy-700 hover:border-navy-600 hover:text-slate-300'
                )}
              >
                {dt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-lg w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Matching Partners...
            </>
          ) : (
            <>
              <Users className="h-4 w-4" />
              Find Partners
            </>
          )}
        </button>
      </form>
    </div>
  );
}
