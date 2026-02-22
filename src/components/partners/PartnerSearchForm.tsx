'use client';

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Users } from 'lucide-react';
import { IndicationAutocomplete } from '@/components/ui/IndicationAutocomplete';
import { cn } from '@/lib/utils/cn';
import type { DevelopmentStage } from '@/types';

// ────────────────────────────────────────────────────────────
// ZOD SCHEMA
// ────────────────────────────────────────────────────────────

const DEAL_TYPE_VALUES = ['licensing', 'co-development', 'acquisition', 'co-promotion'] as const;

const partnerSearchSchema = z.object({
  indication: z.string().min(1, 'Indication is required'),
  mechanism: z.string().optional(),
  development_stage: z.enum(['preclinical', 'phase1', 'phase2', 'phase3', 'approved']).default('phase2'),
  geography_rights: z.array(z.string()).min(1, 'Select at least one geography'),
  deal_types: z.array(z.enum(DEAL_TYPE_VALUES)).min(1, 'Select at least one deal type'),
});

export type PartnerFormData = z.infer<typeof partnerSearchSchema>;

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

const DEAL_TYPES: { value: typeof DEAL_TYPE_VALUES[number]; label: string }[] = [
  { value: 'licensing', label: 'Licensing' },
  { value: 'co-development', label: 'Co-Development' },
  { value: 'acquisition', label: 'Acquisition' },
  { value: 'co-promotion', label: 'Co-Promotion' },
];

// ────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────

export default function PartnerSearchForm({ onSubmit, isLoading }: PartnerSearchFormProps) {
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSearchSchema),
    defaultValues: {
      indication: '',
      mechanism: '',
      development_stage: 'phase2',
      geography_rights: ['US'],
      deal_types: ['licensing'],
    },
  });

  const geos = watch('geography_rights');
  const stage = watch('development_stage');
  const dealTypes = watch('deal_types');

  const toggleGeo = useCallback(
    (value: string) => {
      if (value === 'Global') {
        const next = geos.includes('Global') ? ['US'] : ['Global'];
        setValue('geography_rights', next, { shouldValidate: true });
      } else {
        const filtered = geos.filter((g) => g !== 'Global');
        const next = filtered.includes(value)
          ? filtered.filter((g) => g !== value)
          : [...filtered, value];
        setValue('geography_rights', next, { shouldValidate: true });
      }
    },
    [geos, setValue],
  );

  const toggleDealType = useCallback(
    (value: typeof DEAL_TYPE_VALUES[number]) => {
      const next = dealTypes.includes(value)
        ? dealTypes.filter((dt) => dt !== value)
        : [...dealTypes, value];
      setValue('deal_types', next as typeof DEAL_TYPE_VALUES[number][], { shouldValidate: true });
    },
    [dealTypes, setValue],
  );

  const doSubmit = handleSubmit((data) => {
    onSubmit({
      ...data,
      mechanism: data.mechanism || undefined,
    });
  });

  return (
    <div className="card noise">
      <form onSubmit={doSubmit} className="space-y-5">
        {/* Indication */}
        <IndicationAutocomplete
          value={watch('indication')}
          onChange={(v) => setValue('indication', v, { shouldValidate: true })}
          error={errors.indication?.message}
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
            value={watch('mechanism') || ''}
            onChange={(e) => setValue('mechanism', e.target.value)}
          />
          <p className="text-2xs text-slate-600 mt-1">Optional. Improves matching precision.</p>
        </div>

        {/* Development Stage */}
        <div>
          <label className="input-label">Development Stage</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {DEVELOPMENT_STAGES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setValue('development_stage', s.value)}
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
          {errors.geography_rights?.message && (
            <p className="text-xs text-signal-red mt-0.5">{errors.geography_rights.message}</p>
          )}
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
          {errors.deal_types?.message && (
            <p className="text-xs text-signal-red mt-0.5">{errors.deal_types.message}</p>
          )}
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
