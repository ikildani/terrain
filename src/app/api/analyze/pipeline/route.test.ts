import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mock Supabase client ──────────────────────────────────────
let mockSupabase: ReturnType<typeof createMockSupabase>;

function createMockSupabase(overrides?: { user?: { id: string } | null; authError?: Error | null }) {
  const user = overrides?.user !== undefined ? overrides.user : { id: 'user-789' };
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
    feature: 'pipeline',
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

import { POST } from './route';
import { rateLimit } from '@/lib/rate-limit';
import { checkUsage } from '@/lib/usage';

// ── Helpers ───────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL('http://localhost:3000/api/analyze/pipeline'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validBody() {
  return {
    input: {
      indication: 'Non-Small Cell Lung Cancer',
      phase: ['Phase 2', 'Phase 3'],
      status: ['Recruiting'],
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────

describe('POST /api/analyze/pipeline', () => {
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
    mockSupabase = createMockSupabase({ authError: new Error('Token expired') });
    const res = await POST(makeRequest(validBody()));

    expect(res.status).toBe(401);
  });

  // ── Rate limiting ────────────────────────────────────────

  it('returns 429 when rate limit is exceeded', async () => {
    vi.mocked(rateLimit).mockResolvedValueOnce({
      success: false,
      limit: 20,
      remaining: 0,
      retryAfter: 30,
    });

    const res = await POST(makeRequest(validBody()));
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/rate limit/i);
    expect(res.headers.get('Retry-After')).toBe('30');
  });

  // ── Validation ───────────────────────────────────────────

  it('returns 400 when no search criterion is provided', async () => {
    const res = await POST(
      makeRequest({
        input: {
          phase: ['Phase 2'],
          status: ['Recruiting'],
        },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/at least one search criterion/i);
  });

  // ── Usage limit ──────────────────────────────────────────

  it('returns 403 when usage limit is exceeded', async () => {
    vi.mocked(checkUsage).mockResolvedValueOnce({
      allowed: false,
      plan: 'free',
      feature: 'pipeline',
      monthlyCount: 5,
      limit: 5,
      remaining: 0,
    });

    const res = await POST(makeRequest(validBody()));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/monthly limit/i);
  });

  // ── Success paths ────────────────────────────────────────

  it('returns 200 with pipeline data for indication search', async () => {
    const res = await POST(makeRequest(validBody()));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.usage.feature).toBe('pipeline');
  });

  it('returns 200 when searching by mechanism only', async () => {
    const res = await POST(
      makeRequest({
        input: {
          mechanism: 'KRAS G12C inhibitor',
        },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('returns 200 when searching by company only', async () => {
    const res = await POST(
      makeRequest({
        input: {
          company: 'Pfizer',
        },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  // ── Server error ─────────────────────────────────────────

  it('returns 500 when search engine throws an unexpected error', async () => {
    // Override withTiming to throw
    const { withTiming } = await import('@/lib/logger');
    vi.mocked(withTiming).mockRejectedValueOnce(new Error('ClinicalTrials.gov API down'));

    const res = await POST(makeRequest(validBody()));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBe('ClinicalTrials.gov API down');
  });
});
