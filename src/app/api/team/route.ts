import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

// ────────────────────────────────────────────────────────────
// GET /api/team — List team members and pending invitations
// ────────────────────────────────────────────────────────────

export async function GET() {
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

  // Get team members (profiles linked to this user as team owner)
  const { data: members } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at')
    .eq('team_owner_id', user.id);

  // Get pending invitations
  const { data: invitations } = await supabase
    .from('team_invitations')
    .select('id, email, role, status, created_at')
    .eq('inviter_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({
    success: true,
    data: {
      members: members ?? [],
      invitations: invitations ?? [],
    },
  });
}

// ────────────────────────────────────────────────────────────
// POST /api/team — Send a team invitation
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
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

  // Verify user has a team plan
  const { data: sub } = await supabase.from('subscriptions').select('plan').eq('user_id', user.id).single();

  if (!sub || sub.plan !== 'team') {
    return NextResponse.json({ success: false, error: 'Team plan required.' } satisfies ApiResponse<never>, {
      status: 403,
    });
  }

  const body = await request.json();
  const email = body.email?.trim()?.toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, error: 'Valid email address required.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }

  // Don't allow self-invite
  if (email === user.email) {
    return NextResponse.json({ success: false, error: 'You cannot invite yourself.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }

  // Check seat limit (5 seats including owner)
  const { data: existingMembers } = await supabase.from('profiles').select('id').eq('team_owner_id', user.id);

  const { data: pendingInvites } = await supabase
    .from('team_invitations')
    .select('id')
    .eq('inviter_id', user.id)
    .eq('status', 'pending');

  const totalSeats = 1 + (existingMembers?.length ?? 0) + (pendingInvites?.length ?? 0);
  if (totalSeats >= 5) {
    return NextResponse.json(
      {
        success: false,
        error: 'Team seat limit reached (5 seats). Remove a member to invite someone new.',
      } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  // Check if already invited
  const { data: existing } = await supabase
    .from('team_invitations')
    .select('id, status')
    .eq('inviter_id', user.id)
    .eq('email', email)
    .single();

  if (existing && existing.status === 'pending') {
    return NextResponse.json(
      { success: false, error: 'This email has already been invited.' } satisfies ApiResponse<never>,
      { status: 409 },
    );
  }

  // Upsert invitation (handles re-inviting after revoke)
  if (existing) {
    await supabase
      .from('team_invitations')
      .update({ status: 'pending', accepted_at: null, created_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    const { error } = await supabase.from('team_invitations').insert({ inviter_id: user.id, email, role: 'member' });

    if (error) {
      logger.error('team_invite_insert_failed', { error: error.message, email });
      return NextResponse.json({ success: false, error: 'Failed to create invitation.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }
  }

  // Check if user already exists — auto-link them
  const { data: existingProfile } = await supabase.from('profiles').select('id, email').eq('email', email).single();

  if (existingProfile) {
    // User exists — link them to the team immediately
    await supabase.from('profiles').update({ team_owner_id: user.id }).eq('id', existingProfile.id);

    await supabase
      .from('team_invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('inviter_id', user.id)
      .eq('email', email);

    logger.info('team_member_auto_linked', { inviter: user.id, member: existingProfile.id });
  } else {
    // Send invite email (fire and forget)
    (async () => {
      try {
        const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).single();

        const { sendEmail } = await import('@/lib/email');
        const { TeamInviteEmail } = await import('@/emails/TeamInviteEmail');

        await sendEmail({
          to: email,
          subject: `${profile?.full_name || profile?.email || 'Your colleague'} invited you to Terrain`,
          react: TeamInviteEmail({
            inviterName: (profile?.full_name as string) || '',
            inviterEmail: (profile?.email as string) || user.email || '',
          }),
          tags: [{ name: 'type', value: 'team_invite' }],
        });
      } catch (emailErr) {
        logger.error('team_invite_email_failed', {
          error: emailErr instanceof Error ? emailErr.message : String(emailErr),
        });
      }
    })();
  }

  return NextResponse.json({ success: true, data: { email, autoLinked: !!existingProfile } });
}

// ────────────────────────────────────────────────────────────
// DELETE /api/team — Remove a member or revoke an invitation
// ────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get('memberId');
  const invitationId = searchParams.get('invitationId');

  if (memberId) {
    // Remove a team member — unlink from team
    const { error } = await supabase
      .from('profiles')
      .update({ team_owner_id: null })
      .eq('id', memberId)
      .eq('team_owner_id', user.id); // Ensure they belong to this team

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to remove member.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    // Also update the invitation status
    const { data: memberProfile } = await supabase.from('profiles').select('email').eq('id', memberId).single();

    if (memberProfile) {
      await supabase
        .from('team_invitations')
        .update({ status: 'revoked' })
        .eq('inviter_id', user.id)
        .eq('email', memberProfile.email as string);
    }

    logger.info('team_member_removed', { owner: user.id, member: memberId });
    return NextResponse.json({ success: true });
  }

  if (invitationId) {
    // Revoke a pending invitation
    const { error } = await supabase
      .from('team_invitations')
      .update({ status: 'revoked' })
      .eq('id', invitationId)
      .eq('inviter_id', user.id)
      .eq('status', 'pending');

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to revoke invitation.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    logger.info('team_invite_revoked', { owner: user.id, invitation: invitationId });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { success: false, error: 'memberId or invitationId required.' } satisfies ApiResponse<never>,
    { status: 400 },
  );
}
