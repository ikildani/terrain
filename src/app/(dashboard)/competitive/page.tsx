'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Crosshair } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import CompetitiveForm from '@/components/competitive/CompetitiveForm';
import CompetitiveLandscapeReport from '@/components/competitive/CompetitiveLandscapeReport';
import { SkeletonMetric, SkeletonCard } from '@/components/ui/Skeleton';
import type { CompetitiveLandscapeOutput } from '@/types';

function ResultsSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonMetric key={i} />
        ))}
      </div>
      <SkeletonCard className="h-[400px]" />
      <SkeletonCard className="h-[300px]" />
      <SkeletonCard className="h-[250px]" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 text-center flex flex-col items-center">
      <Crosshair className="w-12 h-12 text-navy-600 mb-4" />
      <h3 className="font-display text-lg text-white mb-2">
        Map Your Competitive Landscape
      </h3>
      <p className="text-sm text-slate-500 max-w-md">
        Enter an indication to generate a competitive landscape analysis with
        differentiation scoring, evidence assessment, pipeline mapping, and
        white space identification.
      </p>
    </div>
  );
}

export default function CompetitivePage() {
  const [mechanism, setMechanism] = useState<string | undefined>(undefined);

  const mutation = useMutation({
    mutationFn: async (formData: { indication: string; mechanism?: string }) => {
      const response = await fetch('/api/analyze/competitive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { indication: formData.indication, mechanism: formData.mechanism } }),
      });
      const json = await response.json();
      if (!json.success) throw new Error(json.error || 'Analysis failed');
      return json.data as CompetitiveLandscapeOutput;
    },
    onSuccess: () => {
      toast.success('Competitive analysis complete');
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      toast.error(msg.includes('limit') ? 'Usage limit reached — upgrade to continue' : msg);
    },
  });

  const results = mutation.data ?? null;
  const isLoading = mutation.isPending;
  const error = mutation.error ? (mutation.error as Error).message : null;

  function handleSubmit(formData: { indication: string; mechanism?: string }) {
    setMechanism(formData.mechanism);
    mutation.mutate(formData);
  }

  return (
    <>
      <PageHeader
        title="Competitive Landscape"
        subtitle="Map the competitive battlefield for any indication."
      />
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel — Form */}
        <div className="w-full lg:w-[380px] lg:flex-shrink-0">
          <CompetitiveForm
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
          {!isLoading && !error && results && (
            <CompetitiveLandscapeReport data={results} mechanism={mechanism} />
          )}
        </div>
      </div>
    </>
  );
}
