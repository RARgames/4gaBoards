import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pageObjects/LoginPage';
import { BoardPage } from '../../pageObjects/BoardPage';
import { ROLES, TEST_PROJECT_NAME } from '../../testData';

const TEST_BOARD_NAME = `TC03 Board ${Date.now()}`;

test.describe('TC03: Delete Board - Role Based Access', () => {
  for (const role of ROLES) {
    test(`${role.name} - delete board behavior`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const boardPage = new BoardPage(page);
      const boardName = `${TEST_BOARD_NAME} ${role.name}`;

      await test.step(`Login as ${role.name}`, async () => {
        await loginPage.navigateToLoginPage();
        await loginPage.loginToDashboard(role.user.username, role.user.password);
        await expect(loginPage.dashboardTitle).toBeVisible({ timeout: 15000 });
      });

      if (role.isProjectManager) {
        await test.step(`Create board as ${role.name}`, async () => {
          await boardPage.createBoard(boardName, TEST_PROJECT_NAME);
          await expect(
            page.getByRole('button', { name: boardName, exact: true }).first(),
          ).toBeVisible({ timeout: 5000 });
        });

        await test.step(`Delete board as ${role.name}`, async () => {
          await boardPage.deleteBoard(boardName);
          await expect(
            page.getByRole('button', { name: boardName, exact: true }),
          ).toHaveCount(0, { timeout: 10000 });
        });
      } else {
        await test.step(`Verify delete option not available for ${role.name}`, async () => {
          await page.getByRole('button', { name: 'Project 01', exact: true }).first().click();
          await page.getByRole('link', { name: 'Board 01', exact: true }).last().click();
          await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 5000 });

          await page.getByRole('button', { name: 'Edit Board' }).last().click();

          const deleteButton = page.getByRole('button', { name: 'Delete Board' });
          await expect(deleteButton).toHaveCount(0, { timeout: 3000 });
        });
      }
    });
  }
});
