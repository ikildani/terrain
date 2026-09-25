import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────

const mockAuth = vi.fn();
vi.mock('@/lib/api/api-key-auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/api-key-auth')>('@/lib/api/api-key-auth');
  return { ...actual, authenticateApiKey: (...args: unknown[]) => mockAuth(...args) };
});

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true, limit: 60, remaining: 59, retryAfter: 0 }),
}));

vi.mock('@/lib/audit', () => ({ logAudit: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/activity', () => ({ logActivity: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/utils/sentry', () => ({ captureApiError: vi.fn() }));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  withTiming: vi.fn(async (_label: string, fn: () => Promise<unknown>) => ({ result: await fn(), durationMs: 1 })),
  logApiRequest: vi.fn(),
  logApiResponse: vi.fn(),
}));

const mockGetProfile = vi.fn();
vi.mock('@/lib/demand/demand-layer', async () => {
  const actual = await vi.importActual<typeof import('@/lib/demand/demand-layer')>('@/lib/demand/demand-layer');
  return { ...actual, getDemandProfileCached: (...args: unknown[]) => mockGetProfile(...args) };
});

import { GET } from './route';
import { rateLimit } from '@/lib/rate-limit';
import { UnknownTerritoryError } from '@/lib/demand/demand-layer';

// ── Helpers ───────────────────────────────────────────────────

const KEY_CTX = { workspaceId: 'ws-1', keyId: 'key-1', scopes: ['demand'], rateLimitRpm: 60 };

function makeRequest(indication: string, query = '', headers: Record<string, string> = {}) {
  return new NextRequest(`http://localhost:3000/api/v1/demand/${encodeURIComponent(indication)}${query}`, {
    method: 'GET',
    headers: { authorization: 'Bearer sk_terrain_test', ...headers },
  });
}

function ctx(indication: string) {
  return { params: Promise.resolve({ indication }) };
}

const FAKE_PROFILE = {
  identity: { terrainName: "Alzheimer's Disease", solidusKey: 'alzheimers', therapyArea: 'neurology' },
  asOf: '2026-09-25',
  assumptions: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(KEY_CTX);
  mockGetProfile.mockResolvedValue({ profile: FAKE_PROFILE, cacheHit: false });
  vi.mocked(rateLimit).mockResolvedValue({ success: true, limit: 60, remaining: 59, retryAfter: 0 });
});

// ── Tests ─────────────────────────────────────────────────────

describe('GET /api/v1/demand/[indication]', () => {
  it('returns 401 when the API key is missing or invalid', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(makeRequest('alzheimers'), ctx('alzheimers'));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/API key/);
    expect(res.headers.get('X-Request-Id')).toBeTruthy();
  });

  it('returns 403 when the key lacks the demand scope', async () => {
    mockAuth.mockResolvedValue({ ...KEY_CTX, scopes: ['market_sizing', 'reports'] });
    const res = await GET(makeRequest('alzheimers'), ctx('alzheimers'));
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/demand scope/);
    expect(mockGetProfile).not.toHaveBeenCalled();
  });

  it('allows wildcard-scoped keys', async () => {
    mockAuth.mockResolvedValue({ ...KEY_CTX, scopes: ['*'] });
    const res = await GET(makeRequest('alzheimers'), ctx('alzheimers'));
    expect(res.status).toBe(200);
  });

  it('returns 429 when the per-key rate limit is exceeded', async () => {
    vi.mocked(rateLimit).mockResolvedValueOnce({ success: false, limit: 60, remaining: 0, retryAfter: 30 });
    const res = await GET(makeRequest('alzheimers'), ctx('alzheimers'));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
  });

  it('returns the demand profile with a 1-hour private cache header', async () => {
    const res = await GET(makeRequest('alzheimers', '?territory=EU5&asOf=2026-09-25'), ctx('alzheimers'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.identity.solidusKey).toBe('alzheimers');
    expect(res.headers.get('Cache-Control')).toBe('private, max-age=3600');
    expect(res.headers.get('X-Cache')).toBe('MISS');
    expect(mockGetProfile).toHaveBeenCalledWith('alzheimers', { territory: 'EU5', asOf: '2026-09-25' });
  });

  it('reports cache hits', async () => {
    mockGetProfile.mockResolvedValueOnce({ profile: FAKE_PROFILE, cacheHit: true });
    const res = await GET(makeRequest('alzheimers'), ctx('alzheimers'));
    expect(res.headers.get('X-Cache')).toBe('HIT');
  });

  it('returns 404 with the nearest 3 suggestions for an unmapped Solidus key', async () => {
    mockGetProfile.mockResolvedValueOnce(undefined);
    const res = await GET(makeRequest('thymoma'), ctx('thymoma'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/no Terrain counterpart/);
    expect(Array.isArray(body.suggestions)).toBe(true);
    expect(body.suggestions.length).toBeGreaterThan(0);
    expect(body.suggestions.length).toBeLessThanOrEqual(3);
    for (const s of body.suggestions) {
      expect(s.terrainName).toBeTypeOf('string');
      expect(s.therapyArea).toBeTypeOf('string');
      expect('solidusKey' in s).toBe(true);
    }
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('returns 404 with suggestions for an unknown indication', async () => {
    mockGetProfile.mockResolvedValueOnce(undefined);
    const res = await GET(makeRequest('lung_nsclcx'), ctx('lung_nsclcx'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/not found/);
    expect(body.suggestions[0].terrainName).toBe('Non-Small Cell Lung Cancer');
    expect(body.suggestions[0].solidusKey).toBe('lung_nsclc');
  });

  it('returns 400 for an unsupported territory', async () => {
    mockGetProfile.mockRejectedValueOnce(new UnknownTerritoryError('mars'));
    const res = await GET(makeRequest('alzheimers', '?territory=mars'), ctx('alzheimers'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Unknown territory "mars"/);
    expect(body.errors).toContain('US');
  });

  it('returns 400 for a malformed asOf', async () => {
    const res = await GET(makeRequest('alzheimers', '?asOf=yesterday'), ctx('alzheimers'));
    expect(res.status).toBe(400);
    expect(mockGetProfile).not.toHaveBeenCalled();
  });

  it('returns 500 with the shared error shape when the engine throws', async () => {
    mockGetProfile.mockRejectedValueOnce(new Error('boom'));
    const res = await GET(makeRequest('alzheimers'), ctx('alzheimers'));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ success: false, error: 'Demand profile failed. Please try again.' });
  });
});
