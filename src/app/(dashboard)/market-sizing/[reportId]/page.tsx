'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import dynamic from 'next/dynamic';

const MarketSizingReport = dynamic(() => import('@/components/market-sizing/MarketSizingReport'), { ssr: false });
const DeviceMarketSizingReport = dynamic(() => import('@/components/market-sizing/DeviceMarketSizingReport'), {
  ssr: false,
});
const CDxMarketSizingReport = dynamic(() => import('@/components/market-sizing/CDxMarketSizingReport'), { ssr: false });
const PdfPreviewOverlay = dynamic(
  () => import('@/components/shared/PdfPreviewOverlay').then((mod) => ({ default: mod.PdfPreviewOverlay })),
  { ssr: false },
);
import { SkeletonCard, SkeletonMetric } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { apiGet } from '@/lib/utils/api';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ArrowLeft, FileText } from 'lucide-react';
import type {
  Report,
  MarketSizingOutput,
  MarketSizingInput,
  DeviceMarketSizingOutput,
  CDxOutput,
  DeviceMarketSizingInput,
  CDxMarketSizingInput,
} from '@/types';

function renderReportForCategory(report: Report, preview = false, onPdfExport?: () => void) {
  const inputs = report.inputs as Record<string, unknown> | null;
  const category = (inputs?.product_category as string) || 'pharmaceutical';
  const pdfExport = preview ? undefined : onPdfExport;

  if (category.startsWith('device') || category.startsWith('medical_device')) {
    return (
      <DeviceMarketSizingReport
        data={report.outputs as unknown as DeviceMarketSizingOutput}
        input={inputs as unknown as DeviceMarketSizingInput}
        previewMode={preview}
        onPdfExport={pdfExport}
      />
    );
  }

  if (
    category === 'companion_diagnostic' ||
    category === 'cdx' ||
    category === 'diagnostics_companion' ||
    category === 'diagnostics_ivd'
  ) {
    return (
      <CDxMarketSizingReport
        data={report.outputs as unknown as CDxOutput}
        input={inputs as unknown as CDxMarketSizingInput}
        previewMode={preview}
        onPdfExport={pdfExport}
      />
    );
  }

  return (
    <MarketSizingReport
      data={report.outputs as unknown as MarketSizingOutput}
      input={inputs as unknown as MarketSizingInput}
      previewMode={preview}
      onPdfExport={pdfExport}
    />
  );
}

export default function MarketSizingReportPage({ params }: { params: { reportId: string } }) {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await apiGet<Report>(`/api/reports/${params.reportId}`);
        if (res.success && res.data) {
          setReport(res.data);
        } else {
          setError(res.error ?? 'Report not found');
        }
      } catch {
        setError('Failed to load report');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params.reportId]);

  return (
    <ErrorBoundary>
      <PageHeader
        title={report?.title ?? 'Market Assessment Report'}
        subtitle={report ? `${report.indication} — ${report.report_type}` : `Report ${params.reportId}`}
        actions={
          <Link href="/market-sizing" className="btn btn-ghost">
            <ArrowLeft className="w-4 h-4" />
            Back to Market Sizing
          </Link>
        }
      />

      {isLoading && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonMetric key={i} />
            ))}
          </div>
          <SkeletonCard className="h-[200px]" />
          <SkeletonCard className="h-[300px]" />
        </div>
      )}

      {error && !isLoading && (
        <div className="card noise p-12 text-center flex flex-col items-center">
          <FileText className="w-12 h-12 text-navy-600 mb-4" />
          <h3 className="font-display text-lg text-slate-200 mb-2">Report Not Found</h3>
          <p className="text-sm text-slate-500 max-w-md mb-6">{error}</p>
          <Link href="/market-sizing">
            <Button variant="primary">Go to Market Sizing</Button>
          </Link>
        </div>
      )}

      {!isLoading && report && report.outputs && renderReportForCategory(report, false, () => setPreviewOpen(true))}

      {/* PDF Preview Overlay */}
      {report && report.outputs && (
        <PdfPreviewOverlay
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          reportTitle={report.title || 'Market Assessment Report'}
          reportSubtitle={`${report.indication} — ${report.report_type}`}
          filename={`terrain-${report.indication?.toLowerCase().replace(/\s+/g, '-') || 'report'}-market-sizing`}
        >
          {renderReportForCategory(report, true)}
        </PdfPreviewOverlay>
      )}
    </ErrorBoundary>
  );
}
