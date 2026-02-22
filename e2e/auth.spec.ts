import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page loads with email and password fields', async ({ page }) => {
    await page.goto('/login');

    // Should have email + password inputs
    const emailInput = page.getByLabel(/email/i).or(page.locator('input[type="email"]'));
    const passwordInput = page.getByLabel(/password/i).or(page.locator('input[type="password"]'));
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Should have sign in button
    const submitButton = page.getByRole('button', { name: /sign in|log in|continue/i });
    await expect(submitButton).toBeVisible();
  });

  test('signup page loads with registration fields', async ({ page }) => {
    await page.goto('/signup');

    // Should have email input at minimum
    const emailInput = page.getByLabel(/email/i).or(page.locator('input[type="email"]'));
    await expect(emailInput).toBeVisible();

    // Should have create account / sign up button
    const submitButton = page.getByRole('button', { name: /sign up|create|register|get started/i });
    await expect(submitButton).toBeVisible();
  });

  test('login form shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');

    // Click submit without filling in fields
    const submitButton = page.getByRole('button', { name: /sign in|log in|continue/i });
    await submitButton.click();

    // Should show some kind of error state (either form validation or inline error)
    // Wait a moment for client-side validation
    await page.waitForTimeout(500);

    // Check for HTML5 validation, inline errors, or error styling
    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('login page has link to signup', async ({ page }) => {
    await page.goto('/login');
    const signupLink = page.getByRole('link', { name: /sign up|create account|register/i });
    await expect(signupLink).toBeVisible();
  });

  test('signup page has link to login', async ({ page }) => {
    await page.goto('/signup');
    const loginLink = page.getByRole('link', { name: /sign in|log in|already have/i });
    await expect(loginLink).toBeVisible();
  });

  test('unauthenticated user is redirected from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to login
    await page.waitForURL(/\/(login|auth)/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/(login|auth)/);
  });

  test('unauthenticated user is redirected from market-sizing', async ({ page }) => {
    await page.goto('/market-sizing');
    await page.waitForURL(/\/(login|auth)/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/(login|auth)/);
  });

  test('privacy page loads without auth', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toBeVisible();
    expect(page.url()).toContain('/privacy');
  });

  test('terms page loads without auth', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('h1')).toBeVisible();
    expect(page.url()).toContain('/terms');
  });
});
