import { test, expect } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage.js';
import { getDemoCredentials } from '../support/env.js';

test.describe('User authentication', () => {
  test('dashboard loads after valid local credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Open the login screen', async () => {
      await loginPage.goto();
    });

    await test.step('Sign in with seeded demo credentials', async () => {
      await loginPage.login(getDemoCredentials());
    });

    await test.step('Projects dashboard is shown', async () => {
      await expect(page.getByTestId('projects-dashboard')).toBeVisible();
    });
  });

  test('invalid password shows a clear error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const { emailOrUsername } = getDemoCredentials();

    await test.step('Open the login screen', async () => {
      await loginPage.goto();
    });

    await test.step('Submit a wrong password', async () => {
      await loginPage.login({
        emailOrUsername,
        password: 'definitely-not-the-demo-password',
      });
    });

    await test.step('Server error is visible to the user', async () => {
      await expect(page.getByTestId('login-message')).toContainText('Invalid username or password');
    });
  });
});
