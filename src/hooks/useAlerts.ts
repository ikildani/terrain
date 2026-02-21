'use client';

import type { AlertEvent } from '@/types';

interface AlertsState {
  alerts: AlertEvent[];
  unreadCount: number;
  isLoading: boolean;
}

export function useAlerts(): AlertsState {
  return { alerts: [], unreadCount: 0, isLoading: false };
}
