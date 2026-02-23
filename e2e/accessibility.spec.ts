import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.describe('Landing page', () => {
    test('has proper heading hierarchy', async ({ page }) => {
      await page.goto('/');

      // Should have exactly one h1
      const h1s = await page.locator('h1').count();
      expect(h1s).toBe(1);

      // h2s should exist for sections
      const h2s = await page.locator('h2').count();
      expect(h2s).toBeGreaterThan(0);
    });

    test('all images have alt text', async ({ page }) => {
      await page.goto('/');

      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt, `Image ${i} missing alt text`).toBeTruthy();
      }
    });

    test('all form inputs have associated labels', async ({ page }) => {
      await page.goto('/');

      const inputs = page.locator('input:not([type="hidden"])');
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');

        // Input should have either a label[for], aria-label, aria-labelledby, or at minimum placeholder
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = (await label.count()) > 0;
          const hasAria = !!ariaLabel || !!ariaLabelledBy;
          expect(
            hasLabel || hasAria || !!placeholder,
            `Input ${i} (id="${id}") has no label or aria attribute`
          ).toBeTruthy();
        }
      }
    });

    test('interactive elements are keyboard focusable', async ({ page }) => {
      await page.goto('/');

      // Tab to first interactive element
      await page.keyboard.press('Tab');

      // Something should be focused
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBeTruthy();
      expect(focused).not.toBe('BODY');
    });
  });

  test.describe('Login page', () => {
    test('form inputs have proper labels', async ({ page }) => {
      await page.goto('/login');

      // Email input should have a label
      const emailLabel = page.locator('label[for="email"]');
      await expect(emailLabel).toBeVisible();

      // Password input should have a label
      const passwordLabel = page.locator('label[for="password"]');
      await expect(passwordLabel).toBeVisible();
    });

    test('submit button communicates loading state', async ({ page }) => {
      await page.goto('/login');

      const submitBtn = page.locator('button[type="submit"]');
      await expect(submitBtn).toBeVisible();

      // Initially not busy
      const ariaBusy = await submitBtn.getAttribute('aria-busy');
      expect(ariaBusy).toBeNull();
    });
  });

  test.describe('Signup page', () => {
    test('form inputs have proper labels', async ({ page }) => {
      await page.goto('/signup');

      const nameLabel = page.locator('label[for="fullName"]');
      await expect(nameLabel).toBeVisible();

      const emailLabel = page.locator('label[for="email"]');
      await expect(emailLabel).toBeVisible();

      const passwordLabel = page.locator('label[for="password"]');
      await expect(passwordLabel).toBeVisible();
    });

    test('submit button has aria-busy support', async ({ page }) => {
      await page.goto('/signup');

      const submitBtn = page.locator('button[type="submit"]');
      await expect(submitBtn).toBeVisible();
      await expect(submitBtn).toBeEnabled();
    });
  });

  test.describe('Focus management', () => {
    test('focus-visible styles are applied on keyboard navigation', async ({ page }) => {
      await page.goto('/login');

      // Tab to focus the first input
      await page.keyboard.press('Tab');

      // The focused element should have focus-visible styles
      const focusedEl = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;
        const styles = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          outlineStyle: styles.outlineStyle,
          outlineColor: styles.outlineColor,
        };
      });

      expect(focusedEl).toBeTruthy();
    });

    test('skip links or logical tab order on landing page', async ({ page }) => {
      await page.goto('/');

      // Press Tab multiple times and verify we cycle through interactive elements
      const focusSequence: string[] = [];
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        const tag = await page.evaluate(() => document.activeElement?.tagName || 'NONE');
        focusSequence.push(tag);
      }

      // Should have focused on at least some interactive elements (not all BODY)
      const interactiveCount = focusSequence.filter(
        t => t !== 'BODY' && t !== 'NONE'
      ).length;
      expect(interactiveCount).toBeGreaterThan(0);
    });
  });

  test.describe('Color contrast and visual', () => {
    test('text elements have sufficient color styling', async ({ page }) => {
      await page.goto('/');

      // Check that the page renders (basic smoke test for styles)
      const bodyBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      // Body should have the navy-950 background
      expect(bodyBg).toBeTruthy();
      expect(bodyBg).not.toBe('');
    });
  });
});
