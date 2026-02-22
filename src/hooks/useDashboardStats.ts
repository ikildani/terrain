'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';

interface DailyActivity {
  date: string;
  count: number;
}

interface ModuleBreakdown {
  feature: string;
  count: number;
}

interface TopIndication {
  indication: string;
  count: number;
}

interface ReportsByType {
  report_type: string;
  count: number;
}

interface DashboardStats {
  analysesThisMonth: number;
  totalReports: number;
  dailyActivity: DailyActivity[];
  moduleBreakdown: ModuleBreakdown[];
  topIndications: TopIndication[];
  reportsByType: ReportsByType[];
}

const EMPTY_STATS: DashboardStats = {
  analysesThisMonth: 0,
  totalReports: 0,
  dailyActivity: [],
  moduleBreakdown: [],
  topIndications: [],
  reportsByType: [],
};

async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = createClient();
  if (!supabase) return EMPTY_STATS;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    usageRes,
    reportsRes,
    dailyActivityRes,
    moduleBreakdownRes,
    topIndicationsRes,
    reportsByTypeRes,
  ] = await Promise.all([
    // Existing: analyses this month
    supabase
      .from('usage_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStart),

    // Existing: total reports
    supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),

    // New: daily activity (last 30 days)
    supabase
      .from('usage_events')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true }),

    // New: module breakdown (all time)
    supabase
      .from('usage_events')
      .select('feature')
      .eq('user_id', userId),

    // New: top indications
    supabase
      .from('usage_events')
      .select('indication')
      .eq('user_id', userId)
      .not('indication', 'is', null),

    // New: reports by type
    supabase
      .from('reports')
      .select('report_type')
      .eq('user_id', userId),
  ]);

  // --- Process daily activity: group by day ---
  const dailyMap = new Map<string, number>();
  // Pre-fill all 30 days with zero
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    dailyMap.set(key, 0);
  }
  if (dailyActivityRes.data) {
    for (const row of dailyActivityRes.data) {
      const day = new Date(row.created_at).toISOString().split('T')[0];
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
    }
  }
  const dailyActivity: DailyActivity[] = Array.from(dailyMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  // --- Process module breakdown: group by feature ---
  const featureMap = new Map<string, number>();
  if (moduleBreakdownRes.data) {
    for (const row of moduleBreakdownRes.data) {
      const f = row.feature ?? 'unknown';
      featureMap.set(f, (featureMap.get(f) ?? 0) + 1);
    }
  }
  const moduleBreakdown: ModuleBreakdown[] = Array.from(featureMap.entries())
    .map(([feature, count]) => ({ feature, count }))
    .sort((a, b) => b.count - a.count);

  // --- Process top indications: group + top 8 ---
  const indicationMap = new Map<string, number>();
  if (topIndicationsRes.data) {
    for (const row of topIndicationsRes.data) {
      const ind = row.indication as string;
      if (ind) {
        indicationMap.set(ind, (indicationMap.get(ind) ?? 0) + 1);
      }
    }
  }
  const topIndications: TopIndication[] = Array.from(indicationMap.entries())
    .map(([indication, count]) => ({ indication, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // --- Process reports by type: group by report_type ---
  const reportTypeMap = new Map<string, number>();
  if (reportsByTypeRes.data) {
    for (const row of reportsByTypeRes.data) {
      const rt = row.report_type ?? 'unknown';
      reportTypeMap.set(rt, (reportTypeMap.get(rt) ?? 0) + 1);
    }
  }
  const reportsByType: ReportsByType[] = Array.from(reportTypeMap.entries())
    .map(([report_type, count]) => ({ report_type, count }))
    .sort((a, b) => b.count - a.count);

  return {
    analysesThisMonth: usageRes.count ?? 0,
    totalReports: reportsRes.count ?? 0,
    dailyActivity,
    moduleBreakdown,
    topIndications,
    reportsByType,
  };
}

export function useDashboardStats() {
  const { user, isLoading: userLoading } = useUser();

  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: () => fetchDashboardStats(user!.id),
    enabled: !!user && !userLoading,
    staleTime: 30 * 1000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  });

  return {
    analysesThisMonth: data?.analysesThisMonth ?? 0,
    totalReports: data?.totalReports ?? 0,
    dailyActivity: data?.dailyActivity ?? [],
    moduleBreakdown: data?.moduleBreakdown ?? [],
    topIndications: data?.topIndications ?? [],
    reportsByType: data?.reportsByType ?? [],
    isLoading: isLoading || userLoading,
    dataUpdatedAt,
  };
}
