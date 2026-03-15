import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { parseBodyWithLimit } from '@/lib/api/parse-body';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse, Workspace, WorkspaceRole } from '@/types';

const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  logo_url: z.string().trim().max(500).url().optional().nullable(),
  brand_primary_color: z
    .string()
    .trim()
    .max(20)
    .regex(/^#[0-9a-fA-F]{3,8}$/, 'Must be a valid hex color')
    .optional()
    .nullable(),
  brand_footer_text: z.string().trim().max(500).optional().nullable(),
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
// GET /api/workspaces/[workspaceId] — Get workspace details + members
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

  const rl = await rateLimit(`workspace_detail:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
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

  // Fetch workspace
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  if (wsError || !workspace) {
    return NextResponse.json({ success: false, error: 'Workspace not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  // Fetch members with profile data
  const { data: members } = await supabase
    .from('workspace_members')
    .select('id, workspace_id, user_id, role, joined_at, invited_by, profiles(email, full_name)')
    .eq('workspace_id', workspaceId)
    .order('joined_at', { ascending: true });

  const flatMembers = (members ?? []).map((m) => {
    const profile = m.profiles as unknown as { email: string; full_name: string | null } | null;
    return {
      id: m.id,
      workspace_id: m.workspace_id,
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      invited_by: m.invited_by,
      email: profile?.email,
      full_name: profile?.full_name,
    };
  });

  return NextResponse.json({
    success: true,
    data: { ...workspace, members: flatMembers },
  });
}

// ────────────────────────────────────────────────────────────
// PATCH /api/workspaces/[workspaceId] — Update workspace settings
// ────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, context: RouteContext) {
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

  const rl = await rateLimit(`workspace_update:${user.id}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify owner or admin role
  const role = await getMemberRole(supabase, workspaceId, user.id);
  if (!role || (role !== 'owner' && role !== 'admin')) {
    return NextResponse.json(
      { success: false, error: 'Admin or owner access required.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  try {
    const body = await parseBodyWithLimit(request);
    const parsed = updateWorkspaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    // Filter out undefined values
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update.' } satisfies ApiResponse<never>, {
        status: 400,
      });
    }

    updates.updated_at = new Date().toISOString();

    const { data: workspace, error: updateError } = await supabase
      .from('workspaces')
      .update(updates)
      .eq('id', workspaceId)
      .select()
      .single();

    if (updateError) {
      captureApiError(updateError, { route: `/api/workspaces/${workspaceId}`, action: 'update' });
      logger.error('workspace_update_failed', { error: updateError.message, workspaceId });
      return NextResponse.json({ success: false, error: 'Failed to update workspace.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    logger.info('workspace_updated', { workspaceId, userId: user.id, fields: Object.keys(updates) });

    return NextResponse.json({ success: true, data: workspace } satisfies ApiResponse<Workspace>);
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }
}

// ────────────────────────────────────────────────────────────
// DELETE /api/workspaces/[workspaceId] — Delete workspace
// ────────────────────────────────────────────────────────────

export async function DELETE(_request: NextRequest, context: RouteContext) {
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

  const rl = await rateLimit(`workspace_delete:${user.id}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify owner role only
  const role = await getMemberRole(supabase, workspaceId, user.id);
  if (role !== 'owner') {
    return NextResponse.json(
      { success: false, error: 'Only the workspace owner can delete it.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  const { error: deleteError } = await supabase.from('workspaces').delete().eq('id', workspaceId);

  if (deleteError) {
    captureApiError(deleteError, { route: `/api/workspaces/${workspaceId}`, action: 'delete' });
    logger.error('workspace_delete_failed', { error: deleteError.message, workspaceId });
    return NextResponse.json({ success: false, error: 'Failed to delete workspace.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  logger.info('workspace_deleted', { workspaceId, userId: user.id });

  return NextResponse.json({ success: true } satisfies ApiResponse<never>);
}
