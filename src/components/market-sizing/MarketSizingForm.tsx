"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { IndicationAutocomplete } from "@/components/ui/IndicationAutocomplete";
import { ProductTypeSelector } from "@/components/shared/ProductTypeSelector";
import type { ProductCategory } from "@/types/devices-diagnostics";

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const GEOGRAPHIES = [
  { code: "US", label: "US" },
  { code: "EU5", label: "EU5" },
  { code: "Germany", label: "Germany" },
  { code: "France", label: "France" },
  { code: "Italy", label: "Italy" },
  { code: "Spain", label: "Spain" },
  { code: "UK", label: "UK" },
  { code: "Japan", label: "Japan" },
  { code: "China", label: "China" },
  { code: "Canada", label: "Canada" },
  { code: "Australia", label: "Australia" },
  { code: "RoW", label: "RoW" },
] as const;

const PHARMA_STAGES = [
  { value: "preclinical", label: "Preclinical" },
  { value: "phase1", label: "Phase 1" },
  { value: "phase2", label: "Phase 2" },
  { value: "phase3", label: "Phase 3" },
  { value: "approved", label: "Approved" },
] as const;

const DEVICE_STAGES = [
  { value: "concept", label: "Concept" },
  { value: "preclinical", label: "Preclinical" },
  { value: "clinical_trial", label: "Clinical Trial" },
  { value: "fda_submitted", label: "FDA Submitted" },
  { value: "cleared_approved", label: "Cleared/Approved" },
  { value: "commercial", label: "Commercial" },
] as const;

const PRICING_OPTIONS = [
  { value: "conservative", label: "Conservative" },
  { value: "base", label: "Base" },
  { value: "premium", label: "Premium" },
] as const;

const DEVICE_CATEGORY_OPTIONS = [
  { value: "cardiovascular", label: "Cardiovascular" },
  { value: "orthopedic", label: "Orthopedic" },
  { value: "neurology", label: "Neurology" },
  { value: "diabetes_metabolic", label: "Diabetes / Metabolic" },
  { value: "oncology_surgical", label: "Oncology — Surgical" },
  { value: "wound_care", label: "Wound Care" },
  { value: "ophthalmology", label: "Ophthalmology" },
  { value: "endoscopy_gi", label: "Endoscopy / GI" },
  { value: "general_surgery", label: "General Surgery" },
  { value: "ivd_oncology", label: "IVD — Oncology" },
];

const DEVICE_SETTINGS = [
  { value: "hospital_inpatient", label: "Hospital Inpatient" },
  { value: "hospital_outpatient", label: "Hospital Outpatient" },
  { value: "asc", label: "ASC" },
  { value: "office", label: "Office" },
  { value: "home", label: "Home" },
  { value: "lab", label: "Lab" },
] as const;

const PRICING_MODEL_OPTIONS = [
  { value: "per_procedure", label: "Per Procedure" },
  { value: "per_unit_capital", label: "Per Unit (Capital)" },
  { value: "bundle", label: "Bundle" },
  { value: "subscription", label: "Subscription" },
];

const REIMBURSEMENT_OPTIONS = [
  { value: "covered", label: "Covered" },
  { value: "coverage_pending", label: "Coverage Pending" },
  { value: "unlisted", label: "Unlisted" },
  { value: "self_pay", label: "Self-Pay" },
];

const TEST_TYPE_OPTIONS = [
  { value: "IHC", label: "IHC" },
  { value: "FISH", label: "FISH" },
  { value: "PCR", label: "PCR" },
  { value: "NGS_panel", label: "NGS Panel" },
  { value: "liquid_biopsy", label: "Liquid Biopsy" },
  { value: "WGS", label: "WGS" },
  { value: "RNA_seq", label: "RNA-seq" },
];

const CDX_STAGE_OPTIONS = [
  { value: "discovery", label: "Discovery" },
  { value: "analytical_validation", label: "Analytical Validation" },
  { value: "clinical_validation", label: "Clinical Validation" },
  { value: "pma_submitted", label: "PMA Submitted" },
  { value: "approved", label: "Approved" },
];

// ────────────────────────────────────────────────────────────
// Zod Schemas
// ────────────────────────────────────────────────────────────

const pharmaSchema = z.object({
  indication: z.string().min(1, "Indication is required"),
  subtype: z.string().optional(),
  geography: z.array(z.string()).min(1, "Select at least one geography"),
  development_stage: z.string().default("phase2"),
  mechanism: z.string().optional(),
  patient_segment: z.string().optional(),
  pricing_assumption: z.string().default("base"),
  launch_year: z.coerce.number().min(2025).max(2040).default(2028),
});

const deviceSchema = z.object({
  procedure_or_condition: z.string().min(1, "Procedure or condition is required"),
  device_category: z.string().default("cardiovascular"),
  target_setting: z.array(z.string()).min(1, "Select at least one setting"),
  physician_specialty: z.string().optional(),
  development_stage: z.string().default("clinical_trial"),
  pricing_model: z.string().default("per_procedure"),
  unit_ase: z.coerce.number().min(0, "Unit ASE is required"),
  disposables_per_procedure: z.coerce.number().optional(),
  disposable_ase: z.coerce.number().optional(),
  service_contract_annual: z.coerce.number().optional(),
  reimbursement_status: z.string().default("covered"),
  geography: z.array(z.string()).min(1, "Select at least one geography"),
  launch_year: z.coerce.number().min(2025).max(2040).default(2028),
});

const cdxSchema = z.object({
  drug_indication: z.string().min(1, "Drug indication is required"),
  biomarker: z.string().min(1, "Biomarker is required"),
  biomarker_prevalence_pct: z.coerce.number().min(1).max(100),
  test_type: z.string().default("NGS_panel"),
  test_ase: z.coerce.number().min(0, "Test ASE is required"),
  drug_development_stage: z.string().default("phase2"),
  cdx_development_stage: z.string().default("clinical_validation"),
  geography: z.array(z.string()).min(1, "Select at least one geography"),
  launch_year: z.coerce.number().min(2025).max(2040).default(2028),
});

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

type FormMode = "pharma" | "device" | "cdx";

function getFormMode(category: ProductCategory): FormMode {
  if (category === "pharmaceutical") return "pharma";
  if (category === "diagnostics_companion" || category === "diagnostics_ivd") return "cdx";
  return "device";
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

function CheckboxItem({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer text-xs transition-colors",
        checked
          ? "bg-teal-500/10 text-teal-400 border border-teal-500/30"
          : "bg-navy-800 text-slate-400 border border-transparent hover:border-navy-600"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only"
      />
      <div
        className={cn(
          "w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0",
          checked ? "bg-teal-500 border-teal-500" : "border-slate-600"
        )}
      >
        {checked && (
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
              "px-3 py-1.5 rounded text-xs font-medium border transition-colors",
              value === opt.value
                ? "bg-teal-500/10 border-teal-500 text-teal-500"
                : "bg-navy-800 border-navy-700 text-slate-400 hover:border-navy-600"
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

function PricingAssumptionCards({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
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
              "px-3 py-2 rounded-md text-xs font-medium border transition-colors text-center",
              value === opt.value
                ? "bg-teal-500/10 border-teal-500 text-teal-500"
                : "bg-navy-800 border-navy-700 text-slate-400 hover:border-navy-600"
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
  const [productCategory, setProductCategory] = useState<ProductCategory>("pharmaceutical");
  const formMode = getFormMode(productCategory);

  return (
    <div className="card space-y-6">
      <ProductTypeSelector value={productCategory} onChange={setProductCategory} />

      <SectionDivider />

      {formMode === "pharma" && (
        <PharmaForm
          productCategory={productCategory}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      )}
      {formMode === "device" && (
        <DeviceForm
          productCategory={productCategory}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      )}
      {formMode === "cdx" && (
        <CdxForm
          productCategory={productCategory}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
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
    defaultValues: {
      indication: "",
      subtype: "",
      geography: ["US"] as string[],
      development_stage: "phase2",
      mechanism: "",
      patient_segment: "",
      pricing_assumption: "base",
      launch_year: 2028,
    },
  });

  const geography = watch("geography");
  const developmentStage = watch("development_stage");
  const pricingAssumption = watch("pricing_assumption");

  const toggleGeo = useCallback(
    (code: string) => {
      const next = geography.includes(code)
        ? geography.filter((g) => g !== code)
        : [...geography, code];
      setValue("geography", next, { shouldValidate: true });
    },
    [geography, setValue]
  );

  const doSubmit = handleSubmit((data) => {
    onSubmit(productCategory, data as Record<string, unknown>);
  });

  return (
    <form onSubmit={doSubmit} className="space-y-5">
      <IndicationAutocomplete
        label="Indication"
        value={watch("indication")}
        onChange={(v) => setValue("indication", v, { shouldValidate: true })}
        error={errors.indication?.message}
      />

      <Input
        label="Subtype / Specifics"
        {...register("subtype")}
        placeholder="e.g., EGFR+ Stage III/IV"
      />

      <SectionDivider />

      <GeographyGrid
        selected={geography}
        onToggle={toggleGeo}
        error={errors.geography?.message}
      />

      <SectionDivider />

      <PillSelector
        label="Development Stage"
        options={PHARMA_STAGES}
        value={developmentStage as (typeof PHARMA_STAGES)[number]["value"]}
        onChange={(v) => setValue("development_stage", v)}
      />

      <Input
        label="Mechanism of Action"
        {...register("mechanism")}
        placeholder="e.g., KRAS G12C inhibitor"
      />

      <Input
        label="Patient Segment"
        {...register("patient_segment")}
        placeholder="e.g., 2L+ after platinum-based chemo"
      />

      <SectionDivider />

      <PricingAssumptionCards
        value={pricingAssumption}
        onChange={(v) => setValue("pricing_assumption", v)}
      />

      <Input
        label="Expected Launch Year"
        type="number"
        {...register("launch_year")}
        min={2025}
        max={2040}
        step={1}
      />

      <SectionDivider />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
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
    defaultValues: {
      procedure_or_condition: "",
      device_category: "cardiovascular",
      target_setting: [] as string[],
      physician_specialty: "",
      development_stage: "clinical_trial",
      pricing_model: "per_procedure",
      unit_ase: undefined as unknown as number,
      disposables_per_procedure: undefined as unknown as number,
      disposable_ase: undefined as unknown as number,
      service_contract_annual: undefined as unknown as number,
      reimbursement_status: "covered",
      geography: ["US"] as string[],
      launch_year: 2028,
    },
  });

  const geography = watch("geography");
  const targetSetting = watch("target_setting");
  const developmentStage = watch("development_stage");

  const toggleGeo = useCallback(
    (code: string) => {
      const next = geography.includes(code)
        ? geography.filter((g) => g !== code)
        : [...geography, code];
      setValue("geography", next, { shouldValidate: true });
    },
    [geography, setValue]
  );

  const toggleSetting = useCallback(
    (value: string) => {
      const next = targetSetting.includes(value)
        ? targetSetting.filter((s) => s !== value)
        : [...targetSetting, value];
      setValue("target_setting", next, { shouldValidate: true });
    },
    [targetSetting, setValue]
  );

  const doSubmit = handleSubmit((data) => {
    onSubmit(productCategory, data as Record<string, unknown>);
  });

  return (
    <form onSubmit={doSubmit} className="space-y-5">
      <Input
        label="Procedure or Condition"
        {...register("procedure_or_condition")}
        placeholder="e.g., Total knee replacement"
        error={errors.procedure_or_condition?.message}
      />

      <Select
        label="Device Category"
        options={DEVICE_CATEGORY_OPTIONS}
        {...register("device_category")}
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

      <Input
        label="Physician Specialty"
        {...register("physician_specialty")}
        placeholder="e.g., Orthopedic surgeon"
      />

      <SectionDivider />

      <PillSelector
        label="Development Stage"
        options={DEVICE_STAGES}
        value={developmentStage as (typeof DEVICE_STAGES)[number]["value"]}
        onChange={(v) => setValue("development_stage", v)}
      />

      <SectionDivider />

      <Select
        label="Pricing Model"
        options={PRICING_MODEL_OPTIONS}
        {...register("pricing_model")}
      />

      <Input
        label="Unit ASE ($)"
        type="number"
        {...register("unit_ase")}
        step="1"
        min={0}
        placeholder="0"
        error={errors.unit_ase?.message}
      />

      <Input
        label="Disposables per Procedure"
        type="number"
        {...register("disposables_per_procedure")}
        step="1"
        min={0}
        placeholder="Optional"
      />

      <Input
        label="Disposable ASE ($)"
        type="number"
        {...register("disposable_ase")}
        step="1"
        min={0}
        placeholder="Optional"
      />

      <Input
        label="Service Contract Annual ($)"
        type="number"
        {...register("service_contract_annual")}
        step="1"
        min={0}
        placeholder="Optional"
      />

      <SectionDivider />

      <Select
        label="Reimbursement Status"
        options={REIMBURSEMENT_OPTIONS}
        {...register("reimbursement_status")}
      />

      <GeographyGrid
        selected={geography}
        onToggle={toggleGeo}
        error={errors.geography?.message}
      />

      <Input
        label="Expected Launch Year"
        type="number"
        {...register("launch_year")}
        min={2025}
        max={2040}
        step={1}
      />

      <SectionDivider />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
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
    defaultValues: {
      drug_indication: "",
      biomarker: "",
      biomarker_prevalence_pct: undefined as unknown as number,
      test_type: "NGS_panel",
      test_ase: undefined as unknown as number,
      drug_development_stage: "phase2",
      cdx_development_stage: "clinical_validation",
      geography: ["US"] as string[],
      launch_year: 2028,
    },
  });

  const geography = watch("geography");
  const drugStage = watch("drug_development_stage");

  const toggleGeo = useCallback(
    (code: string) => {
      const next = geography.includes(code)
        ? geography.filter((g) => g !== code)
        : [...geography, code];
      setValue("geography", next, { shouldValidate: true });
    },
    [geography, setValue]
  );

  const doSubmit = handleSubmit((data) => {
    onSubmit(productCategory, data as Record<string, unknown>);
  });

  return (
    <form onSubmit={doSubmit} className="space-y-5">
      <Input
        label="Drug Indication"
        {...register("drug_indication")}
        placeholder="e.g., NSCLC EGFR+"
        error={errors.drug_indication?.message}
      />

      <Input
        label="Biomarker"
        {...register("biomarker")}
        placeholder="e.g., EGFR exon 19/21 deletion"
        error={errors.biomarker?.message}
      />

      <Input
        label="Biomarker Prevalence (%)"
        type="number"
        {...register("biomarker_prevalence_pct")}
        min={1}
        max={100}
        step={1}
        placeholder="1-100"
        error={errors.biomarker_prevalence_pct?.message}
      />

      <SectionDivider />

      <Select
        label="Test Type"
        options={TEST_TYPE_OPTIONS}
        {...register("test_type")}
      />

      <Input
        label="Test ASE ($)"
        type="number"
        {...register("test_ase")}
        step="1"
        min={0}
        placeholder="0"
        error={errors.test_ase?.message}
      />

      <SectionDivider />

      <PillSelector
        label="Drug Development Stage"
        options={PHARMA_STAGES}
        value={drugStage as (typeof PHARMA_STAGES)[number]["value"]}
        onChange={(v) => setValue("drug_development_stage", v)}
      />

      <Select
        label="CDx Development Stage"
        options={CDX_STAGE_OPTIONS}
        {...register("cdx_development_stage")}
      />

      <SectionDivider />

      <GeographyGrid
        selected={geography}
        onToggle={toggleGeo}
        error={errors.geography?.message}
      />

      <Input
        label="Expected Launch Year"
        type="number"
        {...register("launch_year")}
        min={2025}
        max={2040}
        step={1}
      />

      <SectionDivider />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        Generate Analysis
      </Button>
    </form>
  );
}
