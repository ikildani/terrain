import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { parseBodyWithLimit } from '@/lib/api/parse-body';
import { logAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse, WorkspaceRole } from '@/types';

const addMemberSchema = z.object({
  user_id: z.string().uuid('Valid user ID required'),
  role: z.enum(['lead', 'member']).optional().default('member'),
});

type RouteContext = { params: Promise<{ workspaceId: string; projectId: string }> };

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

/** Check if user is a project member or workspace admin/owner. */
async function canViewProject(
  admin: ReturnType<typeof createAdminClient>,
  workspaceId: string,
  projectId: string,
  userId: string,
  role: WorkspaceRole,
): Promise<boolean> {
  if (role === 'owner' || role === 'admin') return true;

  const { data } = await admin
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single();

  return !!data;
}

// ────────────────────────────────────────────────────────────
// GET /api/workspaces/[workspaceId]/projects/[projectId]/members
// ────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, context: RouteContext) {
  const { workspaceId, projectId } = await context.params;
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

  const rl = await rateLimit(`project_members:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  const role = await getMemberRole(supabase, workspaceId, user.id);
  if (!role) {
    return NextResponse.json({ success: false, error: 'Workspace not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  const admin = createAdminClient();

  // Verify project exists in this workspace
  const { data: project } = await admin
    .from('workspace_projects')
    .select('id, is_restricted')
    .eq('id', projectId)
    .eq('workspace_id', workspaceId)
    .single();

  if (!project) {
    return NextResponse.json({ success: false, error: 'Project not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  // Check access for restricted projects
  if (project.is_restricted) {
    const canView = await canViewProject(admin, workspaceId, projectId, user.id, role);
    if (!canView) {
      return NextResponse.json({ success: false, error: 'Project not found.' } satisfies ApiResponse<never>, {
        status: 404,
      });
    }
  }

  // Fetch members with profile info
  const { data: members, error: membersError } = await admin
    .from('project_members')
    .select('id, project_id, user_id, role, joined_at')
    .eq('project_id', projectId);

  if (membersError) {
    captureApiError(membersError, {
      route: `/api/workspaces/${workspaceId}/projects/${projectId}/members`,
      action: 'list',
    });
    logger.error('project_members_list_failed', { error: membersError.message, workspaceId, projectId });
    return NextResponse.json({ success: false, error: 'Failed to fetch members.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  // Enrich with profiles
  const memberUserIds = (members ?? []).map((m) => m.user_id);
  const { data: profiles } =
    memberUserIds.length > 0
      ? await admin.from('profiles').select('id, email, full_name').in('id', memberUserIds)
      : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const enrichedMembers = (members ?? []).map((m) => ({
    ...m,
    email: profileMap.get(m.user_id)?.email,
    full_name: profileMap.get(m.user_id)?.full_name,
  }));

  return NextResponse.json({ success: true, data: enrichedMembers });
}

// ────────────────────────────────────────────────────────────
// POST /api/workspaces/[workspaceId]/projects/[projectId]/members — Add member
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest, context: RouteContext) {
  const { workspaceId, projectId } = await context.params;
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

  const rl = await rateLimit(`project_member_add:${user.id}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify admin/owner role
  const role = await getMemberRole(supabase, workspaceId, user.id);
  if (!role || (role !== 'owner' && role !== 'admin')) {
    return NextResponse.json(
      { success: false, error: 'Admin or owner access required.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  const admin = createAdminClient();

  // Verify project exists in this workspace
  const { data: project } = await admin
    .from('workspace_projects')
    .select('id')
    .eq('id', projectId)
    .eq('workspace_id', workspaceId)
    .single();

  if (!project) {
    return NextResponse.json({ success: false, error: 'Project not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  try {
    const body = await parseBodyWithLimit(request);
    const parsed = addMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const { user_id: targetUserId, role: memberRole } = parsed.data;

    // Verify target user is a workspace member
    const { data: wsMember } = await admin
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', targetUserId)
      .single();

    if (!wsMember) {
      return NextResponse.json(
        { success: false, error: 'User must be a workspace member first.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    // Check if already a project member
    const { data: existing } = await admin
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', targetUserId)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'User is already a project member.' } satisfies ApiResponse<never>,
        { status: 409 },
      );
    }

    const { data: member, error: insertError } = await admin
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: targetUserId,
        role: memberRole,
      })
      .select()
      .single();

    if (insertError) {
      captureApiError(insertError, {
        route: `/api/workspaces/${workspaceId}/projects/${projectId}/members`,
        action: 'add',
      });
      logger.error('project_member_add_failed', { error: insertError.message, workspaceId, projectId });
      return NextResponse.json({ success: false, error: 'Failed to add member.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    logAudit({
      workspaceId,
      userId: user.id,
      action: 'member_invited',
      resourceType: 'project_member',
      resourceId: member.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      newValue: { project_id: projectId, user_id: targetUserId, role: memberRole },
    });

    logger.info('project_member_added', { workspaceId, projectId, targetUserId, role: memberRole });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }
}

// ────────────────────────────────────────────────────────────
// DELETE /api/workspaces/[workspaceId]/projects/[projectId]/members?memberId=UUID
// ────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { workspaceId, projectId } = await context.params;
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

  const rl = await rateLimit(`project_member_remove:${user.id}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify admin/owner role
  const role = await getMemberRole(supabase, workspaceId, user.id);
  if (!role || (role !== 'owner' && role !== 'admin')) {
    return NextResponse.json(
      { success: false, error: 'Admin or owner access required.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get('memberId');

  if (!memberId) {
    return NextResponse.json(
      { success: false, error: 'memberId query parameter required.' } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Verify the member record belongs to this project
  const { data: member } = await admin
    .from('project_members')
    .select('id, user_id')
    .eq('id', memberId)
    .eq('project_id', projectId)
    .single();

  if (!member) {
    return NextResponse.json({ success: false, error: 'Member not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  const { error: deleteError } = await admin.from('project_members').delete().eq('id', memberId);

  if (deleteError) {
    captureApiError(deleteError, {
      route: `/api/workspaces/${workspaceId}/projects/${projectId}/members`,
      action: 'remove',
    });
    logger.error('project_member_remove_failed', { error: deleteError.message, workspaceId, projectId, memberId });
    return NextResponse.json({ success: false, error: 'Failed to remove member.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  logAudit({
    workspaceId,
    userId: user.id,
    action: 'member_removed',
    resourceType: 'project_member',
    resourceId: memberId,
    ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
    oldValue: { project_id: projectId, user_id: member.user_id },
  });

  logger.info('project_member_removed', { workspaceId, projectId, memberId, userId: user.id });

  return NextResponse.json({ success: true });
}
