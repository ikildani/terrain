'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Crosshair, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { IndicationAutocomplete } from '@/components/ui/IndicationAutocomplete';
import { FuzzyAutocomplete } from '@/components/ui/FuzzyAutocomplete';
import { ProductTypeSelector } from '@/components/shared/ProductTypeSelector';
import { COVERED_INDICATIONS, COVERED_PROCEDURES, COVERED_BIOMARKERS } from '@/lib/data/competitive-suggestions';
import { MECHANISM_SUGGESTIONS, POPULAR_MECHANISMS } from '@/lib/data/suggestion-lists';
import type { ProductCategory } from '@/types/devices-diagnostics';

// ────────────────────────────────────────────────────────────
// Form schemas per category
// ────────────────────────────────────────────────────────────

const pharmaSchema = z.object({
  indication: z.string().min(1, 'Indication is required'),
  mechanism: z.string().optional(),
});

const deviceSchema = z.object({
  procedure_or_condition: z.string().min(1, 'Procedure or condition is required'),
  device_category: z.string().optional(),
  technology_type: z.string().optional(),
});

const cdxSchema = z.object({
  biomarker: z.string().min(1, 'Biomarker is required'),
  indication: z.string().optional(),
  test_type: z.string().optional(),
  linked_drug: z.string().optional(),
});

const nutraSchema = z.object({
  primary_ingredient: z.string().min(1, 'Primary ingredient is required'),
  health_focus: z.string().optional(),
  ingredient_category: z.string().optional(),
});

// ────────────────────────────────────────────────────────────
// Combined form data type
// ────────────────────────────────────────────────────────────

export interface CompetitiveFormSubmission {
  product_category: string;
  indication?: string;
  mechanism?: string;
  procedure_or_condition?: string;
  device_category?: string;
  technology_type?: string;
  biomarker?: string;
  test_type?: string;
  linked_drug?: string;
  primary_ingredient?: string;
  health_focus?: string;
  ingredient_category?: string;
}

interface CompetitiveFormProps {
  onSubmit: (data: CompetitiveFormSubmission) => void;
  isLoading: boolean;
}

// ────────────────────────────────────────────────────────────
// Device category options
// ────────────────────────────────────────────────────────────

const DEVICE_CATEGORIES = [
  { value: '', label: 'Any' },
  { value: 'cardiovascular', label: 'Cardiovascular' },
  { value: 'orthopedic', label: 'Orthopedic' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'surgical_robotic', label: 'Surgical / Robotic' },
  { value: 'diabetes_metabolic', label: 'Diabetes / Metabolic' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'digital_health', label: 'Digital Health / SaMD' },
  { value: 'oncology_device', label: 'Oncology Devices' },
];

const CDX_PLATFORMS = [
  { value: '', label: 'Any' },
  { value: 'NGS', label: 'NGS (Next-Gen Sequencing)' },
  { value: 'PCR', label: 'PCR / RT-PCR' },
  { value: 'IHC', label: 'IHC (Immunohistochemistry)' },
  { value: 'FISH', label: 'FISH' },
  { value: 'liquid_biopsy', label: 'Liquid Biopsy (ctDNA)' },
  { value: 'ddPCR', label: 'Digital Droplet PCR' },
  { value: 'microarray', label: 'Microarray' },
];

// ────────────────────────────────────────────────────────────
// Helper: determine if category is pharma/device/cdx/nutra
// ────────────────────────────────────────────────────────────

function isPharmaCategory(cat: ProductCategory): boolean {
  return cat === 'pharmaceutical' || cat.startsWith('pharma');
}

function isDeviceCategory(cat: ProductCategory): boolean {
  return (
    cat.startsWith('device_') ||
    cat === 'device_implantable' ||
    cat === 'device_surgical' ||
    cat === 'device_monitoring' ||
    cat === 'device_digital_health' ||
    cat === 'device_capital_equipment'
  );
}

function isCDxCategory(cat: ProductCategory): boolean {
  return cat === 'diagnostics_companion' || cat === 'diagnostics_ivd';
}

function isNutraCategory(cat: ProductCategory): boolean {
  return cat === 'nutraceutical' || cat.startsWith('nutra');
}

function categoryToApiString(cat: ProductCategory): string {
  if (isPharmaCategory(cat)) return 'pharmaceutical';
  if (isDeviceCategory(cat)) return 'device';
  if (isCDxCategory(cat)) return 'cdx';
  if (isNutraCategory(cat)) return 'nutraceutical';
  return 'pharmaceutical';
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export default function CompetitiveForm({ onSubmit, isLoading }: CompetitiveFormProps) {
  const [productCategory, setProductCategory] = useState<ProductCategory>('pharmaceutical');

  // ── Pharma form ──────────────────────────────────────────
  const pharmaForm = useForm<z.infer<typeof pharmaSchema>>({
    resolver: zodResolver(pharmaSchema),
    defaultValues: { indication: '', mechanism: '' },
  });

  // ── Device form ──────────────────────────────────────────
  const deviceForm = useForm<z.infer<typeof deviceSchema>>({
    resolver: zodResolver(deviceSchema),
    defaultValues: { procedure_or_condition: '', device_category: '', technology_type: '' },
  });

  // ── CDx form ─────────────────────────────────────────────
  const cdxForm = useForm<z.infer<typeof cdxSchema>>({
    resolver: zodResolver(cdxSchema),
    defaultValues: { biomarker: '', indication: '', test_type: '', linked_drug: '' },
  });

  // ── Nutra form ───────────────────────────────────────────
  const nutraForm = useForm<z.infer<typeof nutraSchema>>({
    resolver: zodResolver(nutraSchema),
    defaultValues: { primary_ingredient: '', health_focus: '', ingredient_category: '' },
  });

  // ── Pharma coverage check ────────────────────────────────
  const indicationValue = pharmaForm.watch('indication');
  const hasCoverage = indicationValue.length > 0 && COVERED_INDICATIONS.has(indicationValue);

  // ── Device coverage check ────────────────────────────────
  const procedureValue = deviceForm.watch('procedure_or_condition');
  const hasProcedureCoverage =
    procedureValue.length > 0 &&
    COVERED_PROCEDURES.some(
      (p) =>
        p.toLowerCase().includes(procedureValue.toLowerCase()) ||
        procedureValue.toLowerCase().includes(p.toLowerCase()),
    );

  // ── CDx coverage check ──────────────────────────────────
  const biomarkerValue = cdxForm.watch('biomarker');
  const hasBiomarkerCoverage =
    biomarkerValue.length > 0 &&
    COVERED_BIOMARKERS.some(
      (b) =>
        b.toLowerCase().includes(biomarkerValue.toLowerCase()) ||
        biomarkerValue.toLowerCase().includes(b.toLowerCase()),
    );

  // ── Submit handler ───────────────────────────────────────
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isPharmaCategory(productCategory)) {
      pharmaForm.handleSubmit((data) => {
        onSubmit({
          product_category: categoryToApiString(productCategory),
          indication: data.indication,
          mechanism: data.mechanism || undefined,
        });
      })();
    } else if (isDeviceCategory(productCategory)) {
      deviceForm.handleSubmit((data) => {
        onSubmit({
          product_category: categoryToApiString(productCategory),
          procedure_or_condition: data.procedure_or_condition,
          device_category: data.device_category || undefined,
          technology_type: data.technology_type || undefined,
        });
      })();
    } else if (isCDxCategory(productCategory)) {
      cdxForm.handleSubmit((data) => {
        onSubmit({
          product_category: categoryToApiString(productCategory),
          biomarker: data.biomarker,
          indication: data.indication || undefined,
          test_type: data.test_type || undefined,
          linked_drug: data.linked_drug || undefined,
        });
      })();
    } else if (isNutraCategory(productCategory)) {
      nutraForm.handleSubmit((data) => {
        onSubmit({
          product_category: categoryToApiString(productCategory),
          primary_ingredient: data.primary_ingredient,
          health_focus: data.health_focus || undefined,
          ingredient_category: data.ingredient_category || undefined,
        });
      })();
    }
  }

  return (
    <div className="card noise">
      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* Product Category */}
        <ProductTypeSelector value={productCategory} onChange={setProductCategory} />

        {/* ── Pharma Fields ───────────────────────────── */}
        {isPharmaCategory(productCategory) && (
          <>
            <div>
              <IndicationAutocomplete
                value={indicationValue}
                onChange={(val) => pharmaForm.setValue('indication', val, { shouldValidate: true })}
                error={pharmaForm.formState.errors.indication?.message}
                label="Indication"
                placeholder="e.g., Non-Small Cell Lung Cancer"
              />
              {indicationValue.length > 2 &&
                (hasCoverage ? (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <CheckCircle2 className="h-3 w-3 text-signal-green" />
                    <span className="text-[11px] text-signal-green">Competitive data available</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <AlertTriangle className="h-3 w-3 text-signal-amber" />
                    <span className="text-[11px] text-signal-amber">
                      Limited competitive data — white-space analysis will be generated
                    </span>
                  </div>
                ))}
            </div>
            <FuzzyAutocomplete
              label="Mechanism of Action (Optional)"
              value={pharmaForm.watch('mechanism') || ''}
              onChange={(v) => pharmaForm.setValue('mechanism', v)}
              items={MECHANISM_SUGGESTIONS}
              popularItems={POPULAR_MECHANISMS}
              storageKey="terrain:recent-mechanisms"
              placeholder="e.g., PD-1 inhibitor, ADC"
            />
          </>
        )}

        {/* ── Device Fields ───────────────────────────── */}
        {isDeviceCategory(productCategory) && (
          <>
            <div>
              <label className="input-label" htmlFor="procedure_or_condition">
                Procedure / Condition
              </label>
              <input
                id="procedure_or_condition"
                type="text"
                className="input-field mt-1"
                placeholder="e.g., TAVR, Total Knee Arthroplasty, CGM"
                {...deviceForm.register('procedure_or_condition')}
              />
              {deviceForm.formState.errors.procedure_or_condition && (
                <p className="text-[11px] text-signal-red mt-1">
                  {deviceForm.formState.errors.procedure_or_condition.message}
                </p>
              )}
              {procedureValue.length > 2 &&
                (hasProcedureCoverage ? (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <CheckCircle2 className="h-3 w-3 text-signal-green" />
                    <span className="text-[11px] text-signal-green">Device competitor data available</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <AlertTriangle className="h-3 w-3 text-signal-amber" />
                    <span className="text-[11px] text-signal-amber">
                      Limited device data — white-space analysis will be generated
                    </span>
                  </div>
                ))}
            </div>
            <div>
              <label className="input-label" htmlFor="device_category">
                Device Category (Optional)
              </label>
              <select id="device_category" className="input-field mt-1" {...deviceForm.register('device_category')}>
                {DEVICE_CATEGORIES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label" htmlFor="technology_type">
                Technology Type (Optional)
              </label>
              <input
                id="technology_type"
                type="text"
                className="input-field mt-1"
                placeholder="e.g., Pulsed field ablation, Self-expanding valve"
                {...deviceForm.register('technology_type')}
              />
            </div>
          </>
        )}

        {/* ── CDx Fields ──────────────────────────────── */}
        {isCDxCategory(productCategory) && (
          <>
            <div>
              <label className="input-label" htmlFor="biomarker">
                Biomarker
              </label>
              <input
                id="biomarker"
                type="text"
                className="input-field mt-1"
                placeholder="e.g., EGFR, PD-L1, BRCA1/2, HER2"
                {...cdxForm.register('biomarker')}
              />
              {cdxForm.formState.errors.biomarker && (
                <p className="text-[11px] text-signal-red mt-1">{cdxForm.formState.errors.biomarker.message}</p>
              )}
              {biomarkerValue.length > 1 &&
                (hasBiomarkerCoverage ? (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <CheckCircle2 className="h-3 w-3 text-signal-green" />
                    <span className="text-[11px] text-signal-green">CDx competitor data available</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <AlertTriangle className="h-3 w-3 text-signal-amber" />
                    <span className="text-[11px] text-signal-amber">Limited CDx data for this biomarker</span>
                  </div>
                ))}
            </div>
            <div>
              <label className="input-label" htmlFor="cdx_indication">
                Indication (Optional)
              </label>
              <input
                id="cdx_indication"
                type="text"
                className="input-field mt-1"
                placeholder="e.g., NSCLC, Breast Cancer, Ovarian Cancer"
                {...cdxForm.register('indication')}
              />
            </div>
            <div>
              <label className="input-label" htmlFor="test_type">
                Test Platform (Optional)
              </label>
              <select id="test_type" className="input-field mt-1" {...cdxForm.register('test_type')}>
                {CDX_PLATFORMS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label" htmlFor="linked_drug">
                Linked Drug (Optional)
              </label>
              <input
                id="linked_drug"
                type="text"
                className="input-field mt-1"
                placeholder="e.g., Keytruda, Tagrisso, Lynparza"
                {...cdxForm.register('linked_drug')}
              />
            </div>
          </>
        )}

        {/* ── Nutraceutical Fields ────────────────────── */}
        {isNutraCategory(productCategory) && (
          <>
            <div>
              <label className="input-label" htmlFor="primary_ingredient">
                Primary Ingredient
              </label>
              <input
                id="primary_ingredient"
                type="text"
                className="input-field mt-1"
                placeholder="e.g., NMN, Creatine, Omega-3, Ashwagandha"
                {...nutraForm.register('primary_ingredient')}
              />
              {nutraForm.formState.errors.primary_ingredient && (
                <p className="text-[11px] text-signal-red mt-1">
                  {nutraForm.formState.errors.primary_ingredient.message}
                </p>
              )}
            </div>
            <div>
              <label className="input-label" htmlFor="health_focus">
                Health Focus (Optional)
              </label>
              <input
                id="health_focus"
                type="text"
                className="input-field mt-1"
                placeholder="e.g., Longevity, Cognitive, Gut Health, Sports Performance"
                {...nutraForm.register('health_focus')}
              />
            </div>
            <div>
              <label className="input-label" htmlFor="ingredient_category">
                Ingredient Category (Optional)
              </label>
              <input
                id="ingredient_category"
                type="text"
                className="input-field mt-1"
                placeholder="e.g., longevity, cognitive, metabolic"
                {...nutraForm.register('ingredient_category')}
              />
            </div>
          </>
        )}

        {/* Submit */}
        <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mapping Landscape...
            </>
          ) : (
            <>
              <Crosshair className="h-4 w-4" />
              Map Landscape
            </>
          )}
        </button>
      </form>
    </div>
  );
}
