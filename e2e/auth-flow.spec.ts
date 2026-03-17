import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('login page loads with email and password fields', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('signup page loads with name, email, and password fields', async ({ page }) => {
    await page.goto('/signup');

    const nameInput = page.locator('#fullName').or(page.getByLabel(/name/i));
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('unauthenticated user redirected from /market-sizing to /login', async ({ page }) => {
    await page.goto('/market-sizing');
    await page.waitForURL(/\/(login|auth)/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/(login|auth)/);
  });

  test('unauthenticated user redirected from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/(login|auth)/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/(login|auth)/);
  });

  test('login page has "forgot password" link', async ({ page }) => {
    await page.goto('/login');

    const forgotLink = page.getByRole('link', { name: /forgot password/i });
    await expect(forgotLink).toBeVisible();

    // Should point to reset-password route
    const href = await forgotLink.getAttribute('href');
    expect(href).toContain('reset-password');
  });
});
