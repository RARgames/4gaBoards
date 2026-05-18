import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../e2e/pageObjects/LoginPage';

const ADMIN = { username: 'demo', password: 'demo' };

export async function loginAsAdmin(page: Page): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLoginPage();
  await loginPage.loginToDashboard(ADMIN.username, ADMIN.password);
  await expect(page).toHaveURL(loginPage.dashboardUrl, { timeout: 15000 });
}

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
