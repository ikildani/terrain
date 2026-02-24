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
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get: () => undefined,
      set: () => {},
      remove: () => {},
    },
  });
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
  stripeSubscription: Stripe.Subscription,
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
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
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
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  // ── Signature verification ─────────────────────────────────
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
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
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription(supabase, sub);

        // Send subscription confirmation email (non-blocking)
        const createdUserId = sub.metadata?.supabase_user_id;
        if (createdUserId) {
          (async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('email, full_name')
                .eq('id', createdUserId)
                .single();

              if (profile?.email) {
                const planItem = sub.items.data[0];
                const priceId = planItem?.price?.id;
                const planName = priceId === process.env.STRIPE_TEAM_PRICE_ID ? 'Team' : 'Pro';
                const price = planName === 'Team' ? '$499' : '$149';

                const { sendEmail } = await import('@/lib/email');
                const { SubscriptionConfirmationEmail } = await import('@/emails/SubscriptionConfirmationEmail');

                await sendEmail({
                  to: profile.email as string,
                  subject: `Your Terrain ${planName} plan is active`,
                  react: SubscriptionConfirmationEmail({
                    userName: (profile.full_name as string) || '',
                    planName,
                    price,
                    nextBillingDate: new Date(sub.current_period_end * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }),
                  }),
                  tags: [{ name: 'type', value: 'subscription_confirmation' }],
                });
              }
            } catch (emailErr) {
              logger.error('subscription_email_failed', {
                userId: createdUserId,
                error: emailErr instanceof Error ? emailErr.message : String(emailErr),
              });
            }
          })();
        }
        break;
      }
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

          // Send cancellation email (non-blocking)
          (async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('email, full_name')
                .eq('id', userId)
                .single();

              if (profile?.email) {
                const planItem = sub.items.data[0];
                const priceId = planItem?.price?.id;
                const cancelledPlanName = priceId === process.env.STRIPE_TEAM_PRICE_ID ? 'Team' : 'Pro';

                const { sendEmail } = await import('@/lib/email');
                const { CancellationConfirmationEmail } = await import('@/emails/CancellationConfirmationEmail');

                await sendEmail({
                  to: profile.email as string,
                  subject: 'Your Terrain subscription has been cancelled',
                  react: CancellationConfirmationEmail({
                    userName: (profile.full_name as string) || '',
                    planName: cancelledPlanName,
                    accessEndDate: sub.current_period_end
                      ? new Date(sub.current_period_end * 1000).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'immediately',
                  }),
                  tags: [{ name: 'type', value: 'cancellation' }],
                });
              }
            } catch (emailErr) {
              logger.error('cancellation_email_failed', {
                userId,
                error: emailErr instanceof Error ? emailErr.message : String(emailErr),
              });
            }
          })();
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

        // Send payment failed email (non-blocking)
        (async () => {
          try {
            const { data: subRow } = await supabase
              .from('subscriptions')
              .select('user_id')
              .eq('stripe_customer_id', customerId)
              .single();

            if (subRow?.user_id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('email, full_name')
                .eq('id', subRow.user_id)
                .single();

              if (profile?.email) {
                const { sendEmail } = await import('@/lib/email');
                const { PaymentFailedEmail } = await import('@/emails/PaymentFailedEmail');

                await sendEmail({
                  to: profile.email as string,
                  subject: 'Action required: Terrain payment failed',
                  react: PaymentFailedEmail({
                    userName: (profile.full_name as string) || '',
                    invoiceAmount: invoice.amount_due ? `$${(invoice.amount_due / 100).toFixed(2)}` : '',
                    billingPortalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://terrain.ambrosiaventures.co'}/settings/billing`,
                  }),
                  tags: [{ name: 'type', value: 'payment_failed' }],
                });
              }
            }
          } catch (emailErr) {
            logger.error('payment_failed_email_failed', {
              customerId,
              error: emailErr instanceof Error ? emailErr.message : String(emailErr),
            });
          }
        })();
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

    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }

  logger.info('webhook_processed', {
    eventId: event.id,
    type: event.type,
    durationMs: Math.round(performance.now() - routeStart),
  });

  return NextResponse.json({ received: true });
}
