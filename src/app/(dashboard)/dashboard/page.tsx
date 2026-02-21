'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { UpgradeGate } from '@/components/shared/UpgradeGate';
import { Progress } from '@/components/ui/Progress';
import {
  BarChart3,
  Network,
  TestTube2,
  Users,
  FileText,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
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
    label: 'Search Pipeline',
    desc: 'Clinical trials and development assets',
    href: '/pipeline',
    icon: TestTube2,
  },
  {
    label: 'Find Partners',
    desc: 'BD match scoring and deal benchmarks',
    href: '/partners',
    icon: Users,
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { plan, isPro } = useSubscription();
  const limits = PLAN_LIMITS[plan];

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
        <StatCard label="Analyses Run" value="0" subvalue="This month" />
        <StatCard label="Reports Saved" value="0" subvalue="Total" />
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

      {/* Usage Meters + Recent Reports + Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Usage meters */}
        {plan === 'free' && (
          <div className="card">
            <h3 className="label mb-4">Usage This Month</h3>
            <div className="space-y-4">
              <Progress
                label="Market Sizing"
                value={0}
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
                value={0}
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
        <div className={plan === 'free' ? 'card' : 'lg:col-span-2 card'}>
          <h3 className="label mb-4">Recent Reports</h3>
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
        </div>

        {/* Alert Feed */}
        <div className="card">
          <h3 className="label mb-4">Alert Feed</h3>
          {isPro ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Bell className="w-10 h-10 text-navy-600 mb-3" />
              <p className="text-sm text-slate-400 mb-1">No alerts configured</p>
              <p className="text-xs text-slate-600 mb-4">
                Set up deal alerts to track your market.
              </p>
              <Link href="/alerts" className="btn btn-secondary btn-sm">
                Configure Alerts
              </Link>
            </div>
          ) : (
            <UpgradeGate feature="Deal Alerts">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-navy-700 rounded w-3/4 mb-1.5" />
                      <div className="h-2.5 bg-navy-800 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </UpgradeGate>
          )}
        </div>
      </div>
    </>
  );
}
