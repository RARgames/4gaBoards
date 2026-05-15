import { test, expect } from '@playwright/test';
import { LoginPage } from '../pageObjects/LoginPage';

test('admin user logs in with valid credentials', async ({ page }) => {
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
