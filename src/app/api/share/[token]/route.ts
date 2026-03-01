import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import type { ApiResponse } from '@/types';

type RouteContext = { params: Promise<{ token: string }> };

// ── GET: Public share viewer (NO auth required) ──────────────
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

  const supabase = createClient();

  // Look up the share token
  const { data: share } = await supabase
    .from('report_public_shares')
    .select('id, report_id, allow_download, expires_at, view_count')
    .eq('share_token', token)
    .single();

  if (!share) {
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
  const { data: report } = await supabase
    .from('reports')
    .select('title, report_type, indication, outputs, status, tags, created_at')
    .eq('id', share.report_id)
    .single();

  if (!report) {
    return NextResponse.json(
      { success: false, error: 'Share link not found or expired.' } satisfies ApiResponse<never>,
      { status: 404 },
    );
  }

  // Increment view count (fire-and-forget)
  supabase
    .from('report_public_shares')
    .update({ view_count: (share.view_count || 0) + 1, updated_at: new Date().toISOString() })
    .eq('id', share.id)
    .then(() => {});

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
}
