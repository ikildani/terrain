import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse, WorkspaceRole } from '@/types';

type RouteContext = { params: Promise<{ workspaceId: string }> };

/** Verify user is a member of the workspace and return their role. */
async function getMemberRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  userId: string,
): Promise<WorkspaceRole | null> {
  const { data } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  return (data?.role as WorkspaceRole) ?? null;
}

// ────────────────────────────────────────────────────────────
// GET /api/workspaces/[workspaceId]/activity — List activity feed
// ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest, context: RouteContext) {
  const { workspaceId } = await context.params;
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

  const rl = await rateLimit(`workspace_activity:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify membership
  const role = await getMemberRole(supabase, workspaceId, user.id);
  if (!role) {
    return NextResponse.json({ success: false, error: 'Workspace not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  // Parse query params
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 1), 100);
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10) || 0, 0);
  const filterUserId = searchParams.get('user_id') ?? null;
  const filterAction = searchParams.get('action') ?? null;

  try {
    const admin = createAdminClient();

    // Build query
    let query = admin
      .from('workspace_activities')
      .select(
        'id, workspace_id, user_id, action, resource_type, resource_id, metadata, created_at, profiles(email, full_name)',
        { count: 'exact' },
      )
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filterUserId) {
      query = query.eq('user_id', filterUserId);
    }

    if (filterAction) {
      query = query.eq('action', filterAction);
    }

    const { data: activities, error: fetchError, count } = await query;

    if (fetchError) {
      captureApiError(fetchError, { route: `/api/workspaces/${workspaceId}/activity`, action: 'list' });
      logger.error('workspace_activity_list_failed', { error: fetchError.message, workspaceId });
      return NextResponse.json({ success: false, error: 'Failed to fetch activity.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    // Flatten profiles join
    const flatActivities = (activities ?? []).map((a) => {
      const profile = a.profiles as unknown as { email: string; full_name: string | null } | null;
      return {
        id: a.id,
        workspace_id: a.workspace_id,
        user_id: a.user_id,
        action: a.action,
        resource_type: a.resource_type,
        resource_id: a.resource_id,
        metadata: a.metadata,
        created_at: a.created_at,
        user_email: profile?.email ?? null,
        user_name: profile?.full_name ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        activities: flatActivities,
        total: count ?? 0,
      },
    });
  } catch (err) {
    captureApiError(err, { route: `/api/workspaces/${workspaceId}/activity`, action: 'list' });
    logger.error('workspace_activity_list_error', {
      error: err instanceof Error ? err.message : String(err),
      workspaceId,
    });
    return NextResponse.json({ success: false, error: 'Internal server error.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}
