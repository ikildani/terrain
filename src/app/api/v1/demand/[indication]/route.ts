import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey, hasScope } from '@/lib/api/api-key-auth';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { logActivity } from '@/lib/activity';
import { logger, withTiming, logApiRequest, logApiResponse } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import { getDemandProfileCached, UnknownTerritoryError, DEMAND_PROFILE_TTL_MS } from '@/lib/demand/demand-layer';
import { getSuggestionsFor, getUnmappedRecord, solidusKeyForTerrainName } from '@/lib/demand/indication-registry';
import type { ApiResponse } from '@/types';

type RouteContext = { params: Promise<{ indication: string }> };

const ROUTE = '/api/v1/demand/[indication]';
const CACHE_SECONDS = Math.floor(DEMAND_PROFILE_TTL_MS / 1000);

// ────────────────────────────────────────────────────────────
// GET /api/v1/demand/:indication?territory=US&asOf=2026-09-25
// Demand profile for a Solidus slug, Terrain name or synonym.
// ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest, context: RouteContext) {
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
    if (!hasScope(apiKeyCtx, 'demand')) {
      return NextResponse.json(
        { success: false, error: 'API key does not have the demand scope.' } satisfies ApiResponse<never>,
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

    // ── Params + query ───────────────────────────────────────
    const { indication: rawIndication } = await context.params;
    const indication = decodeURIComponent(rawIndication ?? '')
      .trim()
      .slice(0, 200);
    if (!indication) {
      return NextResponse.json({ success: false, error: 'Indication is required.' } satisfies ApiResponse<never>, {
        status: 400,
        headers: { 'X-Request-Id': requestId },
      });
    }

    const { searchParams } = new URL(request.url);
    const territory = searchParams.get('territory')?.trim().slice(0, 50) || undefined;
    const asOfRaw = searchParams.get('asOf')?.trim() || undefined;
    if (asOfRaw && !/^\d{4}-\d{2}-\d{2}$/.test(asOfRaw)) {
      return NextResponse.json(
        { success: false, error: 'asOf must be an ISO date (YYYY-MM-DD).' } satisfies ApiResponse<never>,
        { status: 400, headers: { 'X-Request-Id': requestId } },
      );
    }

    logApiRequest({ route: ROUTE, method: 'GET', requestId });

    // ── Build profile ────────────────────────────────────────
    let outcome: Awaited<ReturnType<typeof getDemandProfileCached>>;
    try {
      const { result } = await withTiming(
        'v1_demand_profile',
        () => getDemandProfileCached(indication, { territory, asOf: asOfRaw }),
        { indication, territory: territory ?? 'US' },
      );
      outcome = result;
    } catch (err) {
      if (err instanceof UnknownTerritoryError) {
        return NextResponse.json(
          {
            success: false,
            error: `${err.message} Supported: ${err.supported.join(', ')}.`,
            errors: err.supported,
          } satisfies ApiResponse<never>,
          { status: 400, headers: { 'X-Request-Id': requestId } },
        );
      }
      throw err;
    }

    // ── 404 with nearest suggestions ─────────────────────────
    if (!outcome) {
      const unmapped = getUnmappedRecord(indication);
      const suggestions = getSuggestionsFor(indication, 3).map((s) => ({
        terrainName: s.name,
        solidusKey: solidusKeyForTerrainName(s.name) ?? null,
        therapyArea: s.therapy_area,
      }));
      const reason = unmapped
        ? `Solidus key "${unmapped.solidusKey}" has no Terrain counterpart: ${unmapped.reason}`
        : `Indication not found: "${indication}".`;
      logApiResponse({ route: ROUTE, status: 404, durationMs: Math.round(performance.now() - routeStart), requestId });
      return NextResponse.json(
        { success: false, error: reason, suggestions },
        { status: 404, headers: { 'X-Request-Id': requestId, 'Cache-Control': 'private, no-store' } },
      );
    }

    // ── Audit + activity ─────────────────────────────────────
    logAudit({
      workspaceId: apiKeyCtx.workspaceId,
      userId: apiKeyCtx.keyId,
      action: 'api_key_created', // reuse existing audit action (mirrors /api/v1/analyze/*)
      resourceType: 'analysis',
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      metadata: {
        feature: 'demand',
        indication: outcome.profile.identity.terrainName,
        territory: territory ?? 'US',
        via: 'v1_api',
      },
    });

    logActivity({
      workspaceId: apiKeyCtx.workspaceId,
      userId: apiKeyCtx.keyId,
      action: 'analysis_run',
      resourceType: 'report',
      metadata: {
        feature: 'demand',
        indication: outcome.profile.identity.terrainName,
        territory: territory ?? 'US',
        via: 'v1_api',
      },
    });

    // ── Success ──────────────────────────────────────────────
    logApiResponse({ route: ROUTE, status: 200, durationMs: Math.round(performance.now() - routeStart), requestId });

    return NextResponse.json(
      { success: true, data: outcome.profile },
      {
        status: 200,
        headers: {
          'Cache-Control': `private, max-age=${CACHE_SECONDS}`,
          'X-Cache': outcome.cacheHit ? 'HIT' : 'MISS',
          'X-Request-Id': requestId,
        },
      },
    );
  } catch (error) {
    captureApiError(error, { route: ROUTE, requestId });
    logger.error('v1_demand_profile_error', {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });
    logApiResponse({ route: ROUTE, status: 500, durationMs: Math.round(performance.now() - routeStart), requestId });
    return NextResponse.json(
      { success: false, error: 'Demand profile failed. Please try again.' } satisfies ApiResponse<never>,
      { status: 500, headers: { 'X-Request-Id': requestId } },
    );
  }
}
