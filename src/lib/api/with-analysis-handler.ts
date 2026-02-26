/**
 * Shared middleware for analysis API routes.
 * Handles: auth → rate limit → usage check → body parse → Zod validate → engine → record usage → respond.
 * Eliminates ~60 lines of boilerplate per route.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/server';
import { checkUsage, recordUsage } from '@/lib/usage';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger, withTiming, logApiRequest, logApiResponse, logBusinessEvent } from '@/lib/logger';
import { redis } from '@/lib/redis';
import type { ApiResponse } from '@/types';
import type { FeatureKey } from '@/lib/subscription';

const CACHE_TTL_SECONDS = 900; // 15 minutes

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

/** Feature-to-report-type mapping for auto-save */
const FEATURE_REPORT_TYPE: Record<string, string> = {
  market_sizing: 'market_sizing',
  competitive: 'competitive',
  partners: 'partners',
  regulatory: 'regulatory',
};

/** Feature-to-title-suffix mapping for auto-save */
const FEATURE_TITLE_SUFFIX: Record<string, string> = {
  market_sizing: 'Market Assessment',
  competitive: 'Competitive Landscape',
  partners: 'Partner Discovery',
  regulatory: 'Regulatory Analysis',
};

interface AnalysisHandlerConfig<TBody, TResult> {
  /** Feature key for usage tracking (e.g., 'market_sizing', 'competitive') */
  feature: FeatureKey;
  /** Route path for logging (e.g., '/api/analyze/market') */
  route: string;
  /** Rate limit key prefix (e.g., 'market', 'competitive') */
  rateKey: string;
  /** Zod schema to validate the request body */
  schema: z.ZodType<TBody>;
  /** Extract an indication string for logging/usage tracking */
  extractIndication: (body: TBody) => string;
  /** The analysis handler that receives validated input + user ID */
  handler: (body: TBody, userId: string) => Promise<TResult> | TResult;
  /** Optional: extra metadata to store with usage event */
  extractUsageMeta?: (body: TBody) => Record<string, unknown>;
  /** withTiming label for performance logging */
  timingLabel: string;
}

// ────────────────────────────────────────────────────────────
// FACTORY
// ────────────────────────────────────────────────────────────

/**
 * Creates a POST handler for an analysis route with all shared middleware baked in.
 *
 * Usage:
 * ```ts
 * export const POST = withAnalysisHandler({ ... });
 * ```
 */
export function withAnalysisHandler<TBody, TResult>(config: AnalysisHandlerConfig<TBody, TResult>) {
  return async function POST(request: NextRequest): Promise<NextResponse> {
    const routeStart = performance.now();
    const requestId = crypto.randomUUID();

    try {
      // ── Auth ──────────────────────────────────────────────
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ success: false, error: 'Authentication required.' } satisfies ApiResponse<never>, {
          status: 401,
          headers: { 'X-Request-Id': requestId },
        });
      }

      // ── Sentry enrichment ──────────────────────────────────
      Sentry.setUser({ id: user.id });

      // ── Rate limit (plan-aware) ──────────────────────────
      const { data: subForRl } = await supabase.from('subscriptions').select('plan').eq('user_id', user.id).single();
      const userPlan = (subForRl?.plan as string) || 'free';
      const rlConfig =
        userPlan === 'team'
          ? RATE_LIMITS.analysis_team
          : userPlan === 'pro'
            ? RATE_LIMITS.analysis_pro
            : RATE_LIMITS.analysis_free;
      const rl = await rateLimit(`${config.rateKey}:${user.id}`, rlConfig);
      if (!rl.success) {
        logApiResponse({
          route: config.route,
          status: 429,
          durationMs: Math.round(performance.now() - routeStart),
          userId: user.id,
        });
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Try again later.' } satisfies ApiResponse<never>,
          { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
        );
      }

      // ── Usage limit check ─────────────────────────────────
      const usage = await checkUsage(user.id, config.feature);

      Sentry.setTag('plan', usage.plan);
      Sentry.setTag('feature', config.feature);

      if (!usage.allowed) {
        return NextResponse.json(
          {
            success: false,
            error:
              usage.limit === 0
                ? `This feature requires a Pro plan. Upgrade to access ${config.feature}.`
                : `Monthly limit reached (${usage.limit} analyses on ${usage.plan} plan). Upgrade to Pro for unlimited access.`,
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

      // ── Parse + validate ──────────────────────────────────
      const body = await request.json();
      const parsed = config.schema.safeParse(body);

      if (!parsed.success) {
        const messages = parsed.error.issues.map((i) => i.message);
        return NextResponse.json(
          { success: false, error: messages.join('; '), errors: messages } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }

      const validatedBody = parsed.data;

      // Guard against oversized payloads stored in reports table
      const inputSize = Buffer.byteLength(JSON.stringify(validatedBody));
      if (inputSize > 100_000) {
        return NextResponse.json(
          { success: false, error: 'Input payload too large (max 100KB).' } satisfies ApiResponse<never>,
          { status: 413 },
        );
      }

      const indication = config.extractIndication(validatedBody);

      Sentry.setContext('analysis', { feature: config.feature, indication });

      logApiRequest({
        route: config.route,
        method: 'POST',
        userId: user.id,
        indication,
        requestId,
      });

      // ── Check cache ──────────────────────────────────────
      const cacheKey = redis ? `analysis:${config.feature}:${stableHash(validatedBody)}` : null;
      let result: TResult | undefined;
      let cacheHit = false;

      if (cacheKey && redis) {
        try {
          const cached = await redis.get<TResult>(cacheKey);
          if (cached) {
            result = cached;
            cacheHit = true;
            logger.info(`${config.timingLabel}_cache_hit`, { indication });
          }
        } catch (cacheErr) {
          logger.warn(`${config.timingLabel}_cache_read_error`, {
            error: cacheErr instanceof Error ? cacheErr.message : String(cacheErr),
            indication,
          });
        }
      }

      // ── Run engine (if cache miss) ────────────────────────
      if (!result) {
        const timed = await withTiming(config.timingLabel, async () => config.handler(validatedBody, user.id), {
          indication,
        });
        result = timed.result;

        // Store in cache (fire and forget)
        if (cacheKey && redis && result) {
          redis.set(cacheKey, result, { ex: CACHE_TTL_SECONDS }).catch((cacheErr) => {
            logger.warn(`${config.timingLabel}_cache_write_error`, {
              error: cacheErr instanceof Error ? cacheErr.message : String(cacheErr),
            });
          });
        }
      }

      // ── Record usage ──────────────────────────────────────
      const usageMeta = config.extractUsageMeta?.(validatedBody) ?? {};
      await recordUsage(user.id, config.feature, indication, usageMeta);

      // ── Save report (only when explicitly requested) ───
      let reportId: string | undefined;
      if (body.save === true) {
        const reportType = FEATURE_REPORT_TYPE[config.feature] ?? config.feature;
        const titleSuffix = FEATURE_TITLE_SUFFIX[config.feature] ?? 'Analysis';
        const title = indication ? `${indication} ${titleSuffix}` : titleSuffix;
        const { data: saved } = await supabase
          .from('reports')
          .insert({
            user_id: user.id,
            title,
            report_type: reportType,
            indication: indication || 'N/A',
            inputs: validatedBody as Record<string, unknown>,
            outputs: result as Record<string, unknown>,
            status: 'final',
            is_starred: false,
          })
          .select('id')
          .single();
        if (saved) reportId = saved.id;
      }

      // ── Success ───────────────────────────────────────────
      logBusinessEvent('analysis_completed', { userId: user.id, feature: config.feature });
      logApiResponse({
        route: config.route,
        status: 200,
        durationMs: Math.round(performance.now() - routeStart),
        userId: user.id,
        indication,
        cacheHit,
      });

      return NextResponse.json(
        {
          success: true,
          data: result,
          report_id: reportId,
          usage: {
            feature: config.feature,
            monthly_count: usage.monthlyCount + 1,
            limit: usage.limit,
            remaining: usage.remaining === -1 ? -1 : Math.max(0, usage.remaining - 1),
          },
        },
        { status: 200, headers: { 'Cache-Control': 'private, no-store', 'X-Request-Id': requestId } },
      );
    } catch (error: unknown) {
      const message = `${config.feature} analysis failed. Please try again.`;
      logger.error(`${config.rateKey}_analysis_error`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        requestId,
      });
      logApiResponse({
        route: config.route,
        status: 500,
        durationMs: Math.round(performance.now() - routeStart),
        requestId,
      });
      return NextResponse.json({ success: false, error: message } satisfies ApiResponse<never>, {
        status: 500,
        headers: { 'X-Request-Id': requestId },
      });
    }
  };
}

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

/**
 * Produce a stable, deterministic hash of a JSON-serialisable object.
 * Used for cache keys — same input always produces the same key.
 */
function stableHash(obj: unknown): string {
  const keys = obj && typeof obj === 'object' && !Array.isArray(obj) ? Object.keys(obj).sort() : undefined;
  const str = JSON.stringify(obj, keys);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}
