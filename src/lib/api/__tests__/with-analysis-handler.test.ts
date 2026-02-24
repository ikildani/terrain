import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { z } from 'zod';

// ── Mocks ──────────────────────────────────────────────────
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

vi.mock('@/lib/usage', () => ({
  checkUsage: vi.fn().mockResolvedValue({
    allowed: true,
    monthlyCount: 2,
    limit: -1,
    remaining: -1,
    feature: 'test_feature',
    plan: 'pro',
  }),
  recordUsage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true }),
  RATE_LIMITS: { analysis_pro: { max: 20, window: 60 } },
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
  withTiming: vi.fn(async (_label: string, fn: () => Promise<unknown>) => ({
    result: await fn(),
    durationMs: 42,
  })),
  logApiRequest: vi.fn(),
  logApiResponse: vi.fn(),
}));

vi.mock('@/lib/redis', () => ({ redis: null }));

vi.mock('@sentry/nextjs', () => ({
  setUser: vi.fn(),
  setTag: vi.fn(),
  setContext: vi.fn(),
}));

import { withAnalysisHandler } from '../with-analysis-handler';
import { rateLimit } from '@/lib/rate-limit';
import { checkUsage } from '@/lib/usage';

// ── Test schema + handler ──────────────────────────────────
const TestSchema = z.object({
  input: z.object({
    indication: z.string().min(1, 'Indication is required.'),
  }),
});

function buildHandler(overrides?: Partial<Parameters<typeof withAnalysisHandler>[0]>) {
  return withAnalysisHandler({
    feature: 'market_sizing',
    route: '/api/analyze/test',
    rateKey: 'test',
    schema: TestSchema,
    timingLabel: 'test_analysis',
    extractIndication: (body) => body.input.indication,
    handler: vi.fn().mockResolvedValue({ result: 'ok' }),
    ...overrides,
  });
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/analyze/test', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── Tests ──────────────────────────────────────────────────
describe('withAnalysisHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    const chain: Record<string, unknown> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.insert = vi.fn().mockReturnValue(chain);
    chain.single = vi.fn().mockResolvedValue({ data: { id: 'report-1' }, error: null });
    mockFrom.mockReturnValue(chain);
    (checkUsage as ReturnType<typeof vi.fn>).mockResolvedValue({
      allowed: true,
      monthlyCount: 2,
      limit: -1,
      remaining: -1,
      feature: 'market_sizing',
      plan: 'pro',
    });
    (rateLimit as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'No session' } });
    const handler = buildHandler();
    const res = await handler(makeRequest({ input: { indication: 'NSCLC' } }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('returns 429 when rate-limited', async () => {
    (rateLimit as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, retryAfter: 30 });
    const handler = buildHandler();
    const res = await handler(makeRequest({ input: { indication: 'NSCLC' } }));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
  });

  it('returns 403 when usage limit exceeded', async () => {
    (checkUsage as ReturnType<typeof vi.fn>).mockResolvedValue({
      allowed: false,
      monthlyCount: 3,
      limit: 3,
      remaining: 0,
      feature: 'market_sizing',
      plan: 'free',
    });
    const handler = buildHandler();
    const res = await handler(makeRequest({ input: { indication: 'NSCLC' } }));
    expect(res.status).toBe(403);
  });

  it('returns 400 on validation failure', async () => {
    const handler = buildHandler();
    const res = await handler(makeRequest({ input: {} }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors).toBeDefined();
  });

  it('returns 200 with data on success', async () => {
    const handler = buildHandler();
    const res = await handler(makeRequest({ input: { indication: 'NSCLC' } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.report_id).toBe('report-1');
    expect(body.usage).toBeDefined();
  });

  it('includes X-Request-Id header on success', async () => {
    const handler = buildHandler();
    const res = await handler(makeRequest({ input: { indication: 'NSCLC' } }));
    expect(res.headers.get('X-Request-Id')).toBeTruthy();
  });

  it('returns 500 when engine throws', async () => {
    const handler = buildHandler({
      handler: vi.fn().mockRejectedValue(new Error('Engine failure')),
    });
    const res = await handler(makeRequest({ input: { indication: 'NSCLC' } }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Engine failure');
    expect(res.headers.get('X-Request-Id')).toBeTruthy();
  });
});
