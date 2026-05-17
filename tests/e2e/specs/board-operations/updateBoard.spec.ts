import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pageObjects/LoginPage';
import { BoardPage } from '../../pageObjects/BoardPage';
import { ROLES, TEST_PROJECT_NAME } from '../../testData';

const TEST_BOARD_NAME = `TC02 Board ${Date.now()}`;

test.describe('TC02: Update Board Name - Role Based Access', () => {
  for (const role of ROLES) {
    test(`${role.name} - rename board behavior`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const boardPage = new BoardPage(page);
      const boardName = `${TEST_BOARD_NAME} ${role.name}`;
      const renamedName = `${boardName} Renamed`;

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

        await test.step(`Rename board as ${role.name}`, async () => {
          await boardPage.renameCurrentBoard(renamedName);
          await expect(
            page.getByRole('button', { name: renamedName, exact: true }).first(),
          ).toBeVisible({ timeout: 5000 });
        });

        await test.step('Cleanup: delete board', async () => {
          await boardPage.deleteBoard(renamedName);
          await expect(
            page.getByRole('button', { name: renamedName, exact: true }),
          ).toHaveCount(0, { timeout: 10000 });
        });
      } else {
        await test.step(`Verify rename option not available for ${role.name}`, async () => {
          await page.getByRole('button', { name: 'Project 01', exact: true }).first().click();
          await page.getByRole('link', { name: 'Board 01', exact: true }).last().click();
          await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 5000 });

          await page.getByRole('button', { name: 'Edit Board' }).last().click();

          const renameButton = page.getByRole('button', { name: 'Rename Board' });
          await expect(renameButton).toHaveCount(0, { timeout: 3000 });
        });
      }
    });
  }
});
