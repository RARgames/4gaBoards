const { expect, test } = require('@playwright/test');

const {
  cleanupProject,
  createBoard,
  createCard,
  createList,
  createProject,
  getCurrentUser,
  getUserPrefs,
  login,
  setAuthCookies,
  updateUserPrefs,
  uniqueName,
} = require('./helpers/boardsApi');
const { BoardPage } = require('./pages/BoardPage');

test.describe('board workflows', () => {
  test('creates a board, list, card, and card description through the UI', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const accessToken = await login(request);
    const project = await createProject(request, accessToken, uniqueName('E2E Project', testInfo));
    const boardName = uniqueName('E2E Board', testInfo);
    const listName = uniqueName('Ready', testInfo);
    const cardName = uniqueName('Write smoke test', testInfo);
    const description = `Created by Playwright at ${new Date().toISOString()}`;

    await setAuthCookies(page, accessToken);

    try {
      await boardPage.gotoProject(project.id);

      await boardPage.createBoard(boardName);
      await expect(boardPage.addListButton()).toBeVisible();

      await boardPage.createList(listName);
      await expect(boardPage.list(listName)).toBeVisible();

      await boardPage.createCard(cardName);
      const cardOnBoard = boardPage.card(cardName);
      await expect(cardOnBoard).toBeVisible();

      await boardPage.openCard(cardName);
      await expect(boardPage.cardModalCloseButton()).toBeVisible();
      await boardPage.addDescription(description);
      await expect(boardPage.descriptionText(description)).toBeVisible();

      await page.reload();
      await boardPage.ensureCardModalOpen(cardName);
      await expect(boardPage.cardModalCloseButton()).toBeVisible();
      await expect(cardOnBoard).toBeVisible();
      await expect(boardPage.descriptionText(description)).toBeVisible();
    } finally {
      await cleanupProject(request, accessToken, project.id);
    }
  });

  test('moves a card between lists from the card modal', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const accessToken = await login(request);
    const project = await createProject(request, accessToken, uniqueName('E2E Move Project', testInfo));
    const boardName = uniqueName('E2E Move Board', testInfo);
    const sourceListName = uniqueName('Todo', testInfo);
    const targetListName = uniqueName('Done', testInfo);
    const cardName = uniqueName('Move me', testInfo);

    await setAuthCookies(page, accessToken);

    try {
      await boardPage.gotoProject(project.id);

      await boardPage.createBoard(boardName);
      await expect(boardPage.addListButton()).toBeVisible();

      await boardPage.createList(sourceListName);
      await expect(boardPage.list(sourceListName)).toBeVisible();
      await boardPage.createCard(cardName);
      await expect(boardPage.card(cardName)).toBeVisible();

      await boardPage.createList(targetListName);
      await expect(boardPage.list(targetListName)).toBeVisible();

      await boardPage.openCard(cardName);
      await expect(boardPage.cardModalCloseButton()).toBeVisible();

      await boardPage.listSelectorCurrentValue(sourceListName).click();
      await boardPage.listSelectorOption(targetListName).click();
      await expect(boardPage.listSelectorCurrentValue(targetListName)).toBeVisible();

      await page.reload();
      await boardPage.ensureCardModalOpen(cardName);
      await expect(boardPage.cardModalCloseButton()).toBeVisible();
      await expect(boardPage.listSelectorCurrentValue(targetListName)).toBeVisible();
    } finally {
      await cleanupProject(request, accessToken, project.id);
    }
  });

  test('creates and edits a card on a Simple template board', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const accessToken = await login(request);
    const project = await createProject(request, accessToken, uniqueName('E2E Simple Workflow Project', testInfo));
    const boardName = uniqueName('E2E Simple Workflow Board', testInfo);
    const cardName = uniqueName('Simple workflow card', testInfo);
    const description = `Simple board workflow ${new Date().toISOString()}`;

    await setAuthCookies(page, accessToken);

    try {
      await boardPage.gotoProject(project.id);

      await boardPage.createBoardFromTemplate(boardName, 'Simple');
      await expect(boardPage.boardTitle(boardName)).toBeVisible();
      await expect(boardPage.list('Open')).toBeVisible();
      await expect(boardPage.list('Todo')).toBeVisible();

      await boardPage.createCard(cardName);
      await expect(boardPage.card(cardName)).toBeVisible();

      await boardPage.openCard(cardName);
      await expect(boardPage.cardModalCloseButton()).toBeVisible();
      await boardPage.addDescription(description);
      await expect(boardPage.descriptionText(description)).toBeVisible();

      await boardPage.listSelectorCurrentValue('Open').click();
      await boardPage.listSelectorOption('Todo').click();
      await expect(boardPage.listSelectorCurrentValue('Todo')).toBeVisible();

      await page.reload();
      await boardPage.ensureCardModalOpen(cardName);
      await expect(boardPage.cardModalCloseButton()).toBeVisible();
      await expect(boardPage.listSelectorCurrentValue('Todo')).toBeVisible();
      await expect(boardPage.descriptionText(description)).toBeVisible();
    } finally {
      await cleanupProject(request, accessToken, project.id);
    }
  });

  test('uses list view to find and open a card', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const accessToken = await login(request);
    const project = await createProject(request, accessToken, uniqueName('E2E List View Project', testInfo));
    const boardName = uniqueName('E2E List View Board', testInfo);
    const listName = uniqueName('List View Lane', testInfo);
    const cardName = uniqueName('List View Card', testInfo);

    await setAuthCookies(page, accessToken);

    try {
      await boardPage.gotoProject(project.id);

      await boardPage.createBoard(boardName);
      await expect(boardPage.addListButton()).toBeVisible();

      await boardPage.createList(listName);
      await expect(boardPage.list(listName)).toBeVisible();
      await boardPage.createCard(cardName);
      await expect(boardPage.card(cardName)).toBeVisible();

      await boardPage.switchToListViewButton().click();
      await expect(boardPage.switchToBoardViewButton()).toBeVisible();
      await expect(boardPage.listViewColumnHeader('Name')).toBeVisible();
      await expect(boardPage.listViewColumnHeader('List')).toBeVisible();

      const cardRow = boardPage.listViewRow(cardName);
      await expect(cardRow).toBeVisible();
      await expect(cardRow).toContainText(listName);

      await boardPage.filterCardsField().fill(cardName);
      await expect(boardPage.cardCount()).toContainText(/1 of 1 card|1 card/);
      await expect(cardRow).toBeVisible();

      await boardPage.listViewOpenCell(cardName).click();
      await expect(boardPage.cardModalCloseButton()).toBeVisible();
      await expect(boardPage.cardModalTitle(cardName)).toBeVisible();

      await boardPage.cardModalCloseButton().click();
      await boardPage.switchToBoardViewButton().click();
      await expect(boardPage.addListButton()).toBeVisible();
      await expect(boardPage.card(cardName)).toBeVisible();
    } finally {
      await cleanupProject(request, accessToken, project.id);
    }
  });

  test('paginates list view cards and opens a card from the next page', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const accessToken = await login(request);
    const project = await createProject(request, accessToken, uniqueName('E2E Grid Pagination Project', testInfo));
    const board = await createBoard(request, accessToken, project.id, uniqueName('E2E Grid Pagination Board', testInfo));
    const list = await createList(request, accessToken, board.id, uniqueName('Grid Pagination Lane', testInfo));
    const cardPrefix = uniqueName('Grid pagination card', testInfo);
    const firstCardName = `${cardPrefix} 01`;
    const lastCardName = `${cardPrefix} 26`;
    const currentUser = await getCurrentUser(request, accessToken);
    const originalPrefs = await getUserPrefs(request, accessToken, currentUser.id);

    for (let index = 0; index < 26; index += 1) {
      await createCard(request, accessToken, list.id, `${cardPrefix} ${String(index + 1).padStart(2, '0')}`, index);
    }

    await updateUserPrefs(request, accessToken, currentUser.id, {
      listViewItemsPerPage: '25',
    });
    await setAuthCookies(page, accessToken);

    try {
      await boardPage.gotoBoard(board.id);
      await boardPage.ensureBoardView();
      await expect(boardPage.addListButton()).toBeVisible();

      await boardPage.switchToListViewButton().click();
      await expect(boardPage.switchToBoardViewButton()).toBeVisible();
      await expect(boardPage.listViewPageCount(2)).toBeVisible();
      await expect(boardPage.listViewRow(firstCardName)).toBeVisible();
      await expect(boardPage.listViewRow(lastCardName)).toHaveCount(0);

      await boardPage.listViewNextPageButton().click();
      await expect(boardPage.listViewPageField()).toHaveAttribute('placeholder', '2');
      await expect(boardPage.listViewRow(lastCardName)).toBeVisible();
      await expect(boardPage.listViewRow(firstCardName)).toHaveCount(0);

      await boardPage.listViewPageField().fill('1');
      await boardPage.listViewPageField().press('Enter');
      await expect(boardPage.listViewPageField()).toHaveAttribute('placeholder', '1');
      await expect(boardPage.listViewRow(firstCardName)).toBeVisible();

      await boardPage.selectListViewItemsPerPage('50 per page');
      await expect(boardPage.listViewItemsPerPageField()).toHaveAttribute('placeholder', '50 per page');
      await expect(boardPage.listViewPageCount(1)).toBeVisible();
      await expect(boardPage.listViewRow(lastCardName)).toBeVisible();

      await boardPage.selectListViewItemsPerPage('25 per page');
      await expect(boardPage.listViewItemsPerPageField()).toHaveAttribute('placeholder', '25 per page');
      await expect(boardPage.listViewPageCount(2)).toBeVisible();
      await expect(boardPage.listViewRow(firstCardName)).toBeVisible();
      await expect(boardPage.listViewRow(lastCardName)).toHaveCount(0);

      await boardPage.listViewNextPageButton().click();
      await boardPage.listViewOpenCell(lastCardName).click();
      await expect(boardPage.cardModalCloseButton()).toBeVisible();
      await expect(boardPage.cardModalTitle(lastCardName)).toBeVisible();
    } finally {
      await updateUserPrefs(request, accessToken, currentUser.id, {
        listViewItemsPerPage: originalPrefs.listViewItemsPerPage,
      });
      await cleanupProject(request, accessToken, project.id);
    }
  });
});
