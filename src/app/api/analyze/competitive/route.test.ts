import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mock Supabase client ──────────────────────────────────────
let mockSupabase: ReturnType<typeof createMockSupabase>;

function createMockSupabase(overrides?: { user?: { id: string } | null; authError?: Error | null }) {
  const user = overrides?.user !== undefined ? overrides.user : { id: 'user-456' };
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
    feature: 'competitive',
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

vi.mock('@/lib/analytics/competitive', () => ({
  analyzeCompetitiveLandscape: vi.fn().mockResolvedValue({
    market_leaders: [],
    landscape_summary: { crowding_score: 6 },
  }),
}));

vi.mock('@/lib/analytics/device-competitive', () => ({
  analyzeDeviceCompetitiveLandscape: vi.fn().mockReturnValue({
    market_leaders: [],
    landscape_summary: { crowding_score: 4 },
  }),
}));

vi.mock('@/lib/analytics/cdx-competitive', () => ({
  analyzeCDxCompetitiveLandscape: vi.fn().mockReturnValue({
    market_leaders: [],
    landscape_summary: { crowding_score: 3 },
  }),
}));

vi.mock('@/lib/analytics/nutraceutical-competitive', () => ({
  analyzeNutraceuticalCompetitiveLandscape: vi.fn().mockReturnValue({
    market_leaders: [],
    landscape_summary: { crowding_score: 5 },
  }),
}));

import { POST } from './route';
import { rateLimit } from '@/lib/rate-limit';
import { checkUsage } from '@/lib/usage';

// ── Helpers ───────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL('http://localhost:3000/api/analyze/competitive'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validPharmaBody() {
  return {
    input: {
      indication: 'Non-Small Cell Lung Cancer',
      mechanism: 'KRAS G12C inhibitor',
    },
    product_category: 'pharmaceutical',
  };
}

// ── Tests ─────────────────────────────────────────────────────

describe('POST /api/analyze/competitive', () => {
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
    mockSupabase = createMockSupabase({ authError: new Error('Session expired') });
    const res = await POST(makeRequest(validPharmaBody()));

    expect(res.status).toBe(401);
  });

  // ── Rate limiting ────────────────────────────────────────

  it('returns 429 when rate limit is exceeded', async () => {
    vi.mocked(rateLimit).mockResolvedValueOnce({
      success: false,
      limit: 20,
      remaining: 0,
      retryAfter: 45,
    });

    const res = await POST(makeRequest(validPharmaBody()));
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/rate limit/i);
    expect(res.headers.get('Retry-After')).toBe('45');
  });

  // ── Validation: pharma ───────────────────────────────────

  it('returns 400 when indication is missing for pharmaceutical', async () => {
    const res = await POST(
      makeRequest({
        input: { mechanism: 'KRAS G12C' },
        product_category: 'pharmaceutical',
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/indication/i);
  });

  // ── Validation: device ───────────────────────────────────

  it('returns 400 when procedure_or_condition is missing for device', async () => {
    const res = await POST(
      makeRequest({
        input: { device_category: 'surgical' },
        product_category: 'device',
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/procedure or condition/i);
  });

  // ── Validation: CDx ──────────────────────────────────────

  it('returns 400 when biomarker is missing for CDx', async () => {
    const res = await POST(
      makeRequest({
        input: { test_type: 'NGS' },
        product_category: 'cdx',
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/biomarker/i);
  });

  // ── Validation: nutraceutical ────────────────────────────

  it('returns 400 when primary_ingredient is missing for nutraceutical', async () => {
    const res = await POST(
      makeRequest({
        input: { health_focus: 'cognitive' },
        product_category: 'nutraceutical',
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/primary ingredient/i);
  });

  // ── Validation: unknown category ─────────────────────────

  it('returns 400 for unknown product_category', async () => {
    const res = await POST(
      makeRequest({
        input: { indication: 'NSCLC' },
        product_category: 'alien_technology',
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/unknown product_category/i);
  });

  // ── Usage limit ──────────────────────────────────────────

  it('returns 403 when usage limit is exceeded', async () => {
    vi.mocked(checkUsage).mockResolvedValueOnce({
      allowed: false,
      plan: 'free',
      feature: 'competitive',
      monthlyCount: 1,
      limit: 1,
      remaining: 0,
    });

    const res = await POST(makeRequest(validPharmaBody()));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/monthly limit/i);
  });

  // ── Success paths ────────────────────────────────────────

  it('returns 200 with competitive data for pharmaceutical input', async () => {
    const res = await POST(makeRequest(validPharmaBody()));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.product_category).toBe('pharmaceutical');
    expect(body.usage.feature).toBe('competitive');
  });

  it('returns 200 for device competitive analysis', async () => {
    const res = await POST(
      makeRequest({
        input: {
          procedure_or_condition: 'Total Knee Arthroplasty',
          device_category: 'orthopedic',
        },
        product_category: 'device',
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.product_category).toBe('device');
  });

  // ── Server error ─────────────────────────────────────────

  it('returns 500 when engine throws an unexpected error', async () => {
    const { analyzeCompetitiveLandscape } = await import('@/lib/analytics/competitive');
    vi.mocked(analyzeCompetitiveLandscape).mockRejectedValueOnce(new Error('DB timeout'));

    const res = await POST(makeRequest(validPharmaBody()));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBe('DB timeout');
  });
});
