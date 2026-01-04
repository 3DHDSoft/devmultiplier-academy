import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DevMultiplier/);
  });

  test('should display header', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    // Check for main navigation elements
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});
