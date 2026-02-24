import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mock Supabase client ──────────────────────────────────────
let mockSupabase: ReturnType<typeof createMockSupabase>;

function createMockSupabase(overrides?: { user?: { id: string } | null; authError?: Error | null }) {
  const user = overrides?.user !== undefined ? overrides.user : { id: 'user-123' };
  const authError = overrides?.authError ?? null;
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: authError }),
    },
    from: vi.fn(() => {
      const chain: Record<string, unknown> = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.eq = vi.fn().mockReturnValue(chain);
      chain.insert = vi.fn().mockReturnValue(chain);
      chain.single = vi
        .fn()
        .mockResolvedValue({ data: { id: 'report-1', plan: 'pro', status: 'active' }, error: null });
      return chain;
    }),
  };
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true, limit: 20, remaining: 19, retryAfter: 0 }),
  RATE_LIMITS: {
    analysis_free: { limit: 5, windowMs: 3600000 },
    analysis_pro: { limit: 20, windowMs: 3600000 },
    analysis_team: { limit: 60, windowMs: 3600000 },
    auth: { limit: 10, windowMs: 900000 },
  },
}));

vi.mock('@/lib/usage', () => ({
  checkUsage: vi.fn().mockResolvedValue({
    allowed: true,
    plan: 'pro',
    feature: 'market_sizing',
    monthlyCount: 0,
    limit: -1,
    remaining: -1,
  }),
  recordUsage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  withTiming: vi.fn(async (_label: string, fn: () => Promise<unknown>) => ({
    result: await fn(),
    durationMs: 100,
  })),
  logApiRequest: vi.fn(),
  logApiResponse: vi.fn(),
}));

vi.mock('@/lib/analytics/market-sizing', () => ({
  calculateMarketSizing: vi.fn().mockResolvedValue({
    summary: { tam_us: { value: 4.2, unit: 'B' } },
  }),
}));

vi.mock('@/lib/analytics/device-market-sizing', () => ({
  calculateDeviceMarketSizing: vi.fn().mockResolvedValue({
    summary: { tam_us: { value: 2.1, unit: 'B' } },
  }),
  calculateCDxMarketSizing: vi.fn().mockResolvedValue({
    summary: { tam_us: { value: 0.8, unit: 'B' } },
  }),
}));

vi.mock('@/lib/analytics/nutraceutical-market-sizing', () => ({
  calculateNutraceuticalMarketSizing: vi.fn().mockResolvedValue({
    summary: { tam_us: { value: 1.5, unit: 'B' } },
  }),
}));

import { POST } from './route';
import { rateLimit } from '@/lib/rate-limit';
import { checkUsage } from '@/lib/usage';

// ── Helpers ───────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL('http://localhost:3000/api/analyze/market'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validPharmaBody() {
  return {
    input: {
      indication: 'Non-Small Cell Lung Cancer',
      geography: ['US'],
      launch_year: 2028,
    },
    product_category: 'pharmaceutical',
  };
}

// ── Tests ─────────────────────────────────────────────────────

describe('POST /api/analyze/market', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabase();
  });

  // ── Auth ─────────────────────────────────────────────────

  it('returns 401 when user is not authenticated', async () => {
    mockSupabase = createMockSupabase({ user: null });
    const res = await POST(makeRequest(validPharmaBody()));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/authentication/i);
  });

  it('returns 401 when auth returns an error', async () => {
    mockSupabase = createMockSupabase({ authError: new Error('Token expired') });
    const res = await POST(makeRequest(validPharmaBody()));

    expect(res.status).toBe(401);
  });

  // ── Rate limiting ────────────────────────────────────────

  it('returns 429 when rate limit is exceeded', async () => {
    vi.mocked(rateLimit).mockResolvedValueOnce({
      success: false,
      limit: 20,
      remaining: 0,
      retryAfter: 60,
    });

    const res = await POST(makeRequest(validPharmaBody()));
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/rate limit/i);
    expect(res.headers.get('Retry-After')).toBe('60');
  });

  // ── Validation ───────────────────────────────────────────

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(
      makeRequest({
        input: { indication: 'NSCLC' },
        product_category: 'pharmaceutical',
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('returns 400 when indication is missing for pharma category', async () => {
    const res = await POST(
      makeRequest({
        input: {
          geography: ['US'],
          launch_year: 2028,
        },
        product_category: 'pharmaceutical',
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/indication/i);
  });

  it('returns 400 for unknown product_category', async () => {
    const res = await POST(
      makeRequest({
        input: {
          indication: 'NSCLC',
          geography: ['US'],
          launch_year: 2028,
        },
        product_category: 'unknown_category',
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/unknown product_category/i);
  });

  // ── Success ──────────────────────────────────────────────

  it('returns 200 with market sizing data for pharmaceutical input', async () => {
    const res = await POST(makeRequest(validPharmaBody()));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.usage).toBeDefined();
    expect(body.usage.feature).toBe('market_sizing');
  });

  it('returns 200 for device product category', async () => {
    const res = await POST(
      makeRequest({
        input: {
          procedure_or_condition: 'Knee Replacement',
          geography: ['US'],
          launch_year: 2028,
        },
        product_category: 'device',
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  // ── Usage limit ──────────────────────────────────────────

  it('returns 403 when usage limit is exceeded', async () => {
    vi.mocked(checkUsage).mockResolvedValueOnce({
      allowed: false,
      plan: 'free',
      feature: 'market_sizing',
      monthlyCount: 3,
      limit: 3,
      remaining: 0,
    });

    const res = await POST(makeRequest(validPharmaBody()));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/monthly limit/i);
  });

  // ── Demo mode ────────────────────────────────────────────

  it('allows unauthenticated demo requests', async () => {
    mockSupabase = createMockSupabase({ user: null });

    const res = await POST(
      makeRequest({
        ...validPharmaBody(),
        demo: true,
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  // ── Server error ─────────────────────────────────────────

  it('returns 500 when engine throws an unexpected error', async () => {
    const { calculateMarketSizing } = await import('@/lib/analytics/market-sizing');
    vi.mocked(calculateMarketSizing).mockRejectedValueOnce(new Error('Engine failure'));

    const res = await POST(makeRequest(validPharmaBody()));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Engine failure');
  });
});
