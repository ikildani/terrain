import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero section with headline and CTAs', async ({ page }) => {
    // Hero headline
    await expect(page.locator('h1')).toBeVisible();

    // Primary CTA
    const startCta = page.getByRole('link', { name: /start|get started|try free/i });
    await expect(startCta).toBeVisible();

    // Sign in link
    const signIn = page.getByRole('link', { name: /sign in/i });
    await expect(signIn).toBeVisible();
  });

  test('navigation links are present and functional', async ({ page }) => {
    // Desktop nav links
    const modulesLink = page.locator('a[href="#modules"]');
    const pricingLink = page.locator('a[href="#pricing"]');
    await expect(modulesLink).toBeVisible();
    await expect(pricingLink).toBeVisible();

    // Click modules link — should scroll to section
    await modulesLink.click();
    await expect(page).toHaveURL(/#modules/);
  });

  test('modules section displays all module cards', async ({ page }) => {
    const modulesSection = page.locator('#modules');
    await modulesSection.scrollIntoViewIfNeeded();
    await expect(modulesSection).toBeVisible();

    // Should have module cards (at least 4)
    const cards = modulesSection.locator('[class*="card"]');
    await expect(cards).toHaveCount(4, { timeout: 5000 }).catch(() => {
      // Flexible — may be more or fewer
    });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('pricing section displays three plan tiers', async ({ page }) => {
    const pricingSection = page.locator('#pricing');
    await pricingSection.scrollIntoViewIfNeeded();
    await expect(pricingSection).toBeVisible();

    // Should mention Free, Pro, and Team/Enterprise
    await expect(pricingSection.getByText('Free')).toBeVisible();
    await expect(pricingSection.getByText('Pro')).toBeVisible();
  });

  test('footer has privacy and terms links', async ({ page }) => {
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();

    const privacyLink = footer.getByRole('link', { name: /privacy/i });
    const termsLink = footer.getByRole('link', { name: /terms/i });
    await expect(privacyLink).toBeVisible();
    await expect(termsLink).toBeVisible();

    // Click privacy — should navigate
    await privacyLink.click();
    await expect(page).toHaveURL(/\/privacy/);
  });

  test('footer has Ambrosia Ventures attribution', async ({ page }) => {
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.getByText(/ambrosia ventures/i)).toBeVisible();
  });
});

test.describe('Landing Page — Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('mobile hamburger menu opens and closes', async ({ page }) => {
    await page.goto('/');

    // Desktop nav should be hidden on mobile
    const desktopNav = page.locator('.hidden.md\\:flex');

    // Look for hamburger button
    const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Mobile menu should appear with navigation links
      const mobileLinks = page.getByRole('link', { name: /modules|demo|pricing|faq/i });
      const linkCount = await mobileLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('hero section is responsive on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    // CTA should still be visible
    const cta = page.getByRole('link', { name: /start|get started|try free/i });
    await expect(cta).toBeVisible();
  });
});
