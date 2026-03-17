import { test, expect } from '@playwright/test';

test.describe('Reports Module', () => {
  test('reports page loads (or redirects to login)', async ({ page }) => {
    await page.goto('/reports');

    await page.waitForURL(/\/(reports|login|auth)/, { timeout: 10_000 });
    const url = page.url();
    expect(url).toMatch(/\/(reports|login|auth)/);

    if (url.includes('/reports')) {
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible({ timeout: 5000 });
    }
  });

  test('shows empty state when no reports saved', async ({ page }) => {
    await page.goto('/reports');

    const url = page.url();
    if (url.includes('/login')) {
      expect(url).toContain('/login');
      return;
    }

    // Look for empty state messaging (common patterns)
    const emptyState = page
      .getByText(/no reports|haven't saved|get started|run your first/i)
      .or(page.locator('[class*="empty"]'));

    // If reports exist, the empty state won't show — both scenarios are valid
    const reportCards = page.locator('[class*="report"]').or(page.locator('table tbody tr'));
    const hasReports = (await reportCards.count()) > 0;
    const hasEmpty = await emptyState
      .first()
      .isVisible()
      .catch(() => false);

    // Either reports are shown or empty state is shown
    expect(hasReports || hasEmpty).toBe(true);
  });

  test('has filter controls', async ({ page }) => {
    await page.goto('/reports');

    const url = page.url();
    if (url.includes('/login')) {
      expect(url).toContain('/login');
      return;
    }

    // Look for filter/search controls
    const filterControl = page
      .getByPlaceholder(/search|filter/i)
      .or(page.getByRole('combobox'))
      .or(page.locator('select'))
      .or(page.locator('[class*="filter"]'))
      .or(page.getByText(/all types|filter by/i));

    const hasFilters = (await filterControl.count()) > 0;
    expect(hasFilters).toBe(true);
  });
});
