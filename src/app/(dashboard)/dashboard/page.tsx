'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { BarChart3, Network, Users, Shield, FileText, ArrowRight, Lock, Star, Clock, Lightbulb } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useProfile } from '@/hooks/useProfile';
import { useReports } from '@/hooks/useReports';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { REPORT_TYPE_COLORS, REPORT_TYPE_ROUTES, formatReportType } from '@/lib/constants/chart-colors';
// Pre-computed counts to avoid importing heavy data files into the client bundle.
// INDICATION_DATA has 236 entries; PRICING_BENCHMARKS has 276 entries.
const INDICATION_COUNT = 236;
const PRICING_BENCHMARK_COUNT = 276;
import { formatDistanceToNow } from 'date-fns';

import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

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

function getReportTypeBadgeClass(reportType: string): string {
  return REPORT_TYPE_COLORS[reportType] ?? REPORT_TYPE_COLORS.full;
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

/** Role-specific suggestions for the getting-started section */
const ROLE_SUGGESTIONS: Record<string, { title: string; items: { label: string; href: string; desc: string }[] }> = {
  investor: {
    title: 'Recommended for Investors',
    items: [
      { label: 'Size a target market', href: '/market-sizing', desc: 'TAM/SAM/SOM for due diligence' },
      { label: 'Map competitive landscape', href: '/competitive', desc: 'Pipeline density and white space' },
      { label: 'Benchmark deal terms', href: '/partners', desc: 'Comparable transactions and valuations' },
    ],
  },
  bd_executive: {
    title: 'Recommended for BD Executives',
    items: [
      { label: 'Find licensing partners', href: '/partners', desc: 'Match score and deal history' },
      { label: 'Assess regulatory path', href: '/regulatory', desc: 'FDA/EMA pathway and timeline' },
      { label: 'Size the opportunity', href: '/market-sizing', desc: 'Revenue projections for deal model' },
    ],
  },
  founder: {
    title: 'Recommended for Founders',
    items: [
      { label: 'Build your market thesis', href: '/market-sizing', desc: 'Investor-ready TAM analysis' },
      { label: 'Know your competitors', href: '/competitive', desc: 'Pipeline map for board decks' },
      { label: 'Plan regulatory strategy', href: '/regulatory', desc: 'Pathway selection and designations' },
    ],
  },
  analyst: {
    title: 'Recommended for Analysts',
    items: [
      { label: 'Deep market sizing', href: '/market-sizing', desc: 'Patient funnel and pricing analysis' },
      { label: 'Landscape mapping', href: '/competitive', desc: 'Full competitive intelligence' },
      { label: 'Regulatory benchmarking', href: '/regulatory', desc: 'Comparable approvals and timelines' },
    ],
  },
  default: {
    title: 'Getting Started',
    items: [
      { label: 'Run your first market analysis', href: '/market-sizing', desc: 'TAM/SAM/SOM in 90 seconds' },
      { label: 'Explore competitive landscapes', href: '/competitive', desc: 'Pipeline and positioning' },
      { label: 'Discover potential partners', href: '/partners', desc: 'BD match scoring' },
    ],
  },
};

function DashboardContent() {
  const { isPro, isEnterprise, isLoading: subLoading } = useSubscription();
  const { fullName, role, company } = useProfile();
  const { reports, isLoading: reportsLoading, toggleStar } = useReports();
  const {
    analysesThisMonth,
    totalReports,
    dailyActivity,
    reportsByType,
    isLoading: statsLoading,
    dataUpdatedAt,
  } = useDashboardStats();
  const recentReports = useMemo(() => reports.slice(0, 10), [reports]);
  const firstName = fullName?.split(' ')[0];

  // Week-over-week trend for stat card
  const { weekTrendLabel, weekTrendDir } = useMemo(() => {
    const last7 = dailyActivity.slice(-7).reduce((s, d) => s + d.count, 0);
    const prior7 = dailyActivity.slice(-14, -7).reduce((s, d) => s + d.count, 0);
    const pct = prior7 > 0 ? Math.round(((last7 - prior7) / prior7) * 100) : last7 > 0 ? 100 : 0;
    const label = pct > 0 ? `+${pct}% WoW` : pct < 0 ? `${pct}% WoW` : 'Flat WoW';
    const dir: 'up' | 'down' | 'flat' = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';
    return { weekTrendLabel: label, weekTrendDir: dir };
  }, [dailyActivity]);

  const totalAllTimeAnalyses = dailyActivity.reduce((sum, d) => sum + d.count, 0);

  const isNewUser = totalReports === 0 && analysesThisMonth === 0 && !statsLoading;

  // Role-based suggestions
  const roleSuggestions = ROLE_SUGGESTIONS[role ?? 'default'] ?? ROLE_SUGGESTIONS.default;

  return (
    <>
      {/* Welcome Header */}
      <PageHeader
        title={`${getGreeting()}${firstName ? `, ${firstName}` : ''}. Your market is moving.`}
        subtitle={
          isEnterprise
            ? `${company ? company + ' ' : ''}Enterprise workspace — full intelligence suite with API, SSO, and audit controls.`
            : 'Start a new analysis or continue where you left off.'
        }
        badge={isEnterprise ? 'Enterprise' : undefined}
      />

      {/* Quick Actions */}
      <h2 className="label mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isProFeature = action.href === '/partners' || action.href === '/regulatory';
          const isLocked = isProFeature && !isPro && !subLoading;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="card group hover:border-teal-500/30 transition-all duration-200 relative"
            >
              {isLocked && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                </div>
              )}
              <Icon className="w-5 h-5 text-teal-500 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-teal-400 transition-colors">
                {action.label}
              </h3>
              <p className="text-xs text-slate-400">{action.desc}</p>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 mt-3 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>

      {/* Recent Reports */}
      <h2 className="label mb-3">Recent Reports</h2>
      <div className="card mb-8">
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
              <div key={report.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group">
                <Link href={getReportHref(report)} className="flex items-center gap-3 min-w-0 flex-1">
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
                      {report.indication && <span className="text-teal-500/80 font-medium">{report.indication}</span>}
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
                      report.is_starred ? 'fill-amber-400 text-amber-400' : 'text-slate-600 hover:text-slate-400'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Enhanced empty state — role-aware getting started */
          <div className="py-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-navy-800 mb-3">
                <Lightbulb className="w-6 h-6 text-teal-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-300 mb-1">{roleSuggestions.title}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your report library is empty. Start building your intelligence base with one of these workflows.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {roleSuggestions.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col items-center text-center p-4 rounded-lg bg-navy-800/40 border border-navy-700/30 hover:border-teal-500/20 transition-all"
                >
                  <p className="text-xs font-medium text-white mb-1 group-hover:text-teal-400 transition-colors">
                    {item.label}
                  </p>
                  <p className="text-2xs text-slate-500">{item.desc}</p>
                  <ArrowRight className="w-3 h-3 text-slate-600 mt-2 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Platform Stats */}
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-3 w-24 bg-navy-700/60 rounded mb-3" />
              <div className="h-7 w-16 bg-navy-700/60 rounded mb-2" />
              <div className="h-3 w-32 bg-navy-700/40 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Analyses This Month"
            value={String(analysesThisMonth)}
            subvalue={totalAllTimeAnalyses > 0 ? `${totalAllTimeAnalyses} in last 30 days` : 'This month'}
            trend={dailyActivity.length > 0 ? weekTrendLabel : undefined}
            trendDirection={dailyActivity.length > 0 ? weekTrendDir : undefined}
            source="Usage Tracking"
            sparklineData={dailyActivity.length > 0 ? dailyActivity.map((d) => d.count) : undefined}
          />
          <StatCard
            label="Reports Saved"
            value={String(totalReports)}
            subvalue={reportsByType.length > 0 ? `Across ${reportsByType.length} report types` : 'Total'}
            source="Reports Database"
          />
          <StatCard
            label="Indications Covered"
            value={String(INDICATION_COUNT)}
            subvalue="In database"
            source="Terrain Curated Dataset"
          />
          <StatCard
            label="Pricing Benchmarks"
            value={String(PRICING_BENCHMARK_COUNT)}
            subvalue="Drug reference points"
            source="Public Filings & Industry Data"
          />
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
