/**
 * Shared test helpers for API route testing.
 * Provides mock factories for NextRequest, Supabase, rate-limit, and usage.
 */

import { vi } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mock User ──────────────────────────────────────────────

export const MOCK_USER = {
  id: 'user-test-123',
  email: 'test@terrain.test',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: { full_name: 'Test User' },
  created_at: '2024-01-01T00:00:00Z',
};

// ── Mock Supabase Client ───────────────────────────────────

export function createMockSupabaseClient(overrides?: {
  user?: typeof MOCK_USER | null;
  authError?: Error | null;
  subscriptionPlan?: string;
  usageCount?: number;
}) {
  const user = overrides?.user !== undefined ? overrides.user : MOCK_USER;
  const authError = overrides?.authError ?? null;
  const plan = overrides?.subscriptionPlan ?? 'pro';
  const usageCount = overrides?.usageCount ?? 0;

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: authError,
      }),
    },
    from: vi.fn((table: string) => {
      if (table === 'subscriptions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { plan, status: 'active' },
            error: null,
          }),
        };
      }
      if (table === 'usage_events') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockResolvedValue({ count: usageCount, error: null }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    }),
  };
}

// ── Mock Factories ─────────────────────────────────────────

/**
 * Setup all common mocks for an API route test.
 * Call this in beforeEach() with the route module path.
 */
export function setupApiMocks(overrides?: Parameters<typeof createMockSupabaseClient>[0]) {
  const mockClient = createMockSupabaseClient(overrides);

  // Mock Supabase server client
  vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => mockClient),
  }));

  // Mock rate-limit — always allow by default
  vi.mock('@/lib/rate-limit', () => ({
    rateLimit: vi.fn().mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      retryAfter: 0,
    }),
    RATE_LIMITS: {
      analysis_free: { limit: 5, windowMs: 3600000 },
      analysis_pro: { limit: 20, windowMs: 3600000 },
      analysis_team: { limit: 60, windowMs: 3600000 },
      auth: { limit: 10, windowMs: 900000 },
    },
  }));

  // Mock usage — always allowed by default
  vi.mock('@/lib/usage', () => ({
    checkUsage: vi.fn().mockResolvedValue({
      allowed: true,
      plan: overrides?.subscriptionPlan ?? 'pro',
      feature: 'test',
      monthlyCount: overrides?.usageCount ?? 0,
      limit: -1,
      remaining: -1,
    }),
    recordUsage: vi.fn().mockResolvedValue(undefined),
  }));

  // Mock logger — silent in tests
  vi.mock('@/lib/logger', () => ({
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    withTiming: vi.fn(async (_label: string, fn: () => Promise<unknown>) => {
      const result = await fn();
      return { result, durationMs: 100 };
    }),
    logApiRequest: vi.fn(),
    logApiResponse: vi.fn(),
  }));

  return mockClient;
}

// ── Request Builder ────────────────────────────────────────

/**
 * Create a mock NextRequest with JSON body.
 */
export function createMockRequest(url: string, body: Record<string, unknown>, method = 'POST'): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── Response Parser ────────────────────────────────────────

/**
 * Parse a NextResponse into a typed object.
 */
export async function parseResponse<T = Record<string, unknown>>(
  response: Response,
): Promise<{ status: number; data: T }> {
  const data = (await response.json()) as T;
  return { status: response.status, data };
}
