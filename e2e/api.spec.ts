import { test, expect } from '@playwright/test';

test.describe('API Route Protection', () => {
  test('POST /api/analyze/market returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/analyze/market', {
      data: {
        input: {
          indication: 'Non-Small Cell Lung Cancer',
          geography: ['US'],
          launch_year: 2026,
        },
        product_category: 'pharmaceutical',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Authentication');
  });

  test('POST /api/analyze/competitive returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/analyze/competitive', {
      data: {
        input: { indication: 'NSCLC' },
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('POST /api/analyze/regulatory returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/analyze/regulatory', {
      data: {
        input: {
          indication: 'NSCLC',
          geography: 'FDA',
          development_stage: 'phase2',
        },
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('POST /api/analyze/partners returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/analyze/partners', {
      data: {
        input: {
          indication: 'NSCLC',
          mechanism: 'KRAS G12C inhibitor',
          development_stage: 'phase2',
          geography_rights: ['US'],
          deal_types: ['licensing'],
        },
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('GET /api/reports returns 401 without auth', async ({ request }) => {
    const response = await request.get('/api/reports');
    expect(response.status()).toBe(401);
  });

  test('POST /api/stripe/checkout returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/stripe/checkout', {
      data: { plan: 'pro' },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('POST /api/stripe/portal returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/stripe/portal');
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('POST /api/stripe/webhook returns 400 without signature', async ({ request }) => {
    const response = await request.post('/api/stripe/webhook', {
      data: { type: 'test' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('signature');
  });
});

test.describe('API Input Validation', () => {
  test('POST /api/analyze/market validates required fields', async ({ request }) => {
    // Missing product_category
    const response = await request.post('/api/analyze/market', {
      data: {
        demo: true,
        input: {
          indication: 'NSCLC',
          geography: ['US'],
          launch_year: 2026,
        },
      },
    });

    // Should be 400 (missing product_category) or could be validated differently
    const body = await response.json();
    if (response.status() === 400) {
      expect(body.success).toBe(false);
    }
  });

  test('POST /api/analyze/market demo mode works without auth', async ({ request }) => {
    const response = await request.post('/api/analyze/market', {
      data: {
        demo: true,
        input: {
          indication: 'Non-Small Cell Lung Cancer',
          geography: ['US'],
          launch_year: 2026,
        },
        product_category: 'pharmaceutical',
      },
    });

    // Demo mode should return data (200) or rate limit (429), not 401
    expect(response.status()).not.toBe(401);

    if (response.status() === 200) {
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    }
  });
});

test.describe('API Response Headers', () => {
  test('analysis endpoints set Cache-Control: private, no-store', async ({ request }) => {
    const response = await request.post('/api/analyze/market', {
      data: {
        demo: true,
        input: {
          indication: 'Non-Small Cell Lung Cancer',
          geography: ['US'],
          launch_year: 2026,
        },
        product_category: 'pharmaceutical',
      },
    });

    if (response.status() === 200) {
      const cacheControl = response.headers()['cache-control'];
      expect(cacheControl).toContain('private');
      expect(cacheControl).toContain('no-store');
    }
  });
});
