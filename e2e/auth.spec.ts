import { test, expect } from '@playwright/test';

test.describe('Authentication Pages', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/DevMultiplier/);
  });

  test('login page should have email and password inputs', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should load register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveTitle(/DevMultiplier/);
  });

  test('register page should have form inputs', async ({ page }) => {
    await page.goto('/register');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('should validate email format on login', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    // Browser HTML5 validation will trigger
    await expect(emailInput).toBeFocused();
  });
});
