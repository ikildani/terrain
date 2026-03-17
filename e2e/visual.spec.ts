import { test, expect } from '@playwright/test';
import * as path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

test.describe('Visual Regression Foundation', () => {
  test('capture screenshot of landing page hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    // Wait for fonts and images to load
    await page.waitForLoadState('networkidle');

    // Capture the hero section (first viewport)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'landing-hero.png'),
      fullPage: false,
    });
  });

  test('capture screenshot of empty market-sizing page', async ({ page }) => {
    await page.goto('/market-sizing');

    // Wait for page to settle (may redirect to login)
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'market-sizing.png'),
      fullPage: false,
    });
  });

  test('capture screenshot of login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();

    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'login.png'),
      fullPage: false,
    });
  });
});
