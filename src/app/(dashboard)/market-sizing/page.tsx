'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import MarketSizingForm from '@/components/market-sizing/MarketSizingForm';
import MarketSizingReport from '@/components/market-sizing/MarketSizingReport';
import DeviceMarketSizingReport from '@/components/market-sizing/DeviceMarketSizingReport';
import CDxMarketSizingReport from '@/components/market-sizing/CDxMarketSizingReport';
import { PdfPreviewOverlay } from '@/components/shared/PdfPreviewOverlay';
import { SkeletonMetric, SkeletonCard } from '@/components/ui/Skeleton';
import type { MarketSizingOutput, MarketSizingInput, DeviceMarketSizingOutput, CDxOutput, DeviceMarketSizingInput, CDxMarketSizingInput } from '@/types';

type MarketSizingResult = MarketSizingOutput | DeviceMarketSizingOutput | CDxOutput;

function isPharma(category: string): boolean {
  return category === 'pharmaceutical' || category.startsWith('pharma');
}

function isDevice(category: string): boolean {
  return category.startsWith('device') || category.startsWith('medical_device');
}

function isCDx(category: string): boolean {
  return (
    category === 'companion_diagnostic' ||
    category === 'cdx' ||
    category === 'diagnostics_companion' ||
    category === 'diagnostics_ivd'
  );
}

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
    <div className="card noise p-12 text-center flex flex-col items-center">
      <BarChart3 className="w-12 h-12 text-navy-600 mb-4" />
      <h3 className="font-display text-lg text-white mb-2">
        Run Your First Analysis
      </h3>
      <p className="text-sm text-slate-500 max-w-md">
        Select a product category and configure your parameters to generate an
        investor-grade market assessment with TAM, SAM, SOM, patient funnel,
        geography breakdown, and 10-year revenue projections.
      </p>
    </div>
  );
}

export default function MarketSizingPage() {
  const [formInput, setFormInput] = useState<Record<string, unknown> | null>(null);
  const [productCategory, setProductCategory] = useState<string>('pharmaceutical');
  const [previewOpen, setPreviewOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({ productCategory: pc, formData }: { productCategory: string; formData: Record<string, unknown> }) => {
      const response = await fetch('/api/analyze/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_category: pc, input: formData }),
      });
      const json = await response.json();
      if (!json.success) throw new Error(json.error || 'Analysis failed');
      return json.data as MarketSizingResult;
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

  function handleSubmit(pc: string, formData: Record<string, unknown>) {
    setProductCategory(pc);
    // Inject product_category into input so device engine can use it
    const enrichedData = { ...formData, product_category: pc };
    setFormInput(enrichedData);
    mutation.mutate({ productCategory: pc, formData: enrichedData });
  }

  function renderReport(preview = false) {
    if (!results || !formInput) return null;

    const pdfExport = preview ? undefined : () => setPreviewOpen(true);

    if (isDevice(productCategory)) {
      return (
        <DeviceMarketSizingReport
          data={results as DeviceMarketSizingOutput}
          input={formInput as unknown as DeviceMarketSizingInput}
          previewMode={preview}
          onPdfExport={pdfExport}
        />
      );
    }

    if (isCDx(productCategory)) {
      return (
        <CDxMarketSizingReport
          data={results as CDxOutput}
          input={formInput as unknown as CDxMarketSizingInput}
          previewMode={preview}
          onPdfExport={pdfExport}
        />
      );
    }

    // Default: pharmaceutical
    return (
      <MarketSizingReport
        data={results as MarketSizingOutput}
        input={formInput as unknown as MarketSizingInput}
        previewMode={preview}
        onPdfExport={pdfExport}
      />
    );
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
            <div className="card noise p-8 text-center">
              <p className="text-sm text-signal-red bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
                {error}
              </p>
            </div>
          )}
          {!isLoading && !error && !results && <EmptyState />}
          {!isLoading && !error && results && formInput && renderReport()}
        </div>
      </div>

      {/* PDF Preview Overlay */}
      <PdfPreviewOverlay
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        reportTitle={
          formInput
            ? `${(formInput as Record<string, unknown>).indication || (formInput as Record<string, unknown>).procedure_or_condition || (formInput as Record<string, unknown>).drug_indication || 'Market'} — Market Sizing`
            : 'Market Sizing Report'
        }
        reportSubtitle={productCategory !== 'pharmaceutical' ? productCategory.replace(/_/g, ' ') : undefined}
        filename={
          formInput
            ? `terrain-${String((formInput as Record<string, unknown>).indication || (formInput as Record<string, unknown>).procedure_or_condition || 'report').toLowerCase().replace(/\s+/g, '-')}-market-sizing`
            : 'terrain-market-sizing'
        }
      >
        {renderReport(true)}
      </PdfPreviewOverlay>
    </>
  );
}
