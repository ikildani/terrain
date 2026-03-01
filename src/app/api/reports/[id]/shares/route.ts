import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

type RouteContext = { params: Promise<{ id: string }> };

const shareSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(10),
  permission: z.enum(['view', 'edit']).default('view'),
});

// ── GET: List shares for a report ────────────────────────────
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

  const rl = await rateLimit(`shares:${user.id}`, { limit: 60, windowMs: 60_000 });
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

  const { data: shares, error } = await supabase
    .from('report_shares')
    .select('id, shared_with_user_id, permission, created_at')
    .eq('report_id', id);

  if (error) {
    logger.error('shares_list_failed', { error: error.message, reportId: id });
    return NextResponse.json({ success: false, error: 'Failed to fetch shares.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  // Enrich with profile emails
  const userIds = (shares || []).map((s) => s.shared_with_user_id);
  let profileMap: Record<string, { email: string; full_name: string | null }> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase.from('profiles').select('id, email, full_name').in('id', userIds);
    if (profiles) {
      profileMap = Object.fromEntries(profiles.map((p) => [p.id, { email: p.email, full_name: p.full_name }]));
    }
  }

  const enriched = (shares || []).map((s) => ({
    id: s.id,
    email: profileMap[s.shared_with_user_id]?.email || 'Unknown',
    full_name: profileMap[s.shared_with_user_id]?.full_name || null,
    permission: s.permission,
    created_at: s.created_at,
  }));

  return NextResponse.json({ success: true, data: enriched });
}

// ── POST: Share with team members ────────────────────────────
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

  const rl = await rateLimit(`shares:${user.id}`, { limit: 30, windowMs: 60_000 });
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
      { success: false, error: 'Team plan required for sharing.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const parsed = shareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid request.' } satisfies ApiResponse<never>, {
        status: 400,
      });
    }

    const { emails, permission } = parsed.data;

    // Look up profiles by email
    const { data: profiles } = await supabase.from('profiles').select('id, email').in('email', emails);
    const foundProfiles = profiles || [];
    const foundEmails = new Set(foundProfiles.map((p) => p.email));
    const notFound = emails.filter((e) => !foundEmails.has(e));

    // Filter out self and already-shared
    const { data: existingShares } = await supabase
      .from('report_shares')
      .select('shared_with_user_id')
      .eq('report_id', id);
    const alreadyShared = new Set((existingShares || []).map((s) => s.shared_with_user_id));

    const toInsert = foundProfiles
      .filter((p) => p.id !== user.id && !alreadyShared.has(p.id))
      .map((p) => ({
        report_id: id,
        shared_with_user_id: p.id,
        permission,
      }));

    if (toInsert.length > 0) {
      const { error: insertError } = await supabase.from('report_shares').insert(toInsert);
      if (insertError) {
        logger.error('share_insert_failed', { error: insertError.message, reportId: id });
        return NextResponse.json({ success: false, error: 'Failed to share report.' } satisfies ApiResponse<never>, {
          status: 500,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { shared_count: toInsert.length, not_found_emails: notFound },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }
}

// ── DELETE: Revoke a share ───────────────────────────────────
export async function DELETE(request: NextRequest, context: RouteContext) {
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

  const rl = await rateLimit(`shares:${user.id}`, { limit: 30, windowMs: 60_000 });
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

  const shareId = new URL(request.url).searchParams.get('shareId');
  if (!shareId) {
    return NextResponse.json({ success: false, error: 'shareId is required.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }

  const { error } = await supabase.from('report_shares').delete().eq('id', shareId).eq('report_id', id);

  if (error) {
    return NextResponse.json({ success: false, error: 'Share not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  return NextResponse.json({ success: true });
}
