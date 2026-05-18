import { test, expect } from '@playwright/test';
import { LoginPage } from '../pageObjects/LoginPage';

test.describe('Authentication', () => {
  test('admin logs in with valid credentials', { tag: '@smoke' }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Navigate to login page', async () => {
      await loginPage.navigateToLoginPage();
      await expect(page).toHaveURL(loginPage.loginUrl);
    });

    await test.step('Log in with admin credentials', async () => {
      await loginPage.loginToDashboard('demo', 'demo');
    });

    await test.step('Validate dashboard is visible', async () => {
      await expect(page).toHaveURL(loginPage.dashboardUrl);
      await expect(loginPage.dashboardTitle).toBeVisible({ timeout: 15000 });
    });
  });

  test('shows error message with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Navigate to login page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await test.step('Submit wrong password', async () => {
      await loginPage.loginToDashboard('demo', 'wrong_password');
    });

    await test.step('Verify error is shown and user stays on login page', async () => {
      await expect(page.locator("div[title='Invalid username or password']")).toBeVisible({ timeout: 10000 });
      await expect(page).toHaveURL(loginPage.loginUrl);
    });
  });
});
