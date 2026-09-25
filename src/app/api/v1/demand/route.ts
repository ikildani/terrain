import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey, hasScope } from '@/lib/api/api-key-auth';
import { rateLimit } from '@/lib/rate-limit';
import { logger, logApiRequest, logApiResponse } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import { INDICATION_DATA } from '@/lib/data/indication-map';
import { listMapped, listUnmapped, MAPPING_COVERAGE } from '@/lib/demand/indication-registry';
import { supportedTerritories } from '@/lib/demand/demand-layer';
import type { ApiResponse } from '@/types';

const ROUTE = '/api/v1/demand';
const CACHE_SECONDS = 24 * 60 * 60;

export interface DemandIndicationListItem {
  /** Canonical Solidus slug; null when Solidus has no key for this Terrain indication. */
  solidusKey: string | null;
  /** Every Solidus key (canonical + registry aliases) that resolves to this indication. */
  solidusAliases: string[];
  terrainName: string;
  therapyArea: string;
  /** `exact` | `proxy` for the canonical key; null when unmapped. */
  match: 'exact' | 'proxy' | null;
  note?: string;
}

export interface DemandIndicationList {
  contractVersion: '1.0';
  coverage: typeof MAPPING_COVERAGE;
  territories: string[];
  indications: DemandIndicationListItem[];
  /** Solidus keys with no Terrain counterpart, with the reason. */
  unmappedSolidusKeys: ReturnType<typeof listUnmapped>;
}

let listCache: { expiresAt: number; body: DemandIndicationList } | null = null;

function buildList(): DemandIndicationList {
  if (listCache && listCache.expiresAt > Date.now()) return listCache.body;

  const mapped = listMapped();
  const byTerrain = new Map<string, typeof mapped>();
  for (const m of mapped) {
    const list = byTerrain.get(m.terrainName) ?? [];
    list.push(m);
    byTerrain.set(m.terrainName, list);
  }

  const indications: DemandIndicationListItem[] = INDICATION_DATA.map((ind) => {
    const keys = byTerrain.get(ind.name) ?? [];
    const canonical = keys.find((k) => !k.alias) ?? keys[0];
    return {
      solidusKey: canonical?.solidusKey ?? null,
      solidusAliases: keys.map((k) => k.solidusKey),
      terrainName: ind.name,
      therapyArea: ind.therapy_area,
      match: canonical?.match ?? null,
      ...(canonical?.note ? { note: canonical.note } : {}),
    };
  }).sort((a, b) => a.therapyArea.localeCompare(b.therapyArea) || a.terrainName.localeCompare(b.terrainName));

  const body: DemandIndicationList = {
    contractVersion: '1.0',
    coverage: MAPPING_COVERAGE,
    territories: supportedTerritories(),
    indications,
    unmappedSolidusKeys: listUnmapped(),
  };
  listCache = { expiresAt: Date.now() + CACHE_SECONDS * 1000, body };
  return body;
}

// ────────────────────────────────────────────────────────────
// GET /api/v1/demand — supported indications with both keys
// ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
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

    logApiRequest({ route: ROUTE, method: 'GET', requestId });

    const { searchParams } = new URL(request.url);
    const therapyArea = searchParams.get('therapy_area')?.trim().toLowerCase() || undefined;
    const mappedOnly = searchParams.get('mapped') === 'true';

    const full = buildList();
    const indications = full.indications.filter(
      (i) => (!therapyArea || i.therapyArea === therapyArea) && (!mappedOnly || i.solidusKey !== null),
    );

    logApiResponse({ route: ROUTE, status: 200, durationMs: Math.round(performance.now() - routeStart), requestId });

    return NextResponse.json(
      { success: true, data: { ...full, indications, count: indications.length } },
      {
        status: 200,
        headers: { 'Cache-Control': `private, max-age=${CACHE_SECONDS}`, 'X-Request-Id': requestId },
      },
    );
  } catch (error) {
    captureApiError(error, { route: ROUTE, action: 'list', requestId });
    logger.error('v1_demand_list_error', {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });
    logApiResponse({ route: ROUTE, status: 500, durationMs: Math.round(performance.now() - routeStart), requestId });
    return NextResponse.json(
      { success: false, error: 'Failed to list demand indications.' } satisfies ApiResponse<never>,
      { status: 500, headers: { 'X-Request-Id': requestId } },
    );
  }
}
