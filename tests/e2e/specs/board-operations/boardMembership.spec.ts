import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pageObjects/LoginPage';
import { ROLES } from '../../testData';

const BOARD_01 = 'Board 01';

test.describe('TC05: Manage Board Memberships - Role Based Access', () => {
  for (const role of ROLES) {
    test(`${role.name} - membership management behavior`, async ({ page }) => {
      const loginPage = new LoginPage(page);

      await test.step(`Login as ${role.name}`, async () => {
        await loginPage.navigateToLoginPage();
        await loginPage.loginToDashboard(role.user.username, role.user.password);
        await expect(loginPage.dashboardTitle).toBeVisible({ timeout: 15000 });
      });

      await test.step(`Navigate to ${BOARD_01}`, async () => {
        await page.getByRole('button', { name: 'Project 01', exact: true }).first().click();
        await page.getByRole('link', { name: BOARD_01, exact: true }).last().click();
        await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 5000 });
      });

      await test.step(`Verify membership management for ${role.name}`, async () => {
        const addUserButton = page.getByRole('button', { name: 'Add user' });

        if (role.canManageMembers) {
          await expect(addUserButton).toBeVisible({ timeout: 3000 });
        } else {
          await expect(addUserButton).toHaveCount(0, { timeout: 3000 });
        }
      });
    });
  }
});