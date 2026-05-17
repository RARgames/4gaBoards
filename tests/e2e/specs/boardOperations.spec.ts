import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pageObjects/LoginPage';
import { BoardPage } from '../pageObjects/BoardPage';
import { ROLES, TEST_PROJECT_NAME } from '../testData';

const BOARD_01 = 'Board 01';

async function loginToDashboard(page: Page, role: (typeof ROLES)[number]) {
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLoginPage();
  await loginPage.loginToDashboard(role.user.username, role.user.password);
  await expect(loginPage.dashboardTitle).toBeVisible({ timeout: 15000 });
}

test.describe('TC01: Create Board - Role Based Access', () => {
  for (const role of ROLES) {

    // TEST: Verify board creation is only available to project managers
    // RESULT: PMs can create and see new boards; non-PMs cannot select a project in the Add Board form

    test(`${role.name} - board creation behavior`, async ({ page }) => {
      await loginToDashboard(page, role);
      const boardPage = new BoardPage(page);
      const boardName = `TC01 Board ${Date.now()} ${role.name}`;

      if (role.isProjectManager) {
        await boardPage.createBoard(boardName, TEST_PROJECT_NAME);
        await expect(boardPage.boardInSidebar(boardName)).toBeVisible({ timeout: 5000 });

        await boardPage.deleteBoard(boardName);
        await expect(page.getByRole('button', { name: boardName, exact: true })).toHaveCount(0, { timeout: 10000 });
      } else {
        await boardPage.addBoardButton.click();
        await expect(boardPage.boardNameInput).toBeVisible({ timeout: 5000 });
        const hasProject = await boardPage.isProjectInAddBoardDropdown(TEST_PROJECT_NAME);
        expect(hasProject).toBe(false);
      }
    });
  }
});

test.describe('TC02: Update Board Name - Role Based Access', () => {
  for (const role of ROLES) {

    // TEST: Verify board renaming is restricted to project managers
    // RESULT: PMs can rename a board and see the updated name; non-PMs do not see the "Rename Board" option

    test(`${role.name} - rename board behavior`, async ({ page }) => {
      await loginToDashboard(page, role);
      const boardPage = new BoardPage(page);

      if (role.isProjectManager) {
        const boardName = `TC02 Board ${Date.now()} ${role.name}`;
        const renamedName = `${boardName} Renamed`;

        await boardPage.createBoard(boardName, TEST_PROJECT_NAME);
        await expect(boardPage.boardInSidebar(boardName)).toBeVisible({ timeout: 5000 });

        await boardPage.navigateToBoard(boardName);
        await boardPage.renameCurrentBoard(renamedName);
        await expect(boardPage.boardInSidebar(renamedName)).toBeVisible({ timeout: 5000 });

        await boardPage.deleteBoard(renamedName);
        await expect(page.getByRole('button', { name: renamedName, exact: true })).toHaveCount(0, { timeout: 10000 });
      } else {
        await boardPage.navigateToBoard(BOARD_01, 'Project 01');

        await page.getByRole('button', { name: 'Edit Board' }).last().click();
        const renameButton = page.getByRole('button', { name: 'Rename Board' });
        await expect(renameButton).toHaveCount(0, { timeout: 3000 });
      }
    });
  }
});

test.describe('TC03: Delete Board - Role Based Access', () => {
  for (const role of ROLES) {

    // TEST: Verify board deletion is restricted to project managers
    // RESULT: PMs can delete a board and it disappears from sidebar; non-PMs do not see the "Delete Board" option

    test(`${role.name} - delete board behavior`, async ({ page }) => {
      await loginToDashboard(page, role);
      const boardPage = new BoardPage(page);

      if (role.isProjectManager) {
        const boardName = `TC03 Board ${Date.now()} ${role.name}`;

        await boardPage.createBoard(boardName, TEST_PROJECT_NAME);
        await expect(boardPage.boardInSidebar(boardName)).toBeVisible({ timeout: 5000 });

        await boardPage.deleteBoard(boardName);
        await expect(page.getByRole('button', { name: boardName, exact: true })).toHaveCount(0, { timeout: 10000 });
      } else {
        await boardPage.navigateToBoard(BOARD_01, 'Project 01');

        await page.getByRole('button', { name: 'Edit Board' }).last().click();
        const deleteButton = page.getByRole('button', { name: 'Delete Board' });
        await expect(deleteButton).toHaveCount(0, { timeout: 3000 });
      }
    });
  }
});

test.describe('TC04: View Board - Role Based Access', () => {
  for (const role of ROLES) {

    // TEST: Verify all authenticated members can view a board they have access to
    // RESULT: Board title is visible for all roles; "Add list" button only shows for editors

    test(`${role.name} - board view behavior`, async ({ page }) => {
      await loginToDashboard(page, role);
      const boardPage = new BoardPage(page);

      await boardPage.navigateToBoard(BOARD_01, 'Project 01');
      await expect(boardPage.boardTitle(BOARD_01)).toBeVisible({ timeout: 5000 });

      if (role.canEditBoard) {
        await expect(boardPage.addListButton).toBeVisible();
      } else {
        await expect(boardPage.addListButton).toHaveCount(0);
      }
    });
  }

  // TEST: Verify unauthenticated users cannot access a board directly by URL
  // RESULT: User is redirected to the login page
  test('Unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/boards/1776357153188087112');
    await expect(page.locator('input[name="emailOrUsername"]')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('TC05: Manage Board Memberships - Role Based Access', () => {
  for (const role of ROLES) {
    // TEST: Verify only authorized roles can manage board memberships
    // RESULT: Roles with canManageMembers see the "Add user" button; others do not
    test(`${role.name} - membership management behavior`, async ({ page }) => {
      await loginToDashboard(page, role);
      const boardPage = new BoardPage(page);

      await boardPage.navigateToBoard(BOARD_01, 'Project 01');

      if (role.canManageMembers) {
        await expect(boardPage.addUserButton).toBeVisible({ timeout: 3000 });
      } else {
        await expect(boardPage.addUserButton).toHaveCount(0, { timeout: 3000 });
      }
    });
  }
});
