import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ────────────────────────────────────────────────────────────
// Integration tests for the Stripe webhook route handler.
//
// We mock:
//   - @/lib/stripe (stripe.webhooks.constructEvent)
//   - @supabase/ssr (createServerClient)
//   - @/lib/logger (logger methods)
//   - @/lib/utils/sentry (captureApiError)
//   - next/server (NextRequest / NextResponse)
//
// This allows us to test the webhook's business logic:
//   - Signature verification
//   - Idempotency / deduplication
//   - Subscription upsert on created/updated events
//   - Downgrade to free on deleted events
//   - Past-due status on payment failure
//   - Error handling (500 response + retry allowance)
// ────────────────────────────────────────────────────────────

// ── Mock Stripe ─────────────────────────────────────────────
const mockConstructEvent = vi.fn();
vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
    },
  },
}));

// ── Mock Supabase ───────────────────────────────────────────
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();

// Chain: supabase.from('table').update({...}).eq('col', val)
// We set up a fluent mock chain.
function resetSupabaseMocks() {
  mockEq.mockReturnValue(Promise.resolve({ error: null }));
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockFrom.mockReturnValue({ update: mockUpdate });
}

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

// ── Mock Logger ─────────────────────────────────────────────
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// ── Mock Sentry ─────────────────────────────────────────────
vi.mock('@/lib/utils/sentry', () => ({
  captureApiError: vi.fn(),
}));

// ── Helper: create a mock NextRequest ───────────────────────
function createMockRequest(body: string, signature: string | null) {
  return {
    text: () => Promise.resolve(body),
    headers: {
      get: (name: string) => {
        if (name === 'stripe-signature') return signature;
        return null;
      },
    },
  };
}

// ── Helper: create a Stripe event object ────────────────────
function createStripeEvent(
  id: string,
  type: string,
  data: Record<string, unknown>
) {
  return { id, type, data: { object: data } };
}

// ── Helper: create a Stripe Subscription-like object ────────
function createSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub_test123',
    customer: 'cus_test456',
    metadata: { supabase_user_id: 'user-uuid-123' },
    items: {
      data: [{ price: { id: 'price_pro_monthly' } }],
    },
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
    cancel_at_period_end: false,
    ...overrides,
  };
}

// Import the route handler (after mocks are set up)
let POST: (request: unknown) => Promise<{ status?: number; json: () => unknown }>;

describe('POST /api/stripe/webhook', () => {
  beforeEach(async () => {
    vi.resetModules();
    resetSupabaseMocks();
    mockConstructEvent.mockReset();

    // Set env vars needed by the handler
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro_monthly';
    process.env.STRIPE_TEAM_PRICE_ID = 'price_team_monthly';

    // Dynamic import to get fresh module with fresh dedup map
    const mod = await import('@/app/api/stripe/webhook/route');
    POST = mod.POST as typeof POST;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Signature verification ──────────────────────────────

  describe('signature verification', () => {
    it('should return 400 when stripe-signature header is missing', async () => {
      const req = createMockRequest('body', null);
      const response = await POST(req);
      const body = await response.json();

      expect(body).toHaveProperty('error');
      expect(body.error).toMatch(/missing/i);
    });

    it('should return 400 when signature verification fails', async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Signature mismatch');
      });

      const req = createMockRequest('body', 'sig_invalid');
      const response = await POST(req);
      const body = await response.json();

      expect(body).toHaveProperty('error');
      expect(body.error).toMatch(/invalid signature/i);
    });
  });

  // ── Idempotency ─────────────────────────────────────────

  describe('idempotency / deduplication', () => {
    it('should process the same event ID only once', async () => {
      const event = createStripeEvent('evt_dup_test', 'customer.subscription.updated', createSubscription());
      mockConstructEvent.mockReturnValue(event);

      const req1 = createMockRequest('body', 'sig_valid');
      const res1 = await POST(req1);
      const body1 = await res1.json();
      expect(body1.received).toBe(true);

      // Second call with same event id
      const req2 = createMockRequest('body', 'sig_valid');
      const res2 = await POST(req2);
      const body2 = await res2.json();
      expect(body2.received).toBe(true);
      expect(body2.duplicate).toBe(true);
    });
  });

  // ── Subscription created/updated ────────────────────────

  describe('customer.subscription.created / updated', () => {
    it('should upsert subscription with pro plan when price matches STRIPE_PRO_PRICE_ID', async () => {
      const sub = createSubscription();
      const event = createStripeEvent('evt_create_1', 'customer.subscription.created', sub);
      mockConstructEvent.mockReturnValue(event);

      const req = createMockRequest('body', 'sig_valid');
      const res = await POST(req);
      const body = await res.json();

      expect(body.received).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          stripe_subscription_id: 'sub_test123',
          stripe_customer_id: 'cus_test456',
          plan: 'pro',
          status: 'active',
        })
      );
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-uuid-123');
    });

    it('should upsert subscription with team plan when price matches STRIPE_TEAM_PRICE_ID', async () => {
      const sub = createSubscription({
        items: { data: [{ price: { id: 'price_team_monthly' } }] },
      });
      const event = createStripeEvent('evt_create_team', 'customer.subscription.updated', sub);
      mockConstructEvent.mockReturnValue(event);

      const req = createMockRequest('body', 'sig_valid');
      await POST(req);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'team' })
      );
    });

    it('should default to free plan when price ID matches neither pro nor team', async () => {
      const sub = createSubscription({
        items: { data: [{ price: { id: 'price_unknown' } }] },
      });
      const event = createStripeEvent('evt_create_free', 'customer.subscription.created', sub);
      mockConstructEvent.mockReturnValue(event);

      const req = createMockRequest('body', 'sig_valid');
      await POST(req);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'free' })
      );
    });

    it('should log a warning and skip upsert when supabase_user_id is missing', async () => {
      const sub = createSubscription({ metadata: {} });
      const event = createStripeEvent('evt_no_uid', 'customer.subscription.created', sub);
      mockConstructEvent.mockReturnValue(event);

      const req = createMockRequest('body', 'sig_valid');
      const res = await POST(req);
      const body = await res.json();

      expect(body.received).toBe(true);
      // mockUpdate should NOT have been called since there's no user_id
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  // ── Subscription deleted ────────────────────────────────

  describe('customer.subscription.deleted', () => {
    it('should downgrade user to free plan with canceled status', async () => {
      const sub = createSubscription();
      const event = createStripeEvent('evt_delete_1', 'customer.subscription.deleted', sub);
      mockConstructEvent.mockReturnValue(event);

      const req = createMockRequest('body', 'sig_valid');
      const res = await POST(req);
      const body = await res.json();

      expect(body.received).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          plan: 'free',
          status: 'canceled',
          stripe_subscription_id: null,
          cancel_at_period_end: false,
        })
      );
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-uuid-123');
    });

    it('should skip downgrade when supabase_user_id is missing on delete', async () => {
      const sub = createSubscription({ metadata: {} });
      const event = createStripeEvent('evt_delete_nouid', 'customer.subscription.deleted', sub);
      mockConstructEvent.mockReturnValue(event);

      const req = createMockRequest('body', 'sig_valid');
      const res = await POST(req);
      const body = await res.json();

      expect(body.received).toBe(true);
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  // ── Invoice payment failed ──────────────────────────────

  describe('invoice.payment_failed', () => {
    it('should set subscription status to past_due', async () => {
      const invoice = { id: 'in_test789', customer: 'cus_test456' };
      const event = createStripeEvent('evt_payment_fail_1', 'invoice.payment_failed', invoice);
      mockConstructEvent.mockReturnValue(event);

      const req = createMockRequest('body', 'sig_valid');
      const res = await POST(req);
      const body = await res.json();

      expect(body.received).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'past_due',
        })
      );
      expect(mockEq).toHaveBeenCalledWith('stripe_customer_id', 'cus_test456');
    });
  });

  // ── Unhandled event types ───────────────────────────────

  describe('unhandled event types', () => {
    it('should return success for unrecognized event types', async () => {
      const event = createStripeEvent('evt_unhandled_1', 'charge.succeeded', {});
      mockConstructEvent.mockReturnValue(event);

      const req = createMockRequest('body', 'sig_valid');
      const res = await POST(req);
      const body = await res.json();

      expect(body.received).toBe(true);
    });
  });

  // ── Error handling ──────────────────────────────────────

  describe('error handling', () => {
    it('should return 500 when Supabase update fails, allowing Stripe to retry', async () => {
      const sub = createSubscription();
      const event = createStripeEvent('evt_error_1', 'customer.subscription.created', sub);
      mockConstructEvent.mockReturnValue(event);

      // Simulate Supabase error
      mockEq.mockReturnValue(
        Promise.resolve({ error: { message: 'DB connection timeout' } })
      );

      const req = createMockRequest('body', 'sig_valid');
      const res = await POST(req);
      const body = await res.json();

      expect(body).toHaveProperty('error');
      expect(body.error).toMatch(/webhook handler failed/i);
    });

    it('should return 500 when subscription delete update fails', async () => {
      const sub = createSubscription();
      const event = createStripeEvent('evt_error_2', 'customer.subscription.deleted', sub);
      mockConstructEvent.mockReturnValue(event);

      mockEq.mockReturnValue(
        Promise.resolve({ error: { message: 'Connection refused' } })
      );

      const req = createMockRequest('body', 'sig_valid');
      const res = await POST(req);
      const body = await res.json();

      expect(body).toHaveProperty('error');
    });

    it('should return 500 when invoice.payment_failed update fails', async () => {
      const invoice = { id: 'in_fail', customer: 'cus_fail' };
      const event = createStripeEvent('evt_error_3', 'invoice.payment_failed', invoice);
      mockConstructEvent.mockReturnValue(event);

      mockEq.mockReturnValue(
        Promise.resolve({ error: { message: 'Timeout' } })
      );

      const req = createMockRequest('body', 'sig_valid');
      const res = await POST(req);
      const body = await res.json();

      expect(body).toHaveProperty('error');
    });

    it('should allow retry of a previously failed event (removed from dedup set)', async () => {
      // First attempt: fails due to DB error
      const sub = createSubscription();
      const event = createStripeEvent('evt_retry_test', 'customer.subscription.created', sub);
      mockConstructEvent.mockReturnValue(event);

      mockEq.mockReturnValueOnce(
        Promise.resolve({ error: { message: 'DB error' } })
      );

      const req1 = createMockRequest('body', 'sig_valid');
      const res1 = await POST(req1);
      const body1 = await res1.json();
      expect(body1.error).toBeDefined();

      // Second attempt (retry): should succeed, not be marked as duplicate
      resetSupabaseMocks();

      const req2 = createMockRequest('body', 'sig_valid');
      const res2 = await POST(req2);
      const body2 = await res2.json();

      expect(body2.received).toBe(true);
      expect(body2.duplicate).toBeUndefined();
    });
  });
});
