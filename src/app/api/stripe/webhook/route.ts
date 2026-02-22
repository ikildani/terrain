import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';

// ────────────────────────────────────────────────────────────
// SERVICE-ROLE CLIENT (no user session in webhooks)
// ────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────
// IDEMPOTENCY — Deduplicate events by Stripe event ID
// In-memory set with TTL. Stripe retries events for up to 72h,
// but we only need to dedup within a reasonable window.
// ────────────────────────────────────────────────────────────

const processedEvents = new Map<string, number>();
const DEDUP_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function isDuplicate(eventId: string): boolean {
  const now = Date.now();

  // Periodic cleanup — remove entries older than TTL
  if (processedEvents.size > 1000) {
    processedEvents.forEach((timestamp, key) => {
      if (now - timestamp > DEDUP_TTL_MS) processedEvents.delete(key);
    });
  }

  if (processedEvents.has(eventId)) return true;
  processedEvents.set(eventId, now);
  return false;
}

// ────────────────────────────────────────────────────────────
// SUBSCRIPTION UPSERT
// ────────────────────────────────────────────────────────────

async function upsertSubscription(
  supabase: ReturnType<typeof createServiceClient>,
  stripeSubscription: Stripe.Subscription
) {
  const userId = stripeSubscription.metadata?.supabase_user_id;
  if (!userId) {
    logger.warn('webhook_missing_user_id', {
      stripe_subscription_id: stripeSubscription.id,
      customer: stripeSubscription.customer,
    });
    return;
  }

  const planItem = stripeSubscription.items.data[0];
  const priceId = planItem?.price?.id;

  let plan: 'free' | 'pro' | 'team' = 'free';
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = 'pro';
  if (priceId === process.env.STRIPE_TEAM_PRICE_ID) plan = 'team';

  const { error } = await supabase
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

  if (error) {
    throw new Error(`Supabase upsert failed for user ${userId}: ${error.message}`);
  }

  logger.info('webhook_subscription_upserted', { userId, plan, status: stripeSubscription.status });
}

// ────────────────────────────────────────────────────────────
// POST /api/stripe/webhook
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const routeStart = performance.now();
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header.' },
      { status: 400 }
    );
  }

  // ── Signature verification ─────────────────────────────────
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    logger.error('webhook_signature_failed', {
      error: err instanceof Error ? err.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  // ── Idempotency check ──────────────────────────────────────
  if (isDuplicate(event.id)) {
    logger.info('webhook_duplicate_skipped', { eventId: event.id, type: event.type });
    return NextResponse.json({ received: true, duplicate: true });
  }

  logger.info('webhook_received', { eventId: event.id, type: event.type });

  // ── Handle event ───────────────────────────────────────────
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
          const { error } = await supabase
            .from('subscriptions')
            .update({
              plan: 'free',
              status: 'canceled',
              stripe_subscription_id: null,
              cancel_at_period_end: false,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          if (error) {
            throw new Error(`Subscription downgrade failed for user ${userId}: ${error.message}`);
          }
          logger.info('webhook_subscription_canceled', { userId });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          throw new Error(`Payment failed update failed for customer ${customerId}: ${error.message}`);
        }
        logger.warn('webhook_payment_failed', { customerId, invoiceId: invoice.id });
        break;
      }
      default:
        logger.info('webhook_unhandled_event', { type: event.type });
        break;
    }
  } catch (err) {
    // CRITICAL: Return 500 so Stripe will retry the event.
    // Stripe retries with exponential backoff over 72 hours.
    const message = err instanceof Error ? err.message : 'Webhook handler failed';
    logger.error('webhook_handler_error', {
      error: message,
      stack: err instanceof Error ? err.stack : undefined,
      eventId: event.id,
      eventType: event.type,
      durationMs: Math.round(performance.now() - routeStart),
    });
    captureApiError(err, {
      route: '/api/stripe/webhook',
      eventId: event.id,
      eventType: event.type,
    });

    // Remove from dedup set so retries can be processed
    processedEvents.delete(event.id);

    return NextResponse.json(
      { error: 'Webhook handler failed.' },
      { status: 500 }
    );
  }

  logger.info('webhook_processed', {
    eventId: event.id,
    type: event.type,
    durationMs: Math.round(performance.now() - routeStart),
  });

  return NextResponse.json({ received: true });
}
