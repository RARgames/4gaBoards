import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pageObjects/LoginPage';
import { ROLES } from '../../testData';

const BOARD_01 = 'Board 01';

test.describe('TC04: View Board - Role Based Access', () => {
  for (const role of ROLES) {
    test(`${role.name} - board view behavior`, async ({ page }) => {
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

      await test.step(`Verify board view for ${role.name}`, async () => {
        await expect(page.locator(`div[title="${BOARD_01}"]`).first()).toBeVisible({ timeout: 5000 });

        if (role.canEditBoard) {
          await expect(page.getByRole('button', { name: 'Add list' })).toBeVisible();
        } else {
          await expect(page.getByRole('button', { name: 'Add list' })).toHaveCount(0);
        }
      });
    });
  }

  test('Unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/boards/1776357153188087112');
    await expect(page.locator('input[name="emailOrUsername"]')).toBeVisible({ timeout: 10000 });
  });
});
