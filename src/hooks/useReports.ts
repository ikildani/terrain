'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Report } from '@/types';
import { apiGet, apiPost, apiDelete, apiClient } from '@/lib/utils/api';

interface UseReportsReturn {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  fetchReports: () => Promise<void>;
  saveReport: (data: {
    title: string;
    report_type: string;
    indication: string;
    inputs: unknown;
    outputs: unknown;
    tags?: string[];
  }) => Promise<Report | null>;
  deleteReport: (id: string) => Promise<boolean>;
  toggleStar: (id: string) => Promise<boolean>;
}

export function useReports(): UseReportsReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiGet<Report[]>('/api/reports');
      if (res.success && res.data) {
        setReports(res.data);
      } else {
        setError(res.error ?? 'Failed to fetch reports');
      }
    } catch {
      setError('Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveReport = useCallback(async (data: {
    title: string;
    report_type: string;
    indication: string;
    inputs: unknown;
    outputs: unknown;
    tags?: string[];
  }): Promise<Report | null> => {
    try {
      const res = await apiPost<Report>('/api/reports', data);
      if (res.success && res.data) {
        setReports(prev => [res.data!, ...prev]);
        return res.data;
      }
      setError(res.error ?? 'Failed to save report');
      return null;
    } catch {
      setError('Failed to save report');
      return null;
    }
  }, []);

  const deleteReport = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await apiDelete(`/api/reports/${id}`);
      if (res.success) {
        setReports(prev => prev.filter(r => r.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const toggleStar = useCallback(async (id: string): Promise<boolean> => {
    const report = reports.find(r => r.id === id);
    if (!report) return false;

    try {
      const res = await apiClient<Report>(`/api/reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_starred: !report.is_starred }),
      });
      if (res.success && res.data) {
        setReports(prev => prev.map(r => r.id === id ? res.data! : r));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [reports]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { reports, isLoading, error, fetchReports, saveReport, deleteReport, toggleStar };
}
