const { expect, test } = require('@playwright/test');

const { BoardPage } = require('./pages/BoardPage');
const { LoginPage } = require('./pages/LoginPage');
const {
  DEFAULT_USER,
  cleanupProject,
  createBoard,
  createProject,
  createUser,
  deleteUser,
  login,
  uniqueName,
  uniqueUserData,
} = require('./helpers/boardsApi');
const { signInWithAccessToken } = require('./helpers/session');

async function createIsolatedUser(request, testInfo) {
  const adminAccessToken = await login(request);
  const userData = uniqueUserData(testInfo);
  const user = await createUser(request, adminAccessToken, userData);
  const accessToken = await login(request, userData.username, userData.password);

  return {
    accessToken,
    adminAccessToken,
    user,
  };
}

test.describe('validation and negative cases', () => {
  test('requires a username before submitting login', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.passwordField().fill('demo');
    await loginPage.submit();

    await expect(loginPage.usernameField()).toBeFocused();
    await expect(page).toHaveURL(/\/login/);
  });

  test('requires a password before submitting login', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.usernameField().fill(DEFAULT_USER);
    await loginPage.submit();

    await expect(loginPage.passwordField()).toBeFocused();
    await expect(page).toHaveURL(/\/login/);
  });

  test('does not create a board with an empty name', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const { accessToken, adminAccessToken, user } = await createIsolatedUser(request, testInfo);
    const project = await createProject(request, accessToken, uniqueName('E2E Negative Project', testInfo));

    await signInWithAccessToken(page, accessToken);

    try {
      await boardPage.gotoProject(project.id);
      await boardPage.addBoardButton().click();
      await boardPage.boardNameField().press('Enter');

      await expect(boardPage.boardNameField()).toBeFocused();
      await expect(boardPage.addListButton()).toBeHidden();
    } finally {
      await cleanupProject(request, accessToken, project.id);
      await deleteUser(request, adminAccessToken, user.id);
    }
  });

  test('does not create a list with an empty name', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const { accessToken, adminAccessToken, user } = await createIsolatedUser(request, testInfo);
    const project = await createProject(request, accessToken, uniqueName('E2E Negative List Project', testInfo));
    const board = await createBoard(request, accessToken, project.id, uniqueName('E2E Negative List Board', testInfo));

    await signInWithAccessToken(page, accessToken);

    try {
      await boardPage.gotoBoard(board.id);
      await boardPage.addListButton().click();
      await boardPage.listNameField().press('Enter');

      await expect(boardPage.listNameField()).toBeFocused();
    } finally {
      await cleanupProject(request, accessToken, project.id);
      await deleteUser(request, adminAccessToken, user.id);
    }
  });

  test('does not create a card with an empty name', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const { accessToken, adminAccessToken, user } = await createIsolatedUser(request, testInfo);
    const project = await createProject(request, accessToken, uniqueName('E2E Negative Card Project', testInfo));
    const board = await createBoard(request, accessToken, project.id, uniqueName('E2E Negative Card Board', testInfo));
    const listName = uniqueName('Negative Card List', testInfo);

    await signInWithAccessToken(page, accessToken);

    try {
      await boardPage.gotoBoard(board.id);
      await expect(boardPage.addListButton()).toBeVisible();
      await boardPage.createList(listName);
      await expect(boardPage.list(listName)).toBeVisible();

      await boardPage.addCardButton().click();
      await boardPage.cardNameField().press('Enter');

      await expect(boardPage.cardNameField()).toBeFocused();
      await expect(boardPage.cardModalCloseButton()).toBeHidden();
    } finally {
      await cleanupProject(request, accessToken, project.id);
      await deleteUser(request, adminAccessToken, user.id);
    }
  });
});
