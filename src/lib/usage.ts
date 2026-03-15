import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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
  const supabase = await createClient();

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
 * Atomically check usage limit AND record the event in a single Postgres
 * transaction. Uses pg_advisory_xact_lock to serialize concurrent requests
 * for the same user+feature, eliminating the TOCTOU race condition.
 *
 * Returns the same shape as checkUsage so callers can switch seamlessly.
 */
export async function checkAndRecordUsageAtomic(
  userId: string,
  feature: FeatureKey,
  plan: PlanKey,
  indication?: string,
  metadata?: Record<string, unknown>,
): Promise<UsageCheckResult> {
  const limit = getFeatureLimit(plan, feature);
  const unlimited = isUnlimited(plan, feature);

  if (limit === 0) {
    return { allowed: false, plan, feature, monthlyCount: 0, limit: 0, remaining: 0 };
  }

  if (unlimited) {
    // Still record usage for analytics, but skip the atomic gate
    await recordUsage(userId, feature, indication, metadata);
    return { allowed: true, plan, feature, monthlyCount: 0, limit: -1, remaining: -1 };
  }

  // Use service role to call the SECURITY DEFINER function (bypasses RLS)
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase.rpc('check_and_record_usage', {
    p_user_id: userId,
    p_feature: feature,
    p_limit: limit,
    p_indication: indication ?? null,
    p_metadata: metadata ?? {},
  });

  if (error) {
    logger.error('atomic_usage_check_failed', { error: error.message, userId, feature });
    captureApiError(new Error(`Atomic usage check failed: ${error.message}`), { userId, feature });
    // Fall back to non-atomic check so the request isn't blocked by a DB error
    return checkUsage(userId, feature);
  }

  const result = data as { allowed: boolean; monthly_count: number; limit: number; remaining: number };

  return {
    allowed: result.allowed,
    plan,
    feature,
    monthlyCount: result.monthly_count,
    limit: result.limit,
    remaining: result.remaining < 0 ? -1 : result.remaining,
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
  const supabase = await createClient();

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
