import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkUsage, recordUsage } from '@/lib/usage';
import { analyzeRegulatory } from '@/lib/analytics/regulatory';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger, withTiming, logApiRequest, logApiResponse } from '@/lib/logger';
import type { ApiResponse } from '@/types';

// ────────────────────────────────────────────────────────────
// REQUEST SCHEMA
// ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  input: z.object({
    indication: z.string().min(1, 'Indication is required.'),
    product_type: z.enum(['pharmaceutical', 'biologic', 'device', 'diagnostic'], {
      required_error: 'Product type is required.',
    }),
    development_stage: z.enum(['preclinical', 'phase1', 'phase2', 'phase3', 'approved'], {
      required_error: 'Development stage is required.',
    }),
    mechanism: z.string().optional(),
    geography: z
      .array(z.enum(['FDA', 'EMA', 'PMDA', 'NMPA']))
      .min(1, 'At least one regulatory agency is required.'),
    unmet_need: z.enum(['high', 'medium', 'low'], {
      required_error: 'Unmet need level is required.',
    }),
    has_orphan_potential: z.boolean(),
  }),
});

// ────────────────────────────────────────────────────────────
// POST /api/analyze/regulatory
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
      return NextResponse.json(
        { success: false, error: 'Authentication required.' } satisfies ApiResponse<never>,
        { status: 401 },
      );
    }

    // ── Rate limit ──────────────────────────────────────────
    const rl = await rateLimit(`regulatory:${user.id}`, RATE_LIMITS.analysis_pro);
    if (!rl.success) {
      logApiResponse({ route: '/api/analyze/regulatory', status: 429, durationMs: Math.round(performance.now() - routeStart), userId: user.id });
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Try again later.' } satisfies ApiResponse<never>,
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      );
    }

    // ── Usage limit check ──────────────────────────────────
    const usage = await checkUsage(user.id, 'regulatory');

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

    // ── Validate with Zod ───────────────────────────────────
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message);
      return NextResponse.json(
        {
          success: false,
          error: messages.join('; '),
          errors: messages,
        } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const { input } = parsed.data;

    logApiRequest({ route: '/api/analyze/regulatory', method: 'POST', userId: user.id, indication: input.indication, product_type: input.product_type });

    // ── Run analysis engine ─────────────────────────────────
    const { result } = await withTiming('regulatory_analysis', () => analyzeRegulatory(input), { indication: input.indication, product_type: input.product_type });

    // ── Record usage ─────────────────────────────────────────
    await recordUsage(user.id, 'regulatory', input.indication, {
      product_type: input.product_type,
      geography: input.geography,
      development_stage: input.development_stage,
    });

    // ── Success ─────────────────────────────────────────────
    logApiResponse({ route: '/api/analyze/regulatory', status: 200, durationMs: Math.round(performance.now() - routeStart), userId: user.id, indication: input.indication });
    return NextResponse.json(
      {
        success: true,
        data: result,
        usage: {
          feature: 'regulatory',
          monthly_count: usage.monthlyCount + 1,
          limit: usage.limit,
          remaining: usage.remaining === -1 ? -1 : Math.max(0, usage.remaining - 1),
        },
      } satisfies ApiResponse<typeof result> & { usage: unknown },
      { status: 200, headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Regulatory analysis failed.';
    logger.error('regulatory_analysis_error', { error: message, stack: error instanceof Error ? error.stack : undefined });
    logApiResponse({ route: '/api/analyze/regulatory', status: 500, durationMs: Math.round(performance.now() - routeStart) });
    return NextResponse.json(
      { success: false, error: message } satisfies ApiResponse<never>,
      { status: 500 },
    );
  }
}
