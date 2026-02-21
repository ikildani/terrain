import { PageHeader } from '@/components/layout/PageHeader';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MarketSizingReportPage({
  params,
}: {
  params: { reportId: string };
}) {
  return (
    <>
      <PageHeader
        title="Market Assessment Report"
        subtitle={`Report ID: ${params.reportId}`}
        actions={
          <Link href="/market-sizing" className="btn btn-ghost">
            <ArrowLeft className="w-4 h-4" />
            Back to Market Sizing
          </Link>
        }
      />
      <div className="card p-12 text-center flex flex-col items-center">
        <FileText className="w-12 h-12 text-navy-600 mb-4" />
        <h3 className="font-display text-lg text-white mb-2">
          Saved Report View
        </h3>
        <p className="text-sm text-slate-500 max-w-md">
          Report viewing will be available once Supabase integration is complete.
          Reports are currently generated in real-time on the Market Sizing page.
        </p>
        <Link href="/market-sizing" className="btn btn-primary mt-6">
          Go to Market Sizing
        </Link>
      </div>
    </>
  );
}
