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

vi.mock('@/lib/utils/sentry', () => ({ captureApiError: vi.fn() }));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logApiRequest: vi.fn(),
  logApiResponse: vi.fn(),
}));

import { GET } from './route';
import { rateLimit } from '@/lib/rate-limit';
import { INDICATION_DATA } from '@/lib/data/indication-map';

// ── Helpers ───────────────────────────────────────────────────

const KEY_CTX = { workspaceId: 'ws-1', keyId: 'key-1', scopes: ['demand'], rateLimitRpm: 60 };

function makeRequest(query = '') {
  return new NextRequest(`http://localhost:3000/api/v1/demand${query}`, {
    method: 'GET',
    headers: { authorization: 'Bearer sk_terrain_test' },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(KEY_CTX);
  vi.mocked(rateLimit).mockResolvedValue({ success: true, limit: 60, remaining: 59, retryAfter: 0 });
});

// ── Tests ─────────────────────────────────────────────────────

describe('GET /api/v1/demand', () => {
  it('returns 401 without a valid API key', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('returns 403 without the demand scope', async () => {
    mockAuth.mockResolvedValue({ ...KEY_CTX, scopes: ['reports'] });
    const res = await GET(makeRequest());
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/demand scope/);
  });

  it('returns 429 when rate limited', async () => {
    vi.mocked(rateLimit).mockResolvedValueOnce({ success: false, limit: 60, remaining: 0, retryAfter: 12 });
    const res = await GET(makeRequest());
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('12');
  });

  it('lists every Terrain indication with both keys and a 24-hour cache header', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('private, max-age=86400');
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.contractVersion).toBe('1.0');
    expect(body.data.count).toBe(INDICATION_DATA.length);
    expect(body.data.indications.length).toBe(INDICATION_DATA.length);

    const alz = body.data.indications.find((i: { terrainName: string }) => i.terrainName === "Alzheimer's Disease");
    expect(alz).toEqual(
      expect.objectContaining({ solidusKey: 'alzheimers', therapyArea: 'neurology', match: 'exact' }),
    );

    const nsclc = body.data.indications.find((i: { solidusKey: string | null }) => i.solidusKey === 'lung_nsclc');
    expect(nsclc.terrainName).toBe('Non-Small Cell Lung Cancer');

    const mash = body.data.indications.find((i: { solidusKey: string | null }) => i.solidusKey === 'nashMash');
    expect(mash.solidusAliases).toContain('nonAlcoholicSteatohepatitis');

    expect(body.data.coverage.totalKeys).toBe(271);
    expect(body.data.coverage.mappedKeys).toBe(178);
    expect(body.data.unmappedSolidusKeys.some((u: { solidusKey: string }) => u.solidusKey === 'all')).toBe(true);
    expect(body.data.territories).toContain('US');
    expect(body.data.territories).toContain('us_only');
  });

  it('filters by therapy_area and mapped=true', async () => {
    const res = await GET(makeRequest('?therapy_area=neurology&mapped=true'));
    const body = await res.json();
    expect(body.data.count).toBeGreaterThan(0);
    for (const i of body.data.indications) {
      expect(i.therapyArea).toBe('neurology');
      expect(i.solidusKey).not.toBeNull();
    }
  });
});
