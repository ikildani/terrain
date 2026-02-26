import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkUsage, recordUsage } from '@/lib/usage';
import { scoreAllIndications } from '@/lib/analytics/screener';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger, logApiRequest, logApiResponse } from '@/lib/logger';
import type { ApiResponse } from '@/types';
import type { OpportunityFilters } from '@/lib/analytics/screener';

// ────────────────────────────────────────────────────────────
// REQUEST SCHEMA
// ────────────────────────────────────────────────────────────

const ScreenerRequestSchema = z.object({
  filters: z
    .object({
      therapy_areas: z.array(z.string()).optional(),
      product_category: z.string().default('pharmaceutical'),
      min_prevalence: z.number().optional(),
      max_crowding: z.number().optional(),
      phases: z.array(z.string()).optional(),
      min_opportunity_score: z.number().optional(),
    })
    .optional(),
  sort_by: z
    .enum(['opportunity_score', 'global_prevalence', 'crowding_score', 'global_incidence', 'cagr_5yr', 'unmet_need'])
    .default('opportunity_score'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(250).default(50),
  offset: z.number().min(0).default(0),
});

// ────────────────────────────────────────────────────────────
// POST /api/analyze/screener
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const routeStart = performance.now();
  try {
    // ── Auth ──────────────────────────────────────────────────
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

    // ── Rate limit (plan-aware) ──────────────────────────────
    const { data: subForRl } = await supabase.from('subscriptions').select('plan').eq('user_id', user.id).single();
    const userPlan = (subForRl?.plan as string) || 'free';
    const rlConfig =
      userPlan === 'team'
        ? RATE_LIMITS.analysis_team
        : userPlan === 'pro'
          ? RATE_LIMITS.analysis_pro
          : RATE_LIMITS.analysis_free;
    const rl = await rateLimit(`screener:${user.id}`, rlConfig);
    if (!rl.success) {
      logApiResponse({
        route: '/api/analyze/screener',
        status: 429,
        durationMs: Math.round(performance.now() - routeStart),
        userId: user.id,
      });
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Try again later.' } satisfies ApiResponse<never>,
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      );
    }

    // ── Usage limit check ─────────────────────────────────────
    const usage = await checkUsage(user.id, 'competitive');

    if (!usage.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Monthly limit reached (${usage.limit} analyses on ${usage.plan} plan). Upgrade to Pro for unlimited access.`,
          usage: {
            feature: usage.feature,
            monthly_count: usage.monthlyCount,
            limit: usage.limit,
            remaining: 0,
          },
        } satisfies ApiResponse<never> & { usage: unknown },
        { status: 403 },
      );
    }

    // ── Parse body ──────────────────────────────────────────
    const body = await request.json();

    // ── Validate with Zod ───────────────────────────────────
    const parsed = ScreenerRequestSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message);
      return NextResponse.json(
        { success: false, error: messages.join('; '), errors: messages } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const { filters, sort_by, sort_order, limit, offset } = parsed.data;

    logApiRequest({
      route: '/api/analyze/screener',
      method: 'POST',
      userId: user.id,
      filters: filters ?? {},
      sort_by,
    });

    // ── Run screener engine ─────────────────────────────────
    const { opportunities, total_count } = scoreAllIndications(
      filters as OpportunityFilters | undefined,
      sort_by,
      sort_order,
      limit,
      offset,
    );

    // ── Record usage ────────────────────────────────────────
    await recordUsage(user.id, 'competitive', undefined, { sub_feature: 'screener' });

    // ── Success ─────────────────────────────────────────────
    logApiResponse({
      route: '/api/analyze/screener',
      status: 200,
      durationMs: Math.round(performance.now() - routeStart),
      userId: user.id,
      total_count,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          opportunities,
          total_count,
          filters_applied: filters ?? {},
          generated_at: new Date().toISOString(),
        },
        usage: {
          feature: 'competitive',
          monthly_count: usage.monthlyCount + 1,
          limit: usage.limit,
          remaining: usage.remaining === -1 ? -1 : Math.max(0, usage.remaining - 1),
        },
      },
      { status: 200, headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Screener analysis failed.';
    logger.error('screener_analysis_error', {
      error: message,
      stack: error instanceof Error ? error.stack : undefined,
    });
    logApiResponse({
      route: '/api/analyze/screener',
      status: 500,
      durationMs: Math.round(performance.now() - routeStart),
    });
    return NextResponse.json(
      { success: false, error: 'Screener analysis failed. Please try again.' } satisfies ApiResponse<never>,
      { status: 500 },
    );
  }
}
