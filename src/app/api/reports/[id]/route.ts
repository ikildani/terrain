import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  is_starred: z.boolean().optional(),
  status: z.enum(['draft', 'final']).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
  }

  const rateLimitResult = await rateLimit(`report_id:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
  if (!rateLimitResult.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Check ownership first
  const { data: ownReport } = await supabase.from('reports').select('*').eq('id', id).eq('user_id', user.id).single();

  if (ownReport) {
    return NextResponse.json({ success: true, data: ownReport });
  }

  // Check shared access (RLS also enforces this, but explicit check for clarity)
  const { data: share } = await supabase
    .from('report_shares')
    .select('permission')
    .eq('report_id', id)
    .eq('shared_with_user_id', user.id)
    .single();

  if (share) {
    const { data: sharedReport } = await supabase.from('reports').select('*').eq('id', id).single();

    if (sharedReport) {
      return NextResponse.json({ success: true, data: sharedReport });
    }
  }

  return NextResponse.json({ success: false, error: 'Report not found.' }, { status: 404 });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
  }

  const rateLimitResultDel = await rateLimit(`report_id:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
  if (!rateLimitResultDel.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { error } = await supabase.from('reports').delete().eq('id', id).eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ success: false, error: 'Report not found or already deleted.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
  }

  const rateLimitResultPatch = await rateLimit(`report_id:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
  if (!rateLimitResultPatch.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.' }, { status: 400 });
    }

    const updates = { ...parsed.data, updated_at: new Date().toISOString() };

    const { data: report, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !report) {
      return NextResponse.json({ success: false, error: 'Report not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: report });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
  }
}
