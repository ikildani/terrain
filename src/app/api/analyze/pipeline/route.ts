import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkUsage, recordUsage } from '@/lib/usage';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger, withTiming, logApiRequest, logApiResponse } from '@/lib/logger';
import type { ApiResponse } from '@/types';

// ────────────────────────────────────────────────────────────
// REQUEST SCHEMA
// ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  input: z
    .object({
      indication: z.string().optional(),
      mechanism: z.string().optional(),
      target: z.string().optional(),
      phase: z.array(z.enum(['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'])).optional(),
      company: z.string().optional(),
      geography: z.array(z.string()).optional(),
      status: z.array(z.enum(['Recruiting', 'Active', 'Completed'])).optional(),
      has_deal: z.boolean().optional(),
    })
    .refine((data) => data.indication || data.mechanism || data.target || data.company, {
      message: 'At least one search criterion is required (indication, mechanism, target, or company).',
    }),
});

// ────────────────────────────────────────────────────────────
// PIPELINE SEARCH (placeholder — will integrate ClinicalTrials.gov)
// ────────────────────────────────────────────────────────────

interface PipelineAsset {
  nct_id: string;
  title: string;
  company: string;
  phase: string;
  status: string;
  indication: string;
  mechanism: string;
  start_date: string;
  enrollment: number;
}

async function searchPipeline(input: z.infer<typeof RequestSchema>['input']): Promise<PipelineAsset[]> {
  // Placeholder — will be replaced with ClinicalTrials.gov API v2 integration
  // https://clinicaltrials.gov/api/v2/studies
  return [
    {
      nct_id: 'NCT00000001',
      title: `${input.indication || 'Unknown'} — ${input.mechanism || 'Multi-target'} Study`,
      company: input.company || 'Undisclosed',
      phase: input.phase?.[0] || 'Phase 2',
      status: input.status?.[0] || 'Recruiting',
      indication: input.indication || '',
      mechanism: input.mechanism || '',
      start_date: '2024-06-01',
      enrollment: 250,
    },
  ];
}

// ────────────────────────────────────────────────────────────
// POST /api/analyze/pipeline
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

    // ── Rate limit ──────────────────────────────────────────
    const rl = await rateLimit(`pipeline:${user.id}`, RATE_LIMITS.analysis_pro);
    if (!rl.success) {
      logApiResponse({
        route: '/api/analyze/pipeline',
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
    const usage = await checkUsage(user.id, 'pipeline');

    if (!usage.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Monthly limit reached (${usage.limit} searches on ${usage.plan} plan). Upgrade to Pro for unlimited access.`,
          usage: { feature: usage.feature, monthly_count: usage.monthlyCount, limit: usage.limit, remaining: 0 },
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
        { success: false, error: messages.join('; '), errors: messages } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const { input } = parsed.data;
    const searchTerm = input.indication || input.mechanism || input.target || input.company || '';

    logApiRequest({ route: '/api/analyze/pipeline', method: 'POST', userId: user.id, indication: searchTerm });

    // ── Run search engine ──────────────────────────────────
    const { result } = await withTiming('pipeline_search', () => searchPipeline(input), { searchTerm });

    // ── Record usage ────────────────────────────────────────
    await recordUsage(user.id, 'pipeline', searchTerm, {
      phase: input.phase,
      company: input.company,
    });

    // ── Success ─────────────────────────────────────────────
    logApiResponse({
      route: '/api/analyze/pipeline',
      status: 200,
      durationMs: Math.round(performance.now() - routeStart),
      userId: user.id,
      searchTerm,
    });
    return NextResponse.json(
      {
        success: true,
        data: result,
        usage: {
          feature: 'pipeline',
          monthly_count: usage.monthlyCount + 1,
          limit: usage.limit,
          remaining: usage.remaining === -1 ? -1 : Math.max(0, usage.remaining - 1),
        },
      } satisfies ApiResponse<typeof result> & { usage: unknown },
      { status: 200, headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Pipeline search failed.';
    logger.error('pipeline_search_error', { error: message, stack: error instanceof Error ? error.stack : undefined });
    logApiResponse({
      route: '/api/analyze/pipeline',
      status: 500,
      durationMs: Math.round(performance.now() - routeStart),
    });
    return NextResponse.json({ success: false, error: message } satisfies ApiResponse<never>, { status: 500 });
  }
}
