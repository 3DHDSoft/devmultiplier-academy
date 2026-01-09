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

    // Test that email input exists and is visible
    await expect(emailInput).toBeVisible();

    // Clear any existing value and set valid email
    await emailInput.clear();
    await emailInput.type('valid@example.com');

    // Verify the value was entered
    const value = await emailInput.inputValue();
    expect(value).toBe('valid@example.com');

    // Test HTML5 validation - input should be valid with proper email
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(isValid).toBe(true);

    // Now test with invalid email
    await emailInput.clear();
    await emailInput.type('invalid-email');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });
});
