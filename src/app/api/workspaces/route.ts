import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { parseBodyWithLimit } from '@/lib/api/parse-body';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse, Workspace } from '@/types';

const MAX_WORKSPACES: Record<string, number> = { team: 1, enterprise: 3 };

const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  slug: z
    .string()
    .trim()
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
});

// ────────────────────────────────────────────────────────────
// GET /api/workspaces — List user's workspaces (with member count)
// ────────────────────────────────────────────────────────────

export async function GET() {
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

  const rl = await rateLimit(`workspaces:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Get workspace IDs user is a member of
  const { data: memberships, error: memberError } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id);

  if (memberError) {
    captureApiError(memberError, { route: '/api/workspaces', action: 'list_memberships' });
    logger.error('workspaces_list_memberships_failed', { error: memberError.message });
    return NextResponse.json({ success: false, error: 'Failed to fetch workspaces.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  if (!memberships || memberships.length === 0) {
    return NextResponse.json({ success: true, data: [] } satisfies ApiResponse<Workspace[]>);
  }

  const workspaceIds = memberships.map((m) => m.workspace_id);

  // Fetch full workspace data
  const { data: workspaces, error: wsError } = await supabase
    .from('workspaces')
    .select('*')
    .in('id', workspaceIds)
    .order('created_at', { ascending: false });

  if (wsError) {
    captureApiError(wsError, { route: '/api/workspaces', action: 'list_workspaces' });
    logger.error('workspaces_list_failed', { error: wsError.message });
    return NextResponse.json({ success: false, error: 'Failed to fetch workspaces.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  // Get member counts per workspace
  const { data: memberCounts } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .in('workspace_id', workspaceIds);

  const countMap = new Map<string, number>();
  for (const mc of memberCounts ?? []) {
    countMap.set(mc.workspace_id, (countMap.get(mc.workspace_id) ?? 0) + 1);
  }

  const enriched = (workspaces ?? []).map((ws) => ({
    ...ws,
    member_count: countMap.get(ws.id) ?? 0,
  }));

  return NextResponse.json({ success: true, data: enriched });
}

// ────────────────────────────────────────────────────────────
// POST /api/workspaces — Create a workspace
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
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

  const rl = await rateLimit(`workspace_create:${user.id}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'Too many workspace creations. Try again later.' } satisfies ApiResponse<never>,
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  try {
    const body = await parseBodyWithLimit(request);
    const parsed = createWorkspaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const { name, slug: rawSlug } = parsed.data;

    // Check subscription — must be team or enterprise
    const { data: sub } = await supabase.from('subscriptions').select('plan').eq('user_id', user.id).single();

    if (!sub || (sub.plan !== 'team' && sub.plan !== 'enterprise')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Team or Enterprise plan required to create workspaces.',
        } satisfies ApiResponse<never>,
        { status: 403 },
      );
    }

    // Check workspace count limit
    const maxAllowed = MAX_WORKSPACES[sub.plan] ?? 1;

    const { data: existingWorkspaces } = await supabase.from('workspaces').select('id').eq('owner_id', user.id);

    if ((existingWorkspaces?.length ?? 0) >= maxAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Workspace limit reached (${maxAllowed} for ${sub.plan} plan).`,
        } satisfies ApiResponse<never>,
        { status: 403 },
      );
    }

    // Generate slug if not provided
    const slug =
      rawSlug ??
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Determine max seats based on plan
    const maxSeats = sub.plan === 'enterprise' ? 25 : 5;

    // Create workspace
    const { data: workspace, error: createError } = await supabase
      .from('workspaces')
      .insert({
        name,
        slug,
        owner_id: user.id,
        plan: sub.plan as 'team' | 'enterprise',
        max_seats: maxSeats,
        settings: {},
      })
      .select()
      .single();

    if (createError) {
      captureApiError(createError, { route: '/api/workspaces', action: 'create' });
      logger.error('workspace_create_failed', { error: createError.message, userId: user.id });
      return NextResponse.json({ success: false, error: 'Failed to create workspace.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    // Auto-add creator as owner member
    const { error: memberError } = await supabase.from('workspace_members').insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: 'owner',
      invited_by: null,
    });

    if (memberError) {
      captureApiError(memberError, { route: '/api/workspaces', action: 'add_owner_member' });
      logger.error('workspace_add_owner_failed', { error: memberError.message, workspaceId: workspace.id });
    }

    logger.info('workspace_created', { workspaceId: workspace.id, userId: user.id, plan: sub.plan });

    return NextResponse.json({ success: true, data: workspace } satisfies ApiResponse<Workspace>, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }
}
