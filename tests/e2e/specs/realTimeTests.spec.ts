import { test, expect } from '@playwright/test';
import { ListPage } from '../pageObjects/ListPage';
import { BoardPage } from '../pageObjects/BoardPage';
import { ADMIN, TEST_USERS, TEST_PROJECT_NAME } from '../testData';
import { BASE_URL, BOARD_01, loginToDashboard, loginAndNavigateToBoard, getAdminToken, getBoardId } from '../utils';

test.describe('TC25: List creation broadcasts', () => {

  // TEST: Verify that when an editor creates a list, it appears in the viewer's session without reload (WebSocket)
  // RESULT: List appears in viewer's tab in real-time via WebSocket broadcast

  test('List created by editor appears in viewer session in real time', async ({ browser }) => {
    // Step 1: Open board as editor in context 1
    const editorContext = await browser.newContext();
    const editorPage = await editorContext.newPage();
    const editorListPage = new ListPage(editorPage);

    await loginAndNavigateToBoard(editorPage, TEST_USERS.editor.username, TEST_USERS.editor.password);

    // Step 2: Open same board as viewer in context 2
    const viewerContext = await browser.newContext();
    const viewerPage = await viewerContext.newPage();
    const viewerListPage = new ListPage(viewerPage);

    await loginAndNavigateToBoard(viewerPage, TEST_USERS.viewer.username, TEST_USERS.viewer.password);

    // Step 3: Editor creates a list
    const listName = `TC25 List ${Date.now()}`;
    await editorListPage.createList(listName);
    await expect(editorListPage.listTitle(listName)).toBeVisible({ timeout: 5000 });

    // Step 4: Verify list appears in viewer session without reload
    await expect(viewerListPage.listTitle(listName)).toBeVisible({ timeout: 10000 });

    // Cleanup: editor deletes the list
    await editorListPage.closeAddListForm();
    await editorListPage.deleteList(listName);
    await expect(editorListPage.listTitle(listName)).toHaveCount(0, { timeout: 5000 });

    await editorContext.close();
    await viewerContext.close();
  });
});

test.describe('TC26: List deletion broadcasts', () => {

  // TEST: Verify that when an editor deletes a list, it disappears from the viewer's session without reload (WebSocket)
  // RESULT: List disappears from viewer's tab in real-time via WebSocket broadcast

  test('List deleted by editor disappears from viewer session in real time', async ({ browser }) => {
    // Step 1: Open board as editor and create a list for this test
    const editorContext = await browser.newContext();
    const editorPage = await editorContext.newPage();
    const editorListPage = new ListPage(editorPage);

    await loginAndNavigateToBoard(editorPage, TEST_USERS.editor.username, TEST_USERS.editor.password);

    const listName = `TC26 List ${Date.now()}`;
    await editorListPage.createList(listName);
    await expect(editorListPage.listTitle(listName)).toBeVisible({ timeout: 5000 });
    await editorListPage.closeAddListForm();

    // Step 2: Open same board as viewer
    const viewerContext = await browser.newContext();
    const viewerPage = await viewerContext.newPage();
    const viewerListPage = new ListPage(viewerPage);

    await loginAndNavigateToBoard(viewerPage, TEST_USERS.viewer.username, TEST_USERS.viewer.password);

    // Verify viewer can see the list
    await expect(viewerListPage.listTitle(listName)).toBeVisible({ timeout: 5000 });

    // Step 3: Editor deletes the list
    await editorListPage.deleteList(listName);
    await expect(editorListPage.listTitle(listName)).toHaveCount(0, { timeout: 5000 });

    // Step 4: Verify list disappears from viewer session without reload
    await expect(viewerListPage.listTitle(listName)).toHaveCount(0, { timeout: 10000 });

    await editorContext.close();
    await viewerContext.close();
  });
});

test.describe('TC27: List rename broadcasts', () => {

  // TEST: Verify that when an editor renames a list, the updated name appears in the viewer's session without reload (WebSocket)
  // RESULT: Updated list name appears in viewer's tab in real-time via WebSocket broadcast

  test('List renamed by editor updates in viewer session in real time', async ({ browser }) => {
    // Step 1: Open board as editor and create a list
    const editorContext = await browser.newContext();
    const editorPage = await editorContext.newPage();
    const editorListPage = new ListPage(editorPage);

    await loginAndNavigateToBoard(editorPage, TEST_USERS.editor.username, TEST_USERS.editor.password);

    const listName = `TC27 List ${Date.now()}`;
    const renamedName = `${listName} Renamed`;
    await editorListPage.createList(listName);
    await expect(editorListPage.listTitle(listName)).toBeVisible({ timeout: 5000 });
    await editorListPage.closeAddListForm();

    // Step 2: Open same board as viewer
    const viewerContext = await browser.newContext();
    const viewerPage = await viewerContext.newPage();
    const viewerListPage = new ListPage(viewerPage);

    await loginAndNavigateToBoard(viewerPage, TEST_USERS.viewer.username, TEST_USERS.viewer.password);

    // Verify viewer sees the original name
    await expect(viewerListPage.listTitle(listName)).toBeVisible({ timeout: 5000 });

    // Step 3: Editor renames the list
    await editorListPage.renameList(listName, renamedName);
    await expect(editorListPage.listTitle(renamedName)).toBeVisible({ timeout: 5000 });

    // Step 4: Verify renamed list appears in viewer session without reload
    await expect(viewerListPage.listTitle(renamedName)).toBeVisible({ timeout: 10000 });
    await expect(viewerListPage.listTitle(listName)).toHaveCount(0, { timeout: 3000 });

    // Cleanup
    await editorListPage.deleteList(renamedName);
    await expect(editorListPage.listTitle(renamedName)).toHaveCount(0, { timeout: 5000 });

    await editorContext.close();
    await viewerContext.close();
  });
});

test.describe('TC28: List reorder broadcasts', () => {

  // TEST: Verify that when an editor reorders lists, the new order appears in the viewer's session without reload (WebSocket)
  // RESULT: Reordered lists appear in viewer's tab in real-time via WebSocket broadcast

  test('List reordered by editor updates in viewer session in real time', async ({ browser }) => {
    // Step 1: Open board as editor and create 3 lists
    const editorContext = await browser.newContext();
    const editorPage = await editorContext.newPage();
    const editorListPage = new ListPage(editorPage);

    await loginAndNavigateToBoard(editorPage, TEST_USERS.editor.username, TEST_USERS.editor.password);

    const listA = `TC28 A ${Date.now()}`;
    const listB = `TC28 B ${Date.now()}`;
    const listC = `TC28 C ${Date.now()}`;

    await editorListPage.openAddListForm();
    for (const name of [listA, listB, listC]) {
      await editorListPage.listNameField.fill(name);
      await editorListPage.listNameField.press('Enter');
      await expect(editorListPage.listTitle(name)).toBeVisible({ timeout: 5000 });
    }
    await editorListPage.closeAddListForm();

    // Step 2: Open same board as viewer
    const viewerContext = await browser.newContext();
    const viewerPage = await viewerContext.newPage();
    const viewerListPage = new ListPage(viewerPage);

    await loginAndNavigateToBoard(viewerPage, TEST_USERS.viewer.username, TEST_USERS.viewer.password);

    // Verify viewer sees all lists in original order (A before B)
    const viewerOrderBefore = await viewerListPage.getListOrder();
    const indexABefore = viewerOrderBefore.findIndex(t => t === listA);
    const indexBBefore = viewerOrderBefore.findIndex(t => t === listB);
    expect(indexABefore).toBeLessThan(indexBBefore);

    // Step 3: Editor drags list A past list C
    await editorListPage.dragList(listA, listC);

    // Verify editor sees new order (B before A)
    const editorOrder = await editorListPage.getListOrder();
    const editorIndexA = editorOrder.findIndex(t => t === listA);
    const editorIndexB = editorOrder.findIndex(t => t === listB);
    expect(editorIndexB).toBeLessThan(editorIndexA);

    // Step 4: Verify viewer sees new order without reload
    await viewerPage.waitForTimeout(2000);
    const viewerOrderAfter = await viewerListPage.getListOrder();
    const indexAAfter = viewerOrderAfter.findIndex(t => t === listA);
    const indexBAfter = viewerOrderAfter.findIndex(t => t === listB);
    expect(indexBAfter).toBeLessThan(indexAAfter);

    // Cleanup
    for (const name of [listA, listB, listC]) {
      await editorListPage.deleteList(name);
      await expect(editorListPage.listTitle(name)).toHaveCount(0, { timeout: 5000 });
    }

    await editorContext.close();
    await viewerContext.close();
  });
});

test.describe('TC29: Board deletion notifies members', () => {

  // TEST: Verify that when admin deletes a board, all other sessions are redirected away (WebSocket)
  // RESULT: Editor and viewer sessions redirect away from the board without reload

  test('Board deleted by admin redirects other sessions away', async ({ browser }) => {
    const { apiContext, token } = await getAdminToken();

    // Step 1: Admin creates a board and adds editor + viewer as members
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    const adminBoardPage = new BoardPage(adminPage);

    await loginToDashboard(adminPage, ADMIN.username, ADMIN.password);

    const boardName = `TC29 Board ${Date.now()}`;
    await adminBoardPage.createBoard(boardName, TEST_PROJECT_NAME);
    await expect(adminBoardPage.boardInSidebar(boardName)).toBeVisible({ timeout: 5000 });

    // Add editor and viewer memberships via API
    const boardId = await getBoardId(apiContext, token, boardName);

    const usersRes = await apiContext.get(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const usersBody = await usersRes.json();
    const editorUser = usersBody.items.find((u: any) => u.username === TEST_USERS.editor.username);
    const viewerUser = usersBody.items.find((u: any) => u.username === TEST_USERS.viewer.username);

    await apiContext.post(`${BASE_URL}/api/boards/${boardId}/memberships`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userId: editorUser.id, role: 'editor' },
    });
    await apiContext.post(`${BASE_URL}/api/boards/${boardId}/memberships`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userId: viewerUser.id, role: 'viewer' },
    });

    // Step 2: Open board as editor
    const editorContext = await browser.newContext();
    const editorPage = await editorContext.newPage();

    await loginAndNavigateToBoard(editorPage, TEST_USERS.editor.username, TEST_USERS.editor.password, boardName);
    await expect(editorPage.getByRole('button', { name: 'Back to Project' })).toBeVisible({ timeout: 5000 });

    // Step 3: Open board as viewer
    const viewerContext = await browser.newContext();
    const viewerPage = await viewerContext.newPage();

    await loginAndNavigateToBoard(viewerPage, TEST_USERS.viewer.username, TEST_USERS.viewer.password, boardName);
    await expect(viewerPage.getByRole('button', { name: 'Back to Project' })).toBeVisible({ timeout: 5000 });

    // Step 4: Admin deletes the board
    await adminBoardPage.deleteBoard(boardName);
    await expect(adminPage.getByRole('button', { name: boardName, exact: true })).toHaveCount(0, { timeout: 10000 });

    // Step 5: Verify editor and viewer sessions are redirected away (no longer on board page)
    await expect(editorPage.getByRole('button', { name: 'Back to Project' })).toHaveCount(0, { timeout: 10000 });
    await expect(viewerPage.getByRole('button', { name: 'Back to Project' })).toHaveCount(0, { timeout: 10000 });

    await apiContext.dispose();
    await adminContext.close();
    await editorContext.close();
    await viewerContext.close();
  });
});
