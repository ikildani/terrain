import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateApiKey, hasScope } from '@/lib/api/api-key-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { logActivity } from '@/lib/activity';
import { logger, logApiRequest, logApiResponse } from '@/lib/logger';
import { parseBodyWithLimit, BodyTooLargeError } from '@/lib/api/parse-body';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse } from '@/types';

// ────────────────────────────────────────────────────────────
// POST Schema
// ────────────────────────────────────────────────────────────

const CreateReportSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(500),
  report_type: z.string().trim().min(1).max(100),
  indication: z.string().trim().max(500).default('N/A'),
  inputs: z.record(z.unknown()).default({}),
  outputs: z.record(z.unknown()).default({}),
  status: z.enum(['draft', 'final']).default('final'),
  is_starred: z.boolean().default(false),
  tags: z.array(z.string().trim().max(100)).max(20).default([]),
  folder_id: z.string().uuid().optional().nullable(),
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/reports — List workspace reports
// ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
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

    if (!hasScope(apiKeyCtx, 'reports')) {
      return NextResponse.json(
        { success: false, error: 'API key does not have the reports scope.' } satisfies ApiResponse<never>,
        { status: 403, headers: { 'X-Request-Id': requestId } },
      );
    }

    // ── Rate limit ───────────────────────────────────────────
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

    logApiRequest({ route: '/api/v1/reports', method: 'GET', requestId });

    // ── Query params ─────────────────────────────────────────
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    const allowedSortColumns = ['created_at', 'updated_at', 'title'];
    const safeSort = allowedSortColumns.includes(sort) ? sort : 'created_at';
    const ascending = order === 'asc';

    const admin = createAdminClient();
    const { data: reports, error } = await admin
      .from('reports')
      .select('id, title, report_type, indication, status, is_starred, tags, folder_id, created_at, updated_at')
      .eq('workspace_id', apiKeyCtx.workspaceId)
      .order(safeSort, { ascending })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    logApiResponse({ route: '/api/v1/reports', status: 200, durationMs: 0, requestId });

    return NextResponse.json(
      { success: true, data: reports ?? [] },
      { status: 200, headers: { 'X-Request-Id': requestId } },
    );
  } catch (error) {
    captureApiError(error, { route: '/api/v1/reports', action: 'list', requestId });
    logger.error('v1_reports_list_error', {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });
    return NextResponse.json({ success: false, error: 'Failed to fetch reports.' } satisfies ApiResponse<never>, {
      status: 500,
      headers: { 'X-Request-Id': requestId },
    });
  }
}

// ────────────────────────────────────────────────────────────
// POST /api/v1/reports — Create a report in the workspace
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
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

    if (!hasScope(apiKeyCtx, 'reports')) {
      return NextResponse.json(
        { success: false, error: 'API key does not have the reports scope.' } satisfies ApiResponse<never>,
        { status: 403, headers: { 'X-Request-Id': requestId } },
      );
    }

    // ── Rate limit ───────────────────────────────────────────
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

    const parsed = CreateReportSchema.safeParse(body);
    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message);
      return NextResponse.json(
        { success: false, error: messages.join('; '), errors: messages } satisfies ApiResponse<never>,
        { status: 400, headers: { 'X-Request-Id': requestId } },
      );
    }

    logApiRequest({ route: '/api/v1/reports', method: 'POST', requestId });

    const admin = createAdminClient();

    const { data: report, error } = await admin
      .from('reports')
      .insert({
        workspace_id: apiKeyCtx.workspaceId,
        title: parsed.data.title,
        report_type: parsed.data.report_type,
        indication: parsed.data.indication,
        inputs: parsed.data.inputs,
        outputs: parsed.data.outputs,
        status: parsed.data.status,
        is_starred: parsed.data.is_starred,
        tags: parsed.data.tags,
        folder_id: parsed.data.folder_id ?? null,
      })
      .select('id, title, report_type, indication, status, is_starred, tags, folder_id, created_at, updated_at')
      .single();

    if (error) throw error;

    // ── Audit + activity ─────────────────────────────────────
    logAudit({
      workspaceId: apiKeyCtx.workspaceId,
      userId: apiKeyCtx.keyId,
      action: 'report_created',
      resourceType: 'report',
      resourceId: report.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      metadata: { via: 'v1_api', title: parsed.data.title },
    });

    logActivity({
      workspaceId: apiKeyCtx.workspaceId,
      userId: apiKeyCtx.keyId,
      action: 'report_created',
      resourceType: 'report',
      resourceId: report.id,
      metadata: { via: 'v1_api' },
    });

    logApiResponse({ route: '/api/v1/reports', status: 201, durationMs: 0, requestId });

    return NextResponse.json({ success: true, data: report }, { status: 201, headers: { 'X-Request-Id': requestId } });
  } catch (error) {
    captureApiError(error, { route: '/api/v1/reports', action: 'create', requestId });
    logger.error('v1_reports_create_error', {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });
    return NextResponse.json({ success: false, error: 'Failed to create report.' } satisfies ApiResponse<never>, {
      status: 500,
      headers: { 'X-Request-Id': requestId },
    });
  }
}
