import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { success: false, error: 'No billing account found.' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/settings/billing`,
    });

    return NextResponse.json({
      success: true,
      data: { url: portalSession.url },
    });
  } catch (err) {
    logger.error('stripe_portal_error', {
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
    });
    captureApiError(err, { route: '/api/stripe/portal' });
    return NextResponse.json(
      { success: false, error: 'Failed to create billing portal session.' },
      { status: 500 }
    );
  }
}
