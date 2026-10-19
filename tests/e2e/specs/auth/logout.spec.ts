import { test, expect } from '@playwright/test';

// Use fresh storage state — this test logs out and would break parallel tests
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Logout', () => {
  test('should log out successfully', async ({ page }) => {
    // First log in
    await page.goto('/login');
    await page.locator('input[name="emailOrUsername"]').fill('demo');
    await page.locator('input[name="password"]').fill('demo');
    await page.locator('button:has-text("Log in")').click();
    await page.waitForURL('/');

    // Click user avatar to open menu
    await page.locator('button[title="Profile and Settings"]').click();
    const popup = page.getByRole('dialog');
    await expect(popup).toBeVisible();

    // Click Log Out
    await popup.getByRole('button', { name: 'Log Out' }).click();

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });
});
