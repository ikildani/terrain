'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { UpgradeGate } from '@/components/shared/UpgradeGate';
import { useSubscription } from '@/hooks/useSubscription';
import PartnerSearchForm from '@/components/partners/PartnerSearchForm';
import PartnerDiscoveryReport from '@/components/partners/PartnerDiscoveryReport';
import { PdfPreviewOverlay } from '@/components/shared/PdfPreviewOverlay';
import { SkeletonMetric, SkeletonCard } from '@/components/ui/Skeleton';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost } from '@/lib/utils/api';
import type { PartnerDiscoveryOutput } from '@/types';
import type { PartnerFormData } from '@/components/partners/PartnerSearchForm';

// ────────────────────────────────────────────────────────────
// SKELETON LOADING STATE
// ────────────────────────────────────────────────────────────

function ResultsSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonMetric key={i} />
        ))}
      </div>
      <SkeletonCard className="h-[120px]" />
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonCard key={i} className="h-[220px]" />
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// EMPTY STATE
// ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="card noise p-12 text-center flex flex-col items-center">
      <Users className="w-12 h-12 text-navy-600 mb-4" />
      <h3 className="font-display text-lg text-white mb-2">
        Discover Your Ideal BD Partners
      </h3>
      <p className="text-sm text-slate-500 max-w-md">
        Enter your asset profile to screen 300+ biopharma companies and rank
        the most likely partners based on therapeutic alignment, pipeline gaps,
        deal history, geographic fit, and financial capacity.
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PREVIEW CONTENT (for UpgradeGate blur)
// ────────────────────────────────────────────────────────────

function PreviewContent() {
  return (
    <div className="space-y-4 pointer-events-none select-none">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {['Partners Screened', 'Top-Tier Matches', 'Avg Match Score', 'Median Upfront'].map((label, i) => (
          <div key={i} className="stat-card noise">
            <p className="text-2xs font-mono text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="font-mono text-2xl text-white mt-2">--</p>
          </div>
        ))}
      </div>
      {[1, 2, 3].map((rank) => (
        <div key={rank} className="card noise">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-md bg-navy-700 flex items-center justify-center">
              <span className="font-mono text-sm text-slate-300">{rank}</span>
            </div>
            <div className="flex-1">
              <div className="h-4 w-32 bg-navy-700 rounded" />
              <div className="h-3 w-48 bg-navy-800 rounded mt-2" />
            </div>
            <div className="w-12 h-12 rounded-full bg-navy-700" />
          </div>
          <div className="h-3 w-full bg-navy-800 rounded mt-3" />
          <div className="h-3 w-3/4 bg-navy-800 rounded mt-2" />
          <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 bg-navy-800/50 rounded-md">
            {[1, 2, 3].map((j) => (
              <div key={j} className="text-center">
                <div className="h-2 w-16 bg-navy-700 rounded mx-auto" />
                <div className="h-3 w-12 bg-navy-700 rounded mx-auto mt-2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────────────

export default function PartnersPage() {
  const { isPro, isLoading: subLoading } = useSubscription();
  const [lastInput, setLastInput] = useState<PartnerFormData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (formData: PartnerFormData) => {
      const response = await apiPost<PartnerDiscoveryOutput>('/api/analyze/partners', {
        input: {
          asset_description: '',
          indication: formData.indication,
          mechanism: formData.mechanism,
          development_stage: formData.development_stage,
          geography_rights: formData.geography_rights,
          deal_types: formData.deal_types,
        },
      });
      if (!response.success) throw new Error(response.error || 'Partner analysis failed');
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    onSuccess: () => {
      toast.success('Partner analysis complete');
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Partner analysis failed';
      toast.error(msg.includes('limit') || msg.includes('Pro') ? 'Upgrade to Pro for Partner Discovery' : msg);
    },
  });

  const results = mutation.data ?? null;
  const isLoading = mutation.isPending;
  const error = mutation.error ? (mutation.error as Error).message : null;

  function handleSubmit(formData: PartnerFormData) {
    setLastInput(formData);
    mutation.mutate(formData);
  }

  // While loading subscription status, show a minimal skeleton
  if (subLoading) {
    return (
      <>
        <PageHeader
          title="Partner Discovery"
          subtitle="Find and rank potential BD partners for your asset."
          badge="Pro"
        />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[380px] lg:flex-shrink-0">
            <SkeletonCard className="h-[600px]" />
          </div>
          <div className="flex-1 min-w-0">
            <EmptyState />
          </div>
        </div>
      </>
    );
  }

  // Free tier: show gated preview
  if (!isPro) {
    return (
      <>
        <PageHeader
          title="Partner Discovery"
          subtitle="Find and rank potential BD partners for your asset."
          badge="Pro"
        />
        <UpgradeGate feature="Partner Discovery">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[380px] lg:flex-shrink-0">
              <PartnerSearchForm onSubmit={() => {}} isLoading={false} />
            </div>
            <div className="flex-1 min-w-0">
              <PreviewContent />
            </div>
          </div>
        </UpgradeGate>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Partner Discovery"
        subtitle="Find and rank potential BD partners for your asset."
        badge="Pro"
      />
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel -- Form */}
        <div className="w-full lg:w-[380px] lg:flex-shrink-0">
          <PartnerSearchForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Right panel -- Results */}
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
          {!isLoading && !error && results && (
            <PartnerDiscoveryReport
              data={results}
              input={lastInput ? {
                indication: lastInput.indication,
                mechanism: lastInput.mechanism,
                development_stage: lastInput.development_stage,
                geography_rights: lastInput.geography_rights,
                deal_types: lastInput.deal_types,
              } : undefined}
              onPdfExport={() => setPreviewOpen(true)}
            />
          )}
        </div>
      </div>

      {/* PDF Preview Overlay */}
      {results && (
        <PdfPreviewOverlay
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          reportTitle="Partner Discovery Report"
          reportSubtitle={lastInput ? `${lastInput.indication} — ${lastInput.development_stage}` : undefined}
          filename={`partner-discovery-${lastInput?.indication.toLowerCase().replace(/\s+/g, '-') || 'report'}`}
        >
          <PartnerDiscoveryReport
            data={results}
            input={lastInput ? {
              indication: lastInput.indication,
              mechanism: lastInput.mechanism,
              development_stage: lastInput.development_stage,
              geography_rights: lastInput.geography_rights,
              deal_types: lastInput.deal_types,
            } : undefined}
            previewMode
          />
        </PdfPreviewOverlay>
      )}
    </>
  );
}
