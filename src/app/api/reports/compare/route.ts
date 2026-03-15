import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import { buildComparisonMatrix } from '@/lib/comparison';
import { z } from 'zod';
import type { ApiResponse, Report } from '@/types';

const compareSchema = z.object({
  report_ids: z
    .array(z.string().uuid())
    .min(2, 'Select at least 2 reports to compare.')
    .max(4, 'Maximum 4 reports can be compared at once.'),
});

// ────────────────────────────────────────────────────────────
// POST /api/reports/compare
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required.' } satisfies ApiResponse<never>, {
      status: 401,
    });
  }

  const rl = await rateLimit(`compare:${user.id}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  try {
    let body: unknown;
    try {
      const { parseBodyWithLimit } = await import('@/lib/api/parse-body');
      body = await parseBodyWithLimit(request);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid or oversized request body.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }
    const parsed = compareSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const { report_ids } = parsed.data;
    const admin = createAdminClient();

    // Fetch all reports — user must have access to each
    const { data: reports, error: fetchError } = await admin
      .from('reports')
      .select(
        'id, user_id, title, report_type, indication, inputs, outputs, status, is_starred, tags, workspace_id, created_at, updated_at',
      )
      .in('id', report_ids);

    if (fetchError) {
      captureApiError(fetchError, { route: '/api/reports/compare', action: 'fetch' });
      logger.error('compare_fetch_failed', { error: fetchError.message });
      return NextResponse.json({ success: false, error: 'Failed to fetch reports.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    if (!reports || reports.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Not enough accessible reports found.' } satisfies ApiResponse<never>,
        { status: 404 },
      );
    }

    // Verify the user has access to each report (either owner or workspace member)
    for (const report of reports) {
      const isOwner = report.user_id === user.id;
      if (!isOwner && report.workspace_id) {
        const { data: member } = await admin
          .from('workspace_members')
          .select('role')
          .eq('workspace_id', report.workspace_id)
          .eq('user_id', user.id)
          .single();

        if (!member) {
          return NextResponse.json(
            { success: false, error: `Access denied to report ${report.id}.` } satisfies ApiResponse<never>,
            { status: 403 },
          );
        }
      } else if (!isOwner) {
        return NextResponse.json(
          { success: false, error: `Access denied to report ${report.id}.` } satisfies ApiResponse<never>,
          { status: 403 },
        );
      }
    }

    // Build comparison matrix
    const matrix = buildComparisonMatrix(reports as unknown as Report[]);

    return NextResponse.json({ success: true, data: matrix });
  } catch (err) {
    captureApiError(err, { route: '/api/reports/compare', action: 'compare' });
    logger.error('compare_error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ success: false, error: 'Internal server error.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}
