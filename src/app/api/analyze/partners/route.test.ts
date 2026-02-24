import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mock Supabase client ──────────────────────────────────────
let mockSupabase: ReturnType<typeof createMockSupabase>;

function createMockSupabase(overrides?: { user?: { id: string } | null; authError?: Error | null }) {
  const user = overrides?.user !== undefined ? overrides.user : { id: 'user-partner-1' };
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
    feature: 'partners',
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

vi.mock('@/lib/analytics/partners', () => ({
  analyzePartners: vi.fn().mockResolvedValue({
    partners: [
      {
        company: 'Pfizer',
        match_score: 85,
        score_breakdown: {
          therapeutic_alignment: 90,
          pipeline_gap: 80,
          deal_history: 85,
          financial_capacity: 95,
          geography_fit: 75,
          strategic_priority: 80,
        },
        rationale: 'Strong oncology focus with known KRAS interest.',
      },
    ],
    total_matches: 1,
  }),
}));

import { POST } from './route';
import { rateLimit } from '@/lib/rate-limit';
import { checkUsage, recordUsage } from '@/lib/usage';

// ── Helpers ───────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL('http://localhost:3000/api/analyze/partners'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validBody() {
  return {
    input: {
      indication: 'Non-Small Cell Lung Cancer',
      mechanism: 'KRAS G12C inhibitor',
      development_stage: 'phase2',
      geography_rights: ['US', 'EU5'],
      deal_types: ['licensing', 'co-development'],
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────

describe('POST /api/analyze/partners', () => {
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
    mockSupabase = createMockSupabase({ authError: new Error('Invalid JWT') });
    const res = await POST(makeRequest(validBody()));

    expect(res.status).toBe(401);
  });

  // ── Rate limiting ────────────────────────────────────────

  it('returns 429 when rate limit is exceeded', async () => {
    vi.mocked(rateLimit).mockResolvedValueOnce({
      success: false,
      limit: 20,
      remaining: 0,
      retryAfter: 120,
    });

    const res = await POST(makeRequest(validBody()));
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/rate limit/i);
    expect(res.headers.get('Retry-After')).toBe('120');
  });

  // ── Validation ───────────────────────────────────────────

  it('returns 400 when indication is empty', async () => {
    const res = await POST(
      makeRequest({
        input: {
          indication: '',
          development_stage: 'phase2',
          geography_rights: ['US'],
          deal_types: ['licensing'],
        },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('returns 400 when geography_rights is empty', async () => {
    const res = await POST(
      makeRequest({
        input: {
          indication: 'NSCLC',
          development_stage: 'phase2',
          geography_rights: [],
          deal_types: ['licensing'],
        },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/geography/i);
  });

  it('returns 400 when deal_types is empty', async () => {
    const res = await POST(
      makeRequest({
        input: {
          indication: 'NSCLC',
          development_stage: 'phase2',
          geography_rights: ['US'],
          deal_types: [],
        },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/deal type/i);
  });

  it('returns 400 when development_stage is invalid', async () => {
    const res = await POST(
      makeRequest({
        input: {
          indication: 'NSCLC',
          development_stage: 'invalid_stage',
          geography_rights: ['US'],
          deal_types: ['licensing'],
        },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  // ── Usage limit (Pro-gated) ──────────────────────────────

  it('returns 403 when user is on free plan (partners is Pro-only)', async () => {
    vi.mocked(checkUsage).mockResolvedValueOnce({
      allowed: false,
      plan: 'free',
      feature: 'partners',
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

  // ── Success ──────────────────────────────────────────────

  it('returns 200 with partner matches', async () => {
    const res = await POST(makeRequest(validBody()));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.partners).toHaveLength(1);
    expect(body.data.partners[0].company).toBe('Pfizer');
    expect(body.usage.feature).toBe('partners');
  });

  it('records usage after successful analysis', async () => {
    await POST(makeRequest(validBody()));

    expect(recordUsage).toHaveBeenCalledWith(
      'user-partner-1',
      'partners',
      'Non-Small Cell Lung Cancer',
      expect.objectContaining({
        mechanism: 'KRAS G12C inhibitor',
        development_stage: 'phase2',
      }),
    );
  });

  // ── Server error ─────────────────────────────────────────

  it('returns 500 when engine throws an unexpected error', async () => {
    const { analyzePartners } = await import('@/lib/analytics/partners');
    vi.mocked(analyzePartners).mockRejectedValueOnce(new Error('Partner DB unavailable'));

    const res = await POST(makeRequest(validBody()));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Partner DB unavailable');
  });
});
