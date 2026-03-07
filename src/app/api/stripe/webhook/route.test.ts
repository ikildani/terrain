import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// ── Mock Stripe ───────────────────────────────────────────────
const mockConstructEvent = vi.fn();

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
    },
  },
}));

// ── Mock Supabase (service-role client, no user session) ──────
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();

const mockDelete = vi.fn();
const mockUpsert = vi.fn();

function resetSupabaseMocks() {
  // .update({}).eq() chain — returns Promise with error: null
  mockEq.mockReturnValue(Promise.resolve({ error: null }));
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockDelete.mockReturnValue({ eq: mockEq });
  mockUpsert.mockReturnValue(Promise.resolve({ error: null }));
  // .insert() for dedup table — returns { error: null } (no duplicate)
  mockInsert.mockResolvedValue({ error: null });
  // .select().eq().single() for profile lookups — returns user data
  mockSingle.mockResolvedValue({
    data: { id: 'user-uuid-123', email: 'test@test.com', full_name: 'Test User' },
    error: null,
  });
  mockSelect.mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockSingle }) });
  mockFrom.mockReturnValue({
    update: mockUpdate,
    select: mockSelect,
    delete: mockDelete,
    upsert: mockUpsert,
    insert: mockInsert,
  });
}

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

// ── Mock Logger ───────────────────────────────────────────────
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logBusinessEvent: vi.fn(),
}));

// ── Mock Sentry ───────────────────────────────────────────────
vi.mock('@/lib/utils/sentry', () => ({
  captureApiError: vi.fn(),
}));

// ── Mock email module (dynamic import in webhook) ─────────────
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/emails/SubscriptionConfirmationEmail', () => ({
  SubscriptionConfirmationEmail: vi.fn().mockReturnValue(null),
}));

vi.mock('@/emails/CancellationConfirmationEmail', () => ({
  CancellationConfirmationEmail: vi.fn().mockReturnValue(null),
}));

vi.mock('@/emails/PaymentFailedEmail', () => ({
  PaymentFailedEmail: vi.fn().mockReturnValue(null),
}));

// ── Helper: create mock NextRequest for webhook ───────────────
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

// ── Helper: create Stripe event ───────────────────────────────
function createStripeEvent(id: string, type: string, data: Record<string, unknown>) {
  return { id, type, data: { object: data } };
}

// ── Helper: create Stripe Subscription-like object ────────────
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

// Import POST handler (after all mocks are set up)
let POST: (request: unknown) => Promise<Response>;

describe('POST /api/stripe/webhook', () => {
  beforeEach(async () => {
    vi.resetModules();
    resetSupabaseMocks();
    mockConstructEvent.mockReset();

    // Set env vars
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro_monthly';
    process.env.STRIPE_TEAM_PRICE_ID = 'price_team_monthly';

    // Dynamic import to get fresh module (resets in-memory dedup map)
    const mod = await import('./route');
    POST = mod.POST as typeof POST;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Signature verification ───────────────────────────────

  it('returns 400 when stripe-signature header is missing', async () => {
    const req = createMockRequest('body', null);
    const res = await POST(req);
    const body = await res.json();

    expect(body.error).toMatch(/missing/i);
  });

  it('returns 400 when signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Signature mismatch');
    });

    const req = createMockRequest('body', 'sig_invalid');
    const res = await POST(req);
    const body = await res.json();

    expect(body.error).toMatch(/invalid signature/i);
  });

  // ── Idempotency ──────────────────────────────────────────

  it('deduplicates events with the same event ID', async () => {
    const event = createStripeEvent('evt_dedup_1', 'customer.subscription.updated', createSubscription());
    mockConstructEvent.mockReturnValue(event);

    const req1 = createMockRequest('body', 'sig_valid');
    const res1 = await POST(req1);
    const body1 = await res1.json();
    expect(body1.received).toBe(true);
    expect(body1.duplicate).toBeUndefined();

    // Second insert of same event_id returns unique constraint violation
    mockInsert.mockResolvedValueOnce({ error: { code: '23505', message: 'duplicate key' } });

    const req2 = createMockRequest('body', 'sig_valid');
    const res2 = await POST(req2);
    const body2 = await res2.json();
    expect(body2.received).toBe(true);
    expect(body2.duplicate).toBe(true);
  });

  // ── subscription.created ─────────────────────────────────

  it('upserts subscription with pro plan on customer.subscription.created', async () => {
    const sub = createSubscription();
    const event = createStripeEvent('evt_created_1', 'customer.subscription.created', sub);
    mockConstructEvent.mockReturnValue(event);

    const req = createMockRequest('body', 'sig_valid');
    const res = await POST(req);
    const body = await res.json();

    expect(body.received).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('subscriptions');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        stripe_subscription_id: 'sub_test123',
        stripe_customer_id: 'cus_test456',
        plan: 'pro',
        status: 'active',
        user_id: 'user-uuid-123',
      }),
      expect.objectContaining({ onConflict: 'user_id' }),
    );
  });

  // ── subscription.updated (team plan) ─────────────────────

  it('upserts subscription with team plan when price matches team', async () => {
    const sub = createSubscription({
      items: { data: [{ price: { id: 'price_team_monthly' } }] },
    });
    const event = createStripeEvent('evt_updated_team', 'customer.subscription.updated', sub);
    mockConstructEvent.mockReturnValue(event);

    const req = createMockRequest('body', 'sig_valid');
    await POST(req);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'team' }),
      expect.objectContaining({ onConflict: 'user_id' }),
    );
  });

  // ── subscription.deleted ─────────────────────────────────

  it('downgrades user to free plan on customer.subscription.deleted', async () => {
    const sub = createSubscription();
    const event = createStripeEvent('evt_deleted_1', 'customer.subscription.deleted', sub);
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
      }),
    );
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-uuid-123');
  });

  // ── invoice.payment_failed ───────────────────────────────

  it('sets status to past_due on invoice.payment_failed', async () => {
    const invoice = { id: 'in_test789', customer: 'cus_test456', amount_due: 14900 };
    const event = createStripeEvent('evt_payment_fail', 'invoice.payment_failed', invoice);
    mockConstructEvent.mockReturnValue(event);

    const req = createMockRequest('body', 'sig_valid');
    const res = await POST(req);
    const body = await res.json();

    expect(body.received).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('subscriptions');
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'past_due' }));
    expect(mockEq).toHaveBeenCalledWith('stripe_customer_id', 'cus_test456');
  });

  // ── Unhandled event types ────────────────────────────────

  it('returns success for unrecognized event types', async () => {
    const event = createStripeEvent('evt_unknown_1', 'charge.succeeded', {});
    mockConstructEvent.mockReturnValue(event);

    const req = createMockRequest('body', 'sig_valid');
    const res = await POST(req);
    const body = await res.json();

    expect(body.received).toBe(true);
  });

  // ── Error handling (500) ─────────────────────────────────

  it('returns 500 when Supabase update fails (allows Stripe retry)', async () => {
    const sub = createSubscription();
    const event = createStripeEvent('evt_db_error', 'customer.subscription.created', sub);
    mockConstructEvent.mockReturnValue(event);

    // Make the upsert return an error
    mockUpsert.mockReturnValueOnce(Promise.resolve({ error: { message: 'DB connection timeout' } }));

    const req = createMockRequest('body', 'sig_valid');
    const res = await POST(req);
    const body = await res.json();

    expect(body.error).toMatch(/webhook handler failed/i);
  });

  it('allows retry of a previously failed event (removed from dedup set)', async () => {
    const sub = createSubscription();
    const event = createStripeEvent('evt_retry', 'customer.subscription.created', sub);
    mockConstructEvent.mockReturnValue(event);

    // First attempt fails — upsert returns error
    mockUpsert.mockReturnValueOnce(Promise.resolve({ error: { message: 'DB error' } }));

    const req1 = createMockRequest('body', 'sig_valid');
    const res1 = await POST(req1);
    const body1 = await res1.json();
    expect(body1.error).toBeDefined();

    // Second attempt succeeds (event was removed from dedup set on failure)
    resetSupabaseMocks();

    const req2 = createMockRequest('body', 'sig_valid');
    const res2 = await POST(req2);
    const body2 = await res2.json();
    expect(body2.received).toBe(true);
    expect(body2.duplicate).toBeUndefined();
  });
});
