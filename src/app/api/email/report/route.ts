import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import { ReportEmail } from '@/emails/ReportEmail';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResult = await rateLimit(`email_report:${user.id}`, { limit: 10, windowMs: 3600 * 1000 });
  if (!rateLimitResult.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: { reportTitle?: string; reportSubtitle?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { reportTitle, reportSubtitle } = body;

  if (!reportTitle) {
    return NextResponse.json({ success: false, error: 'reportTitle is required' }, { status: 400 });
  }

  const userName = (user.user_metadata?.full_name as string) || '';

  const result = await sendEmail({
    to: user.email,
    subject: `Your Terrain report: ${reportTitle}`,
    react: ReportEmail({
      userName,
      reportTitle,
      reportSubtitle,
      reportUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://terrain.ambrosiaventures.co'}/reports`,
    }),
    tags: [{ name: 'type', value: 'report_email' }],
  });

  if (!result.success) {
    logger.error('report_email_failed', {
      userId: user.id,
      reportTitle,
      error: result.error,
    });
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
