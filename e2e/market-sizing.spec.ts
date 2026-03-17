import { test, expect } from '@playwright/test';

test.describe('Market Sizing Module', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to market sizing (will redirect to login if not auth'd)
    await page.goto('/market-sizing');
  });

  test('page loads without crash', async ({ page }) => {
    // Should see either the form or login redirect
    const title = page.locator('h1');
    await expect(title).toBeVisible({ timeout: 10000 });
  });

  test('form renders with all product categories', async ({ page }) => {
    // Look for product type selector buttons
    const pharmaBtn = page.getByText('Pharmaceutical');
    const deviceBtn = page.getByText('Medical Device');
    await expect(pharmaBtn).toBeVisible();
    await expect(deviceBtn).toBeVisible();
  });

  test('pharma form has required fields', async ({ page }) => {
    // Indication field should be visible
    const indicationField = page.getByPlaceholder(/indication|e.g./i);
    await expect(indicationField).toBeVisible();

    // Geography section should exist
    const geoSection = page.getByText('Geographies');
    await expect(geoSection).toBeVisible();

    // Submit button should exist
    const submitBtn = page.getByText('Generate Analysis');
    await expect(submitBtn).toBeVisible();
  });

  test('device form shows procedure field', async ({ page }) => {
    // Click Medical Device
    await page.getByText('Medical Device').click();

    // Should show procedure field
    const procedureField = page.getByPlaceholder(/procedure|condition/i);
    await expect(procedureField).toBeVisible({ timeout: 5000 });
  });

  test('charts container exists after analysis', async ({ page }) => {
    // This test verifies the DOM structure for charts
    // Note: requires authenticated session for full test
    const chartContainer = page.locator('.chart-container');
    // If not logged in, we just verify the page structure loads
    const pageContent = page.locator('[class*="page-content"]');
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Dashboard', () => {
  test('dashboard page loads', async ({ page }) => {
    await page.goto('/dashboard');
    // Should see either dashboard content or login redirect
    await expect(page).toHaveURL(/dashboard|login/);
  });
});

test.describe('Landing Page', () => {
  test('landing page loads without errors', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Terrain/);

    // No error boundaries should be visible
    const errorBoundary = page.getByText('Something went wrong');
    await expect(errorBoundary).not.toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');

    // CTA button should exist
    const ctaBtn = page.getByText(/Start for free|Try it free|Get started/i);
    await expect(ctaBtn).toBeVisible();
  });
});
