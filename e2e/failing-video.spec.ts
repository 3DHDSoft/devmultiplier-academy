import { test, expect } from '@playwright/test';

test('deliberate failure for video test', async ({ page }) => {
  await page.goto('/');
  // Intentionally fail: look for a non-existent element
  await page.click('[data-testid="this-element-does-not-exist"]');
  // This line will never be reached
  expect(true).toBe(false);
});
