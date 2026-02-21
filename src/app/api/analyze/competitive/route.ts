import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkUsage, recordUsage } from '@/lib/usage';
import { analyzeCompetitiveLandscape } from '@/lib/analytics/competitive';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger, withTiming, logApiRequest, logApiResponse } from '@/lib/logger';
import type { ApiResponse, CompetitiveLandscapeOutput } from '@/types';

// ────────────────────────────────────────────────────────────
// REQUEST SCHEMA
// ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  input: z.object({
    indication: z.string().min(1, 'Indication is required.'),
    mechanism: z.string().optional(),
  }),
  save: z.boolean().optional(),
  report_title: z.string().optional(),
});

// ────────────────────────────────────────────────────────────
// POST /api/analyze/competitive
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const routeStart = performance.now();
  try {
    // ── Auth ──────────────────────────────────────────────────
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' } satisfies ApiResponse<never>,
        { status: 401 },
      );
    }

    // ── Rate limit ──────────────────────────────────────────
    const rl = rateLimit(`competitive:${user.id}`, RATE_LIMITS.analysis_pro);
    if (!rl.success) {
      logApiResponse({ route: '/api/analyze/competitive', status: 429, durationMs: Math.round(performance.now() - routeStart), userId: user.id });
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
          usage: { feature: usage.feature, monthly_count: usage.monthlyCount, limit: usage.limit, remaining: 0 },
        } satisfies ApiResponse<never> & { usage: unknown },
        { status: 403 },
      );
    }

    // ── Parse body ──────────────────────────────────────────
    const body = await request.json();

    // ── Validate with Zod ───────────────────────────────────
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message);
      return NextResponse.json(
        { success: false, error: messages.join('; '), errors: messages } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    logApiRequest({ route: '/api/analyze/competitive', method: 'POST', userId: user.id, indication: parsed.data.input.indication });

    // ── Run competitive landscape analysis ──────────────────
    const { result } = await withTiming('competitive_analysis', () => analyzeCompetitiveLandscape(parsed.data.input), { indication: parsed.data.input.indication });

    // ── Record usage ────────────────────────────────────────
    await recordUsage(user.id, 'competitive', parsed.data.input.indication, {
      mechanism: parsed.data.input.mechanism,
    });

    // ── Success ─────────────────────────────────────────────
    logApiResponse({ route: '/api/analyze/competitive', status: 200, durationMs: Math.round(performance.now() - routeStart), userId: user.id, indication: parsed.data.input.indication });
    return NextResponse.json(
      {
        success: true,
        data: result,
        usage: {
          feature: 'competitive',
          monthly_count: usage.monthlyCount + 1,
          limit: usage.limit,
          remaining: usage.remaining === -1 ? -1 : Math.max(0, usage.remaining - 1),
        },
      } satisfies ApiResponse<CompetitiveLandscapeOutput> & { usage: unknown },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Competitive analysis failed.';
    logger.error('competitive_analysis_error', { error: message, stack: error instanceof Error ? error.stack : undefined });
    logApiResponse({ route: '/api/analyze/competitive', status: 500, durationMs: Math.round(performance.now() - routeStart) });
    return NextResponse.json(
      { success: false, error: message } satisfies ApiResponse<never>,
      { status: 500 },
    );
  }
}
