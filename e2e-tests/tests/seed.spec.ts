import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="emailOrUsername"]').fill('demo');
    await page.locator('input[name="password"]').fill('demo');
    await page.locator('button:has-text("Log in")').click();
    await page.waitForURL('/');
  });
});
