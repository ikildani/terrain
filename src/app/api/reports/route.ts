import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { logBusinessEvent } from '@/lib/logger';

const createReportSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title too long'),
  report_type: z.enum(['market_sizing', 'competitive', 'partners', 'regulatory', 'full']),
  indication: z.string().trim().min(1, 'Indication is required').max(500, 'Indication too long'),
  inputs: z.record(z.unknown()).optional(),
  outputs: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  workspace_id: z.string().uuid().optional(),
  folder_id: z.string().uuid().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
  }

  const rateLimitResult = await rateLimit(`reports:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
  if (!rateLimitResult.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Fetch personal reports + workspace reports (RLS handles access control)
  const { data: reports, error } = await supabase
    .from('reports')
    .select(
      'id, title, report_type, indication, status, is_starred, tags, workspace_id, folder_id, created_at, updated_at',
    )
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch reports.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: reports });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
  }

  const rateLimitResult = await rateLimit(`reports_post:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
  if (!rateLimitResult.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = createReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.' }, { status: 400 });
    }

    const { title, report_type, indication, inputs, outputs, tags, workspace_id, folder_id } = parsed.data;

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        title,
        report_type,
        indication,
        inputs: inputs ?? {},
        outputs: outputs ?? {},
        tags: tags ?? [],
        status: 'draft',
        is_starred: false,
        workspace_id: workspace_id ?? null,
        folder_id: folder_id ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to save report.' }, { status: 500 });
    }

    logBusinessEvent('report_saved', { userId: user.id, report_type: body.report_type });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
  }
}
