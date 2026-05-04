import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login - Invalid Credentials', () => {
  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[name="emailOrUsername"]').fill('wronguser');
    await page.locator('input[name="password"]').fill('wrongpass');
    await page.locator('button:has-text("Log in")').click();

    // Error message appears and user stays on login page
    await expect(page.getByText('Invalid username or password')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
