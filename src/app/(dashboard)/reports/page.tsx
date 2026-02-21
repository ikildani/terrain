import { PageHeader } from '@/components/layout/PageHeader';

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Saved Reports" subtitle="Access and manage your saved market assessments." />
      <div className="card p-12 text-center">
        <p className="text-slate-500">No saved reports yet. Run an analysis to create your first report.</p>
      </div>
    </>
  );
}
