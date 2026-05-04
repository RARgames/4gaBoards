import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test('should log in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('demo', 'demo');

    await expect(page).toHaveURL('/');
    await expect(page).toHaveTitle('4ga Boards');
  });
});
