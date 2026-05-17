import { test, expect } from '@playwright/test';
import { ListPage } from '../pageObjects/ListPage';
import { TEST_USERS } from '../testData';
import { BASE_URL, BOARD_01, loginToDashboard, getAdminToken, getBoardId, getBoardMembershipId } from '../utils';

test.describe('TC14: Role upgrade - Viewer → Editor', () => {
  // TEST: Verify that upgrading a user's role from Viewer to Editor grants list creation ability
  // RESULT: After admin upgrades role and user refreshes, "Add list" button appears and list creation succeeds
  test('Viewer upgraded to Editor can create lists after refresh', async ({ page }) => {
    const { apiContext, token } = await getAdminToken();
    const boardId = await getBoardId(apiContext, token, BOARD_01);
    const membershipId = await getBoardMembershipId(apiContext, token, boardId, TEST_USERS.viewer.username);

    // Step 1: Login as viewer and confirm no "Add list" button
    const listPage = new ListPage(page);

    await loginToDashboard(page, TEST_USERS.viewer.username, TEST_USERS.viewer.password);

    await page.getByRole('button', { name: 'Project 01', exact: true }).first().click();
    await page.getByRole('link', { name: BOARD_01, exact: true }).last().click();
    await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 5000 });

    await expect(listPage.addListButton).toHaveCount(0, { timeout: 3000 });

    // Step 2: Admin upgrades viewer to editor via API
    const updateRes = await apiContext.patch(`${BASE_URL}/api/board-memberships/${membershipId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { role: 'editor' },
    });
    expect(updateRes.status()).toBe(200);

    // Step 3: Viewer refreshes the page
    await page.reload();
    await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 5000 });

    // Step 4: Verify "Add list" button is now visible and list creation works
    await expect(listPage.addListButton).toBeVisible({ timeout: 5000 });

    const listName = `TC14 List ${Date.now()}`;
    await listPage.createList(listName);
    await expect(listPage.listTitle(listName)).toBeVisible({ timeout: 5000 });

    // Cleanup: delete test list
    await listPage.deleteList(listName);
    await expect(listPage.listTitle(listName)).toHaveCount(0, { timeout: 5000 });

    // Cleanup: revert role back to viewer
    await apiContext.patch(`${BASE_URL}/api/board-memberships/${membershipId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { role: 'viewer' },
    });

    await apiContext.dispose();
  });
});

test.describe('TC15: Role downgrade - Editor → Viewer', () => {
  // TEST: Verify that downgrading a user's role from Editor to Viewer removes list creation ability
  // RESULT: After admin downgrades role and user refreshes, "Add list" button disappears
  test('Editor downgraded to Viewer cannot create lists after refresh', async ({ page }) => {
    const { apiContext, token } = await getAdminToken();
    const boardId = await getBoardId(apiContext, token, BOARD_01);
    const membershipId = await getBoardMembershipId(apiContext, token, boardId, TEST_USERS.editor.username);

    // Step 1: Login as editor and confirm "Add list" button is visible
    const listPage = new ListPage(page);

    await loginToDashboard(page, TEST_USERS.editor.username, TEST_USERS.editor.password);

    await page.getByRole('button', { name: 'Project 01', exact: true }).first().click();
    await page.getByRole('link', { name: BOARD_01, exact: true }).last().click();
    await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 5000 });

    await expect(listPage.addListButton).toBeVisible({ timeout: 5000 });

    // Step 2: Admin downgrades editor to viewer via API
    const updateRes = await apiContext.patch(`${BASE_URL}/api/board-memberships/${membershipId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { role: 'viewer' },
    });
    expect(updateRes.status()).toBe(200);

    // Step 3: Editor refreshes the page
    await page.reload();
    await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 5000 });

    // Step 4: Verify "Add list" button is gone
    await expect(listPage.addListButton).toHaveCount(0, { timeout: 5000 });

    // Cleanup: revert role back to editor
    await apiContext.patch(`${BASE_URL}/api/board-memberships/${membershipId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { role: 'editor' },
    });

    await apiContext.dispose();
  });
});

test.describe('TC16: Membership revocation', () => {
  // TEST: Verify that revoking a user's board membership removes board access entirely
  // RESULT: After admin removes membership and user refreshes, board is no longer accessible
  test('Editor with revoked membership loses board access after refresh', async ({ page }) => {
    const { apiContext, token } = await getAdminToken();
    const boardId = await getBoardId(apiContext, token, BOARD_01);

    // First, get the editor's user ID so we can re-add them after the test
    const boardRes = await apiContext.get(`${BASE_URL}/api/boards/${boardId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const boardBody = await boardRes.json();
    const editorUser = boardBody.included.users.find((u: any) => u.username === TEST_USERS.editor.username);
    const editorUserId = editorUser.id;
    const membership = boardBody.included.boardMemberships.find((bm: any) => bm.userId === editorUserId);
    const membershipId = membership.id;

    // Step 1: Login as editor and confirm board is accessible
    await loginToDashboard(page, TEST_USERS.editor.username, TEST_USERS.editor.password);

    await page.getByRole('button', { name: 'Project 01', exact: true }).first().click();
    await page.getByRole('link', { name: BOARD_01, exact: true }).last().click();
    await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 5000 });

    // Step 2: Admin revokes editor's board membership via API
    const deleteRes = await apiContext.delete(`${BASE_URL}/api/board-memberships/${membershipId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(deleteRes.status()).toBe(200);

    // Step 3: Editor refreshes the page
    await page.reload();

    // Step 4: Verify board is no longer accessible (redirected away or board not visible)
    await expect(page.getByRole('button', { name: 'Back to Project' })).toHaveCount(0, { timeout: 10000 });

    // Cleanup: re-add editor membership
    const createRes = await apiContext.post(`${BASE_URL}/api/boards/${boardId}/memberships`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userId: editorUserId, role: 'editor' },
    });
    expect(createRes.status()).toBe(200);

    await apiContext.dispose();
  });
});
