'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Report } from '@/types';
import { apiGet, apiPost, apiDelete, apiClient } from '@/lib/utils/api';

const REPORTS_KEY = ['reports'] as const;

async function fetchReports(): Promise<Report[]> {
  const res = await apiGet<Report[]>('/api/reports');
  if (res.success && res.data) return res.data;
  throw new Error(res.error ?? 'Failed to fetch reports');
}

export function useReports() {
  const queryClient = useQueryClient();

  const {
    data: reports = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: REPORTS_KEY,
    queryFn: fetchReports,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const saveMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      report_type: string;
      indication: string;
      inputs: unknown;
      outputs: unknown;
      tags?: string[];
    }) => {
      const res = await apiPost<Report>('/api/reports', data);
      if (res.success && res.data) return res.data;
      throw new Error(res.error ?? 'Failed to save report');
    },
    onSuccess: (newReport) => {
      queryClient.setQueryData<Report[]>(REPORTS_KEY, (old) =>
        old ? [newReport, ...old] : [newReport]
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiDelete(`/api/reports/${id}`);
      if (!res.success) throw new Error('Failed to delete report');
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Report[]>(REPORTS_KEY, (old) =>
        old ? old.filter((r) => r.id !== deletedId) : []
      );
    },
  });

  const starMutation = useMutation({
    mutationFn: async (id: string) => {
      const report = reports.find((r) => r.id === id);
      if (!report) throw new Error('Report not found');
      const res = await apiClient<Report>(`/api/reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_starred: !report.is_starred }),
      });
      if (res.success && res.data) return res.data;
      throw new Error('Failed to toggle star');
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Report[]>(REPORTS_KEY, (old) =>
        old ? old.map((r) => (r.id === updated.id ? updated : r)) : []
      );
    },
  });

  return {
    reports,
    isLoading,
    error: error ? (error as Error).message : null,
    fetchReports: () => queryClient.invalidateQueries({ queryKey: REPORTS_KEY }),
    saveReport: async (data: Parameters<typeof saveMutation.mutateAsync>[0]) => {
      try {
        return await saveMutation.mutateAsync(data);
      } catch {
        return null;
      }
    },
    deleteReport: async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    toggleStar: async (id: string) => {
      try {
        await starMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
  };
}
