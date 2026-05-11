const { expect, test } = require('@playwright/test');

const {
  cleanupProject,
  createBoard,
  createBoardMembership,
  createCard,
  createList,
  createProject,
  createUser,
  deleteUser,
  login,
  uniqueName,
  uniqueUserData,
} = require('./helpers/boardsApi');
const { signInWithAccessToken } = require('./helpers/session');
const { BoardPage } = require('./pages/BoardPage');

test.describe('authorization', () => {
  test('viewer can read a board but cannot edit board or card content', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const adminAccessToken = await login(request);
    const project = await createProject(request, adminAccessToken, uniqueName('E2E Authz Project', testInfo));
    const board = await createBoard(request, adminAccessToken, project.id, uniqueName('E2E Authz Board', testInfo));
    const list = await createList(request, adminAccessToken, board.id, uniqueName('Readonly Lane', testInfo));
    const cardName = uniqueName('Readonly Card', testInfo);
    const viewerData = uniqueUserData(testInfo);
    const viewer = await createUser(request, adminAccessToken, viewerData);

    await createCard(request, adminAccessToken, list.id, cardName, 0, {
      description: 'Viewer should be able to read this card but not edit it.',
    });
    await createBoardMembership(request, adminAccessToken, board.id, viewer.id, 'viewer');

    const viewerAccessToken = await login(request, viewerData.username, viewerData.password);
    await signInWithAccessToken(page, viewerAccessToken);

    try {
      await boardPage.gotoBoard(board.id);
      await boardPage.ensureBoardView();

      await expect(boardPage.boardTitle(board.name)).toBeVisible();
      await expect(boardPage.list(list.name)).toBeVisible();
      await expect(boardPage.cardText(cardName)).toBeVisible();
      await expect(page.getByRole('button', { name: /Add list/i })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Add card' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Project Settings' })).toHaveCount(0);

      await boardPage.boardEditButton().click();
      await expect(page.getByRole('button', { name: 'Check Activity' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Rename Board' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Export Board' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Delete Board' })).toHaveCount(0);
      await page.keyboard.press('Escape');

      await boardPage.cardText(cardName).click();
      await expect(boardPage.cardModalCloseButton()).toBeVisible();
      await expect(boardPage.cardModalTitle(cardName)).toBeVisible();
      await expect(boardPage.descriptionText('Viewer should be able to read this card but not edit it.')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add Member' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Add Label' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Add Task' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Add Attachment' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Delete Card' })).toHaveCount(0);

      await boardPage.cardEditButton().click();
      await expect(page.getByRole('button', { name: 'Copy Link' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Check Activity' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Edit Name' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Edit Members' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Edit Labels' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Move Card' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Duplicate Card' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Delete Card' })).toHaveCount(0);
    } finally {
      await cleanupProject(request, adminAccessToken, project.id);
      await deleteUser(request, adminAccessToken, viewer.id);
    }
  });
});
