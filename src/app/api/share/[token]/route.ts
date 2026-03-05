import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

type RouteContext = { params: Promise<{ token: string }> };

// ── GET: Public share viewer (NO auth required) ──────────────
// Uses the service-role client to bypass RLS — this endpoint is
// public by design (rate-limited, returns only safe fields).
export async function GET(request: NextRequest, context: RouteContext) {
  const { token } = await context.params;

  // Rate limit by IP to prevent token enumeration
  const ip = request.headers.get('x-real-ip') || 'unknown';
  const rl = await rateLimit(`share_view:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  try {
    const supabase = createAdminClient();

    // Look up the share token
    const { data: share, error: shareError } = await supabase
      .from('report_public_shares')
      .select('id, report_id, allow_download, expires_at, view_count')
      .eq('share_token', token)
      .single();

    if (shareError || !share) {
      return NextResponse.json(
        { success: false, error: 'Share link not found or expired.' } satisfies ApiResponse<never>,
        { status: 404 },
      );
    }

    // Check expiration
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Share link not found or expired.' } satisfies ApiResponse<never>,
        { status: 404 },
      );
    }

    // Fetch report data (only safe fields)
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('title, report_type, indication, outputs, status, tags, created_at')
      .eq('id', share.report_id)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { success: false, error: 'Share link not found or expired.' } satisfies ApiResponse<never>,
        { status: 404 },
      );
    }

    // Atomic view count increment via Postgres function (no race conditions)
    supabase.rpc('increment_share_view_count', { p_share_id: share.id }).then(({ error }) => {
      if (error) {
        logger.warn('share_view_count_increment_failed', { share_id: share.id, error: error.message });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        title: report.title,
        report_type: report.report_type,
        indication: report.indication,
        outputs: report.outputs,
        status: report.status,
        tags: report.tags,
        generated_at: report.created_at,
        allow_download: share.allow_download,
        view_count: (share.view_count || 0) + 1,
      },
    });
  } catch (err) {
    logger.error('share_view_error', { token, error: err instanceof Error ? err.message : 'Unknown error' });
    return NextResponse.json({ success: false, error: 'Unable to load shared report.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}
