'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mountain, FileText, ExternalLink, BarChart3, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { apiGet } from '@/lib/utils/api';

interface SharedReportData {
  title: string;
  report_type: string;
  indication: string;
  outputs: Record<string, unknown>;
  status: string;
  tags: string[];
  generated_at: string;
  allow_download: boolean;
  view_count: number;
}

const TYPE_LABELS: Record<string, string> = {
  market_sizing: 'Market Sizing',
  competitive: 'Competitive',
  partners: 'Partner Discovery',
  regulatory: 'Regulatory',
  full: 'Full Report',
};

function formatCurrency(value: number, unit: string): string {
  if (unit === 'B') return `$${value.toFixed(1)}B`;
  if (unit === 'M') return `$${Math.round(value)}M`;
  return `$${value}`;
}

export function SharedReportPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<SharedReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      const res = await apiGet<SharedReportData>(`/api/share/${token}`);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || 'Report not found or link expired.');
      }
      setLoading(false);
    }
    fetchReport();
  }, [token]);

  // Extract summary metrics for market sizing reports
  const summaryMetrics = (() => {
    if (!data || data.report_type !== 'market_sizing') return null;
    const outputs = data.outputs as Record<string, unknown>;
    const summary = outputs?.summary as Record<string, unknown> | undefined;
    if (!summary) return null;

    const tamUs = summary.tam_us as { value: number; unit: string } | undefined;
    const samUs = summary.sam_us as { value: number; unit: string } | undefined;
    const somUs = summary.som_us as { value: number; unit: string } | undefined;
    const cagr = summary.cagr_5yr as number | undefined;

    return { tamUs, samUs, somUs, cagr };
  })();

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Header */}
      <header className="border-b border-navy-700/60 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mountain className="w-5 h-5 text-teal-500" />
            <span className="font-display text-lg text-white">Terrain</span>
            <Badge variant="teal">Shared Report</Badge>
          </div>
          <a
            href="https://terrain.ambrosiaventures.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-teal-400 transition-colors flex items-center gap-1"
          >
            What is Terrain?
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="card p-8">
              <div className="h-6 bg-navy-700 rounded w-1/3 mb-3" />
              <div className="h-4 bg-navy-700 rounded w-1/4" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card p-4">
                  <div className="h-3 bg-navy-700 rounded w-2/3 mb-2" />
                  <div className="h-6 bg-navy-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card noise p-12 text-center"
          >
            <AlertCircle className="w-12 h-12 text-red-400/50 mx-auto mb-4" />
            <h2 className="font-display text-lg text-white mb-2">Link Unavailable</h2>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <a href="/login" className="btn btn-primary text-xs px-4 py-2">
                Sign In
              </a>
              <a
                href="https://terrain.ambrosiaventures.co"
                className="btn text-xs px-4 py-2 border border-navy-700 text-slate-400"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        )}

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Report Header */}
            <div className="card noise p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-teal-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h1 className="font-display text-xl text-white">{data.title}</h1>
                    <Badge variant="teal">{TYPE_LABELS[data.report_type] || data.report_type}</Badge>
                    {data.status === 'final' && <Badge variant="green">Final</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{data.indication}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>Generated {new Date(data.generated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Metrics (Market Sizing) */}
            {summaryMetrics && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryMetrics.tamUs && (
                  <div className="stat-card noise">
                    <p className="text-2xs font-mono text-slate-500 uppercase tracking-wider">US TAM</p>
                    <p className="font-mono text-2xl text-white mt-2">
                      {formatCurrency(summaryMetrics.tamUs.value, summaryMetrics.tamUs.unit)}
                    </p>
                  </div>
                )}
                {summaryMetrics.samUs && (
                  <div className="stat-card noise">
                    <p className="text-2xs font-mono text-slate-500 uppercase tracking-wider">US SAM</p>
                    <p className="font-mono text-2xl text-white mt-2">
                      {formatCurrency(summaryMetrics.samUs.value, summaryMetrics.samUs.unit)}
                    </p>
                  </div>
                )}
                {summaryMetrics.somUs && (
                  <div className="stat-card noise">
                    <p className="text-2xs font-mono text-slate-500 uppercase tracking-wider">US SOM</p>
                    <p className="font-mono text-2xl text-white mt-2">
                      {formatCurrency(summaryMetrics.somUs.value, summaryMetrics.somUs.unit)}
                    </p>
                  </div>
                )}
                {summaryMetrics.cagr != null && (
                  <div className="stat-card noise">
                    <p className="text-2xs font-mono text-slate-500 uppercase tracking-wider">5-Year CAGR</p>
                    <p className="font-mono text-2xl text-teal-400 mt-2">{summaryMetrics.cagr.toFixed(1)}%</p>
                  </div>
                )}
              </div>
            )}

            {/* Full analysis CTA */}
            <div className="card noise p-8 text-center">
              <BarChart3 className="w-10 h-10 text-teal-500/30 mx-auto mb-4" />
              <h3 className="font-display text-lg text-white mb-2">Explore the Full Analysis</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
                This is a preview of the shared report. Sign in to Terrain for interactive charts, data tables, PDF
                export, and full methodology.
              </p>
              <div className="flex items-center justify-center gap-3">
                <a href="/login" className="btn btn-primary text-sm px-6 py-2.5">
                  View in Terrain
                </a>
                <a
                  href="/signup"
                  className="btn text-sm px-6 py-2.5 border border-navy-700 text-slate-400 hover:text-white"
                >
                  Create Free Account
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-navy-700/60 px-6 py-6 mt-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-slate-600">
            Powered by{' '}
            <a
              href="https://terrain.ambrosiaventures.co"
              className="text-slate-500 hover:text-teal-400 transition-colors"
            >
              Terrain
            </a>{' '}
            — Market Opportunity Intelligence by{' '}
            <a
              href="https://ambrosiaventures.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-teal-400 transition-colors"
            >
              Ambrosia Ventures
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
