import { test, expect } from '@playwright/test';

test.describe('Course Pages', () => {
  test('should load courses page', async ({ page }) => {
    await page.goto('/courses');
    await expect(page).toHaveTitle(/DevMultiplier/);
  });

  test('should display courses section', async ({ page }) => {
    await page.goto('/courses');
    const heading = page.locator('h1, h2');
    await expect(heading).toBeTruthy();
  });

  test('should load pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page).toHaveTitle(/DevMultiplier/);
  });

  test('should load about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/DevMultiplier/);
  });

  test('should load contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveTitle(/DevMultiplier/);
  });
});
