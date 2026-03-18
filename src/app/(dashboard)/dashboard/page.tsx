'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
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
  Building2,
  Key,
  ShieldCheck,
  ScrollText,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useProfile } from '@/hooks/useProfile';
import { useReports } from '@/hooks/useReports';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { PLAN_LIMITS, PLAN_DISPLAY } from '@/lib/subscription';
// Pre-computed counts to avoid importing heavy data files into the client bundle.
// INDICATION_DATA has 236 entries; PRICING_BENCHMARKS has 276 entries.
const INDICATION_COUNT = 236;
const PRICING_BENCHMARK_COUNT = 276;
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

/** Curated market signals -- static for now, could be API-driven later */
const MARKET_SIGNALS = [
  {
    category: 'FDA',
    headline: 'FDA PDUFA dates this week',
    detail: 'Track upcoming action dates and potential market-moving approvals.',
    href: '/regulatory',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    category: 'M&A',
    headline: 'Recent biopharma transactions',
    detail: 'Latest deal announcements from SEC EDGAR filings.',
    href: '/partners',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    category: 'Pipeline',
    headline: 'Phase 3 readouts to watch',
    detail: 'Key clinical catalysts across oncology, neurology, and immunology.',
    href: '/competitive',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    category: 'Pricing',
    headline: 'Pricing & reimbursement signals',
    detail: 'WAC changes, payer coverage decisions, and IRA negotiation updates.',
    href: '/market-sizing',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
];

import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

function DashboardContent() {
  const { plan, isPro, isEnterprise, isLoading: subLoading } = useSubscription();
  const { fullName, role, company, therapyAreas } = useProfile();
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
  const recentReports = useMemo(() => reports.slice(0, 8), [reports]);
  const firstName = fullName?.split(' ')[0];
  const planDisplay = PLAN_DISPLAY[plan];

  // Derived insights
  const totalAllTimeAnalyses = dailyActivity.reduce((sum, d) => sum + d.count, 0);
  const mostUsedModule = moduleBreakdown.length > 0 ? moduleBreakdown[0] : null;
  const topIndication = topIndications.length > 0 ? topIndications[0] : null;
  const activeStreak = useMemo(() => {
    let streak = 0;
    for (let i = dailyActivity.length - 1; i >= 0; i--) {
      if (dailyActivity[i].count > 0) streak++;
      else break;
    }
    return streak;
  }, [dailyActivity]);

  // Week-over-week trend: last 7 days vs prior 7 days
  const { weekTrendLabel, weekTrendDir } = useMemo(() => {
    const last7 = dailyActivity.slice(-7).reduce((s, d) => s + d.count, 0);
    const prior7 = dailyActivity.slice(-14, -7).reduce((s, d) => s + d.count, 0);
    const pct = prior7 > 0 ? Math.round(((last7 - prior7) / prior7) * 100) : last7 > 0 ? 100 : 0;
    const label = pct > 0 ? `+${pct}% WoW` : pct < 0 ? `${pct}% WoW` : 'Flat WoW';
    const dir: 'up' | 'down' | 'flat' = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';
    return { weekTrendLabel: label, weekTrendDir: dir };
  }, [dailyActivity]);

  const isNewUser = totalReports === 0 && analysesThisMonth === 0 && !statsLoading;

  // Role-based suggestions
  const roleSuggestions = ROLE_SUGGESTIONS[role ?? 'default'] ?? ROLE_SUGGESTIONS.default;

  return (
    <>
      {/* Welcome Header — enterprise-aware */}
      <PageHeader
        title={`${getGreeting()}${firstName ? `, ${firstName}` : ''}. Your market is moving.`}
        subtitle={
          isEnterprise
            ? `${company ? company + ' ' : ''}Enterprise workspace — full intelligence suite with API, SSO, and audit controls.`
            : 'Start a new analysis or continue where you left off.'
        }
        badge={isEnterprise ? 'Enterprise' : undefined}
      />

      {/* Enterprise Status Bar */}
      {isEnterprise && (
        <div className="card noise p-4 mb-8 border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">Enterprise Plan</span>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded border bg-purple-500/10 text-purple-400 border-purple-500/20">
                    ACTIVE
                  </span>
                </div>
                <p className="text-2xs text-slate-500">Unlimited seats, API access, SSO, audit log, white-label</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/settings/billing"
                className="text-2xs font-mono text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                Manage plan <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

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
              <p className="text-xs text-slate-400">{action.desc}</p>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 mt-3 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>

      {/* Market Pulse — industry signals for daily return visits */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="label">Market Pulse</h2>
          <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" />
        </div>
        <span className="text-2xs font-mono text-slate-600">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {MARKET_SIGNALS.map((signal) => (
          <Link
            key={signal.category}
            href={signal.href}
            className="group p-4 bg-navy-900/60 border border-navy-700/40 rounded-lg hover:border-navy-600/60 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${signal.bgColor} ${signal.color}`}
              >
                {signal.category}
              </span>
            </div>
            <p className="text-xs font-medium text-white mb-1 group-hover:text-teal-400 transition-colors">
              {signal.headline}
            </p>
            <p className="text-2xs text-slate-500 leading-relaxed">{signal.detail}</p>
          </Link>
        ))}
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
                <p className="text-xs text-white font-medium truncate">{formatReportType(mostUsedModule.feature)}</p>
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
                <p className="text-xs text-white font-medium truncate">{topIndication.indication}</p>
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

      {/* Therapy Area Focus — if user has selected therapy areas */}
      {therapyAreas.length > 0 && (
        <div className="mb-8">
          <h2 className="label mb-3">Your Focus Areas</h2>
          <div className="flex flex-wrap gap-2">
            {therapyAreas.map((area) => (
              <span
                key={area}
                className="text-xs font-medium px-3 py-1.5 rounded-md bg-teal-500/8 border border-teal-500/15 text-teal-400"
              >
                {area}
              </span>
            ))}
            <Link
              href="/settings"
              className="text-xs font-medium px-3 py-1.5 rounded-md bg-navy-800 border border-navy-700 text-slate-500 hover:text-slate-400 hover:border-navy-600 transition-colors"
            >
              Edit areas
            </Link>
          </div>
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

      {/* Enterprise Workspace Summary */}
      {isEnterprise && (
        <>
          <h2 className="label mb-3">Enterprise Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <Link
              href="/settings/billing"
              className="group flex items-center gap-3 p-4 bg-navy-900/60 border border-navy-700/40 rounded-lg hover:border-purple-500/20 transition-all"
            >
              <div className="w-9 h-9 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
                <Key className="w-4 h-4 text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-white font-medium group-hover:text-purple-400 transition-colors">API Keys</p>
                <p className="text-2xs text-slate-500">REST API access</p>
              </div>
            </Link>
            <Link
              href="/settings/billing"
              className="group flex items-center gap-3 p-4 bg-navy-900/60 border border-navy-700/40 rounded-lg hover:border-purple-500/20 transition-all"
            >
              <div className="w-9 h-9 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-white font-medium group-hover:text-purple-400 transition-colors">
                  SSO / SAML
                </p>
                <p className="text-2xs text-slate-500">Okta, Azure AD</p>
              </div>
            </Link>
            <Link
              href="/settings/billing"
              className="group flex items-center gap-3 p-4 bg-navy-900/60 border border-navy-700/40 rounded-lg hover:border-purple-500/20 transition-all"
            >
              <div className="w-9 h-9 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
                <ScrollText className="w-4 h-4 text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-white font-medium group-hover:text-purple-400 transition-colors">
                  Audit Log
                </p>
                <p className="text-2xs text-slate-500">Activity tracking</p>
              </div>
            </Link>
            <Link
              href="/settings/team"
              className="group flex items-center gap-3 p-4 bg-navy-900/60 border border-navy-700/40 rounded-lg hover:border-purple-500/20 transition-all"
            >
              <div className="w-9 h-9 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-white font-medium group-hover:text-purple-400 transition-colors">
                  Team Members
                </p>
                <p className="text-2xs text-slate-500">Unlimited seats</p>
              </div>
            </Link>
          </div>
        </>
      )}

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
                value={reportsByType.find((r) => r.report_type === 'competitive')?.count ?? 0}
                max={limits.competitive as number}
                showValue
              />
              <Progress label="Saved Reports" value={totalReports} max={limits.reports_saved as number} showValue />
            </div>
            <Link href="/settings/billing" className="btn btn-ghost btn-sm w-full mt-4 text-teal-500">
              Upgrade for unlimited access
            </Link>
          </div>
        </>
      )}

      {/* Recent Reports — enhanced empty state */}
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
