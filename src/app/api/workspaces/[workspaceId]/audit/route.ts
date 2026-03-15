import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse, AuditEntry, WorkspaceRole } from '@/types';

type RouteContext = { params: Promise<{ workspaceId: string }> };

const QuerySchema = z.object({
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
  user_id: z.string().uuid().optional(),
  action: z.string().optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

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

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function entriesToCSV(entries: AuditEntry[]): string {
  const headers = ['Time', 'User', 'Email', 'Action', 'Resource Type', 'Resource ID', 'IP Address', 'Details'];
  const rows = entries.map((e) => [
    e.created_at,
    e.user_name ?? '',
    e.user_email ?? '',
    e.action,
    e.resource_type ?? '',
    e.resource_id ?? '',
    e.ip_address ?? '',
    JSON.stringify(e.metadata ?? {}),
  ]);

  return [headers.join(','), ...rows.map((row) => row.map(escapeCSV).join(','))].join('\n');
}

// ────────────────────────────────────────────────────────────
// GET /api/workspaces/[workspaceId]/audit
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

  const rl = await rateLimit(`audit_log:${user.id}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify membership — owner or admin only
  const role = await getMemberRole(supabase, workspaceId, user.id);
  if (!role) {
    return NextResponse.json({ success: false, error: 'Workspace not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  if (role !== 'owner' && role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Permission denied. Owner or admin access required.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  // Verify enterprise plan
  const admin = createAdminClient();
  const { data: workspace } = await admin.from('workspaces').select('plan').eq('id', workspaceId).single();

  if (!workspace || workspace.plan !== 'enterprise') {
    return NextResponse.json(
      { success: false, error: 'Enterprise plan required for audit log access.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  try {
    // Parse query params
    const url = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      limit: url.searchParams.get('limit') ?? undefined,
      offset: url.searchParams.get('offset') ?? undefined,
      user_id: url.searchParams.get('user_id') ?? undefined,
      action: url.searchParams.get('action') ?? undefined,
      from: url.searchParams.get('from') ?? undefined,
      to: url.searchParams.get('to') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid query parameters.' } satisfies ApiResponse<never>, {
        status: 400,
      });
    }

    const { limit, offset, user_id, action, from, to } = parsed.data;

    // Build query
    let query = admin
      .from('audit_log')
      .select('*, profiles!audit_log_user_id_fkey(full_name, email)', { count: 'exact' })
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (from) {
      query = query.gte('created_at', from);
    }
    if (to) {
      query = query.lte('created_at', to);
    }

    const { data: entries, count, error } = await query;

    if (error) {
      throw error;
    }

    // Map entries with joined profile data
    const mapped: AuditEntry[] = (entries ?? []).map((e) => {
      const profile = e.profiles as unknown as { full_name: string | null; email: string } | null;
      return {
        id: e.id,
        workspace_id: e.workspace_id,
        user_id: e.user_id,
        action: e.action,
        resource_type: e.resource_type,
        resource_id: e.resource_id,
        ip_address: e.ip_address,
        user_agent: e.user_agent,
        old_value: e.old_value,
        new_value: e.new_value,
        metadata: e.metadata ?? {},
        created_at: e.created_at,
        user_name: profile?.full_name ?? undefined,
        user_email: profile?.email ?? undefined,
      };
    });

    // Check if CSV export was requested
    const acceptHeader = request.headers.get('accept') ?? '';
    if (acceptHeader.includes('text/csv')) {
      const csv = entriesToCSV(mapped);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="audit-log-${workspaceId}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: { entries: mapped, total: count ?? 0 },
    } satisfies ApiResponse<{ entries: AuditEntry[]; total: number }>);
  } catch (err) {
    captureApiError(err, { route: `/api/workspaces/${workspaceId}/audit`, action: 'get' });
    logger.error('audit_log_fetch_failed', {
      error: err instanceof Error ? err.message : String(err),
      workspaceId,
    });
    return NextResponse.json({ success: false, error: 'Failed to fetch audit log.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}
