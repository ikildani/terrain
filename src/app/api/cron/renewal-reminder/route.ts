import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sendEmail } from '@/lib/email';
import { RenewalReminderEmail } from '@/emails/RenewalReminderEmail';
import { logger } from '@/lib/logger';
import { timingSafeEqual } from 'crypto';

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    }
  );
}

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !authHeader) return false;

  const token = authHeader.replace('Bearer ', '');

  try {
    const a = Buffer.from(token);
    const b = Buffer.from(cronSecret);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Find subscriptions renewing in the next 7 days
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('user_id, plan, current_period_end, stripe_subscription_id')
    .eq('status', 'active')
    .eq('cancel_at_period_end', false)
    .neq('plan', 'free')
    .gte('current_period_end', now.toISOString())
    .lte('current_period_end', sevenDaysFromNow.toISOString());

  if (error) {
    logger.error('renewal_reminder_query_failed', { error: error.message });
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    logger.info('renewal_reminder_none_found');
    return NextResponse.json({ success: true, sent: 0 });
  }

  let sent = 0;

  for (const sub of subscriptions) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', sub.user_id)
        .single();

      if (!profile?.email) continue;

      const planName = sub.plan === 'team' ? 'Team' : 'Pro';
      const amount = sub.plan === 'team' ? '$499/mo' : '$149/mo';
      const renewalDate = new Date(sub.current_period_end).toLocaleDateString(
        'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      );

      await sendEmail({
        to: profile.email as string,
        subject: `Your Terrain ${planName} plan renews on ${renewalDate}`,
        react: RenewalReminderEmail({
          userName: (profile.full_name as string) || '',
          planName,
          renewalDate,
          amount,
        }),
        tags: [{ name: 'type', value: 'renewal_reminder' }],
      });

      sent++;
    } catch (err) {
      logger.error('renewal_reminder_email_failed', {
        userId: sub.user_id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info('renewal_reminder_complete', {
    total: subscriptions.length,
    sent,
  });

  return NextResponse.json({ success: true, sent });
}
