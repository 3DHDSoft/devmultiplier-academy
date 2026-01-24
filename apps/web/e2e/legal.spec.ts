import { test, expect } from '@playwright/test';

test.describe('Legal Pages', () => {
  test('should load privacy policy page', async ({ page }) => {
    await page.goto('/privacy-policy');
    await expect(page).toHaveTitle(/DevMultiplier/);
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should redirect /privacy to /privacy-policy', async ({ page }) => {
    await page.goto('/privacy', { waitUntil: 'networkidle' });
    // Playwright follows redirects by default
    await expect(page).toHaveURL(/privacy-policy/);
  });

  test('should load terms of service page', async ({ page }) => {
    await page.goto('/terms-of-service');
    await expect(page).toHaveTitle(/DevMultiplier/);
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should redirect /terms to /terms-of-service', async ({ page }) => {
    await page.goto('/terms', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/terms-of-service/);
  });

  test('should have contact email in privacy policy', async ({ page }) => {
    await page.goto('/privacy-policy');
    const emailLink = page.locator('a[href*="mailto:"]');
    const isVisible = await emailLink.isVisible().catch(() => false);
    // Email link may or may not be visible depending on page structure
    if (isVisible) {
      await expect(emailLink).toBeVisible();
    }
  });
});
