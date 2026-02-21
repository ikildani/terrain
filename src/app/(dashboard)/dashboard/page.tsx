'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Progress } from '@/components/ui/Progress';
import {
  BarChart3,
  Network,
  Users,
  Shield,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useReports } from '@/hooks/useReports';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { PLAN_LIMITS } from '@/lib/subscription';

const quickActions = [
  {
    label: 'New Market Analysis',
    desc: 'TAM/SAM/SOM with investor-grade methodology',
    href: '/market-sizing',
    icon: BarChart3,
  },
  {
    label: 'Map a Landscape',
    desc: 'Competitive positioning and pipeline map',
    href: '/competitive',
    icon: Network,
  },
  {
    label: 'Find Partners',
    desc: 'BD match scoring and deal benchmarks',
    href: '/partners',
    icon: Users,
  },
  {
    label: 'Regulatory Intel',
    desc: 'FDA/EMA pathway analysis and timelines',
    href: '/regulatory',
    icon: Shield,
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { plan } = useSubscription();
  const limits = PLAN_LIMITS[plan];
  const { reports, isLoading: reportsLoading } = useReports();
  const { analysesThisMonth, totalReports } = useDashboardStats();
  const recentReports = reports.slice(0, 5);

  return (
    <>
      <PageHeader
        title={`${getGreeting()}. Your market is moving.`}
        subtitle="Start a new analysis or continue where you left off."
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="card group hover:border-teal-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-teal-sm"
            >
              <Icon className="w-5 h-5 text-teal-500 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-teal-400 transition-colors">
                {action.label}
              </h3>
              <p className="text-xs text-slate-500">{action.desc}</p>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 mt-3 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Analyses Run"
          value={String(analysesThisMonth)}
          subvalue="This month"
        />
        <StatCard
          label="Reports Saved"
          value={String(totalReports)}
          subvalue="Total"
        />
        <StatCard
          label="Indications Covered"
          value="152"
          subvalue="In database"
          source="Terrain Curated Dataset"
        />
        <StatCard
          label="Pricing Benchmarks"
          value="150+"
          subvalue="Drug reference points"
          source="Public Filings & Industry Data"
        />
      </div>

      {/* Usage Meters + Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Usage meters */}
        {plan === 'free' && (
          <div className="card">
            <h3 className="label mb-4">Usage This Month</h3>
            <div className="space-y-4">
              <Progress
                label="Market Sizing"
                value={analysesThisMonth}
                max={limits.market_sizing as number}
                showValue
              />
              <Progress
                label="Competitive Analysis"
                value={0}
                max={limits.competitive as number}
                showValue
              />
              <Progress
                label="Saved Reports"
                value={totalReports}
                max={limits.reports_saved as number}
                showValue
              />
            </div>
            <Link
              href="/settings/billing"
              className="btn btn-ghost btn-sm w-full mt-4 text-teal-500"
            >
              Upgrade for unlimited access
            </Link>
          </div>
        )}

        {/* Recent Reports */}
        <div className={plan === 'free' ? 'lg:col-span-2 card' : 'lg:col-span-3 card'}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="label">Recent Reports</h3>
            {recentReports.length > 0 && (
              <Link href="/reports" className="text-xs text-teal-500 hover:text-teal-400 transition-colors">
                View all
              </Link>
            )}
          </div>
          {reportsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-navy-800/50 rounded-md animate-pulse" />
              ))}
            </div>
          ) : recentReports.length > 0 ? (
            <div className="space-y-2">
              {recentReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/market-sizing/${report.id}`}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-navy-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-slate-300 truncate group-hover:text-white transition-colors">
                        {report.title}
                      </p>
                      <p className="text-xs text-slate-600">
                        {report.indication} · {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xs font-mono text-slate-600 uppercase px-2 py-0.5 bg-navy-800 rounded shrink-0">
                    {report.report_type.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <FileText className="w-10 h-10 text-navy-600 mb-3" />
              <p className="text-sm text-slate-400 mb-1">No reports yet</p>
              <p className="text-xs text-slate-600 mb-4">
                Run your first market analysis to get started.
              </p>
              <Link href="/market-sizing" className="btn btn-primary btn-sm">
                New Market Analysis
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
