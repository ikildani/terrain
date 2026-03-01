'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { UpgradeGate } from '@/components/shared/UpgradeGate';
import { useSubscription } from '@/hooks/useSubscription';
import { IndicationAutocomplete } from '@/components/ui/IndicationAutocomplete';
import { SkeletonMetric, SkeletonCard } from '@/components/ui/Skeleton';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost } from '@/lib/utils/api';
import { cn } from '@/lib/utils/cn';
import type { RegulatoryOutput, RegulatoryAgency, DevelopmentStage } from '@/types';

const RegulatoryResults = dynamic(() => import('@/components/regulatory/RegulatoryResults').then((m) => m.default), {
  ssr: false,
});

// ────────────────────────────────────────────────────────────
// ZOD SCHEMA
// ────────────────────────────────────────────────────────────

const regulatoryFormSchema = z.object({
  indication: z.string().min(1, 'Indication is required'),
  product_type: z.enum(['pharmaceutical', 'biologic', 'device', 'diagnostic']).default('pharmaceutical'),
  development_stage: z.enum(['preclinical', 'phase1', 'phase2', 'phase3', 'approved']).default('phase2'),
  mechanism: z.string().optional().default(''),
  geography: z.array(z.enum(['FDA', 'EMA', 'PMDA', 'NMPA'])).min(1, 'Select at least one agency'),
  unmet_need: z.enum(['high', 'medium', 'low']).default('high'),
  has_orphan_potential: z.boolean().default(false),
});

type RegulatoryFormData = z.infer<typeof regulatoryFormSchema>;

// ────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────

const PRODUCT_TYPES: { value: RegulatoryFormData['product_type']; label: string }[] = [
  { value: 'pharmaceutical', label: 'Small Molecule' },
  { value: 'biologic', label: 'Biologic' },
  { value: 'device', label: 'Medical Device' },
  { value: 'diagnostic', label: 'Diagnostic / IVD' },
];

const STAGES: { value: DevelopmentStage; label: string }[] = [
  { value: 'preclinical', label: 'Preclinical' },
  { value: 'phase1', label: 'Phase 1' },
  { value: 'phase2', label: 'Phase 2' },
  { value: 'phase3', label: 'Phase 3' },
  { value: 'approved', label: 'Approved' },
];

const GEOGRAPHIES: { value: RegulatoryAgency; label: string; flag: string }[] = [
  { value: 'FDA', label: 'FDA (US)', flag: 'US' },
  { value: 'EMA', label: 'EMA (EU)', flag: 'EU' },
  { value: 'PMDA', label: 'PMDA (Japan)', flag: 'JP' },
  { value: 'NMPA', label: 'NMPA (China)', flag: 'CN' },
];

const UNMET_NEED_OPTIONS: { value: 'high' | 'medium' | 'low'; label: string; description: string }[] = [
  { value: 'high', label: 'High', description: 'No effective treatment or significant gap' },
  { value: 'medium', label: 'Medium', description: 'Some treatments exist but improvements needed' },
  { value: 'low', label: 'Low', description: 'Multiple effective treatments available' },
];

// ────────────────────────────────────────────────────────────
// SKELETON
// ────────────────────────────────────────────────────────────

function ResultsSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <SkeletonMetric key={i} />
        ))}
      </div>
      <SkeletonCard className="h-[200px]" />
      <SkeletonCard className="h-[280px]" />
      <SkeletonCard className="h-[300px]" />
      <SkeletonCard className="h-[250px]" />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// EMPTY STATE
// ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="card noise p-12 text-center flex flex-col items-center">
      <Shield className="w-12 h-12 text-navy-600 mb-4" />
      <h3 className="font-display text-lg text-white mb-2">Analyze Your Regulatory Strategy</h3>
      <p className="text-sm text-slate-500 max-w-md">
        Enter your product profile to receive pathway recommendations, designation eligibility assessment, timeline
        estimates, comparable approval precedents, and risk analysis.
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// FORM COMPONENT
// ────────────────────────────────────────────────────────────

function RegulatoryForm({ onSubmit, isLoading }: { onSubmit: (data: RegulatoryFormData) => void; isLoading: boolean }) {
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegulatoryFormData>({
    resolver: zodResolver(regulatoryFormSchema),
    defaultValues: {
      indication: '',
      product_type: 'pharmaceutical',
      development_stage: 'phase2',
      mechanism: '',
      geography: ['FDA'],
      unmet_need: 'high',
      has_orphan_potential: false,
    },
  });

  const productType = watch('product_type');
  const devStage = watch('development_stage');
  const geography = watch('geography');
  const unmetNeed = watch('unmet_need');
  const orphanPotential = watch('has_orphan_potential');

  const toggleGeography = useCallback(
    (agency: RegulatoryAgency) => {
      const next = geography.includes(agency) ? geography.filter((g) => g !== agency) : [...geography, agency];
      setValue('geography', next, { shouldValidate: true });
    },
    [geography, setValue],
  );

  const doSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <div className="card noise">
      <form onSubmit={doSubmit} className="space-y-5">
        {/* Indication */}
        <IndicationAutocomplete
          label="Indication"
          value={watch('indication')}
          onChange={(val) => setValue('indication', val, { shouldValidate: true })}
          error={errors.indication?.message}
          placeholder="e.g., Non-Small Cell Lung Cancer"
        />

        {/* Product Type */}
        <fieldset>
          <legend className="input-label">Product Type</legend>
          <div className="flex flex-wrap gap-2 mt-1" role="radiogroup" aria-label="Product Type">
            {PRODUCT_TYPES.map((pt) => (
              <button
                key={pt.value}
                type="button"
                role="radio"
                aria-checked={productType === pt.value}
                onClick={() => setValue('product_type', pt.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all border',
                  productType === pt.value
                    ? 'bg-teal-500/15 text-teal-400 border-teal-500/30'
                    : 'bg-navy-800 text-slate-400 border-navy-700 hover:border-slate-500',
                )}
              >
                {pt.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Development Stage */}
        <fieldset>
          <legend className="input-label">Development Stage</legend>
          <div className="flex flex-wrap gap-2 mt-1" role="radiogroup" aria-label="Development Stage">
            {STAGES.map((s) => (
              <button
                key={s.value}
                type="button"
                role="radio"
                aria-checked={devStage === s.value}
                onClick={() => setValue('development_stage', s.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all border',
                  devStage === s.value
                    ? 'bg-teal-500/15 text-teal-400 border-teal-500/30'
                    : 'bg-navy-800 text-slate-400 border-navy-700 hover:border-slate-500',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Mechanism */}
        <div>
          <label htmlFor="mechanism" className="input-label">
            Mechanism of Action (Optional)
          </label>
          <input
            id="mechanism"
            type="text"
            className="input"
            placeholder="e.g., PD-1 inhibitor, KRAS G12C"
            value={watch('mechanism') || ''}
            onChange={(e) => setValue('mechanism', e.target.value)}
          />
        </div>

        {/* Geography Multi-Select */}
        <div>
          <label className="input-label">Regulatory Agencies</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {GEOGRAPHIES.map((geo) => (
              <button
                key={geo.value}
                type="button"
                onClick={() => toggleGeography(geo.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5',
                  geography.includes(geo.value)
                    ? 'bg-teal-500/15 text-teal-400 border-teal-500/30'
                    : 'bg-navy-800 text-slate-400 border-navy-700 hover:border-slate-500',
                )}
              >
                <span className="font-mono text-2xs opacity-60">{geo.flag}</span>
                {geo.label}
              </button>
            ))}
          </div>
          {errors.geography?.message && <p className="mt-1.5 text-xs text-signal-red">{errors.geography.message}</p>}
        </div>

        {/* Unmet Need */}
        <fieldset>
          <legend className="input-label">Unmet Medical Need</legend>
          <div className="space-y-2 mt-1" role="radiogroup" aria-label="Unmet Medical Need">
            {UNMET_NEED_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'flex items-start gap-3 p-2.5 rounded-md cursor-pointer border transition-all',
                  unmetNeed === opt.value
                    ? 'bg-teal-500/10 border-teal-500/30'
                    : 'bg-navy-800/50 border-transparent hover:border-navy-700',
                )}
              >
                <input
                  type="radio"
                  name="unmet_need"
                  value={opt.value}
                  checked={unmetNeed === opt.value}
                  onChange={() => setValue('unmet_need', opt.value)}
                  className="mt-0.5 accent-teal-500"
                />
                <div>
                  <span className="text-xs font-medium text-white">{opt.label}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Orphan Potential Toggle */}
        <div>
          <label
            className={cn(
              'flex items-center gap-3 p-3 rounded-md cursor-pointer border transition-all',
              orphanPotential
                ? 'bg-teal-500/10 border-teal-500/30'
                : 'bg-navy-800/50 border-transparent hover:border-navy-700',
            )}
          >
            <input
              type="checkbox"
              checked={orphanPotential}
              onChange={(e) => setValue('has_orphan_potential', e.target.checked)}
              className="accent-teal-500"
            />
            <div>
              <span className="text-xs font-medium text-white">Orphan Drug Potential</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Disease affects fewer than 200,000 US patients per year
              </p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing Pathways...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Analyze Regulatory Strategy
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────────────

export default function RegulatoryPage() {
  const { isPro } = useSubscription();
  const mutation = useMutation({
    mutationFn: async (formData: RegulatoryFormData) => {
      const response = await apiPost<RegulatoryOutput>('/api/analyze/regulatory', {
        input: {
          indication: formData.indication,
          product_type: formData.product_type,
          development_stage: formData.development_stage,
          mechanism: formData.mechanism || undefined,
          geography: formData.geography,
          unmet_need: formData.unmet_need,
          has_orphan_potential: formData.has_orphan_potential,
        },
      });
      if (!response.success) throw new Error(response.error || 'Analysis failed');
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    onSuccess: () => {
      toast.success('Regulatory analysis complete');
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      toast.error(msg.includes('limit') ? 'Usage limit reached — upgrade to continue' : msg);
    },
  });

  const results = mutation.data ?? null;
  const isLoading = mutation.isPending;
  const error = mutation.error ? (mutation.error as Error).message : null;

  function handleSubmit(formData: RegulatoryFormData) {
    mutation.mutate(formData);
  }

  const content = (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left panel - Form */}
      <div className="w-full lg:w-[380px] lg:flex-shrink-0">
        <RegulatoryForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Right panel - Results */}
      <div className="flex-1 min-w-0">
        {isLoading && <ResultsSkeleton />}
        {!isLoading && error && (
          <div className="card noise p-8 text-center">
            <p className="text-sm text-signal-red bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
              {error}
            </p>
          </div>
        )}
        {!isLoading && !error && !results && <EmptyState />}
        {!isLoading && !error && results && <RegulatoryResults data={results} />}
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Regulatory Intelligence"
        subtitle="Pathway analysis, designation opportunities, and timeline modeling."
        badge="Pro"
      />
      {isPro ? content : <UpgradeGate feature="Regulatory Intelligence">{content}</UpgradeGate>}
    </>
  );
}
