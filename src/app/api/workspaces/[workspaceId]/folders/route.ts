import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { parseBodyWithLimit } from '@/lib/api/parse-body';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse, ReportFolder, WorkspaceRole } from '@/types';

const createFolderSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  parent_id: z.string().uuid().optional().nullable(),
  color: z
    .string()
    .trim()
    .max(20)
    .regex(/^#[0-9a-fA-F]{3,8}$/, 'Must be a valid hex color')
    .optional()
    .nullable(),
});

const updateFolderSchema = z.object({
  id: z.string().uuid('Folder ID is required'),
  name: z.string().trim().min(1).max(100).optional(),
  parent_id: z.string().uuid().optional().nullable(),
  color: z
    .string()
    .trim()
    .max(20)
    .regex(/^#[0-9a-fA-F]{3,8}$/, 'Must be a valid hex color')
    .optional()
    .nullable(),
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

const ANALYST_ROLES: WorkspaceRole[] = ['owner', 'admin', 'analyst'];

// ────────────────────────────────────────────────────────────
// GET /api/workspaces/[workspaceId]/folders — List all folders (flat)
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

  const rl = await rateLimit(`workspace_folders:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
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

  const { data: folders, error: foldersError } = await supabase
    .from('report_folders')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true });

  if (foldersError) {
    captureApiError(foldersError, { route: `/api/workspaces/${workspaceId}/folders`, action: 'list' });
    logger.error('workspace_folders_list_failed', { error: foldersError.message, workspaceId });
    return NextResponse.json({ success: false, error: 'Failed to fetch folders.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  return NextResponse.json({ success: true, data: folders ?? [] });
}

// ────────────────────────────────────────────────────────────
// POST /api/workspaces/[workspaceId]/folders — Create folder
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

  const rl = await rateLimit(`workspace_folder_create:${user.id}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify analyst+ role
  const role = await getMemberRole(supabase, workspaceId, user.id);
  if (!role || !ANALYST_ROLES.includes(role)) {
    return NextResponse.json(
      { success: false, error: 'Analyst or higher access required.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  try {
    const body = await parseBodyWithLimit(request);
    const parsed = createFolderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const { name, parent_id, color } = parsed.data;

    // Validate parent_id belongs to the same workspace if provided
    if (parent_id) {
      const { data: parentFolder } = await supabase
        .from('report_folders')
        .select('id')
        .eq('id', parent_id)
        .eq('workspace_id', workspaceId)
        .single();

      if (!parentFolder) {
        return NextResponse.json(
          { success: false, error: 'Parent folder not found in this workspace.' } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }
    }

    const { data: folder, error: createError } = await supabase
      .from('report_folders')
      .insert({
        workspace_id: workspaceId,
        name,
        parent_id: parent_id ?? null,
        color: color ?? null,
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      captureApiError(createError, { route: `/api/workspaces/${workspaceId}/folders`, action: 'create' });
      logger.error('workspace_folder_create_failed', { error: createError.message, workspaceId });
      return NextResponse.json({ success: false, error: 'Failed to create folder.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    logger.info('workspace_folder_created', { workspaceId, folderId: folder.id, userId: user.id });

    return NextResponse.json({ success: true, data: folder } satisfies ApiResponse<ReportFolder>, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }
}

// ────────────────────────────────────────────────────────────
// PATCH /api/workspaces/[workspaceId]/folders — Rename/move folder
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

  const rl = await rateLimit(`workspace_folder_update:${user.id}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify analyst+ role
  const role = await getMemberRole(supabase, workspaceId, user.id);
  if (!role || !ANALYST_ROLES.includes(role)) {
    return NextResponse.json(
      { success: false, error: 'Analyst or higher access required.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  try {
    const body = await parseBodyWithLimit(request);
    const parsed = updateFolderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const { id: folderId, ...fields } = parsed.data;

    // Build update object from defined fields
    const updates: Record<string, unknown> = {};
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.parent_id !== undefined) updates.parent_id = fields.parent_id;
    if (fields.color !== undefined) updates.color = fields.color;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update.' } satisfies ApiResponse<never>, {
        status: 400,
      });
    }

    // Validate parent_id if being changed
    if (updates.parent_id) {
      // Prevent setting parent to self
      if (updates.parent_id === folderId) {
        return NextResponse.json(
          { success: false, error: 'A folder cannot be its own parent.' } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }

      const { data: parentFolder } = await supabase
        .from('report_folders')
        .select('id')
        .eq('id', updates.parent_id as string)
        .eq('workspace_id', workspaceId)
        .single();

      if (!parentFolder) {
        return NextResponse.json(
          { success: false, error: 'Parent folder not found in this workspace.' } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }
    }

    updates.updated_at = new Date().toISOString();

    const { data: folder, error: updateError } = await supabase
      .from('report_folders')
      .update(updates)
      .eq('id', folderId)
      .eq('workspace_id', workspaceId)
      .select()
      .single();

    if (updateError) {
      captureApiError(updateError, { route: `/api/workspaces/${workspaceId}/folders`, action: 'update' });
      logger.error('workspace_folder_update_failed', { error: updateError.message, workspaceId, folderId });
      return NextResponse.json({ success: false, error: 'Failed to update folder.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    if (!folder) {
      return NextResponse.json({ success: false, error: 'Folder not found.' } satisfies ApiResponse<never>, {
        status: 404,
      });
    }

    logger.info('workspace_folder_updated', { workspaceId, folderId, userId: user.id });

    return NextResponse.json({ success: true, data: folder } satisfies ApiResponse<ReportFolder>);
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }
}

// ────────────────────────────────────────────────────────────
// DELETE /api/workspaces/[workspaceId]/folders?folderId=UUID — Delete folder
// ────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest, context: RouteContext) {
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

  const rl = await rateLimit(`workspace_folder_delete:${user.id}`, { limit: 10, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify admin or owner
  const role = await getMemberRole(supabase, workspaceId, user.id);
  if (!role || (role !== 'owner' && role !== 'admin')) {
    return NextResponse.json(
      { success: false, error: 'Admin or owner access required.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId');

  if (!folderId) {
    return NextResponse.json(
      { success: false, error: 'folderId query parameter required.' } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  // Set reports in this folder to folder_id = null
  const { error: reportUpdateError } = await supabase
    .from('reports')
    .update({ folder_id: null })
    .eq('folder_id', folderId)
    .eq('workspace_id', workspaceId);

  if (reportUpdateError) {
    captureApiError(reportUpdateError, { route: `/api/workspaces/${workspaceId}/folders`, action: 'unlink_reports' });
    logger.error('workspace_folder_unlink_reports_failed', { error: reportUpdateError.message, workspaceId, folderId });
  }

  // Delete subfolders (cascade — set their reports to null too)
  const { data: subfolders } = await supabase
    .from('report_folders')
    .select('id')
    .eq('parent_id', folderId)
    .eq('workspace_id', workspaceId);

  for (const sub of subfolders ?? []) {
    await supabase.from('reports').update({ folder_id: null }).eq('folder_id', sub.id).eq('workspace_id', workspaceId);

    await supabase.from('report_folders').delete().eq('id', sub.id).eq('workspace_id', workspaceId);
  }

  // Delete the folder itself
  const { error: deleteError } = await supabase
    .from('report_folders')
    .delete()
    .eq('id', folderId)
    .eq('workspace_id', workspaceId);

  if (deleteError) {
    captureApiError(deleteError, { route: `/api/workspaces/${workspaceId}/folders`, action: 'delete' });
    logger.error('workspace_folder_delete_failed', { error: deleteError.message, workspaceId, folderId });
    return NextResponse.json({ success: false, error: 'Failed to delete folder.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  logger.info('workspace_folder_deleted', { workspaceId, folderId, userId: user.id });

  return NextResponse.json({ success: true });
}
