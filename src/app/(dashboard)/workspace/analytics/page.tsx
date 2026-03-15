'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2, ArrowRight, BarChart3, FileText, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { AnalyticsCharts } from '@/components/workspace/AnalyticsCharts';
import { MemberUsageTable } from '@/components/workspace/MemberUsageTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { AnalyticsData } from '@/types';

function AnalyticsContent() {
  const { isLoading: subLoading, hasWorkspace } = useSubscription();
  const { activeWorkspace, activeWorkspaceId, members, isLoading: wsLoading } = useWorkspace();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  const isLoading = subLoading || wsLoading;

  const fetchAnalytics = useCallback(async () => {
    if (!activeWorkspaceId) return;
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/analytics`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.data);
      }
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (!isLoading && activeWorkspaceId) {
      fetchAnalytics();
    }
  }, [isLoading, activeWorkspaceId, fetchAnalytics]);

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <div className="page-header">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card noise animate-pulse p-5">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </>
    );
  }

  // ── No workspace plan (free/pro) ────────────────────────
  if (!hasWorkspace) {
    return (
      <>
        <PageHeader title="Team Analytics" subtitle="Monitor workspace usage and team activity." />
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Building2 className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Team workspaces</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Upgrade to the Team plan to access shared workspaces with team analytics, activity tracking, and usage
            insights.
          </p>
          <Link href="/settings/billing" className="btn btn-primary btn-sm inline-flex items-center gap-2">
            View Plans
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </>
    );
  }

  // ── Has plan but no workspace created yet ─────────────────
  if (!activeWorkspace || !activeWorkspaceId) {
    return (
      <>
        <PageHeader title="Team Analytics" subtitle="Monitor workspace usage and team activity." />
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Building2 className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Create your workspace</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">Set up your workspace to get started.</p>
          <Link href="/settings/team" className="btn btn-primary btn-sm inline-flex items-center gap-2">
            Set Up Workspace
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </>
    );
  }

  // Derive trending indication
  const trendingIndication = analytics?.top_indications?.[0]?.indication ?? 'N/A';
  const activeMembers = members.length;

  // ── Workspace exists ────────────────────────────────────
  return (
    <>
      <PageHeader
        title="Team Analytics"
        subtitle={activeWorkspace.name}
        badge={activeWorkspace.plan === 'enterprise' ? 'Enterprise' : 'Team'}
      />

      {/* Stat cards */}
      {isLoadingAnalytics ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card noise animate-pulse p-5">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card noise p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-teal-500" />
              <span className="label text-slate-500">Total Analyses</span>
            </div>
            <p className="font-mono text-2xl font-semibold text-white">{analytics?.total_analyses ?? 0}</p>
          </div>
          <div className="card noise p-5">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-teal-500" />
              <span className="label text-slate-500">Total Reports</span>
            </div>
            <p className="font-mono text-2xl font-semibold text-white">{analytics?.total_reports ?? 0}</p>
          </div>
          <div className="card noise p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-teal-500" />
              <span className="label text-slate-500">Active Members</span>
            </div>
            <p className="font-mono text-2xl font-semibold text-white">{activeMembers}</p>
          </div>
          <div className="card noise p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              <span className="label text-slate-500">Trending</span>
            </div>
            <p className="text-sm font-semibold text-white truncate">{trendingIndication}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      {isLoadingAnalytics ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card noise animate-pulse p-5 h-72">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-full w-full rounded" />
            </div>
          ))}
        </div>
      ) : analytics ? (
        <>
          <AnalyticsCharts analytics={analytics} />
          <div className="mt-6">
            <MemberUsageTable members={analytics.usage_by_member} />
          </div>
        </>
      ) : null}
    </>
  );
}

export default function WorkspaceAnalyticsPage() {
  return (
    <ErrorBoundary>
      <AnalyticsContent />
    </ErrorBoundary>
  );
}
