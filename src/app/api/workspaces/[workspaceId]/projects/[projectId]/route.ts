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

const updateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name too long').optional(),
  description: z.string().trim().max(500, 'Description too long').optional().nullable(),
  is_restricted: z.boolean().optional(),
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

/** Check if user is a project member. */
async function isProjectMember(
  admin: ReturnType<typeof createAdminClient>,
  projectId: string,
  userId: string,
): Promise<boolean> {
  const { data } = await admin
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single();

  return !!data;
}

// ────────────────────────────────────────────────────────────
// GET /api/workspaces/[workspaceId]/projects/[projectId]
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

  const rl = await rateLimit(`workspace_project:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
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

  const admin = createAdminClient();

  // Fetch the project
  const { data: project, error: projectError } = await admin
    .from('workspace_projects')
    .select('*')
    .eq('id', projectId)
    .eq('workspace_id', workspaceId)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ success: false, error: 'Project not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  // Check access: admin/owner can see all, others need project membership for restricted
  if (project.is_restricted && role !== 'owner' && role !== 'admin') {
    const isMember = await isProjectMember(admin, projectId, user.id);
    if (!isMember) {
      return NextResponse.json({ success: false, error: 'Project not found.' } satisfies ApiResponse<never>, {
        status: 404,
      });
    }
  }

  // Fetch members with profile info
  const { data: members } = await admin
    .from('project_members')
    .select('id, project_id, user_id, role, joined_at')
    .eq('project_id', projectId);

  // Fetch profiles for members
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

  // Fetch report count scoped to this project
  const { count: reportCount } = await admin
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId);

  return NextResponse.json({
    success: true,
    data: {
      ...project,
      members: enrichedMembers,
      report_count: reportCount ?? 0,
    },
  });
}

// ────────────────────────────────────────────────────────────
// PATCH /api/workspaces/[workspaceId]/projects/[projectId]
// ────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, context: RouteContext) {
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

  const rl = await rateLimit(`workspace_project_update:${user.id}`, { limit: 30, windowMs: 60 * 1000 });
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

  try {
    const body = await parseBodyWithLimit(request);
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.description !== undefined) updates.description = parsed.data.description;
    if (parsed.data.is_restricted !== undefined) updates.is_restricted = parsed.data.is_restricted;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update.' } satisfies ApiResponse<never>, {
        status: 400,
      });
    }

    updates.updated_at = new Date().toISOString();

    const admin = createAdminClient();

    const { data: project, error: updateError } = await admin
      .from('workspace_projects')
      .update(updates)
      .eq('id', projectId)
      .eq('workspace_id', workspaceId)
      .select()
      .single();

    if (updateError) {
      captureApiError(updateError, { route: `/api/workspaces/${workspaceId}/projects/${projectId}`, action: 'update' });
      logger.error('workspace_project_update_failed', { error: updateError.message, workspaceId, projectId });
      return NextResponse.json({ success: false, error: 'Failed to update project.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found.' } satisfies ApiResponse<never>, {
        status: 404,
      });
    }

    logAudit({
      workspaceId,
      userId: user.id,
      action: 'project_updated',
      resourceType: 'project',
      resourceId: projectId,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      newValue: parsed.data as unknown as Record<string, unknown>,
    });

    logger.info('workspace_project_updated', { workspaceId, projectId, userId: user.id });

    return NextResponse.json({ success: true, data: project });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }
}

// ────────────────────────────────────────────────────────────
// DELETE /api/workspaces/[workspaceId]/projects/[projectId]
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

  const rl = await rateLimit(`workspace_project_delete:${user.id}`, { limit: 10, windowMs: 60 * 1000 });
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

  // Set reports.project_id = null for reports in this project
  const { error: reportUpdateError } = await admin
    .from('reports')
    .update({ project_id: null })
    .eq('project_id', projectId);

  if (reportUpdateError) {
    captureApiError(reportUpdateError, {
      route: `/api/workspaces/${workspaceId}/projects/${projectId}`,
      action: 'unlink_reports',
    });
    logger.error('workspace_project_unlink_reports_failed', {
      error: reportUpdateError.message,
      workspaceId,
      projectId,
    });
  }

  // Delete the project (CASCADE will remove project_members)
  const { error: deleteError } = await admin
    .from('workspace_projects')
    .delete()
    .eq('id', projectId)
    .eq('workspace_id', workspaceId);

  if (deleteError) {
    captureApiError(deleteError, {
      route: `/api/workspaces/${workspaceId}/projects/${projectId}`,
      action: 'delete',
    });
    logger.error('workspace_project_delete_failed', { error: deleteError.message, workspaceId, projectId });
    return NextResponse.json({ success: false, error: 'Failed to delete project.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  logAudit({
    workspaceId,
    userId: user.id,
    action: 'project_deleted',
    resourceType: 'project',
    resourceId: projectId,
    ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
  });

  logger.info('workspace_project_deleted', { workspaceId, projectId, userId: user.id });

  return NextResponse.json({ success: true });
}
