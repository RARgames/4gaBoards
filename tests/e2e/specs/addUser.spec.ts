import { test, expect } from '@playwright/test';
import { LoginPage } from '../pageObjects/LoginPage';
import { UserSettingPage } from '../pageObjects/UserSettingPage';

test('admin user can create a new user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const userSettingPage = new UserSettingPage(page);
  const createdUserEmails: string[] = [];

  const user = {
    email: 'test_user@gmail.com',
    password: 'Abcde@123',
    name: 'test user',
    username: 'test_user',
  };

  try {
    await test.step('Log in as admin', async () => {
      await loginPage.navigateToLoginPage();
      await expect(page).toHaveURL(loginPage.loginUrl);
      await loginPage.loginToDashboard('demo', 'demo');
      await expect(page).toHaveURL(loginPage.dashboardUrl);
      await expect(loginPage.dashboardTitle).toBeVisible({ timeout: 15000 });
    });

    await test.step('Navigate to users setting page', async () => {
      await userSettingPage.navigateToUsersSettingPage();
    });

    await test.step('Create new user', async () => {
      await userSettingPage.addUserButton.click();
      await userSettingPage.addUser(user.email, user.password, user.name, user.username);
      createdUserEmails.push(user.email);
    });

    await test.step('Verify new user appears in list', async () => {
      await expect(page.locator(`div[title='${user.email}']`)).toBeVisible();
    });
  } finally {
    if (!createdUserEmails.length) {
      return;
    }

    await userSettingPage.navigateToUsersSettingPage();

    for (const email of [...createdUserEmails].reverse()) {
      await userSettingPage.deleteUserByEmail(email).catch((error: unknown) => {
        console.warn(`Cleanup failed for user ${email}:`, error);
      });
    }
  }
});
