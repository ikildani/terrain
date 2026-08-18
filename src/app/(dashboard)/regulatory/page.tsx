'use client';

import dynamic from 'next/dynamic';
import { Shield } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { UpgradeGate } from '@/components/shared/UpgradeGate';
import { useSubscription } from '@/hooks/useSubscription';
import { SkeletonMetric, SkeletonCard } from '@/components/ui/Skeleton';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost } from '@/lib/utils/api';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { RegulatoryForm } from '@/components/regulatory/RegulatoryForm';
import type { RegulatoryFormData } from '@/components/regulatory/RegulatoryForm';
import type { RegulatoryOutput } from '@/types';

const RegulatoryResults = dynamic(() => import('@/components/regulatory/RegulatoryResults').then((m) => m.default), {
  ssr: false,
});

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

function RegulatoryContent() {
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
      <div className="w-full lg:w-[380px] lg:flex-shrink-0">
        <RegulatoryForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      <div className="flex-1 min-w-0">
        {isLoading && <ResultsSkeleton />}
        {!isLoading && error && (
          <div className="card p-8 text-center">
            <p className="text-sm text-signal-red bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
              {error}
            </p>
          </div>
        )}
        {!isLoading && !error && !results && (
          <EmptyState
            icon={Shield}
            heading="Analyze Your Regulatory Strategy"
            description="Enter your product profile to receive pathway recommendations, designation eligibility assessment, timeline estimates, comparable approval precedents, and risk analysis."
          />
        )}
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

export default function RegulatoryPage() {
  return (
    <ErrorBoundary>
      <RegulatoryContent />
    </ErrorBoundary>
  );
}
