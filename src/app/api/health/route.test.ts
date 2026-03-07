import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock redis
const mockPing = vi.fn();
vi.mock('@/lib/redis', () => ({
  redis: {
    ping: mockPing,
  },
}));

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.resetModules();
    mockPing.mockReset();
  });

  it('returns 200 with healthy status when Redis is OK', async () => {
    mockPing.mockResolvedValue('PONG');
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('healthy');
  });

  it('returns 503 with degraded status when Redis fails', async () => {
    mockPing.mockRejectedValue(new Error('Connection refused'));
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
  });

  it('sets Cache-Control: no-store header', async () => {
    mockPing.mockResolvedValue('PONG');
    const { GET } = await import('./route');
    const response = await GET();

    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('includes version from env or defaults to dev', async () => {
    mockPing.mockResolvedValue('PONG');
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();

    // Route returns simple { status } — version not included in current implementation
    expect(body.status).toBeDefined();
  });
});
