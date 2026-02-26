import { createClient } from '@/lib/supabase/server';
import { getFeatureLimit, isUnlimited, type PlanKey, type FeatureKey } from '@/lib/subscription';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';

interface UsageCheckResult {
  allowed: boolean;
  plan: PlanKey;
  feature: FeatureKey;
  monthlyCount: number;
  limit: number;
  remaining: number;
}

/**
 * Check if a user has remaining usage for a feature this month.
 * Returns usage metadata for the API response.
 */
export async function checkUsage(userId: string, feature: FeatureKey): Promise<UsageCheckResult> {
  const supabase = createClient();

  // Get user's plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .single();

  const plan: PlanKey =
    subscription && (subscription.status === 'active' || subscription.status === 'trialing')
      ? (subscription.plan as PlanKey)
      : 'free';

  const limit = getFeatureLimit(plan, feature);
  const unlimited = isUnlimited(plan, feature);

  if (limit === 0) {
    return { allowed: false, plan, feature, monthlyCount: 0, limit: 0, remaining: 0 };
  }

  if (unlimited) {
    return { allowed: true, plan, feature, monthlyCount: 0, limit: -1, remaining: -1 };
  }

  // Count usage this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('usage_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('created_at', startOfMonth.toISOString());

  const monthlyCount = count ?? 0;
  const remaining = Math.max(0, limit - monthlyCount);

  return {
    allowed: monthlyCount < limit,
    plan,
    feature,
    monthlyCount,
    limit,
    remaining,
  };
}

/**
 * Record a usage event after a successful API call.
 */
export async function recordUsage(
  userId: string,
  feature: string,
  indication?: string,
  metadata?: Record<string, unknown>,
) {
  const supabase = createClient();

  const { error } = await supabase.from('usage_events').insert({
    user_id: userId,
    feature,
    indication,
    metadata: metadata ?? {},
  });

  if (error) {
    logger.error('usage_record_failed', { error: error.message, userId, feature });
    captureApiError(new Error(`Failed to record usage: ${error.message}`), { userId, feature });
  }
}
