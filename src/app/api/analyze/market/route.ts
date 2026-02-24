import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkUsage, recordUsage } from '@/lib/usage';
import { calculateMarketSizing } from '@/lib/analytics/market-sizing';
import { calculateDeviceMarketSizing, calculateCDxMarketSizing } from '@/lib/analytics/device-market-sizing';
import { calculateNutraceuticalMarketSizing } from '@/lib/analytics/nutraceutical-market-sizing';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger, withTiming, logApiRequest, logApiResponse } from '@/lib/logger';
import type { ApiResponse } from '@/types';

// ────────────────────────────────────────────────────────────
// REQUEST SCHEMA
// ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  input: z
    .object({
      // Pharma fields
      indication: z.string().trim().max(500).optional(),
      subtype: z.string().trim().max(500).optional(),
      mechanism: z.string().trim().max(500).optional(),
      molecular_target: z.string().trim().max(500).optional(),
      patient_segment: z.string().trim().max(500).optional(),
      pricing_assumption: z.enum(['conservative', 'base', 'premium']).optional(),
      development_stage: z.string().trim().max(200).optional(),

      // Device fields
      product_name: z.string().trim().max(500).optional(),
      device_category: z.string().trim().max(200).optional(),
      product_category: z.string().trim().max(200).optional(),
      procedure_or_condition: z.string().trim().max(500).optional(),
      target_setting: z.array(z.string().trim().max(200)).optional(),
      pricing_model: z.string().trim().max(200).optional(),
      unit_ase: z.number().optional(),
      disposables_per_procedure: z.number().optional(),
      disposable_ase: z.number().optional(),
      service_contract_annual: z.number().optional(),
      reimbursement_status: z.string().trim().max(200).optional(),
      physician_specialty: z.array(z.string().trim().max(200)).optional(),

      // CDx fields
      drug_name: z.string().trim().max(500).optional(),
      drug_indication: z.string().trim().max(500).optional(),
      biomarker: z.string().trim().max(500).optional(),
      biomarker_prevalence_pct: z.number().optional(),
      test_type: z.string().trim().max(200).optional(),
      test_setting: z.array(z.string().trim().max(200)).optional(),
      drug_development_stage: z.string().trim().max(200).optional(),
      cdx_development_stage: z.string().trim().max(200).optional(),
      test_ase: z.number().optional(),
      is_standalone: z.boolean().optional(),
      drug_partner: z.string().trim().max(500).optional(),

      // Shared fields
      geography: z.array(z.string().trim().max(100)).min(1, 'At least one geography is required.'),
      launch_year: z
        .number()
        .int()
        .min(2024, 'Launch year must be 2024 or later.')
        .max(2045, 'Launch year must be 2045 or earlier.'),
    })
    .passthrough(),

  product_category: z.string().trim().max(200).min(1, 'product_category is required.'),
  save: z.boolean().optional(),
  report_title: z.string().trim().max(500).optional(),
  demo: z.boolean().optional(),
});

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
// POST /api/analyze/market
// ────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────
// DEMO RATE LIMITING (in-memory, resets on cold start)
// ────────────────────────────────────────────────────────────

const demoRequests = new Map<string, number>();

function isDemoRateLimited(ip: string): boolean {
  const now = Date.now();
  const lastRequest = demoRequests.get(ip);
  if (lastRequest && now - lastRequest < 60_000) return true; // 1 per minute per IP
  demoRequests.set(ip, now);
  // Clean old entries every 100 requests
  if (demoRequests.size > 500) {
    demoRequests.forEach((time, key) => {
      if (now - time > 300_000) demoRequests.delete(key);
    });
  }
  return false;
}

export async function POST(request: NextRequest) {
  const routeStart = performance.now();
  try {
    // ── Check for demo mode (unauthenticated) ─────────────────
    const body = await request.json();
    const isDemo = body.demo === true;

    let user: { id: string } | null = null;

    if (isDemo) {
      // Rate limit demo requests by IP
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      if (isDemoRateLimited(ip)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Demo rate limit reached. Sign up for unlimited access.',
          } satisfies ApiResponse<never>,
          { status: 429 },
        );
      }
    } else {
      // ── Auth ──────────────────────────────────────────────────
      const supabase = createClient();
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return NextResponse.json({ success: false, error: 'Authentication required.' } satisfies ApiResponse<never>, {
          status: 401,
        });
      }
      user = authUser;

      // ── Rate limit authenticated users ────────────────────────
      const rl = await rateLimit(`market:${authUser.id}`, RATE_LIMITS.analysis_pro);
      if (!rl.success) {
        logApiResponse({
          route: '/api/analyze/market',
          status: 429,
          durationMs: Math.round(performance.now() - routeStart),
          userId: authUser.id,
        });
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Try again later.' } satisfies ApiResponse<never>,
          { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
        );
      }
    }

    logApiRequest({ route: '/api/analyze/market', method: 'POST', userId: user?.id, isDemo });

    // ── Usage limit check (skip for demo) ──────────────────────
    let usage: {
      monthlyCount: number;
      limit: number;
      remaining: number;
      allowed: boolean;
      feature: string;
      plan: string;
    } = { monthlyCount: 0, limit: 1, remaining: 1, allowed: true, feature: 'market_sizing', plan: 'demo' };

    if (!isDemo && user) {
      usage = await checkUsage(user.id, 'market_sizing');

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
    }

    // ── Validate with Zod ───────────────────────────────────
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message);
      return NextResponse.json(
        { success: false, error: messages.join('; '), errors: messages } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const { input, product_category } = parsed.data;

    // ── Additional validation by category ───────────────────
    if (isPharma(product_category)) {
      if (!input.indication) {
        return NextResponse.json(
          { success: false, error: 'indication is required for pharmaceutical analysis.' } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }
    } else if (isDevice(product_category)) {
      if (!input.procedure_or_condition) {
        return NextResponse.json(
          {
            success: false,
            error: 'procedure_or_condition is required for device analysis.',
          } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }
    } else if (isCDx(product_category)) {
      if (!input.drug_indication) {
        return NextResponse.json(
          { success: false, error: 'drug_indication is required for CDx analysis.' } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }
    } else if (isNutraceutical(product_category)) {
      if (!(input as Record<string, unknown>).primary_ingredient) {
        return NextResponse.json(
          {
            success: false,
            error: 'primary_ingredient is required for nutraceutical analysis.',
          } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }
    }

    // ── Route to the correct engine ─────────────────────────
    let result: unknown;
    const indication =
      input.indication ||
      input.drug_indication ||
      input.procedure_or_condition ||
      ((input as Record<string, unknown>).primary_ingredient as string) ||
      '';

    if (isPharma(product_category)) {
      const { result: r } = await withTiming(
        'market_sizing_pharma',
        () => calculateMarketSizing(input as Parameters<typeof calculateMarketSizing>[0]),
        { indication },
      );
      result = r;
    } else if (isDevice(product_category)) {
      const { result: r } = await withTiming(
        'market_sizing_device',
        () => calculateDeviceMarketSizing(input as Parameters<typeof calculateDeviceMarketSizing>[0]),
        { indication },
      );
      result = r;
    } else if (isCDx(product_category)) {
      const { result: r } = await withTiming(
        'market_sizing_cdx',
        () => calculateCDxMarketSizing(input as Parameters<typeof calculateCDxMarketSizing>[0]),
        { indication },
      );
      result = r;
    } else if (isNutraceutical(product_category)) {
      const { result: r } = await withTiming(
        'market_sizing_nutraceutical',
        () =>
          calculateNutraceuticalMarketSizing(
            input as unknown as Parameters<typeof calculateNutraceuticalMarketSizing>[0],
          ),
        { indication },
      );
      result = r;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Unknown product_category: "${product_category}". Supported categories: pharmaceutical, medical_device/device, companion_diagnostic/cdx, nutraceutical.`,
        } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    // ── Record usage (skip for demo) ─────────────────────────
    if (!isDemo && user) {
      await recordUsage(user.id, 'market_sizing', indication, { product_category });
    }

    // ── Auto-save report (skip for demo) ──────────────────────
    let reportId: string | undefined;
    if (!isDemo && user) {
      const supabase = createClient();
      const title = indication ? `${indication} Market Assessment` : 'Market Assessment';
      const { data: saved } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          title,
          report_type: 'market_sizing',
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
      route: '/api/analyze/market',
      status: 200,
      durationMs: Math.round(performance.now() - routeStart),
      userId: user?.id,
      product_category,
      indication,
    });
    return NextResponse.json(
      {
        success: true,
        data: result,
        report_id: reportId,
        usage: {
          feature: 'market_sizing',
          monthly_count: usage.monthlyCount + 1,
          limit: usage.limit,
          remaining: usage.remaining === -1 ? -1 : Math.max(0, usage.remaining - 1),
        },
      } satisfies ApiResponse<typeof result> & { usage: unknown; report_id?: string },
      { status: 200, headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Market analysis failed.';
    logger.error('market_analysis_error', { error: message, stack: error instanceof Error ? error.stack : undefined });
    logApiResponse({
      route: '/api/analyze/market',
      status: 500,
      durationMs: Math.round(performance.now() - routeStart),
    });
    return NextResponse.json({ success: false, error: message } satisfies ApiResponse<never>, { status: 500 });
  }
}
