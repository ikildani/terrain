import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { STRIPE_PRICES } from '@/lib/subscription';
import { z } from 'zod';

const checkoutSchema = z.object({
  plan: z.enum(['pro', 'team']),
  return_url: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { plan, return_url } = parsed.data;
    const priceId =
      plan === 'pro' ? STRIPE_PRICES.pro_monthly : STRIPE_PRICES.team_monthly;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    // Look up existing Stripe customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // Create Stripe customer if none exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${return_url ?? appUrl + '/dashboard'}?upgraded=true`,
      cancel_url: `${appUrl}/settings/billing`,
      metadata: { supabase_user_id: user.id, plan },
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ success: true, data: { url: session.url } });
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}
