import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

// Service-role client for webhook (no user session available)
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

async function upsertSubscription(
  supabase: ReturnType<typeof createServiceClient>,
  stripeSubscription: Stripe.Subscription
) {
  const userId = stripeSubscription.metadata?.supabase_user_id;
  if (!userId) return;

  const planItem = stripeSubscription.items.data[0];
  const priceId = planItem?.price?.id;

  let plan: 'free' | 'pro' | 'team' = 'free';
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = 'pro';
  if (priceId === process.env.STRIPE_TEAM_PRICE_ID) plan = 'team';

  await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: stripeSubscription.id,
      stripe_customer_id: stripeSubscription.customer as string,
      plan,
      status: stripeSubscription.status,
      current_period_start: new Date(
        stripeSubscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        stripeSubscription.current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header.' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription(supabase, sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (userId) {
          await supabase
            .from('subscriptions')
            .update({
              plan: 'free',
              status: 'canceled',
              stripe_subscription_id: null,
              cancel_at_period_end: false,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
