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
});

export async function GET() {
  const supabase = createClient();
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

  const { data: reports, error } = await supabase
    .from('reports')
    .select('id, title, report_type, indication, status, is_starred, tags, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch reports.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: reports });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
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

    const { title, report_type, indication, inputs, outputs, tags } = parsed.data;

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
