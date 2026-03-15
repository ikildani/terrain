'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils/cn';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { IndicationAutocomplete } from '@/components/ui/IndicationAutocomplete';
import { FuzzyAutocomplete } from '@/components/ui/FuzzyAutocomplete';
import { ProductTypeSelector } from '@/components/shared/ProductTypeSelector';
import type { ProductCategory } from '@/types/devices-diagnostics';
import {
  POPULAR_MECHANISMS,
  PATIENT_SEGMENT_SUGGESTIONS,
  POPULAR_SEGMENTS,
  PROCEDURE_SUGGESTIONS,
  POPULAR_PROCEDURES,
  POPULAR_BIOMARKERS,
  POPULAR_SUBTYPES,
  BIOMARKER_PREVALENCE,
  getSubtypesForIndication,
  getMechanismsForIndication,
  getSpecialtiesForProcedure,
  getSettingForProcedure,
  getBiomarkersForIndication,
} from '@/lib/data/suggestion-lists';
import type { FilteredSuggestions } from '@/lib/data/suggestion-lists';
import {
  INGREDIENT_SUGGESTIONS,
  POPULAR_INGREDIENTS,
  HEALTH_FOCUS_SUGGESTIONS,
  NUTRACEUTICAL_CATEGORY_OPTIONS,
  NUTRACEUTICAL_CHANNEL_OPTIONS,
  CLAIM_TYPE_OPTIONS,
  NUTRACEUTICAL_STAGES,
} from '@/lib/data/nutraceutical-data';
import type { SuggestionItem } from '@/components/ui/FuzzyAutocomplete';

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const GEOGRAPHIES = [
  { code: 'Global', label: 'Global (All Markets)' },
  { code: 'US', label: 'US' },
  { code: 'EU5', label: 'EU5' },
  { code: 'Germany', label: 'Germany' },
  { code: 'France', label: 'France' },
  { code: 'Italy', label: 'Italy' },
  { code: 'Spain', label: 'Spain' },
  { code: 'UK', label: 'UK' },
  { code: 'Japan', label: 'Japan' },
  { code: 'China', label: 'China' },
  { code: 'Canada', label: 'Canada' },
  { code: 'Australia', label: 'Australia' },
  { code: 'South Korea', label: 'South Korea' },
  { code: 'Brazil', label: 'Brazil' },
  { code: 'India', label: 'India' },
  { code: 'Mexico', label: 'Mexico' },
  { code: 'Taiwan', label: 'Taiwan' },
  { code: 'Saudi Arabia', label: 'Saudi Arabia' },
  { code: 'Israel', label: 'Israel' },
  { code: 'RoW', label: 'RoW (Other)' },
] as const;

const PHARMA_STAGES = [
  { value: 'preclinical', label: 'Preclinical' },
  { value: 'phase1', label: 'Phase 1' },
  { value: 'phase2', label: 'Phase 2' },
  { value: 'phase3', label: 'Phase 3' },
  { value: 'approved', label: 'Approved' },
] as const;

const DEVICE_STAGES = [
  { value: 'concept', label: 'Concept' },
  { value: 'preclinical', label: 'Preclinical' },
  { value: 'clinical_trial', label: 'Clinical Trial' },
  { value: 'fda_submitted', label: 'FDA Submitted' },
  { value: 'cleared_approved', label: 'Cleared/Approved' },
  { value: 'commercial', label: 'Commercial' },
] as const;

const PRICING_OPTIONS = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'base', label: 'Base' },
  { value: 'premium', label: 'Premium' },
] as const;

const DEVICE_CATEGORY_GROUPS = [
  {
    label: 'Surgical',
    options: [
      { value: 'cardiovascular', label: 'Cardiovascular' },
      { value: 'orthopedic', label: 'Orthopedic' },
      { value: 'neurology', label: 'Neurology' },
      { value: 'general_surgery', label: 'General Surgery' },
      { value: 'vascular', label: 'Vascular' },
      { value: 'ent', label: 'ENT' },
      { value: 'urology', label: 'Urology' },
      { value: 'ophthalmology', label: 'Ophthalmology' },
    ],
  },
  {
    label: 'Oncology',
    options: [
      { value: 'oncology_surgical', label: 'Oncology — Surgical' },
      { value: 'oncology_radiation', label: 'Oncology — Radiation Therapy' },
    ],
  },
  {
    label: 'Metabolic / Monitoring',
    options: [
      { value: 'diabetes_metabolic', label: 'Diabetes / Metabolic' },
      { value: 'respiratory', label: 'Respiratory' },
      { value: 'renal_dialysis', label: 'Renal / Dialysis' },
    ],
  },
  {
    label: 'Diagnostics (IVD)',
    options: [
      { value: 'ivd_oncology', label: 'IVD — Oncology' },
      { value: 'ivd_infectious', label: 'IVD — Infectious Disease' },
      { value: 'ivd_cardiology', label: 'IVD — Cardiology' },
      { value: 'ivd_genetics', label: 'IVD — Genetics / Genomics' },
    ],
  },
  {
    label: 'Other Specialties',
    options: [
      { value: 'wound_care', label: 'Wound Care' },
      { value: 'endoscopy_gi', label: 'Endoscopy / GI' },
      { value: 'dental', label: 'Dental' },
      { value: 'dermatology', label: 'Dermatology' },
      { value: 'imaging_radiology', label: 'Imaging / Radiology' },
    ],
  },
];

const DEVICE_SETTINGS = [
  { value: 'hospital_inpatient', label: 'Hospital Inpatient' },
  { value: 'hospital_outpatient', label: 'Hospital Outpatient' },
  { value: 'asc', label: 'ASC' },
  { value: 'office', label: 'Office' },
  { value: 'home', label: 'Home' },
  { value: 'lab', label: 'Lab' },
] as const;

const PRICING_MODEL_OPTIONS = [
  { value: 'per_procedure', label: 'Per Procedure' },
  { value: 'per_unit_capital', label: 'Per Unit (Capital)' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'subscription', label: 'Subscription' },
];

const REIMBURSEMENT_OPTIONS = [
  { value: 'covered', label: 'Covered' },
  { value: 'coverage_pending', label: 'Coverage Pending' },
  { value: 'unlisted', label: 'Unlisted' },
  { value: 'self_pay', label: 'Self-Pay' },
];

const TEST_TYPE_OPTIONS = [
  { value: 'IHC', label: 'IHC' },
  { value: 'FISH', label: 'FISH' },
  { value: 'PCR', label: 'PCR' },
  { value: 'NGS_panel', label: 'NGS Panel' },
  { value: 'liquid_biopsy', label: 'Liquid Biopsy' },
  { value: 'WGS', label: 'WGS' },
  { value: 'RNA_seq', label: 'RNA-seq' },
];

const CDX_STAGE_OPTIONS = [
  { value: 'discovery', label: 'Discovery' },
  { value: 'analytical_validation', label: 'Analytical Validation' },
  { value: 'clinical_validation', label: 'Clinical Validation' },
  { value: 'pma_submitted', label: 'PMA Submitted' },
  { value: 'approved', label: 'Approved' },
];

const CDX_TEST_SETTINGS = [
  { value: 'pathology_lab', label: 'Pathology Lab (Hospital)' },
  { value: 'central_lab', label: 'Central / Reference Lab' },
  { value: 'point_of_care', label: 'Point of Care (Near-patient)' },
] as const;

// ────────────────────────────────────────────────────────────
// Zod Schemas
// ────────────────────────────────────────────────────────────

const pharmaSchema = z.object({
  indication: z.string().min(1, 'Indication is required'),
  subtype: z.string().optional(),
  geography: z.array(z.string()).min(1, 'Select at least one geography'),
  development_stage: z.string().default('phase2'),
  mechanism: z.string().optional(),
  patient_segment: z.string().optional(),
  pricing_assumption: z.string().default('base'),
  launch_year: z.coerce.number().min(2025).max(2040).default(2028),
});

const deviceSchema = z.object({
  procedure_or_condition: z.string().min(1, 'Procedure or condition is required'),
  device_category: z.string().default('cardiovascular'),
  target_setting: z.array(z.string()).min(1, 'Select at least one setting'),
  physician_specialty: z.array(z.string()).optional(),
  development_stage: z.string().default('clinical_trial'),
  pricing_model: z.string().default('per_procedure'),
  unit_ase: z.coerce.number().min(0, 'Unit ASE is required'),
  disposables_per_procedure: z.coerce.number().optional(),
  disposable_ase: z.coerce.number().optional(),
  service_contract_annual: z.coerce.number().optional(),
  reimbursement_status: z.string().default('covered'),
  geography: z.array(z.string()).min(1, 'Select at least one geography'),
  launch_year: z.coerce.number().min(2025).max(2040).default(2028),
});

const cdxSchema = z.object({
  drug_indication: z.string().min(1, 'Drug indication is required'),
  biomarker: z.string().min(1, 'Biomarker is required'),
  biomarker_prevalence_pct: z.coerce.number().min(1).max(100),
  test_type: z.string().default('NGS_panel'),
  test_setting: z.array(z.string()).min(1, 'Select at least one test setting'),
  test_ase: z.coerce.number().min(0, 'Test ASE is required'),
  drug_development_stage: z.string().default('phase2'),
  cdx_development_stage: z.string().default('clinical_validation'),
  geography: z.array(z.string()).min(1, 'Select at least one geography'),
  launch_year: z.coerce.number().min(2025).max(2040).default(2028),
});

const nutraSchema = z.object({
  primary_ingredient: z.string().min(1, 'Primary ingredient is required'),
  health_focus: z.string().min(1, 'Health focus is required'),
  nutraceutical_category: z.string().default('dietary_supplement'),
  target_demographic: z.string().optional(),
  claim_type: z.string().default('structure_function'),
  channels: z.array(z.string()).min(1, 'Select at least one channel'),
  unit_price: z.coerce.number().min(0, 'Unit price is required'),
  units_per_year_per_customer: z.coerce.number().min(1).max(24).default(12),
  cogs_pct: z.coerce.number().min(1).max(99).default(30),
  development_stage: z.string().default('market_ready'),
  has_clinical_data: z.boolean().default(false),
  patent_protected: z.boolean().default(false),
  geography: z.array(z.string()).min(1, 'Select at least one geography'),
  launch_year: z.coerce.number().min(2025).max(2040).default(2026),
});

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

// Build filterHint prop from FilteredSuggestions
function toFilterHint(fs: FilteredSuggestions) {
  if (!fs.isFiltered) return null;
  return { filteredCount: fs.filteredCount, totalCount: fs.totalCount, source: fs.filterSource };
}

type FormMode = 'pharma' | 'device' | 'cdx' | 'nutra';

function getFormMode(category: ProductCategory): FormMode {
  if (category === 'pharmaceutical') return 'pharma';
  if (category === 'nutraceutical') return 'nutra';
  if (category === 'diagnostics_companion' || category === 'diagnostics_ivd') return 'cdx';
  return 'device';
}

// ────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────

interface MarketSizingFormProps {
  onSubmit: (productCategory: string, formData: Record<string, unknown>) => void;
  isLoading: boolean;
}

// ────────────────────────────────────────────────────────────
// Reusable sub-components
// ────────────────────────────────────────────────────────────

function SectionDivider() {
  return <div className="border-t border-navy-700" />;
}

function CheckboxItem({ checked, label, onToggle }: { checked: boolean; label: string; onToggle: () => void }) {
  return (
    <label
      className={cn(
        'flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer text-xs transition-colors',
        checked
          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
          : 'bg-navy-800 text-slate-400 border border-transparent hover:border-navy-600',
      )}
    >
      <input type="checkbox" checked={checked} onChange={onToggle} className="sr-only" />
      <div
        className={cn(
          'w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0',
          checked ? 'bg-teal-500 border-teal-500' : 'border-slate-600',
        )}
      >
        {checked && (
          <svg className="w-2 h-2 text-navy-950" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="truncate">{label}</span>
    </label>
  );
}

function GeographyGrid({
  selected,
  onToggle,
  error,
}: {
  selected: string[];
  onToggle: (code: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="input-label">Geographies</label>
      <div className="grid grid-cols-2 gap-1.5 mt-1">
        {GEOGRAPHIES.map((geo) => (
          <CheckboxItem
            key={geo.code}
            checked={selected.includes(geo.code)}
            label={geo.label}
            onToggle={() => onToggle(geo.code)}
          />
        ))}
      </div>
      {error && <p className="text-xs text-signal-red mt-1">{error}</p>}
    </div>
  );
}

function PillSelector<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="input-label">{label}</label>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-3 py-1.5 rounded text-xs font-medium border transition-colors',
              value === opt.value
                ? 'bg-teal-500/10 border-teal-500 text-teal-500'
                : 'bg-navy-800 border-navy-700 text-slate-400 hover:border-navy-600',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiCheckboxGrid({
  label,
  options,
  selected,
  onToggle,
  error,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="input-label">{label}</label>
      <div className="grid grid-cols-2 gap-1.5 mt-1">
        {options.map((opt) => (
          <CheckboxItem
            key={opt.value}
            checked={selected.includes(opt.value)}
            label={opt.label}
            onToggle={() => onToggle(opt.value)}
          />
        ))}
      </div>
      {error && <p className="text-xs text-signal-red mt-1">{error}</p>}
    </div>
  );
}

function PricingAssumptionCards({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="input-label">Pricing Assumption</label>
      <div className="grid grid-cols-3 gap-1.5 mt-1">
        {PRICING_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-3 py-2 rounded-md text-xs font-medium border transition-colors text-center',
              value === opt.value
                ? 'bg-teal-500/10 border-teal-500 text-teal-500'
                : 'bg-navy-800 border-navy-700 text-slate-400 hover:border-navy-600',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────

export default function MarketSizingForm({ onSubmit, isLoading }: MarketSizingFormProps) {
  const [productCategory, setProductCategory] = useState<ProductCategory>('pharmaceutical');
  const formMode = getFormMode(productCategory);

  return (
    <div className="card noise space-y-6">
      <ProductTypeSelector value={productCategory} onChange={setProductCategory} />

      <SectionDivider />

      {formMode === 'pharma' && (
        <PharmaForm productCategory={productCategory} onSubmit={onSubmit} isLoading={isLoading} />
      )}
      {formMode === 'device' && (
        <DeviceForm productCategory={productCategory} onSubmit={onSubmit} isLoading={isLoading} />
      )}
      {formMode === 'cdx' && <CdxForm productCategory={productCategory} onSubmit={onSubmit} isLoading={isLoading} />}
      {formMode === 'nutra' && (
        <NutraForm productCategory={productCategory} onSubmit={onSubmit} isLoading={isLoading} />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PHARMA FORM
// ────────────────────────────────────────────────────────────

function PharmaForm({
  productCategory,
  onSubmit,
  isLoading,
}: {
  productCategory: string;
  onSubmit: (category: string, data: Record<string, unknown>) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pharmaSchema),
    mode: 'onTouched',
    defaultValues: {
      indication: '',
      subtype: '',
      geography: ['US'] as string[],
      development_stage: 'phase2',
      mechanism: '',
      patient_segment: '',
      pricing_assumption: 'base',
      launch_year: 2028,
    },
  });

  const indication = watch('indication');
  const geography = watch('geography');
  const developmentStage = watch('development_stage');
  const pricingAssumption = watch('pricing_assumption');

  // Indication-aware filtered suggestions (lazy-loaded from competitor-database)
  const [filteredSubtypes, setFilteredSubtypes] = useState<FilteredSuggestions>({
    items: [],
    isFiltered: false,
    totalCount: 0,
    filteredCount: 0,
    filterSource: '',
  });
  const [filteredMechanisms, setFilteredMechanisms] = useState<FilteredSuggestions>({
    items: [],
    isFiltered: false,
    totalCount: 0,
    filteredCount: 0,
    filterSource: '',
  });
  useEffect(() => {
    let cancelled = false;
    async function loadFiltered() {
      const [subtypes, mechanisms] = await Promise.all([
        getSubtypesForIndication(indication),
        getMechanismsForIndication(indication),
      ]);
      if (!cancelled) {
        setFilteredSubtypes(subtypes);
        setFilteredMechanisms(mechanisms);
      }
    }
    loadFiltered();
    return () => {
      cancelled = true;
    };
  }, [indication]);

  // Clear subtype & mechanism when indication changes (they may no longer be relevant)
  const prevIndicationRef = useRef(indication);
  useEffect(() => {
    if (indication !== prevIndicationRef.current) {
      prevIndicationRef.current = indication;
      setValue('subtype', '');
      setValue('mechanism', '');
    }
  }, [indication, setValue]);

  const toggleGeo = useCallback(
    (code: string) => {
      let next: string[];
      if (code === 'Global') {
        // Toggle Global: if already selected, deselect; otherwise select only Global
        next = geography.includes('Global') ? [] : ['Global'];
      } else {
        // Toggle individual territory: remove Global if present
        const withoutGlobal = geography.filter((g) => g !== 'Global');
        next = withoutGlobal.includes(code) ? withoutGlobal.filter((g) => g !== code) : [...withoutGlobal, code];
      }
      setValue('geography', next, { shouldValidate: true });
    },
    [geography, setValue],
  );

  const doSubmit = handleSubmit((data) => {
    onSubmit(productCategory, data as Record<string, unknown>);
  });

  return (
    <form onSubmit={doSubmit} className="space-y-5">
      <IndicationAutocomplete
        label="Indication"
        value={watch('indication')}
        onChange={(v) => setValue('indication', v, { shouldValidate: true })}
        error={errors.indication?.message}
      />

      <FuzzyAutocomplete
        label="Subtype / Specifics"
        value={watch('subtype') || ''}
        onChange={(v) => setValue('subtype', v)}
        items={filteredSubtypes.items}
        popularItems={filteredSubtypes.isFiltered ? undefined : POPULAR_SUBTYPES}
        storageKey="terrain:recent-subtypes"
        placeholder={indication ? `Subtypes for ${indication}` : 'Select indication first'}
        filterHint={toFilterHint(filteredSubtypes)}
      />

      <SectionDivider />

      <GeographyGrid selected={geography} onToggle={toggleGeo} error={errors.geography?.message} />

      <SectionDivider />

      <PillSelector
        label="Development Stage"
        options={PHARMA_STAGES}
        value={developmentStage as (typeof PHARMA_STAGES)[number]['value']}
        onChange={(v) => setValue('development_stage', v)}
      />

      <FuzzyAutocomplete
        label="Mechanism of Action"
        value={watch('mechanism') || ''}
        onChange={(v) => setValue('mechanism', v)}
        items={filteredMechanisms.items}
        popularItems={filteredMechanisms.isFiltered ? undefined : POPULAR_MECHANISMS}
        storageKey="terrain:recent-mechanisms"
        placeholder={indication ? `Mechanisms for ${indication}` : 'e.g., KRAS G12C inhibitor'}
        filterHint={toFilterHint(filteredMechanisms)}
      />

      <FuzzyAutocomplete
        label="Patient Segment"
        value={watch('patient_segment') || ''}
        onChange={(v) => setValue('patient_segment', v)}
        items={PATIENT_SEGMENT_SUGGESTIONS}
        popularItems={POPULAR_SEGMENTS}
        storageKey="terrain:recent-segments"
        placeholder="e.g., 2L+ after platinum-based chemo"
      />

      <SectionDivider />

      <PricingAssumptionCards value={pricingAssumption} onChange={(v) => setValue('pricing_assumption', v)} />

      <Input
        label="Expected Launch Year"
        type="number"
        {...register('launch_year')}
        min={2025}
        max={2040}
        step={1}
        error={errors.launch_year?.message}
      />

      <SectionDivider />

      <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
        Generate Analysis
      </Button>
    </form>
  );
}

// ────────────────────────────────────────────────────────────
// DEVICE FORM
// ────────────────────────────────────────────────────────────

function DeviceForm({
  productCategory,
  onSubmit,
  isLoading,
}: {
  productCategory: string;
  onSubmit: (category: string, data: Record<string, unknown>) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(deviceSchema),
    mode: 'onTouched',
    defaultValues: {
      procedure_or_condition: '',
      device_category: 'cardiovascular',
      target_setting: [] as string[],
      physician_specialty: [] as string[],
      development_stage: 'clinical_trial',
      pricing_model: 'per_procedure',
      unit_ase: undefined as unknown as number,
      disposables_per_procedure: undefined as unknown as number,
      disposable_ase: undefined as unknown as number,
      service_contract_annual: undefined as unknown as number,
      reimbursement_status: 'covered',
      geography: ['US'] as string[],
      launch_year: 2028,
    },
  });

  const procedureOrCondition = watch('procedure_or_condition');
  const geography = watch('geography');
  const targetSetting = watch('target_setting');
  const developmentStage = watch('development_stage');

  // Procedure-aware filtered specialties
  const filteredSpecialties = useMemo(() => getSpecialtiesForProcedure(procedureOrCondition), [procedureOrCondition]);

  // Auto-set target setting when procedure changes
  const prevProcedureRef = useRef(procedureOrCondition);
  useEffect(() => {
    if (procedureOrCondition !== prevProcedureRef.current) {
      prevProcedureRef.current = procedureOrCondition;
      // Auto-set target setting from procedure data
      const defaultSetting = getSettingForProcedure(procedureOrCondition);
      if (defaultSetting) {
        setValue('target_setting', [defaultSetting], { shouldValidate: true });
      }
      // Clear specialty (may no longer be relevant)
      setValue('physician_specialty', []);
    }
  }, [procedureOrCondition, setValue]);

  const toggleGeo = useCallback(
    (code: string) => {
      let next: string[];
      if (code === 'Global') {
        next = geography.includes('Global') ? [] : ['Global'];
      } else {
        const withoutGlobal = geography.filter((g) => g !== 'Global');
        next = withoutGlobal.includes(code) ? withoutGlobal.filter((g) => g !== code) : [...withoutGlobal, code];
      }
      setValue('geography', next, { shouldValidate: true });
    },
    [geography, setValue],
  );

  const toggleSetting = useCallback(
    (value: string) => {
      const next = targetSetting.includes(value) ? targetSetting.filter((s) => s !== value) : [...targetSetting, value];
      setValue('target_setting', next, { shouldValidate: true });
    },
    [targetSetting, setValue],
  );

  const doSubmit = handleSubmit((data) => {
    onSubmit(productCategory, data as Record<string, unknown>);
  });

  return (
    <form onSubmit={doSubmit} className="space-y-5">
      <FuzzyAutocomplete
        label="Procedure or Condition"
        value={procedureOrCondition}
        onChange={(v) => setValue('procedure_or_condition', v, { shouldValidate: true })}
        items={PROCEDURE_SUGGESTIONS}
        popularItems={POPULAR_PROCEDURES}
        storageKey="terrain:recent-procedures"
        placeholder="e.g., Total knee replacement"
        error={errors.procedure_or_condition?.message}
      />

      <Select
        label="Device Category"
        groups={DEVICE_CATEGORY_GROUPS}
        {...register('device_category')}
        error={errors.device_category?.message}
      />

      <SectionDivider />

      <MultiCheckboxGrid
        label="Target Setting"
        options={DEVICE_SETTINGS}
        selected={targetSetting}
        onToggle={toggleSetting}
        error={errors.target_setting?.message}
      />

      <FuzzyAutocomplete
        label="Physician Specialty"
        value={(watch('physician_specialty') as string[] | undefined)?.[0] || ''}
        onChange={(v) => setValue('physician_specialty', v ? [v] : [])}
        items={filteredSpecialties.items}
        storageKey="terrain:recent-specialties"
        placeholder={procedureOrCondition ? `Specialties for ${procedureOrCondition}` : 'e.g., Orthopedic surgeon'}
        filterHint={toFilterHint(filteredSpecialties)}
      />

      <SectionDivider />

      <PillSelector
        label="Development Stage"
        options={DEVICE_STAGES}
        value={developmentStage as (typeof DEVICE_STAGES)[number]['value']}
        onChange={(v) => setValue('development_stage', v)}
      />

      <SectionDivider />

      <Select label="Pricing Model" options={PRICING_MODEL_OPTIONS} {...register('pricing_model')} />

      <Input
        label="Unit ASE ($)"
        type="number"
        {...register('unit_ase')}
        step="1"
        min={0}
        placeholder="0"
        error={errors.unit_ase?.message}
      />

      <Input
        label="Disposables per Procedure"
        type="number"
        {...register('disposables_per_procedure')}
        step="1"
        min={0}
        placeholder="Optional"
      />

      <Input
        label="Disposable ASE ($)"
        type="number"
        {...register('disposable_ase')}
        step="1"
        min={0}
        placeholder="Optional"
      />

      <Input
        label="Service Contract Annual ($)"
        type="number"
        {...register('service_contract_annual')}
        step="1"
        min={0}
        placeholder="Optional"
      />

      <SectionDivider />

      <Select label="Reimbursement Status" options={REIMBURSEMENT_OPTIONS} {...register('reimbursement_status')} />

      <GeographyGrid selected={geography} onToggle={toggleGeo} error={errors.geography?.message} />

      <Input
        label="Expected Launch Year"
        type="number"
        {...register('launch_year')}
        min={2025}
        max={2040}
        step={1}
        error={errors.launch_year?.message}
      />

      <SectionDivider />

      <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
        Generate Analysis
      </Button>
    </form>
  );
}

// ────────────────────────────────────────────────────────────
// CDx FORM
// ────────────────────────────────────────────────────────────

function CdxForm({
  productCategory,
  onSubmit,
  isLoading,
}: {
  productCategory: string;
  onSubmit: (category: string, data: Record<string, unknown>) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cdxSchema),
    mode: 'onTouched',
    defaultValues: {
      drug_indication: '',
      biomarker: '',
      biomarker_prevalence_pct: undefined as unknown as number,
      test_type: 'NGS_panel',
      test_setting: ['pathology_lab'] as string[],
      test_ase: undefined as unknown as number,
      drug_development_stage: 'phase2',
      cdx_development_stage: 'clinical_validation',
      geography: ['US'] as string[],
      launch_year: 2028,
    },
  });

  const drugIndication = watch('drug_indication');
  const geography = watch('geography');
  const testSetting = watch('test_setting');
  const drugStage = watch('drug_development_stage');
  const biomarker = watch('biomarker');
  const prevalence = watch('biomarker_prevalence_pct');

  // Indication-aware filtered biomarkers
  const filteredBiomarkers = useMemo(() => getBiomarkersForIndication(drugIndication), [drugIndication]);

  // Clear biomarker when drug indication changes
  const prevDrugIndicationRef = useRef(drugIndication);
  useEffect(() => {
    if (drugIndication !== prevDrugIndicationRef.current) {
      prevDrugIndicationRef.current = drugIndication;
      setValue('biomarker', '');
      setValue('biomarker_prevalence_pct', undefined as unknown as number);
    }
  }, [drugIndication, setValue]);

  // Auto-fill biomarker prevalence when a known biomarker is selected
  const prevBiomarkerRef = useRef(biomarker);
  useEffect(() => {
    if (biomarker && biomarker !== prevBiomarkerRef.current) {
      prevBiomarkerRef.current = biomarker;
      const match = BIOMARKER_PREVALENCE[biomarker];
      if (match && (!prevalence || prevalence === 0)) {
        setValue('biomarker_prevalence_pct', match.prevalence_pct);
      }
    }
  }, [biomarker, prevalence, setValue]);

  const autoFilledContext = biomarker && BIOMARKER_PREVALENCE[biomarker]?.context;

  const toggleGeo = useCallback(
    (code: string) => {
      let next: string[];
      if (code === 'Global') {
        // Toggle Global: if already selected, deselect; otherwise select only Global
        next = geography.includes('Global') ? [] : ['Global'];
      } else {
        // Toggle individual territory: remove Global if present
        const withoutGlobal = geography.filter((g) => g !== 'Global');
        next = withoutGlobal.includes(code) ? withoutGlobal.filter((g) => g !== code) : [...withoutGlobal, code];
      }
      setValue('geography', next, { shouldValidate: true });
    },
    [geography, setValue],
  );

  const toggleTestSetting = useCallback(
    (value: string) => {
      const next = testSetting.includes(value) ? testSetting.filter((s) => s !== value) : [...testSetting, value];
      setValue('test_setting', next, { shouldValidate: true });
    },
    [testSetting, setValue],
  );

  const doSubmit = handleSubmit((data) => {
    onSubmit(productCategory, data as Record<string, unknown>);
  });

  return (
    <form onSubmit={doSubmit} className="space-y-5">
      <IndicationAutocomplete
        label="Drug Indication"
        value={watch('drug_indication')}
        onChange={(v) => setValue('drug_indication', v, { shouldValidate: true })}
        placeholder="e.g., NSCLC EGFR+"
        error={errors.drug_indication?.message}
      />

      <FuzzyAutocomplete
        label="Biomarker"
        value={watch('biomarker')}
        onChange={(v) => setValue('biomarker', v, { shouldValidate: true })}
        items={filteredBiomarkers.items}
        popularItems={filteredBiomarkers.isFiltered ? undefined : POPULAR_BIOMARKERS}
        storageKey="terrain:recent-biomarkers"
        placeholder={drugIndication ? `Biomarkers for ${drugIndication}` : 'e.g., EGFR exon 19/21 deletion'}
        error={errors.biomarker?.message}
        filterHint={toFilterHint(filteredBiomarkers)}
      />

      <div>
        <Input
          label="Biomarker Prevalence (%)"
          type="number"
          {...register('biomarker_prevalence_pct')}
          min={1}
          max={100}
          step={1}
          placeholder="1-100"
          error={errors.biomarker_prevalence_pct?.message}
        />
        {autoFilledContext && prevalence && (
          <p className="text-2xs text-teal-500/70 mt-1">Auto-filled from {autoFilledContext}. Adjust as needed.</p>
        )}
      </div>

      <SectionDivider />

      <Select label="Test Type" options={TEST_TYPE_OPTIONS} {...register('test_type')} />

      <MultiCheckboxGrid
        label="Test Setting"
        options={CDX_TEST_SETTINGS}
        selected={testSetting}
        onToggle={toggleTestSetting}
        error={errors.test_setting?.message}
      />

      <Input
        label="Test ASE ($)"
        type="number"
        {...register('test_ase')}
        step="1"
        min={0}
        placeholder="0"
        error={errors.test_ase?.message}
      />

      <SectionDivider />

      <PillSelector
        label="Drug Development Stage"
        options={PHARMA_STAGES}
        value={drugStage as (typeof PHARMA_STAGES)[number]['value']}
        onChange={(v) => setValue('drug_development_stage', v)}
      />

      <Select label="CDx Development Stage" options={CDX_STAGE_OPTIONS} {...register('cdx_development_stage')} />

      <SectionDivider />

      <GeographyGrid selected={geography} onToggle={toggleGeo} error={errors.geography?.message} />

      <Input
        label="Expected Launch Year"
        type="number"
        {...register('launch_year')}
        min={2025}
        max={2040}
        step={1}
        error={errors.launch_year?.message}
      />

      <SectionDivider />

      <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
        Generate Analysis
      </Button>
    </form>
  );
}

// ────────────────────────────────────────────────────────────
// NUTRACEUTICAL / CONSUMER HEALTH FORM
// ────────────────────────────────────────────────────────────

function NutraForm({
  productCategory,
  onSubmit,
  isLoading,
}: {
  productCategory: string;
  onSubmit: (category: string, data: Record<string, unknown>) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(nutraSchema),
    mode: 'onTouched',
    defaultValues: {
      primary_ingredient: '',
      health_focus: '',
      nutraceutical_category: 'dietary_supplement',
      target_demographic: '',
      claim_type: 'structure_function',
      channels: ['dtc_ecommerce'] as string[],
      unit_price: undefined as unknown as number,
      units_per_year_per_customer: 12,
      cogs_pct: 30,
      development_stage: 'market_ready',
      has_clinical_data: false,
      patent_protected: false,
      geography: ['US'] as string[],
      launch_year: 2026,
    },
  });

  const primaryIngredient = watch('primary_ingredient');
  const geography = watch('geography');
  const channels = watch('channels');
  const developmentStage = watch('development_stage');
  const hasClinicalData = watch('has_clinical_data');
  const patentProtected = watch('patent_protected');

  // Ingredient-aware filtered health focus suggestions
  const filteredHealthFocus = useMemo((): FilteredSuggestions => {
    if (!primaryIngredient)
      return {
        items: HEALTH_FOCUS_SUGGESTIONS as SuggestionItem[],
        isFiltered: false,
        totalCount: HEALTH_FOCUS_SUGGESTIONS.length,
        filteredCount: HEALTH_FOCUS_SUGGESTIONS.length,
        filterSource: '',
      };
    // Find ingredient category
    const ingredientMatch = (INGREDIENT_SUGGESTIONS as SuggestionItem[]).find(
      (i) => i.name.toLowerCase() === primaryIngredient.toLowerCase(),
    );
    if (!ingredientMatch?.category)
      return {
        items: HEALTH_FOCUS_SUGGESTIONS as SuggestionItem[],
        isFiltered: false,
        totalCount: HEALTH_FOCUS_SUGGESTIONS.length,
        filteredCount: HEALTH_FOCUS_SUGGESTIONS.length,
        filterSource: '',
      };
    const cat = ingredientMatch.category.toLowerCase();
    const result = (HEALTH_FOCUS_SUGGESTIONS as SuggestionItem[]).filter(
      (h) => h.category && h.category.toLowerCase().includes(cat),
    );
    if (result.length === 0)
      return {
        items: HEALTH_FOCUS_SUGGESTIONS as SuggestionItem[],
        isFiltered: false,
        totalCount: HEALTH_FOCUS_SUGGESTIONS.length,
        filteredCount: HEALTH_FOCUS_SUGGESTIONS.length,
        filterSource: '',
      };
    return {
      items: result,
      isFiltered: true,
      totalCount: HEALTH_FOCUS_SUGGESTIONS.length,
      filteredCount: result.length,
      filterSource: primaryIngredient,
    };
  }, [primaryIngredient]);

  // Clear health focus when ingredient changes
  const prevIngredientRef = useRef(primaryIngredient);
  useEffect(() => {
    if (primaryIngredient !== prevIngredientRef.current) {
      prevIngredientRef.current = primaryIngredient;
      setValue('health_focus', '');
    }
  }, [primaryIngredient, setValue]);

  const toggleGeo = useCallback(
    (code: string) => {
      let next: string[];
      if (code === 'Global') {
        next = geography.includes('Global') ? [] : ['Global'];
      } else {
        const withoutGlobal = geography.filter((g) => g !== 'Global');
        next = withoutGlobal.includes(code) ? withoutGlobal.filter((g) => g !== code) : [...withoutGlobal, code];
      }
      setValue('geography', next, { shouldValidate: true });
    },
    [geography, setValue],
  );

  const toggleChannel = useCallback(
    (value: string) => {
      const next = channels.includes(value) ? channels.filter((c) => c !== value) : [...channels, value];
      setValue('channels', next, { shouldValidate: true });
    },
    [channels, setValue],
  );

  const doSubmit = handleSubmit((data) => {
    onSubmit(productCategory, data as Record<string, unknown>);
  });

  return (
    <form onSubmit={doSubmit} className="space-y-5">
      <FuzzyAutocomplete
        label="Primary Ingredient / Product"
        value={primaryIngredient}
        onChange={(v) => setValue('primary_ingredient', v, { shouldValidate: true })}
        items={INGREDIENT_SUGGESTIONS as SuggestionItem[]}
        popularItems={POPULAR_INGREDIENTS}
        storageKey="terrain:recent-ingredients"
        placeholder="e.g., NMN, Creatine, Probiotics"
        error={errors.primary_ingredient?.message}
      />

      <FuzzyAutocomplete
        label="Health Focus / Category"
        value={watch('health_focus')}
        onChange={(v) => setValue('health_focus', v, { shouldValidate: true })}
        items={filteredHealthFocus.items}
        storageKey="terrain:recent-health-focus"
        placeholder={primaryIngredient ? `Health focus for ${primaryIngredient}` : 'e.g., Longevity / NAD+ restoration'}
        error={errors.health_focus?.message}
        filterHint={toFilterHint(filteredHealthFocus)}
      />

      <Select label="Product Type" options={NUTRACEUTICAL_CATEGORY_OPTIONS} {...register('nutraceutical_category')} />

      <Input
        label="Target Demographic"
        {...register('target_demographic')}
        placeholder="e.g., Adults 40-65, health-optimizers"
      />

      <SectionDivider />

      <Select label="Claim Type" options={CLAIM_TYPE_OPTIONS} {...register('claim_type')} />

      <MultiCheckboxGrid
        label="Distribution Channels"
        options={NUTRACEUTICAL_CHANNEL_OPTIONS}
        selected={channels}
        onToggle={toggleChannel}
        error={errors.channels?.message}
      />

      <SectionDivider />

      <Input
        label="Unit Retail Price ($)"
        type="number"
        {...register('unit_price')}
        step="0.01"
        min={0}
        placeholder="e.g., 49.99"
        error={errors.unit_price?.message}
      />

      <Input
        label="Units per Customer per Year"
        type="number"
        {...register('units_per_year_per_customer')}
        step="1"
        min={1}
        max={24}
        placeholder="12"
      />

      <Input
        label="COGS (% of retail)"
        type="number"
        {...register('cogs_pct')}
        step="1"
        min={1}
        max={99}
        placeholder="30"
      />

      <SectionDivider />

      <PillSelector
        label="Development Stage"
        options={NUTRACEUTICAL_STAGES}
        value={developmentStage as (typeof NUTRACEUTICAL_STAGES)[number]['value']}
        onChange={(v) => setValue('development_stage', v)}
      />

      <div className="grid grid-cols-2 gap-3">
        <label
          className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-md cursor-pointer text-xs border transition-colors',
            hasClinicalData
              ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
              : 'bg-navy-800 text-slate-400 border-navy-700 hover:border-navy-600',
          )}
        >
          <input
            type="checkbox"
            checked={hasClinicalData}
            onChange={(e) => setValue('has_clinical_data', e.target.checked)}
            className="sr-only"
          />
          <div
            className={cn(
              'w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0',
              hasClinicalData ? 'bg-teal-500 border-teal-500' : 'border-slate-600',
            )}
          >
            {hasClinicalData && (
              <svg className="w-2 h-2 text-navy-950" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          Clinical Data
        </label>

        <label
          className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-md cursor-pointer text-xs border transition-colors',
            patentProtected
              ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
              : 'bg-navy-800 text-slate-400 border-navy-700 hover:border-navy-600',
          )}
        >
          <input
            type="checkbox"
            checked={patentProtected}
            onChange={(e) => setValue('patent_protected', e.target.checked)}
            className="sr-only"
          />
          <div
            className={cn(
              'w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0',
              patentProtected ? 'bg-teal-500 border-teal-500' : 'border-slate-600',
            )}
          >
            {patentProtected && (
              <svg className="w-2 h-2 text-navy-950" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          Patent Protected
        </label>
      </div>

      <SectionDivider />

      <GeographyGrid selected={geography} onToggle={toggleGeo} error={errors.geography?.message} />

      <Input
        label="Expected Launch Year"
        type="number"
        {...register('launch_year')}
        min={2025}
        max={2040}
        step={1}
        error={errors.launch_year?.message}
      />

      <SectionDivider />

      <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
        Generate Analysis
      </Button>
    </form>
  );
}
