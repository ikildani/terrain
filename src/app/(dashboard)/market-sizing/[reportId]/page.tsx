import { PageHeader } from '@/components/layout/PageHeader';

export default function MarketSizingReportPage({ params }: { params: { reportId: string } }) {
  return (
    <>
      <PageHeader title="Market Assessment" subtitle={`Report ${params.reportId}`} />
      <div className="card p-12 text-center">
        <p className="text-slate-500">Report view — coming soon</p>
      </div>
    </>
  );
}
