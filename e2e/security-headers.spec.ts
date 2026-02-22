import { test, expect } from '@playwright/test';

test.describe('Security Headers', () => {
  test('landing page returns security headers', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();

    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['strict-transport-security']).toContain('max-age=63072000');
  });

  test('API routes return security headers', async ({ request }) => {
    const response = await request.post('/api/analyze/market', {
      data: {},
    });
    const headers = response.headers();

    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('no X-Powered-By header is exposed', async ({ request }) => {
    const response = await request.get('/');
    expect(response.headers()['x-powered-by']).toBeUndefined();
  });
});
