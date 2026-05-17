import { test, expect } from '@playwright/test';
import { ListPage } from '../pageObjects/ListPage';
import { BoardPage } from '../pageObjects/BoardPage';
import { ADMIN, TEST_USERS, TEST_PROJECT_NAME } from '../testData';
import { BASE_URL, BOARD_01, loginToDashboard, getAdminToken } from '../utils';

test.describe('TC11: PM has auto-editor on all boards', () => {
  const boardName = `TC11 Board ${Date.now()}`;

  // TEST: Verify a Project Manager has editor access on all boards without explicit membership
  // RESULT: PM can navigate to a newly created board and create a list (proving editor-level access)
  test('PM can access and edit a board without explicit membership', async ({ page, browser }) => {
    const boardPage = new BoardPage(page);

    // Step 1: Admin creates a new board (PM is NOT explicitly added)
    await loginToDashboard(page, ADMIN.username, ADMIN.password);

    await boardPage.createBoard(boardName, TEST_PROJECT_NAME);
    await expect(page.getByRole('button', { name: boardName, exact: true }).first()).toBeVisible({ timeout: 5000 });

    // Step 2: Login as PM in a separate browser context (isolated session)
    const pmContext = await browser.newContext();
    const pmPage = await pmContext.newPage();
    const pmListPage = new ListPage(pmPage);

    await loginToDashboard(pmPage, TEST_USERS.pm.username, TEST_USERS.pm.password);

    // Step 3: Navigate to the board
    await pmPage.getByRole('button', { name: 'Project 01', exact: true }).first().click();
    await pmPage.getByRole('link', { name: boardName, exact: true }).last().click();
    await pmPage.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 5000 });

    // Step 4: Create a list (proves editor access)
    const listName = `TC11 List ${Date.now()}`;
    await pmListPage.createList(listName);
    await expect(pmListPage.listTitle(listName)).toBeVisible({ timeout: 5000 });

    // Cleanup: delete list
    await pmListPage.deleteList(listName);
    await expect(pmListPage.listTitle(listName)).toHaveCount(0, { timeout: 5000 });
    await pmContext.close();

    // Cleanup: delete board as admin
    await page.getByRole('button', { name: 'Project 01', exact: true }).first().click();
    await boardPage.deleteBoard(boardName);
    await expect(page.getByRole('button', { name: boardName, exact: true })).toHaveCount(0, { timeout: 10000 });
  });
});

test.describe('TC12: PM cannot be removed from board', () => {
  // TEST: Verify an admin cannot remove a PM from a board membership
  // RESULT: After confirming removal, the server silently rejects it and the PM remains a board member
  test('Admin attempt to remove PM from board is rejected', async ({ page }) => {
    // Login as admin
    await loginToDashboard(page, ADMIN.username, ADMIN.password);

    // Navigate to Board 01
    await page.getByRole('button', { name: 'Project 01', exact: true }).first().click();
    await page.getByRole('link', { name: BOARD_01, exact: true }).last().click();
    await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 5000 });

    // Open membership panel and find PM user
    await page.getByRole('button', { name: 'Add user' }).click();
    await page.getByPlaceholder('Search users...').waitFor({ state: 'visible', timeout: 3000 });
    await page.getByPlaceholder('Search users...').fill(TEST_USERS.pm.name);
    await page.getByText(TEST_USERS.pm.name).click();

    // Click "Remove from board"
    await page.getByRole('button', { name: 'Remove from board' }).click();

    // Confirm removal
    await page.getByText('Are you sure you want to remove this member from the board').waitFor({ state: 'visible', timeout: 3000 });
    await page.getByRole('button', { name: 'Remove member' }).click();

    // Verify PM is still a member (popup closes but PM avatar still visible)
    // Re-open membership panel and search for PM
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Add user' }).click();
    await page.getByPlaceholder('Search users...').waitFor({ state: 'visible', timeout: 3000 });
    await page.getByPlaceholder('Search users...').fill(TEST_USERS.pm.name);
    await expect(page.getByText(TEST_USERS.pm.name)).toBeVisible({ timeout: 3000 });

    await page.keyboard.press('Escape');
  });
});

test.describe('TC13: Promoting user to PM grants board access', () => {
  // TEST: Verify promoting a non-member user to PM grants them editor access on all project boards
  // RESULT: After API promotion, the user can log in, navigate to a board, and create a list
  test('Non-member promoted to PM can access boards and create lists', async ({ page }) => {
    const { apiContext, token } = await getAdminToken();

    // Get project ID
    const projectsRes = await apiContext.get(`${BASE_URL}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const projectsBody = await projectsRes.json();
    const project = projectsBody.items.find((p: any) => p.name === TEST_PROJECT_NAME);

    // Look up non_member user (created by setup.spec.ts)
    const allUsersRes = await apiContext.get(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const allUsersBody = await allUsersRes.json();
    const nonMemberUser = allUsersBody.items.find((u: any) => u.username === TEST_USERS.nonMember.username);
    const nonMemberUserId = nonMemberUser.id;

    // Promote non_member to PM
    const promoteRes = await apiContext.post(`${BASE_URL}/api/projects/${project.id}/managers`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userId: nonMemberUserId },
    });
    expect([200, 409]).toContain(promoteRes.status());

    // Login as the promoted user
    const listPage = new ListPage(page);

    await loginToDashboard(page, TEST_USERS.nonMember.username, TEST_USERS.nonMember.password);

    // Navigate to Project 01 boards
    await page.getByRole('button', { name: 'Project 01', exact: true }).first().click();
    await page.getByRole('link', { name: BOARD_01, exact: true }).last().click();
    await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 5000 });

    // Verify editor access: create a list
    const listName = `TC13 List ${Date.now()}`;
    await listPage.createList(listName);
    await expect(listPage.listTitle(listName)).toBeVisible({ timeout: 5000 });

    // Cleanup: delete the list
    await listPage.deleteList(listName);
    await expect(listPage.listTitle(listName)).toHaveCount(0, { timeout: 5000 });

    // Cleanup: remove PM role
    const pmProjectRes = await apiContext.get(`${BASE_URL}/api/projects/${project.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const pmProjectBody = await pmProjectRes.json();
    const pmRecord = pmProjectBody.included.projectManagers.find((pm: any) => pm.userId === nonMemberUserId);
    if (pmRecord) {
      await apiContext.delete(`${BASE_URL}/api/project-managers/${pmRecord.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    await apiContext.dispose();
  });
});