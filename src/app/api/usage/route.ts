import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PLAN_LIMITS, type PlanKey } from '@/lib/subscription';
import { rateLimit } from '@/lib/rate-limit';
import type { ApiResponse } from '@/types';

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required.' } satisfies ApiResponse<never>, {
      status: 401,
    });
  }

  const rateLimitResult = await rateLimit(`usage:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
  if (!rateLimitResult.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Get user's plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .single();

  const plan: PlanKey =
    subscription && (subscription.status === 'active' || subscription.status === 'trialing')
      ? (subscription.plan as PlanKey)
      : 'free';

  const limits = PLAN_LIMITS[plan];

  // Count usage this month per feature
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: events } = await supabase
    .from('usage_events')
    .select('feature')
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString());

  const counts: Record<string, number> = {};
  if (events) {
    for (const row of events) {
      const feature = (row as { feature: string }).feature;
      counts[feature] = (counts[feature] || 0) + 1;
    }
  }

  // Count saved reports
  const { count: reportCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const FEATURES = ['market_sizing', 'competitive', 'pipeline', 'partners', 'regulatory'] as const;

  const data: Record<string, { used: number; limit: number }> = {};
  for (const feature of FEATURES) {
    const limit = (limits as Record<string, number | boolean>)[feature];
    const numLimit = typeof limit === 'number' ? limit : 0;
    data[feature] = { used: counts[feature] ?? 0, limit: numLimit };
  }

  data.reports_saved = {
    used: reportCount ?? 0,
    limit: typeof limits.reports_saved === 'number' ? limits.reports_saved : 0,
  };

  return NextResponse.json({ success: true, data });
}
