import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { parseBodyWithLimit } from '@/lib/api/parse-body';
import { logAudit } from '@/lib/audit';
import { logActivity } from '@/lib/activity';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse, WorkspaceProject, WorkspaceRole } from '@/types';

const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().trim().max(500, 'Description too long').optional().nullable(),
  is_restricted: z.boolean(),
});

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
// GET /api/workspaces/[workspaceId]/projects — List projects
// ────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, context: RouteContext) {
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

  const rl = await rateLimit(`workspace_projects:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
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

  // RLS handles restricted project visibility
  const { data: projects, error: projectsError } = await supabase
    .from('workspace_projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (projectsError) {
    captureApiError(projectsError, { route: `/api/workspaces/${workspaceId}/projects`, action: 'list' });
    logger.error('workspace_projects_list_failed', { error: projectsError.message, workspaceId });
    return NextResponse.json({ success: false, error: 'Failed to fetch projects.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  return NextResponse.json({ success: true, data: projects ?? [] });
}

// ────────────────────────────────────────────────────────────
// POST /api/workspaces/[workspaceId]/projects — Create project
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest, context: RouteContext) {
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

  const rl = await rateLimit(`workspace_project_create:${user.id}`, { limit: 30, windowMs: 60 * 1000 });
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

  // Verify enterprise plan
  const admin = createAdminClient();
  const { data: workspace } = await admin.from('workspaces').select('plan').eq('id', workspaceId).single();

  if (!workspace || workspace.plan !== 'enterprise') {
    return NextResponse.json(
      { success: false, error: 'Enterprise plan required for projects.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  try {
    const body = await parseBodyWithLimit(request);
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const { name, description, is_restricted } = parsed.data;

    // Create the project
    const { data: project, error: createError } = await admin
      .from('workspace_projects')
      .insert({
        workspace_id: workspaceId,
        name,
        description: description ?? null,
        is_restricted,
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      captureApiError(createError, { route: `/api/workspaces/${workspaceId}/projects`, action: 'create' });
      logger.error('workspace_project_create_failed', { error: createError.message, workspaceId });
      return NextResponse.json({ success: false, error: 'Failed to create project.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    // Auto-add creator as project lead
    await admin.from('project_members').insert({
      project_id: project.id,
      user_id: user.id,
      role: 'lead',
    });

    // Log audit + activity
    logAudit({
      workspaceId,
      userId: user.id,
      action: 'project_created',
      resourceType: 'project',
      resourceId: project.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      newValue: { name, is_restricted },
    });

    logActivity({
      workspaceId,
      userId: user.id,
      action: 'settings_updated',
      resourceType: 'project',
      resourceId: project.id,
      metadata: { name, action: 'project_created' },
    });

    logger.info('workspace_project_created', { workspaceId, projectId: project.id, userId: user.id });

    return NextResponse.json({ success: true, data: project } satisfies ApiResponse<WorkspaceProject>, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }
}
