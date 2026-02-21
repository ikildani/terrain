import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkUsage, recordUsage } from '@/lib/usage';
import { analyzePartners } from '@/lib/analytics/partners';
import type { ApiResponse, PartnerDiscoveryOutput } from '@/types';

// ────────────────────────────────────────────────────────────
// REQUEST SCHEMA
// ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  input: z.object({
    asset_description: z.string().optional().default(''),
    indication: z.string().min(1, 'Indication is required.'),
    mechanism: z.string().optional(),
    development_stage: z.enum(['preclinical', 'phase1', 'phase2', 'phase3', 'approved'], {
      errorMap: () => ({ message: 'Valid development stage is required.' }),
    }),
    geography_rights: z
      .array(z.string())
      .min(1, 'At least one geography is required.'),
    deal_types: z
      .array(z.enum(['licensing', 'co-development', 'acquisition', 'co-promotion']))
      .min(1, 'At least one deal type is required.'),
    exclude_companies: z.array(z.string()).optional(),
    minimum_match_score: z.number().min(0).max(100).optional(),
  }),
  save: z.boolean().optional(),
  report_title: z.string().optional(),
});

// ────────────────────────────────────────────────────────────
// POST /api/analyze/partners
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
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

    // ── Usage limit check ─────────────────────────────────────
    const usage = await checkUsage(user.id, 'partners');

    if (!usage.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Partner Discovery requires a Pro plan. ${usage.limit === 0 ? 'Upgrade to Pro to access this feature.' : `Monthly limit reached (${usage.limit} analyses on ${usage.plan} plan).`}`,
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

    // ── Run partner matching engine ───────────────────────────
    const result = await analyzePartners(parsed.data.input);

    // ── Record usage ──────────────────────────────────────────
    await recordUsage(user.id, 'partners', parsed.data.input.indication, {
      mechanism: parsed.data.input.mechanism,
      development_stage: parsed.data.input.development_stage,
      deal_types: parsed.data.input.deal_types,
      geography_rights: parsed.data.input.geography_rights,
    });

    // ── Success ───────────────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        data: result,
        usage: {
          feature: 'partners',
          monthly_count: usage.monthlyCount + 1,
          limit: usage.limit,
          remaining: usage.remaining === -1 ? -1 : Math.max(0, usage.remaining - 1),
        },
      } satisfies ApiResponse<PartnerDiscoveryOutput> & { usage: unknown },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Partner analysis failed.';
    return NextResponse.json(
      { success: false, error: message } satisfies ApiResponse<never>,
      { status: 500 },
    );
  }
}
