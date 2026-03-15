import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { parseBodyWithLimit } from '@/lib/api/parse-body';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse, WorkspaceRole } from '@/types';

const addMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email('Valid email address required.'),
  role: z.enum(['admin', 'analyst', 'viewer']).optional().default('viewer'),
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
// GET /api/workspaces/[workspaceId]/members — List members with profiles
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

  const rl = await rateLimit(`workspace_members:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
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

  const { data: members, error: membersError } = await supabase
    .from('workspace_members')
    .select('id, workspace_id, user_id, role, joined_at, invited_by, profiles(email, full_name)')
    .eq('workspace_id', workspaceId)
    .order('joined_at', { ascending: true });

  if (membersError) {
    captureApiError(membersError, { route: `/api/workspaces/${workspaceId}/members`, action: 'list' });
    logger.error('workspace_members_list_failed', { error: membersError.message, workspaceId });
    return NextResponse.json({ success: false, error: 'Failed to fetch members.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

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

  return NextResponse.json({ success: true, data: flatMembers });
}

// ────────────────────────────────────────────────────────────
// POST /api/workspaces/[workspaceId]/members — Invite/add member
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

  const rl = await rateLimit(`workspace_invite:${user.id}`, { limit: 10, windowMs: 60 * 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'Too many invitations. Try again later.' } satisfies ApiResponse<never>,
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  // Verify owner or admin role
  const callerRole = await getMemberRole(supabase, workspaceId, user.id);
  if (!callerRole || (callerRole !== 'owner' && callerRole !== 'admin')) {
    return NextResponse.json(
      { success: false, error: 'Admin or owner access required.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
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

    const { email, role } = parsed.data;

    // Prevent self-invite
    if (email === user.email) {
      return NextResponse.json({ success: false, error: 'You cannot invite yourself.' } satisfies ApiResponse<never>, {
        status: 400,
      });
    }

    // Check seat limit
    const { data: workspace } = await supabase.from('workspaces').select('max_seats').eq('id', workspaceId).single();

    if (!workspace) {
      return NextResponse.json({ success: false, error: 'Workspace not found.' } satisfies ApiResponse<never>, {
        status: 404,
      });
    }

    const { data: currentMembers } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId);

    const { data: pendingInvites } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending');

    const totalSeats = (currentMembers?.length ?? 0) + (pendingInvites?.length ?? 0);
    if (totalSeats >= workspace.max_seats) {
      return NextResponse.json(
        {
          success: false,
          error: `Seat limit reached (${workspace.max_seats} seats). Remove a member to invite someone new.`,
        } satisfies ApiResponse<never>,
        { status: 403 },
      );
    }

    // Check for duplicate member
    const adminClient = createAdminClient();
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingProfile) {
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', existingProfile.id)
        .single();

      if (existingMember) {
        return NextResponse.json(
          { success: false, error: 'This user is already a member of this workspace.' } satisfies ApiResponse<never>,
          { status: 409 },
        );
      }

      // User exists — add directly to workspace_members
      const { error: insertError } = await supabase.from('workspace_members').insert({
        workspace_id: workspaceId,
        user_id: existingProfile.id,
        role,
        invited_by: user.id,
      });

      if (insertError) {
        captureApiError(insertError, { route: `/api/workspaces/${workspaceId}/members`, action: 'add_member' });
        logger.error('workspace_add_member_failed', { error: insertError.message, workspaceId });
        return NextResponse.json({ success: false, error: 'Failed to add member.' } satisfies ApiResponse<never>, {
          status: 500,
        });
      }

      logger.info('workspace_member_added', { workspaceId, userId: existingProfile.id, role, invitedBy: user.id });

      return NextResponse.json({ success: true, data: { email, added: true } }, { status: 201 });
    }

    // User does not exist — check for duplicate pending invitation
    const { data: existingInvite } = await supabase
      .from('team_invitations')
      .select('id, status')
      .eq('workspace_id', workspaceId)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { success: false, error: 'This email has already been invited.' } satisfies ApiResponse<never>,
        { status: 409 },
      );
    }

    // Create invitation record
    const { error: inviteError } = await supabase.from('team_invitations').insert({
      inviter_id: user.id,
      email,
      role,
      workspace_id: workspaceId,
    });

    if (inviteError) {
      captureApiError(inviteError, { route: `/api/workspaces/${workspaceId}/members`, action: 'create_invite' });
      logger.error('workspace_invite_create_failed', { error: inviteError.message, workspaceId, email });
      return NextResponse.json({ success: false, error: 'Failed to create invitation.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    // Send invite email
    try {
      const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).single();
      const inviterName = String(profile?.full_name || '').slice(0, 100);
      const inviterEmail = String(profile?.email || user.email || '').slice(0, 200);

      const { sendEmail } = await import('@/lib/email');
      const { TeamInviteEmail } = await import('@/emails/TeamInviteEmail');

      await sendEmail({
        to: email,
        subject: `${inviterName || inviterEmail || 'Your colleague'} invited you to a Terrain workspace`,
        react: TeamInviteEmail({ inviterName, inviterEmail }),
        tags: [{ name: 'type', value: 'workspace_invite' }],
      });
    } catch (emailErr) {
      captureApiError(emailErr, { route: `/api/workspaces/${workspaceId}/members`, action: 'invite_email' });
      logger.error('workspace_invite_email_failed', {
        error: emailErr instanceof Error ? emailErr.message : String(emailErr),
      });
    }

    logger.info('workspace_invite_sent', { workspaceId, email, role, invitedBy: user.id });

    return NextResponse.json({ success: true, data: { email, invited: true } }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }
}

// ────────────────────────────────────────────────────────────
// DELETE /api/workspaces/[workspaceId]/members?memberId=UUID — Remove member
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

  const rl = await rateLimit(`workspace_member_delete:${user.id}`, { limit: 20, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify owner or admin role
  const callerRole = await getMemberRole(supabase, workspaceId, user.id);
  if (!callerRole || (callerRole !== 'owner' && callerRole !== 'admin')) {
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

  // Fetch the target member to verify they exist and are not the owner
  const { data: targetMember } = await supabase
    .from('workspace_members')
    .select('id, user_id, role')
    .eq('id', memberId)
    .eq('workspace_id', workspaceId)
    .single();

  if (!targetMember) {
    return NextResponse.json({ success: false, error: 'Member not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  if (targetMember.role === 'owner') {
    return NextResponse.json(
      { success: false, error: 'Cannot remove the workspace owner.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  const { error: deleteError } = await supabase
    .from('workspace_members')
    .delete()
    .eq('id', memberId)
    .eq('workspace_id', workspaceId);

  if (deleteError) {
    captureApiError(deleteError, { route: `/api/workspaces/${workspaceId}/members`, action: 'remove' });
    logger.error('workspace_member_remove_failed', { error: deleteError.message, workspaceId, memberId });
    return NextResponse.json({ success: false, error: 'Failed to remove member.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  logger.info('workspace_member_removed', { workspaceId, memberId, removedBy: user.id });

  return NextResponse.json({ success: true });
}

// ────────────────────────────────────────────────────────────
// PATCH /api/workspaces/[workspaceId]/members — Update member role
// ────────────────────────────────────────────────────────────

const updateRoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(['admin', 'analyst', 'viewer']),
});

const ROLE_HIERARCHY: Record<string, number> = { owner: 4, admin: 3, analyst: 2, viewer: 1 };

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

  const rl = await rateLimit(`workspace_member_patch:${user.id}`, { limit: 20, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify caller is owner or admin
  const callerRole = await getMemberRole(supabase, workspaceId, user.id);
  if (!callerRole || (callerRole !== 'owner' && callerRole !== 'admin')) {
    return NextResponse.json(
      { success: false, error: 'Admin or owner access required.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await parseBodyWithLimit(request);
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }

  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid input.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }

  const { memberId, role: newRole } = parsed.data;

  // Fetch target member
  const { data: target } = await supabase
    .from('workspace_members')
    .select('id, user_id, role')
    .eq('id', memberId)
    .eq('workspace_id', workspaceId)
    .single();

  if (!target) {
    return NextResponse.json({ success: false, error: 'Member not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  // Cannot change owner's role
  if (target.role === 'owner') {
    return NextResponse.json({ success: false, error: 'Cannot change the owner role.' } satisfies ApiResponse<never>, {
      status: 403,
    });
  }

  // Caller can only assign roles below their own level
  if ((ROLE_HIERARCHY[newRole] ?? 0) >= (ROLE_HIERARCHY[callerRole] ?? 0)) {
    return NextResponse.json(
      { success: false, error: 'Cannot assign a role equal to or above your own.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  const { error: updateError } = await supabase
    .from('workspace_members')
    .update({ role: newRole })
    .eq('id', memberId)
    .eq('workspace_id', workspaceId);

  if (updateError) {
    captureApiError(updateError, { route: `/api/workspaces/${workspaceId}/members`, action: 'update_role' });
    logger.error('workspace_member_role_update_failed', { error: updateError.message, workspaceId, memberId });
    return NextResponse.json({ success: false, error: 'Failed to update role.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  logger.info('workspace_member_role_updated', { workspaceId, memberId, newRole, updatedBy: user.id });

  return NextResponse.json({ success: true, data: { memberId, role: newRole } });
}
