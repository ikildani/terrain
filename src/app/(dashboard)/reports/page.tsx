'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useReports } from '@/hooks/useReports';
import { formatRelativeDate } from '@/lib/utils/format';
import { FileText, Star, Trash2, ExternalLink, BarChart3 } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  market_sizing: 'Market Sizing',
  competitive: 'Competitive',
  full: 'Full Report',
};

export default function ReportsPage() {
  const { reports, isLoading, deleteReport, toggleStar } = useReports();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all'
    ? reports
    : filter === 'starred'
    ? reports.filter(r => r.is_starred)
    : reports.filter(r => r.report_type === filter);

  return (
    <>
      <PageHeader
        title="Saved Reports"
        subtitle="Access and manage your saved market assessments."
      />

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {['all', 'market_sizing', 'competitive', 'starred'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-teal-500/10 text-teal-500 border border-teal-500/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            {f === 'all' ? 'All' : f === 'starred' ? 'Starred' : TYPE_LABELS[f] ?? f}
          </button>
        ))}
        <span className="text-xs text-slate-600 ml-auto">
          {filtered.length} report{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-navy-700 rounded w-1/3 mb-2" />
              <div className="h-3 bg-navy-700 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="card noise p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/5 border border-teal-500/10 flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-teal-500/40" />
          </div>
          <h3 className="font-display text-lg text-slate-200 mb-2">
            No saved reports yet
          </h3>
          <p className="text-sm text-slate-500 max-w-md mb-6">
            Run your first market analysis to create a report.
          </p>
          <Link href="/market-sizing">
            <Button variant="primary">
              <BarChart3 className="w-4 h-4" />
              New Market Analysis
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(report => (
            <div
              key={report.id}
              className="card noise p-4 flex items-center gap-4 hover:border-navy-600 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-slate-200 truncate">
                    {report.title}
                  </h3>
                  <Badge variant="teal">
                    {TYPE_LABELS[report.report_type] ?? report.report_type}
                  </Badge>
                  {report.status === 'final' && (
                    <Badge variant="green">Final</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{report.indication}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span>{formatRelativeDate(report.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleStar(report.id)}
                  className="p-2 rounded-md hover:bg-navy-700 transition-colors"
                  title={report.is_starred ? 'Unstar' : 'Star'}
                >
                  <Star
                    className={`w-4 h-4 ${
                      report.is_starred ? 'text-amber-400 fill-amber-400' : 'text-slate-500'
                    }`}
                  />
                </button>
                <Link
                  href={`/market-sizing/${report.id}`}
                  className="p-2 rounded-md hover:bg-navy-700 transition-colors"
                  title="Open report"
                >
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                </Link>
                <button
                  onClick={() => deleteReport(report.id)}
                  className="p-2 rounded-md hover:bg-navy-700 transition-colors"
                  title="Delete report"
                >
                  <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
