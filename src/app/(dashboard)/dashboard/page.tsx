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
  Lock,
  Star,
  TrendingUp,
  Zap,
  Target,
  Clock,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useProfile } from '@/hooks/useProfile';
import { useReports } from '@/hooks/useReports';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { PLAN_LIMITS } from '@/lib/subscription';
import { INDICATION_DATA } from '@/lib/data/indication-map';
import { PRICING_BENCHMARKS } from '@/lib/data/pricing-benchmarks';
import { formatDistanceToNow } from 'date-fns';
import ActivityTrendChart from '@/components/dashboard/ActivityTrendChart';
import ModuleBreakdownChart from '@/components/dashboard/ModuleBreakdownChart';
import TopIndicationsChart from '@/components/dashboard/TopIndicationsChart';
import DatabaseCoverageChart from '@/components/dashboard/DatabaseCoverageChart';

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

const REPORT_TYPE_COLORS: Record<string, string> = {
  market_sizing: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  competitive: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  regulatory: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  partners: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  full: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

const REPORT_TYPE_ROUTES: Record<string, string> = {
  market_sizing: '/market-sizing',
  competitive: '/competitive',
  regulatory: '/regulatory',
  partners: '/partners',
};

function getReportTypeBadgeClass(reportType: string): string {
  return REPORT_TYPE_COLORS[reportType] ?? REPORT_TYPE_COLORS.full;
}

function formatReportType(reportType: string): string {
  return reportType
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getReportHref(report: { id: string; report_type: string }): string {
  const base = REPORT_TYPE_ROUTES[report.report_type] ?? '/market-sizing';
  return `${base}/${report.id}`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { plan, isPro } = useSubscription();
  const { fullName } = useProfile();
  const limits = PLAN_LIMITS[plan];
  const { reports, isLoading: reportsLoading, toggleStar } = useReports();
  const {
    analysesThisMonth,
    totalReports,
    dailyActivity,
    moduleBreakdown,
    topIndications,
    reportsByType,
    isLoading: statsLoading,
    dataUpdatedAt,
  } = useDashboardStats();
  const recentReports = reports.slice(0, 8);
  const firstName = fullName?.split(' ')[0];

  // Derived insights
  const totalAllTimeAnalyses = dailyActivity.reduce((sum, d) => sum + d.count, 0);
  const mostUsedModule = moduleBreakdown.length > 0 ? moduleBreakdown[0] : null;
  const topIndication = topIndications.length > 0 ? topIndications[0] : null;
  const activeStreak = (() => {
    let streak = 0;
    for (let i = dailyActivity.length - 1; i >= 0; i--) {
      if (dailyActivity[i].count > 0) streak++;
      else break;
    }
    return streak;
  })();

  // Week-over-week trend: last 7 days vs prior 7 days
  const last7 = dailyActivity.slice(-7).reduce((s, d) => s + d.count, 0);
  const prior7 = dailyActivity.slice(-14, -7).reduce((s, d) => s + d.count, 0);
  const weekTrendPct = prior7 > 0 ? Math.round(((last7 - prior7) / prior7) * 100) : last7 > 0 ? 100 : 0;
  const weekTrendLabel = weekTrendPct > 0 ? `+${weekTrendPct}% WoW` : weekTrendPct < 0 ? `${weekTrendPct}% WoW` : 'Flat WoW';
  const weekTrendDir: 'up' | 'down' | 'flat' = weekTrendPct > 0 ? 'up' : weekTrendPct < 0 ? 'down' : 'flat';

  return (
    <>
      <PageHeader
        title={`${getGreeting()}${firstName ? `, ${firstName}` : ''}. Your market is moving.`}
        subtitle="Start a new analysis or continue where you left off."
      />

      {/* Quick Actions */}
      <h2 className="label mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isProFeature = action.href === '/partners' || action.href === '/regulatory';
          const isLocked = isProFeature && !isPro;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="card noise group hover:border-teal-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-teal-sm relative"
            >
              {isLocked && (
                <div className="absolute top-3 right-3">
                  <span className="badge-pro text-[8px] px-1.5 py-0.5 flex items-center gap-0.5">
                    <Lock className="w-2 h-2" />
                    PRO
                  </span>
                </div>
              )}
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

      {/* Platform Overview — Key Metrics */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="label">Platform Overview</h2>
        {dataUpdatedAt && !statsLoading && (
          <span className="text-2xs font-mono text-slate-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" />
            Updated {formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}
          </span>
        )}
      </div>
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card noise animate-pulse">
              <div className="h-3 w-24 bg-navy-700/60 rounded mb-3" />
              <div className="h-7 w-16 bg-navy-700/60 rounded mb-2" />
              <div className="h-3 w-32 bg-navy-700/40 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            label="Analyses This Month"
            value={String(analysesThisMonth)}
            subvalue={totalAllTimeAnalyses > 0 ? `${totalAllTimeAnalyses} in last 30 days` : 'This month'}
            trend={dailyActivity.length > 0 ? weekTrendLabel : undefined}
            trendDirection={dailyActivity.length > 0 ? weekTrendDir : undefined}
            source="Usage Tracking"
            sparklineData={dailyActivity.length > 0 ? dailyActivity.map(d => d.count) : undefined}
          />
          <StatCard
            label="Reports Saved"
            value={String(totalReports)}
            subvalue={reportsByType.length > 0 ? `Across ${reportsByType.length} report types` : 'Total'}
            source="Reports Database"
          />
          <StatCard
            label="Indications Covered"
            value={String(INDICATION_DATA.length)}
            subvalue="In database"
            source="Terrain Curated Dataset"
          />
          <StatCard
            label="Pricing Benchmarks"
            value={String(PRICING_BENCHMARKS.length)}
            subvalue="Drug reference points"
            source="Public Filings & Industry Data"
          />
        </div>
      )}

      {/* Insight Tiles — quick-glance highlights */}
      {!statsLoading && (mostUsedModule || topIndication || activeStreak > 0 || reportsByType.length > 0) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {mostUsedModule && (
            <div className="flex items-center gap-3 p-3 bg-navy-900/60 border border-navy-700/40 rounded-lg">
              <div className="w-8 h-8 rounded-md bg-teal-500/10 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-teal-500" />
              </div>
              <div className="min-w-0">
                <p className="text-2xs text-slate-500 uppercase tracking-wider">Most Used</p>
                <p className="text-xs text-white font-medium truncate">
                  {formatReportType(mostUsedModule.feature)}
                </p>
                <p className="text-2xs text-slate-500 font-mono">{mostUsedModule.count} uses</p>
              </div>
            </div>
          )}
          {topIndication && (
            <div className="flex items-center gap-3 p-3 bg-navy-900/60 border border-navy-700/40 rounded-lg">
              <div className="w-8 h-8 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-2xs text-slate-500 uppercase tracking-wider">Top Focus</p>
                <p className="text-xs text-white font-medium truncate">
                  {topIndication.indication}
                </p>
                <p className="text-2xs text-slate-500 font-mono">{topIndication.count} analyses</p>
              </div>
            </div>
          )}
          {activeStreak > 0 && (
            <div className="flex items-center gap-3 p-3 bg-navy-900/60 border border-navy-700/40 rounded-lg">
              <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-2xs text-slate-500 uppercase tracking-wider">Active Streak</p>
                <p className="text-xs text-white font-medium">
                  {activeStreak} {activeStreak === 1 ? 'day' : 'days'}
                </p>
                <p className="text-2xs text-slate-500 font-mono">Consecutive activity</p>
              </div>
            </div>
          )}
          {reportsByType.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-navy-900/60 border border-navy-700/40 rounded-lg">
              <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-2xs text-slate-500 uppercase tracking-wider">Report Mix</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {reportsByType.slice(0, 3).map((rt) => (
                    <span
                      key={rt.report_type}
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${getReportTypeBadgeClass(rt.report_type)}`}
                    >
                      {formatReportType(rt.report_type)} ({rt.count})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Charts */}
      <h2 className="label mb-3">Analytics</h2>
      {statsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 chart-container noise animate-pulse">
            <div className="h-3 w-24 bg-navy-700/60 rounded mb-4" />
            <div className="h-[220px] bg-navy-700/30 rounded" />
          </div>
          <div className="chart-container noise animate-pulse">
            <div className="h-3 w-24 bg-navy-700/60 rounded mb-4" />
            <div className="h-[180px] bg-navy-700/30 rounded" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2">
            <ActivityTrendChart data={dailyActivity} />
          </div>
          <div>
            <ModuleBreakdownChart data={moduleBreakdown} />
          </div>
        </div>
      )}

      {/* Intelligence Coverage */}
      <h2 className="label mb-3">Intelligence Coverage</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div>
          {statsLoading ? (
            <div className="chart-container noise animate-pulse">
              <div className="h-3 w-28 bg-navy-700/60 rounded mb-4" />
              <div className="h-[200px] bg-navy-700/30 rounded" />
            </div>
          ) : (
            <TopIndicationsChart data={topIndications} />
          )}
        </div>
        <div className="lg:col-span-2">
          <DatabaseCoverageChart />
        </div>
      </div>

      {/* Usage meters (free plan only) */}
      {plan === 'free' && (
        <>
          <h2 className="label mb-3">Usage This Month</h2>
          <div className="card noise mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
        </>
      )}

      {/* Recent Reports */}
      <h2 className="label mb-3">Recent Reports</h2>
      <div className="card noise">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <h3 className="label">Latest Activity</h3>
          </div>
          {recentReports.length > 0 && (
            <Link
              href="/reports"
              className="text-xs text-teal-500 hover:text-teal-400 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        {reportsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-navy-800/50 rounded-md animate-pulse" />
            ))}
          </div>
        ) : recentReports.length > 0 ? (
          <div className="divide-y divide-navy-700/30">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group"
              >
                <Link
                  href={getReportHref(report)}
                  className="flex items-center gap-3 min-w-0 flex-1"
                >
                  <div className="w-8 h-8 rounded-md bg-navy-800 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-slate-500 group-hover:text-teal-500 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm text-slate-300 truncate group-hover:text-white transition-colors">
                        {report.title}
                      </p>
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border shrink-0 ${getReportTypeBadgeClass(report.report_type)}`}
                      >
                        {formatReportType(report.report_type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {report.indication && (
                        <span className="text-teal-500/80 font-medium">
                          {report.indication}
                        </span>
                      )}
                      <span className="text-slate-600 font-mono text-2xs">
                        {new Date(report.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleStar(report.id);
                  }}
                  className="p-1.5 rounded hover:bg-navy-700/50 transition-colors shrink-0 ml-2"
                  aria-label={report.is_starred ? 'Remove star' : 'Star report'}
                >
                  <Star
                    className={`w-4 h-4 transition-colors ${
                      report.is_starred
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-10 text-center">
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
    </>
  );
}
