import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
// GET /api/workspaces/[workspaceId]/reports — List workspace reports
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

  const rl = await rateLimit(`workspace_reports:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
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
  const folderId = searchParams.get('folder_id');
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

  // Validate sort column to prevent injection
  const allowedSortColumns = ['created_at', 'updated_at', 'title'];
  const safeSort = allowedSortColumns.includes(sort) ? sort : 'created_at';
  const ascending = order === 'asc';

  let query = supabase
    .from('reports')
    .select('id, title, report_type, indication, status, is_starred, tags, folder_id, created_at, updated_at')
    .eq('workspace_id', workspaceId)
    .order(safeSort, { ascending })
    .range(offset, offset + limit - 1);

  if (folderId) {
    query = query.eq('folder_id', folderId);
  }

  const { data: reports, error: reportsError } = await query;

  if (reportsError) {
    captureApiError(reportsError, { route: `/api/workspaces/${workspaceId}/reports`, action: 'list' });
    logger.error('workspace_reports_list_failed', { error: reportsError.message, workspaceId });
    return NextResponse.json({ success: false, error: 'Failed to fetch reports.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  return NextResponse.json({ success: true, data: reports ?? [] });
}
