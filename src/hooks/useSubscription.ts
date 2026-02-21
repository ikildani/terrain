'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Plan } from '@/types';
import { useUser } from './useUser';

interface SubscriptionState {
  plan: Plan;
  isLoading: boolean;
  isPro: boolean;
  isTeam: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export function useSubscription(): SubscriptionState {
  const { user, isLoading: userLoading } = useUser();
  const [plan, setPlan] = useState<Plan>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setPlan('free');
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setPlan('free');
      setIsLoading(false);
      return;
    }

    async function fetchSubscription() {
      const { data, error } = await supabase!
        .from('subscriptions')
        .select('plan, status, cancel_at_period_end, current_period_end')
        .eq('user_id', user!.id)
        .single();

      if (data && !error) {
        const row = data as Record<string, string | boolean | null>;
        const effectivePlan =
          row.status === 'active' || row.status === 'trialing'
            ? (row.plan as Plan)
            : 'free';
        setPlan(effectivePlan);
        setCancelAtPeriodEnd(Boolean(row.cancel_at_period_end ?? false));
        setCurrentPeriodEnd((row.current_period_end as string) ?? null);
      }
      setIsLoading(false);
    }

    fetchSubscription();
  }, [user, userLoading]);

  return {
    plan,
    isLoading: isLoading || userLoading,
    isPro: plan === 'pro' || plan === 'team',
    isTeam: plan === 'team',
    cancelAtPeriodEnd,
    currentPeriodEnd,
  };
}
