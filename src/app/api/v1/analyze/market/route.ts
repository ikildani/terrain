import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateApiKey, hasScope } from '@/lib/api/api-key-auth';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { logActivity } from '@/lib/activity';
import { logger, withTiming, logApiRequest, logApiResponse } from '@/lib/logger';
import { parseBodyWithLimit, BodyTooLargeError } from '@/lib/api/parse-body';
import { captureApiError } from '@/lib/utils/sentry';
import { calculateMarketSizing } from '@/lib/analytics/market-sizing';
import { calculateDeviceMarketSizing, calculateCDxMarketSizing } from '@/lib/analytics/device-market-sizing';
import { calculateNutraceuticalMarketSizing } from '@/lib/analytics/nutraceutical-market-sizing';
import type { ApiResponse } from '@/types';

// ────────────────────────────────────────────────────────────
// REQUEST SCHEMA (same as main route)
// ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  input: z.object({
    indication: z.string().trim().max(500).optional(),
    subtype: z.string().trim().max(500).optional(),
    mechanism: z.string().trim().max(500).optional(),
    molecular_target: z.string().trim().max(500).optional(),
    patient_segment: z.string().trim().max(500).optional(),
    pricing_assumption: z.enum(['conservative', 'base', 'premium']).optional(),
    development_stage: z.string().trim().max(200).optional(),
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
    primary_ingredient: z.string().trim().max(500).optional(),
    health_focus: z.string().trim().max(500).optional(),
    nutraceutical_category: z.string().trim().max(200).optional(),
    target_demographic: z.string().trim().max(500).optional(),
    claim_type: z.string().trim().max(200).optional(),
    channels: z.array(z.string().trim().max(200)).optional(),
    unit_price: z.number().optional(),
    units_per_year_per_customer: z.number().optional(),
    cogs_pct: z.number().optional(),
    has_clinical_data: z.boolean().optional(),
    patent_protected: z.boolean().optional(),
    geography: z
      .array(
        z.enum([
          'US',
          'EU5',
          'Germany',
          'France',
          'Italy',
          'Spain',
          'UK',
          'Japan',
          'China',
          'Canada',
          'Australia',
          'RoW',
          'Global',
          'South Korea',
          'Brazil',
          'India',
          'Mexico',
          'Taiwan',
          'Saudi Arabia',
          'Israel',
        ]),
      )
      .min(1, 'At least one geography is required.'),
    launch_year: z
      .number()
      .int()
      .min(2024, 'Launch year must be 2024 or later.')
      .max(2045, 'Launch year must be 2045 or earlier.'),
  }),
  product_category: z.string().trim().max(200).min(1, 'product_category is required.'),
});

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function isPharma(c: string) {
  return c === 'pharmaceutical' || c.startsWith('pharma');
}
function isDevice(c: string) {
  return c.startsWith('medical_device') || c.startsWith('device');
}
function isCDx(c: string) {
  return c === 'companion_diagnostic' || c === 'cdx' || c === 'diagnostics_companion' || c === 'diagnostics_ivd';
}
function isNutraceutical(c: string) {
  return c === 'nutraceutical' || c.startsWith('nutra');
}

// ────────────────────────────────────────────────────────────
// POST /api/v1/analyze/market
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const routeStart = performance.now();
  const requestId = crypto.randomUUID();

  try {
    // ── API Key Auth ─────────────────────────────────────────
    const apiKeyCtx = await authenticateApiKey(request);
    if (!apiKeyCtx) {
      return NextResponse.json({ success: false, error: 'Invalid or missing API key.' } satisfies ApiResponse<never>, {
        status: 401,
        headers: { 'X-Request-Id': requestId },
      });
    }

    // ── Scope check ──────────────────────────────────────────
    if (!hasScope(apiKeyCtx, 'market_sizing')) {
      return NextResponse.json(
        { success: false, error: 'API key does not have the market_sizing scope.' } satisfies ApiResponse<never>,
        { status: 403, headers: { 'X-Request-Id': requestId } },
      );
    }

    // ── Rate limit (per-key RPM) ─────────────────────────────
    const rl = await rateLimit(`v1:${apiKeyCtx.keyId}`, {
      limit: apiKeyCtx.rateLimitRpm,
      windowMs: 60 * 1000,
    });
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfter), 'X-Request-Id': requestId },
      });
    }

    // ── Parse + validate ─────────────────────────────────────
    let body: unknown;
    try {
      body = await parseBodyWithLimit(request);
    } catch (err) {
      if (err instanceof BodyTooLargeError) {
        return NextResponse.json({ success: false, error: (err as Error).message } satisfies ApiResponse<never>, {
          status: 413,
          headers: { 'X-Request-Id': requestId },
        });
      }
      return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
        status: 400,
        headers: { 'X-Request-Id': requestId },
      });
    }

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message);
      return NextResponse.json(
        { success: false, error: messages.join('; '), errors: messages } satisfies ApiResponse<never>,
        { status: 400, headers: { 'X-Request-Id': requestId } },
      );
    }

    const { input, product_category } = parsed.data;

    logApiRequest({
      route: '/api/v1/analyze/market',
      method: 'POST',
      requestId,
    });

    // ── Route to engine ──────────────────────────────────────
    let result: unknown;
    const indication =
      input.indication ||
      input.drug_indication ||
      input.procedure_or_condition ||
      ((input as Record<string, unknown>).primary_ingredient as string) ||
      '';

    if (isPharma(product_category)) {
      const { result: r } = await withTiming(
        'v1_market_sizing_pharma',
        () => calculateMarketSizing(input as Parameters<typeof calculateMarketSizing>[0]),
        { indication },
      );
      result = r;
    } else if (isDevice(product_category)) {
      const { result: r } = await withTiming(
        'v1_market_sizing_device',
        () => calculateDeviceMarketSizing(input as Parameters<typeof calculateDeviceMarketSizing>[0]),
        { indication },
      );
      result = r;
    } else if (isCDx(product_category)) {
      const { result: r } = await withTiming(
        'v1_market_sizing_cdx',
        () => calculateCDxMarketSizing(input as Parameters<typeof calculateCDxMarketSizing>[0]),
        { indication },
      );
      result = r;
    } else if (isNutraceutical(product_category)) {
      const { result: r } = await withTiming(
        'v1_market_sizing_nutra',
        () => calculateNutraceuticalMarketSizing(input as Parameters<typeof calculateNutraceuticalMarketSizing>[0]),
        { indication },
      );
      result = r;
    } else {
      return NextResponse.json(
        { success: false, error: `Unsupported product category: ${product_category}` } satisfies ApiResponse<never>,
        { status: 400, headers: { 'X-Request-Id': requestId } },
      );
    }

    // ── Audit + activity ─────────────────────────────────────
    logAudit({
      workspaceId: apiKeyCtx.workspaceId,
      userId: apiKeyCtx.keyId,
      action: 'api_key_created', // reuse existing audit action
      resourceType: 'analysis',
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      metadata: { feature: 'market_sizing', indication, via: 'v1_api' },
    });

    logActivity({
      workspaceId: apiKeyCtx.workspaceId,
      userId: apiKeyCtx.keyId,
      action: 'analysis_run',
      resourceType: 'report',
      metadata: { feature: 'market_sizing', indication, via: 'v1_api' },
    });

    // ── Success ──────────────────────────────────────────────
    logApiResponse({
      route: '/api/v1/analyze/market',
      status: 200,
      durationMs: Math.round(performance.now() - routeStart),
      requestId,
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: { 'Cache-Control': 'private, no-store', 'X-Request-Id': requestId } },
    );
  } catch (error) {
    captureApiError(error, { route: '/api/v1/analyze/market', requestId });
    logger.error('v1_market_analysis_error', {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });
    logApiResponse({
      route: '/api/v1/analyze/market',
      status: 500,
      durationMs: Math.round(performance.now() - routeStart),
      requestId,
    });
    return NextResponse.json(
      { success: false, error: 'Market analysis failed. Please try again.' } satisfies ApiResponse<never>,
      { status: 500, headers: { 'X-Request-Id': requestId } },
    );
  }
}
