'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';

interface DashboardStats {
  analysesThisMonth: number;
  totalReports: number;
}

async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = createClient();
  if (!supabase) return { analysesThisMonth: 0, totalReports: 0 };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [usageRes, reportsRes] = await Promise.all([
    supabase
      .from('usage_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStart),
    supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  return {
    analysesThisMonth: usageRes.count ?? 0,
    totalReports: reportsRes.count ?? 0,
  };
}

export function useDashboardStats() {
  const { user, isLoading: userLoading } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: () => fetchDashboardStats(user!.id),
    enabled: !!user && !userLoading,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    analysesThisMonth: data?.analysesThisMonth ?? 0,
    totalReports: data?.totalReports ?? 0,
    isLoading: isLoading || userLoading,
  };
}
