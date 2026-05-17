import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pageObjects/LoginPage';
import { BoardPage } from '../../pageObjects/BoardPage';
import { ROLES, TEST_PROJECT_NAME } from '../../testData';

const TEST_BOARD_NAME = `TC01 Board ${Date.now()}`;

test.describe('TC01: Create Board - Role Based Access', () => {
  for (const role of ROLES) {
    test(`${role.name} - board creation behavior`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const boardPage = new BoardPage(page);
      const boardName = `${TEST_BOARD_NAME} ${role.name}`;

      await test.step(`Login as ${role.name}`, async () => {
        await loginPage.navigateToLoginPage();
        await loginPage.loginToDashboard(role.user.username, role.user.password);
        await expect(loginPage.dashboardTitle).toBeVisible({ timeout: 15000 });
      });

      if (role.isProjectManager) {
        await test.step(`Create board and verify as ${role.name}`, async () => {
          await boardPage.createBoard(boardName, TEST_PROJECT_NAME);
          await expect(
            page.getByRole('button', { name: boardName, exact: true }).first(),
          ).toBeVisible({ timeout: 5000 });
        });

        await test.step('Cleanup: delete board', async () => {
          await boardPage.deleteBoard(boardName);
          await expect(
            page.getByRole('button', { name: boardName, exact: true }),
          ).toHaveCount(0, { timeout: 10000 });
        });
      } else {
        await test.step(`Verify project not available in dropdown for ${role.name}`, async () => {
          await boardPage.addBoardButton.click();
          await expect(boardPage.boardNameInput).toBeVisible({ timeout: 5000 });
          const hasProject = await boardPage.isProjectInAddBoardDropdown(TEST_PROJECT_NAME);
          expect(hasProject).toBe(false);
        });
      }
    });
  }
});
