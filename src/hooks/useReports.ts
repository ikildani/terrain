'use client';

import type { Report } from '@/types';

interface ReportsState {
  reports: Report[];
  isLoading: boolean;
}

export function useReports(): ReportsState {
  return { reports: [], isLoading: false };
}
