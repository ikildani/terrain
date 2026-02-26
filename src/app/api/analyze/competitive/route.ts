import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkUsage, recordUsage } from '@/lib/usage';
import { analyzeCompetitiveLandscape } from '@/lib/analytics/competitive';
import { analyzeDeviceCompetitiveLandscape } from '@/lib/analytics/device-competitive';
import { analyzeCDxCompetitiveLandscape } from '@/lib/analytics/cdx-competitive';
import { analyzeNutraceuticalCompetitiveLandscape } from '@/lib/analytics/nutraceutical-competitive';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger, withTiming, logApiRequest, logApiResponse } from '@/lib/logger';
import { sanitizePostgrestValue } from '@/lib/utils/sanitize';
import type { ApiResponse } from '@/types';
import type { DeviceCategory, CDxPlatform, NutraceuticalCategory } from '@/types/devices-diagnostics';

// ────────────────────────────────────────────────────────────
// CATEGORY ROUTING HELPERS
// ────────────────────────────────────────────────────────────

function isPharma(category: string): boolean {
  return category === 'pharmaceutical' || category.startsWith('pharma');
}

function isDevice(category: string): boolean {
  return category.startsWith('medical_device') || category.startsWith('device');
}

function isCDx(category: string): boolean {
  return (
    category === 'companion_diagnostic' ||
    category === 'cdx' ||
    category === 'diagnostics_companion' ||
    category === 'diagnostics_ivd'
  );
}

function isNutraceutical(category: string): boolean {
  return category === 'nutraceutical' || category.startsWith('nutra');
}

// ────────────────────────────────────────────────────────────
// REQUEST SCHEMA
// ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  input: z.object({
    // Pharma fields
    indication: z.string().optional(),
    mechanism: z.string().optional(),

    // Device fields
    procedure_or_condition: z.string().optional(),
    device_category: z.string().optional(),
    technology_type: z.string().optional(),

    // CDx fields
    biomarker: z.string().optional(),
    test_type: z.string().optional(),
    linked_drug: z.string().optional(),

    // Nutraceutical fields
    primary_ingredient: z.string().optional(),
    health_focus: z.string().optional(),
    ingredient_category: z.string().optional(),
  }),

  product_category: z.string().default('pharmaceutical'),
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
    const rl = await rateLimit(`competitive:${user.id}`, rlConfig);
    if (!rl.success) {
      logApiResponse({
        route: '/api/analyze/competitive',
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

    const { input, product_category, save } = parsed.data;

    // ── Category-specific validation ──────────────────────────
    if (isPharma(product_category)) {
      if (!input.indication) {
        return NextResponse.json(
          {
            success: false,
            error: 'Indication is required for pharmaceutical competitive analysis.',
          } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }
    } else if (isDevice(product_category)) {
      if (!input.procedure_or_condition) {
        return NextResponse.json(
          {
            success: false,
            error: 'Procedure or condition is required for device competitive analysis.',
          } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }
    } else if (isCDx(product_category)) {
      if (!input.biomarker) {
        return NextResponse.json(
          { success: false, error: 'Biomarker is required for CDx competitive analysis.' } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }
    } else if (isNutraceutical(product_category)) {
      if (!input.primary_ingredient) {
        return NextResponse.json(
          {
            success: false,
            error: 'Primary ingredient is required for nutraceutical competitive analysis.',
          } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Unknown product_category: "${product_category}". Supported: pharmaceutical, medical_device/device, companion_diagnostic/cdx, nutraceutical.`,
        } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const indication =
      input.indication || input.procedure_or_condition || input.biomarker || input.primary_ingredient || '';
    logApiRequest({ route: '/api/analyze/competitive', method: 'POST', userId: user.id, indication });

    // ── Route to correct engine ─────────────────────────────
    let result: unknown;

    if (isPharma(product_category)) {
      const engineResult = await withTiming(
        'competitive_analysis_pharma',
        () => analyzeCompetitiveLandscape({ indication: input.indication!, mechanism: input.mechanism }),
        { indication: input.indication },
      );
      result = engineResult.result;
    } else if (isDevice(product_category)) {
      const engineResult = await withTiming(
        'competitive_analysis_device',
        async () =>
          analyzeDeviceCompetitiveLandscape({
            procedure_or_condition: input.procedure_or_condition!,
            device_category: input.device_category as DeviceCategory | undefined,
            technology_type: input.technology_type,
          }),
        { procedure: input.procedure_or_condition },
      );
      result = engineResult.result;
    } else if (isCDx(product_category)) {
      const engineResult = await withTiming(
        'competitive_analysis_cdx',
        async () =>
          analyzeCDxCompetitiveLandscape({
            biomarker: input.biomarker!,
            indication: input.indication,
            test_type: input.test_type as CDxPlatform | undefined,
            linked_drug: input.linked_drug,
          }),
        { biomarker: input.biomarker },
      );
      result = engineResult.result;
    } else if (isNutraceutical(product_category)) {
      const engineResult = await withTiming(
        'competitive_analysis_nutra',
        async () =>
          analyzeNutraceuticalCompetitiveLandscape({
            primary_ingredient: input.primary_ingredient!,
            health_focus: input.health_focus,
            ingredient_category: input.ingredient_category as NutraceuticalCategory | undefined,
          }),
        { ingredient: input.primary_ingredient },
      );
      result = engineResult.result;
    }

    // ── Fetch live pipeline & FDA data from Supabase caches ──
    let live_pipeline: unknown[] = [];
    let recent_fda_activity: unknown[] = [];

    try {
      const searchTerm = sanitizePostgrestValue(indication.trim());

      if (searchTerm) {
        // Query clinical_trials_cache for trials matching the indication
        const { data: trialsData, error: trialsError } = await supabase
          .from('clinical_trials_cache')
          .select('nct_id, title, status, phase, sponsor, enrollment, conditions, interventions, last_update_posted')
          .or(`conditions.cs.{${searchTerm}},title.ilike.%${searchTerm}%`)
          .limit(20)
          .order('last_update_posted', { ascending: false });

        if (trialsError) {
          logger.warn('competitive_live_pipeline_query_failed', {
            error: trialsError.message,
            indication: searchTerm,
          });
        } else {
          live_pipeline = trialsData || [];
        }

        // Query fda_approvals_cache for recent FDA activity
        const { data: fdaData, error: fdaError } = await supabase
          .from('fda_approvals_cache')
          .select('*')
          .or(`brand_name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%`)
          .limit(10);

        if (fdaError) {
          logger.warn('competitive_fda_activity_query_failed', {
            error: fdaError.message,
            indication: searchTerm,
          });
        } else {
          recent_fda_activity = fdaData || [];
        }
      }
    } catch (liveDataError) {
      logger.warn('competitive_live_data_fetch_failed', {
        error: liveDataError instanceof Error ? liveDataError.message : 'Unknown error',
        indication,
      });
      // Continue with static data only — live data is supplementary
    }

    // ── Record usage ────────────────────────────────────────
    await recordUsage(user.id, 'competitive', indication, { product_category });

    // ── Save report (respect save parameter) ──────────────────
    let reportId: string | undefined;
    if (save !== false) {
      const title = indication ? `${indication} Competitive Landscape` : 'Competitive Landscape';
      const { data: saved } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          title,
          report_type: 'competitive',
          indication: indication || 'N/A',
          inputs: input,
          outputs: result as Record<string, unknown>,
          status: 'final',
          is_starred: false,
          tags: [product_category],
        })
        .select('id')
        .single();
      if (saved) reportId = saved.id;
    }

    // ── Success ─────────────────────────────────────────────
    logApiResponse({
      route: '/api/analyze/competitive',
      status: 200,
      durationMs: Math.round(performance.now() - routeStart),
      userId: user.id,
      indication,
    });
    return NextResponse.json(
      {
        success: true,
        data: result,
        live_pipeline,
        recent_fda_activity,
        report_id: reportId,
        product_category,
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
    const message = error instanceof Error ? error.message : 'Competitive analysis failed.';
    logger.error('competitive_analysis_error', {
      error: message,
      stack: error instanceof Error ? error.stack : undefined,
    });
    logApiResponse({
      route: '/api/analyze/competitive',
      status: 500,
      durationMs: Math.round(performance.now() - routeStart),
    });
    return NextResponse.json(
      { success: false, error: 'Competitive analysis failed. Please try again.' } satisfies ApiResponse<never>,
      { status: 500 },
    );
  }
}
