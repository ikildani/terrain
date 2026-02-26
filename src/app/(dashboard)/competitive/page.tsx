'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Crosshair } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import CompetitiveForm from '@/components/competitive/CompetitiveForm';
import type { CompetitiveFormSubmission } from '@/components/competitive/CompetitiveForm';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { SkeletonMetric, SkeletonCard } from '@/components/ui/Skeleton';

// Dynamic imports — heavy report components loaded only when results arrive
const CompetitiveLandscapeReport = dynamic(() => import('@/components/competitive/CompetitiveLandscapeReport'), {
  loading: () => <ResultsSkeleton />,
});
const DeviceCompetitiveLandscapeReport = dynamic(
  () => import('@/components/competitive/DeviceCompetitiveLandscapeReport'),
  { loading: () => <ResultsSkeleton /> },
);
const CDxCompetitiveLandscapeReport = dynamic(() => import('@/components/competitive/CDxCompetitiveLandscapeReport'), {
  loading: () => <ResultsSkeleton />,
});
const NutraceuticalCompetitiveLandscapeReport = dynamic(
  () => import('@/components/competitive/NutraceuticalCompetitiveLandscapeReport'),
  { loading: () => <ResultsSkeleton /> },
);
const PdfPreviewOverlay = dynamic(() =>
  import('@/components/shared/PdfPreviewOverlay').then((mod) => ({ default: mod.PdfPreviewOverlay })),
);
const OpportunityScreener = dynamic(() => import('@/components/competitive/OpportunityScreener'), {
  loading: () => (
    <div className="space-y-4">
      <SkeletonCard className="h-[80px]" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonMetric key={i} />
        ))}
      </div>
      <SkeletonCard className="h-[500px]" />
    </div>
  ),
});
import type { CompetitiveLandscapeOutput } from '@/types';
import type {
  DeviceCompetitiveLandscapeOutput,
  CDxCompetitiveLandscapeOutput,
  NutraceuticalCompetitiveLandscapeOutput,
} from '@/types/devices-diagnostics';

const PAGE_TABS = [
  { id: 'analysis', label: 'Competitive Analysis' },
  { id: 'screener', label: 'Opportunity Screener' },
];

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
    <div className="card noise p-12 text-center flex flex-col items-center">
      <Crosshair className="w-12 h-12 text-navy-600 mb-4" />
      <h3 className="font-display text-lg text-white mb-2">Map Your Competitive Landscape</h3>
      <p className="text-sm text-slate-500 max-w-md">
        Select a product category and enter your target indication, procedure, biomarker, or ingredient to generate a
        competitive landscape analysis with differentiation scoring, evidence assessment, and white space
        identification.
      </p>
    </div>
  );
}

type ResultCategory = 'pharmaceutical' | 'device' | 'cdx' | 'nutraceutical';

interface AnalysisResult {
  category: ResultCategory;
  data:
    | CompetitiveLandscapeOutput
    | DeviceCompetitiveLandscapeOutput
    | CDxCompetitiveLandscapeOutput
    | NutraceuticalCompetitiveLandscapeOutput;
}

export default function CompetitivePage() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [mechanism, setMechanism] = useState<string | undefined>(undefined);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (formData: CompetitiveFormSubmission) => {
      const response = await fetch('/api/analyze/competitive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: formData,
          product_category: formData.product_category,
        }),
      });
      const json = await response.json();
      if (!json.success) throw new Error(json.error || 'Analysis failed');
      return {
        category: (formData.product_category || 'pharmaceutical') as ResultCategory,
        data: json.data,
      };
    },
    onSuccess: (result) => {
      setAnalysisResult(result);
      toast.success('Competitive analysis complete');
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      toast.error(msg.includes('limit') ? 'Usage limit reached — upgrade to continue' : msg);
    },
  });

  const isLoading = mutation.isPending;
  const error = mutation.error ? (mutation.error as Error).message : null;

  function handleSubmit(formData: CompetitiveFormSubmission) {
    setMechanism(formData.mechanism);
    setAnalysisResult(null);
    mutation.mutate(formData);
  }

  function renderResults(preview = false) {
    if (!analysisResult) return null;

    const pdfExport = preview ? undefined : () => setPreviewOpen(true);

    switch (analysisResult.category) {
      case 'pharmaceutical':
        return (
          <CompetitiveLandscapeReport
            data={analysisResult.data as CompetitiveLandscapeOutput}
            mechanism={mechanism}
            previewMode={preview}
            onPdfExport={pdfExport}
          />
        );
      case 'device':
        return <DeviceCompetitiveLandscapeReport data={analysisResult.data as DeviceCompetitiveLandscapeOutput} />;
      case 'cdx':
        return <CDxCompetitiveLandscapeReport data={analysisResult.data as CDxCompetitiveLandscapeOutput} />;
      case 'nutraceutical':
        return (
          <NutraceuticalCompetitiveLandscapeReport
            data={analysisResult.data as NutraceuticalCompetitiveLandscapeOutput}
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
      <PageHeader
        title="Competitive Landscape"
        subtitle="Map the competitive battlefield across pharmaceuticals, devices, diagnostics, and nutraceuticals."
      />

      <Tabs tabs={PAGE_TABS} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

      {/* ── Competitive Analysis Tab ── */}
      {activeTab === 'analysis' && (
        <ErrorBoundary>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left panel — Form */}
            <div className="w-full lg:w-[380px] lg:flex-shrink-0">
              <CompetitiveForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>

            {/* Right panel — Results */}
            <div className="flex-1 min-w-0">
              {isLoading && <ResultsSkeleton />}
              {!isLoading && error && (
                <div className="card noise p-8 text-center">
                  <p className="text-sm text-signal-red bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
                    {error}
                  </p>
                </div>
              )}
              {!isLoading && !error && !analysisResult && <EmptyState />}
              {!isLoading && !error && analysisResult && renderResults()}
            </div>
          </div>
        </ErrorBoundary>
      )}

      {/* ── Opportunity Screener Tab ── */}
      {activeTab === 'screener' && (
        <ErrorBoundary>
          <OpportunityScreener />
        </ErrorBoundary>
      )}

      {/* PDF Preview Overlay */}
      <PdfPreviewOverlay
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        reportTitle={
          analysisResult
            ? `Competitive Landscape — ${(analysisResult.data as CompetitiveLandscapeOutput).summary?.indication || 'Analysis'}`
            : 'Competitive Landscape'
        }
        filename={`competitive-landscape-${Date.now()}`}
      >
        {renderResults(true)}
      </PdfPreviewOverlay>
    </>
  );
}
