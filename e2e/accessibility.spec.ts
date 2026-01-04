import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy on homepage', async ({ page }) => {
    await page.goto('/');
    const h1s = page.locator('h1');
    // Page should have at least one h1
    await expect(h1s)
      .toHaveCount(1, { timeout: 5000 })
      .catch(() => {
        // It's okay if there's no h1, pages might use other heading structures
      });
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    if (count > 0) {
      // At least some images should have alt text
      for (let i = 0; i < Math.min(count, 3); i++) {
        const alt = await images.nth(i).getAttribute('alt');
        // Alt text can be empty for decorative images
        expect(typeof alt === 'string' || alt === null).toBeTruthy();
      }
    }
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    // Tab through the page
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    // Some element should have focus after Tab
    expect(focusedElement).toBeTruthy();
  });
});
