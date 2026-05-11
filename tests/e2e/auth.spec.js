const { expect, test } = require('@playwright/test');

const { DEFAULT_PASSWORD, DEFAULT_USER } = require('./helpers/boardsApi');
const { LoginPage } = require('./pages/LoginPage');

test.describe('authentication', () => {
  test('shows validation feedback for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await expect(loginPage.heading()).toBeVisible();
    await loginPage.login(DEFAULT_USER, 'wrong-password');

    await expect(loginPage.errorMessage('Invalid username or password')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('allows the default demo user to log in', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(DEFAULT_USER, DEFAULT_PASSWORD);

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: 'Add Project' }).first()).toBeVisible();
  });
});
