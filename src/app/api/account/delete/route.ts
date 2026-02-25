import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

const DELETE_RATE_LIMIT = { limit: 3, windowMs: 24 * 60 * 60 * 1000 } as const; // 3 per day

export async function POST() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit deletion attempts per user
  const rl = await rateLimit(`account_delete:${user.id}`, DELETE_RATE_LIMIT);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'Too many deletion attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  // Cancel any active Stripe subscription and delete customer before deleting DB records
  try {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subscription?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
        logger.info('account_delete_subscription_cancelled', {
          userId: user.id,
          subscriptionId: subscription.stripe_subscription_id,
        });
      } catch (stripeErr) {
        // Log but don't block deletion — subscription may already be cancelled
        logger.warn('account_delete_subscription_cancel_failed', {
          userId: user.id,
          error: stripeErr instanceof Error ? stripeErr.message : String(stripeErr),
        });
      }
    }

    if (subscription?.stripe_customer_id) {
      try {
        await stripe.customers.del(subscription.stripe_customer_id);
        logger.info('account_delete_stripe_customer_deleted', {
          userId: user.id,
          customerId: subscription.stripe_customer_id,
        });
      } catch (stripeErr) {
        logger.warn('account_delete_stripe_customer_delete_failed', {
          userId: user.id,
          error: stripeErr instanceof Error ? stripeErr.message : String(stripeErr),
        });
      }
    }
  } catch {
    // No subscription row — that's fine, continue with account deletion
  }

  // Use service role to delete user (cascade deletes profile, subscription, reports)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
  }

  const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);

  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete account' }, { status: 500 });
  }

  logger.info('account_deleted', { userId: user.id });

  return NextResponse.json({ success: true });
}
