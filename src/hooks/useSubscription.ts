'use client';

import type { Plan } from '@/types';

interface SubscriptionState {
  plan: Plan;
  isLoading: boolean;
  isPro: boolean;
  isTeam: boolean;
}

export function useSubscription(): SubscriptionState {
  return {
    plan: 'free',
    isLoading: false,
    isPro: false,
    isTeam: false,
  };
}
