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

  test('CSP header is present with script-src directive', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();
    const csp = headers['content-security-policy'];

    expect(csp).toBeDefined();
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("object-src 'none'");
  });

  test('HSTS header includes includeSubDomains', async ({ request }) => {
    const response = await request.get('/');
    const hsts = response.headers()['strict-transport-security'];

    expect(hsts).toBeDefined();
    expect(hsts).toContain('max-age=');
    expect(hsts).toContain('includeSubDomains');
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
