import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

type RouteContext = { params: Promise<{ id: string }> };

const createSchema = z.object({
  allow_download: z.boolean().optional().default(false),
  expires_in_days: z.number().int().min(1).max(365).optional(),
});

// ── GET: Get existing public share ───────────────────────────
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required.' } satisfies ApiResponse<never>, {
      status: 401,
    });
  }

  const rl = await rateLimit(`public_share:${user.id}`, { limit: 60, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify ownership
  const { data: report } = await supabase.from('reports').select('id').eq('id', id).eq('user_id', user.id).single();
  if (!report) {
    return NextResponse.json({ success: false, error: 'Report not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  const { data: publicShare } = await supabase
    .from('report_public_shares')
    .select('*')
    .eq('report_id', id)
    .eq('created_by', user.id)
    .single();

  return NextResponse.json({ success: true, data: publicShare || null });
}

// ── POST: Create or regenerate public share ──────────────────
export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required.' } satisfies ApiResponse<never>, {
      status: 401,
    });
  }

  const rl = await rateLimit(`public_share:${user.id}`, { limit: 20, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify ownership
  const { data: report } = await supabase.from('reports').select('id').eq('id', id).eq('user_id', user.id).single();
  if (!report) {
    return NextResponse.json({ success: false, error: 'Report not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  // Verify team plan
  const { data: sub } = await supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).single();
  if (!sub || sub.plan !== 'team' || !['active', 'trialing'].includes(sub.status)) {
    return NextResponse.json(
      { success: false, error: 'Team plan required for public sharing.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid request.' } satisfies ApiResponse<never>, {
        status: 400,
      });
    }

    // Delete existing share if any (regenerate)
    await supabase.from('report_public_shares').delete().eq('report_id', id).eq('created_by', user.id);

    const expiresAt = parsed.data.expires_in_days
      ? new Date(Date.now() + parsed.data.expires_in_days * 86400_000).toISOString()
      : null;

    const { data: share, error: insertError } = await supabase
      .from('report_public_shares')
      .insert({
        report_id: id,
        created_by: user.id,
        allow_download: parsed.data.allow_download,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError || !share) {
      logger.error('public_share_create_failed', { error: insertError?.message, reportId: id });
      return NextResponse.json(
        { success: false, error: 'Failed to create public share.' } satisfies ApiResponse<never>,
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: share });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }
}

// ── DELETE: Revoke public share ──────────────────────────────
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required.' } satisfies ApiResponse<never>, {
      status: 401,
    });
  }

  const rl = await rateLimit(`public_share:${user.id}`, { limit: 20, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify ownership
  const { data: report } = await supabase.from('reports').select('id').eq('id', id).eq('user_id', user.id).single();
  if (!report) {
    return NextResponse.json({ success: false, error: 'Report not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  const { error } = await supabase.from('report_public_shares').delete().eq('report_id', id).eq('created_by', user.id);

  if (error) {
    return NextResponse.json({ success: false, error: 'No public share found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  return NextResponse.json({ success: true });
}
