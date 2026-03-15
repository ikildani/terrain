import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { checkEnterpriseSignals } from '@/lib/enterprise-signals';
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
// GET /api/workspaces/[workspaceId]/enterprise-signals
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

  // Rate limit: 10/min — this endpoint is cached client-side and not called frequently
  const rl = await rateLimit(`enterprise_signals:${user.id}`, { limit: 10, windowMs: 60 * 1000 });
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

  try {
    // Check if workspace is already on enterprise — if so, no nudge needed
    const admin = createAdminClient();
    const { data: workspace } = await admin.from('workspaces').select('plan').eq('id', workspaceId).single();

    if (workspace?.plan === 'enterprise') {
      return NextResponse.json({
        success: true,
        data: {
          shouldNudge: false,
          reason: null,
          signals: {
            highMemberCount: false,
            frequentExports: false,
            multipleRolesNeeded: false,
            highApiPotential: false,
            complianceNeeds: false,
          },
        },
      });
    }

    // Only compute signals for team-plan workspaces
    if (workspace?.plan !== 'team' && workspace?.plan !== 'enterprise') {
      return NextResponse.json({
        success: true,
        data: {
          shouldNudge: false,
          reason: null,
          signals: {
            highMemberCount: false,
            frequentExports: false,
            multipleRolesNeeded: false,
            highApiPotential: false,
            complianceNeeds: false,
          },
        },
      });
    }

    const signal = await checkEnterpriseSignals(workspaceId);

    return NextResponse.json({ success: true, data: signal });
  } catch (err) {
    captureApiError(err, {
      route: `/api/workspaces/${workspaceId}/enterprise-signals`,
      action: 'check',
    });
    logger.error('enterprise_signals_error', {
      error: err instanceof Error ? err.message : String(err),
      workspaceId,
    });
    return NextResponse.json({ success: false, error: 'Internal server error.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}
