import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateApiKey, hasScope } from '@/lib/api/api-key-auth';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { logActivity } from '@/lib/activity';
import { logger, withTiming, logApiRequest, logApiResponse } from '@/lib/logger';
import { parseBodyWithLimit, BodyTooLargeError } from '@/lib/api/parse-body';
import { captureApiError } from '@/lib/utils/sentry';
import { analyzeCompetitiveLandscape } from '@/lib/analytics/competitive';
import { analyzeDeviceCompetitiveLandscape } from '@/lib/analytics/device-competitive';
import { analyzeCDxCompetitiveLandscape } from '@/lib/analytics/cdx-competitive';
import { analyzeNutraceuticalCompetitiveLandscape } from '@/lib/analytics/nutraceutical-competitive';
import type { ApiResponse } from '@/types';

// ────────────────────────────────────────────────────────────
// REQUEST SCHEMA
// ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  input: z.object({
    indication: z.string().trim().max(500).optional(),
    mechanism: z.string().trim().max(500).optional(),
    subtype: z.string().trim().max(500).optional(),
    development_stage: z.string().trim().max(200).optional(),
    geography: z.array(z.string().trim().max(50)).min(1, 'At least one geography is required.').optional(),
    // Device fields
    device_category: z.string().trim().max(200).optional(),
    procedure_or_condition: z.string().trim().max(500).optional(),
    // CDx fields
    drug_indication: z.string().trim().max(500).optional(),
    biomarker: z.string().trim().max(500).optional(),
    test_type: z.string().trim().max(200).optional(),
    cdx_platform: z.string().trim().max(200).optional(),
    // Nutraceutical fields
    primary_ingredient: z.string().trim().max(500).optional(),
    health_focus: z.string().trim().max(500).optional(),
    nutraceutical_category: z.string().trim().max(200).optional(),
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
// POST /api/v1/analyze/competitive
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
    if (!hasScope(apiKeyCtx, 'competitive')) {
      return NextResponse.json(
        { success: false, error: 'API key does not have the competitive scope.' } satisfies ApiResponse<never>,
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
      route: '/api/v1/analyze/competitive',
      method: 'POST',
      requestId,
    });

    // ── Route to engine ──────────────────────────────────────
    let result: unknown;
    const indication =
      input.indication || input.drug_indication || input.procedure_or_condition || input.primary_ingredient || '';

    if (isPharma(product_category)) {
      const { result: r } = await withTiming(
        'v1_competitive_pharma',
        () => analyzeCompetitiveLandscape(input as Parameters<typeof analyzeCompetitiveLandscape>[0]),
        { indication },
      );
      result = r;
    } else if (isDevice(product_category)) {
      const { result: r } = await withTiming(
        'v1_competitive_device',
        () => analyzeDeviceCompetitiveLandscape(input as Parameters<typeof analyzeDeviceCompetitiveLandscape>[0]),
        { indication },
      );
      result = r;
    } else if (isCDx(product_category)) {
      const { result: r } = await withTiming(
        'v1_competitive_cdx',
        () => analyzeCDxCompetitiveLandscape(input as Parameters<typeof analyzeCDxCompetitiveLandscape>[0]),
        { indication },
      );
      result = r;
    } else if (isNutraceutical(product_category)) {
      const { result: r } = await withTiming(
        'v1_competitive_nutra',
        () =>
          analyzeNutraceuticalCompetitiveLandscape(
            input as Parameters<typeof analyzeNutraceuticalCompetitiveLandscape>[0],
          ),
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
      action: 'api_key_created',
      resourceType: 'analysis',
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      metadata: { feature: 'competitive', indication, via: 'v1_api' },
    });

    logActivity({
      workspaceId: apiKeyCtx.workspaceId,
      userId: apiKeyCtx.keyId,
      action: 'analysis_run',
      resourceType: 'report',
      metadata: { feature: 'competitive', indication, via: 'v1_api' },
    });

    logApiResponse({
      route: '/api/v1/analyze/competitive',
      status: 200,
      durationMs: Math.round(performance.now() - routeStart),
      requestId,
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: { 'Cache-Control': 'private, no-store', 'X-Request-Id': requestId } },
    );
  } catch (error) {
    captureApiError(error, { route: '/api/v1/analyze/competitive', requestId });
    logger.error('v1_competitive_analysis_error', {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });
    logApiResponse({
      route: '/api/v1/analyze/competitive',
      status: 500,
      durationMs: Math.round(performance.now() - routeStart),
      requestId,
    });
    return NextResponse.json(
      { success: false, error: 'Competitive analysis failed. Please try again.' } satisfies ApiResponse<never>,
      { status: 500, headers: { 'X-Request-Id': requestId } },
    );
  }
}
