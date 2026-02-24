import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mock Supabase client ──────────────────────────────────────
let mockSupabase: ReturnType<typeof createMockSupabase>;

function createMockSupabase(overrides?: { user?: { id: string } | null; authError?: Error | null }) {
  const user = overrides?.user !== undefined ? overrides.user : { id: 'user-reg-1' };
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
    feature: 'regulatory',
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

vi.mock('@/lib/redis', () => ({
  redis: null,
  isRedisAvailable: false,
}));

vi.mock('@/lib/analytics/regulatory', () => ({
  analyzeRegulatory: vi.fn().mockResolvedValue({
    recommended_pathway: {
      primary: { name: 'Standard NDA', review_division: 'CDER', typical_review_time: '12 months' },
      alternatives: [],
      rationale: 'Standard pathway based on development stage and unmet need.',
    },
    timeline_estimate: {
      ind_to_bla: { optimistic: 48, realistic: 60, pessimistic: 72 },
      review_timeline: 12,
      total_to_approval: { optimistic: 60, realistic: 72 },
    },
    designation_opportunities: [],
    key_risks: [],
  }),
}));

import { POST } from './route';
import { rateLimit } from '@/lib/rate-limit';
import { checkUsage, recordUsage } from '@/lib/usage';

// ── Helpers ───────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL('http://localhost:3000/api/analyze/regulatory'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validBody() {
  return {
    input: {
      indication: 'Non-Small Cell Lung Cancer',
      product_type: 'pharmaceutical',
      development_stage: 'phase2',
      geography: ['FDA'],
      unmet_need: 'high',
      has_orphan_potential: false,
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────

describe('POST /api/analyze/regulatory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabase();
  });

  // ── Auth ─────────────────────────────────────────────────

  it('returns 401 when user is not authenticated', async () => {
    mockSupabase = createMockSupabase({ user: null });
    const res = await POST(makeRequest(validBody()));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/authentication/i);
  });

  it('returns 401 when auth returns an error', async () => {
    mockSupabase = createMockSupabase({ authError: new Error('JWT malformed') });
    const res = await POST(makeRequest(validBody()));

    expect(res.status).toBe(401);
  });

  // ── Rate limiting ────────────────────────────────────────

  it('returns 429 when rate limit is exceeded', async () => {
    vi.mocked(rateLimit).mockResolvedValueOnce({
      success: false,
      limit: 20,
      remaining: 0,
      retryAfter: 90,
    });

    const res = await POST(makeRequest(validBody()));
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/rate limit/i);
    expect(res.headers.get('Retry-After')).toBe('90');
  });

  // ── Validation ───────────────────────────────────────────

  it('returns 400 when indication is empty', async () => {
    const res = await POST(
      makeRequest({
        input: {
          indication: '',
          product_type: 'pharmaceutical',
          development_stage: 'phase2',
          geography: ['FDA'],
          unmet_need: 'high',
          has_orphan_potential: false,
        },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('returns 400 when product_type is invalid', async () => {
    const res = await POST(
      makeRequest({
        input: {
          indication: 'NSCLC',
          product_type: 'alien_tech',
          development_stage: 'phase2',
          geography: ['FDA'],
          unmet_need: 'high',
          has_orphan_potential: false,
        },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('returns 400 when geography is empty', async () => {
    const res = await POST(
      makeRequest({
        input: {
          indication: 'NSCLC',
          product_type: 'pharmaceutical',
          development_stage: 'phase2',
          geography: [],
          unmet_need: 'high',
          has_orphan_potential: false,
        },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/regulatory agency/i);
  });

  it('returns 400 when has_orphan_potential is missing', async () => {
    const res = await POST(
      makeRequest({
        input: {
          indication: 'NSCLC',
          product_type: 'pharmaceutical',
          development_stage: 'phase2',
          geography: ['FDA'],
          unmet_need: 'high',
          // has_orphan_potential intentionally missing
        },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  // ── Usage limit ──────────────────────────────────────────

  it('returns 403 when feature requires Pro plan (limit=0)', async () => {
    vi.mocked(checkUsage).mockResolvedValueOnce({
      allowed: false,
      plan: 'free',
      feature: 'regulatory',
      monthlyCount: 0,
      limit: 0,
      remaining: 0,
    });

    const res = await POST(makeRequest(validBody()));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/pro plan/i);
  });

  it('returns 403 when monthly usage limit is reached', async () => {
    vi.mocked(checkUsage).mockResolvedValueOnce({
      allowed: false,
      plan: 'pro',
      feature: 'regulatory',
      monthlyCount: 10,
      limit: 10,
      remaining: 0,
    });

    const res = await POST(makeRequest(validBody()));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/monthly limit/i);
  });

  // ── Success ──────────────────────────────────────────────

  it('returns 200 with regulatory analysis data', async () => {
    const res = await POST(makeRequest(validBody()));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.recommended_pathway).toBeDefined();
    expect(body.data.recommended_pathway.primary.name).toBe('Standard NDA');
    expect(body.usage.feature).toBe('regulatory');
  });

  it('records usage after successful analysis', async () => {
    await POST(makeRequest(validBody()));

    expect(recordUsage).toHaveBeenCalledWith(
      'user-reg-1',
      'regulatory',
      'Non-Small Cell Lung Cancer',
      expect.objectContaining({
        product_type: 'pharmaceutical',
        geography: ['FDA'],
        development_stage: 'phase2',
      }),
    );
  });

  it('returns 200 for device product type', async () => {
    const res = await POST(
      makeRequest({
        input: {
          indication: 'Atrial Fibrillation',
          product_type: 'device',
          development_stage: 'phase3',
          geography: ['FDA', 'EMA'],
          unmet_need: 'medium',
          has_orphan_potential: false,
        },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  // ── Server error ─────────────────────────────────────────

  it('returns 500 when engine throws an unexpected error', async () => {
    const { analyzeRegulatory } = await import('@/lib/analytics/regulatory');
    vi.mocked(analyzeRegulatory).mockRejectedValueOnce(new Error('Regulatory DB offline'));

    const res = await POST(makeRequest(validBody()));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Regulatory DB offline');
  });
});
