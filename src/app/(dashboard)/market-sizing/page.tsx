'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import MarketSizingForm from '@/components/market-sizing/MarketSizingForm';
import MarketSizingReport from '@/components/market-sizing/MarketSizingReport';
import { SkeletonMetric, SkeletonCard } from '@/components/ui/Skeleton';
import type { MarketSizingOutput, MarketSizingInput } from '@/types';

function ResultsSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonMetric key={i} />
        ))}
      </div>
      <SkeletonCard className="h-[200px]" />
      <SkeletonCard className="h-[300px]" />
      <SkeletonCard className="h-[250px]" />
      <SkeletonCard className="h-[320px]" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 text-center flex flex-col items-center">
      <BarChart3 className="w-12 h-12 text-navy-600 mb-4" />
      <h3 className="font-display text-lg text-white mb-2">
        Run Your First Analysis
      </h3>
      <p className="text-sm text-slate-500 max-w-md">
        Select an indication and configure your parameters to generate an
        investor-grade market assessment with TAM, SAM, SOM, patient funnel,
        geography breakdown, and 10-year revenue projections.
      </p>
    </div>
  );
}

export default function MarketSizingPage() {
  const [formInput, setFormInput] = useState<MarketSizingInput | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ productCategory, formData }: { productCategory: string; formData: Record<string, unknown> }) => {
      const response = await fetch('/api/analyze/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_category: productCategory, input: formData }),
      });
      const json = await response.json();
      if (!json.success) throw new Error(json.error || 'Analysis failed');
      return json.data as MarketSizingOutput;
    },
    onSuccess: () => {
      toast.success('Market analysis complete');
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      if (msg.includes('limit') || msg.includes('usage')) {
        toast.error('Usage limit reached — upgrade to continue');
      } else {
        toast.error(msg);
      }
    },
  });

  const results = mutation.data ?? null;
  const isLoading = mutation.isPending;
  const error = mutation.error ? (mutation.error as Error).message : null;

  function handleSubmit(productCategory: string, formData: Record<string, unknown>) {
    setFormInput(formData as unknown as MarketSizingInput);
    mutation.mutate({ productCategory, formData });
  }

  return (
    <>
      <PageHeader
        title="Market Sizing"
        subtitle="Quantify your opportunity with investor-grade TAM/SAM/SOM analysis."
      />
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel — Form */}
        <div className="w-full lg:w-[380px] lg:flex-shrink-0">
          <MarketSizingForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Right panel — Results */}
        <div className="flex-1 min-w-0">
          {isLoading && <ResultsSkeleton />}
          {!isLoading && error && (
            <div className="card p-8 text-center">
              <p className="text-sm text-signal-red bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
                {error}
              </p>
            </div>
          )}
          {!isLoading && !error && !results && <EmptyState />}
          {!isLoading && !error && results && formInput && (
            <MarketSizingReport data={results} input={formInput} />
          )}
        </div>
      </div>
    </>
  );
}
