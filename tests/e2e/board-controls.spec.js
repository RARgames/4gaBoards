const { expect, test } = require('@playwright/test');

const { BoardPage } = require('./pages/BoardPage');
const { HeaderPage } = require('./pages/HeaderPage');
const {
  cleanupProject,
  createProject,
  createUser,
  deleteUser,
  login,
  setAuthCookies,
  uniqueName,
  uniqueUserData,
} = require('./helpers/boardsApi');

async function expectSettingsPageContent(page, menuLabel) {
  switch (menuLabel) {
    case 'Profile':
      await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
      await expect(page.getByText('Profile picture')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
      await expect(page.locator('input[name="name"]')).toHaveValue('Demo Demo');
      await expect(page.locator('input[name="phone"]')).toBeVisible();
      await expect(page.locator('input[name="organization"]')).toBeVisible();
      break;
    case 'Preferences':
      await expect(page.getByRole('heading', { name: 'Preferences' })).toBeVisible();
      await expect(page.getByText('Language', { exact: true })).toBeVisible();
      await expect(page.getByText('Default View', { exact: true })).toBeVisible();
      await expect(page.getByText('Subscribe to my own cards', { exact: true })).toBeVisible();
      break;
    case 'Account':
      await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible();
      await expect(page.getByText('Username: demo')).toBeVisible();
      await expect(page.getByText(/Email: demo@demo\.demo/)).toBeVisible();
      await expect(page.getByRole('button', { name: 'Edit Username' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Edit Email' })).toBeVisible();
      break;
    case 'Authentication':
      await expect(page.getByRole('heading', { name: 'Authentication' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Edit Password' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Generate API Client' })).toBeVisible();
      await expect(page.getByText(/API Clients\s*\[\d+\]/)).toBeVisible();
      break;
    case 'About':
      await expect(page.getByRole('heading', { name: 'About 4ga Boards' })).toBeVisible();
      await expect(page.getByText(/^Version:/)).toBeVisible();
      await expect(page.getByText('Website')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Documentation' })).toBeVisible();
      await expect(page.getByText('GitHub')).toBeVisible();
      break;
    case 'Instance Settings':
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
      await expect(page.getByText('User Registration', { exact: true })).toBeVisible();
      await expect(page.getByText('Project Creation For All Users', { exact: true })).toBeVisible();
      await expect(page.getByText('Allowed Registration Domains', { exact: true })).toBeVisible();
      break;
    case 'Users':
      await expect(page.getByRole('heading', { name: /Users/ })).toBeVisible();
      await expect(page.getByText('Name', { exact: true })).toBeVisible();
      await expect(page.getByText('Email', { exact: true })).toBeVisible();
      await expect(page.getByText('Demo Demo')).toBeVisible();
      break;
    default:
      throw new Error(`No settings page assertion defined for ${menuLabel}`);
  }
}

async function expectRouteHeader(page, headerPage, expectedUrlPattern, title) {
  await expect(page).toHaveURL(expectedUrlPattern);

  try {
    await expect(headerPage.headerTitle(title)).toBeVisible({ timeout: 10000 });
  } catch (error) {
    await page.reload();
    await expect(headerPage.headerTitle(title)).toBeVisible({ timeout: 15000 });
  }
}

test.describe('board templates, controls, and menus', () => {
  test('shows board name, template, and import choices in the add-board flow', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const accessToken = await login(request);
    const project = await createProject(request, accessToken, uniqueName('E2E Add Board Project', testInfo));

    await setAuthCookies(page, accessToken);

    try {
      await boardPage.gotoProject(project.id);

      await boardPage.addBoardButton().click();
      await expect(boardPage.boardNameField()).toBeVisible();
      await boardPage.templateField().click();
      await expect(boardPage.templateOption('Simple')).toBeVisible();
      await expect(boardPage.templateOption('Kanban')).toBeVisible();
      await boardPage.templateOption('Simple').click();
      await boardPage.importBoardButton().click();
      await expect(boardPage.importSourceButton('From 4ga Boards')).toBeVisible();
      await expect(boardPage.importSourceButton('From Trello')).toBeVisible();
    } finally {
      await cleanupProject(request, accessToken, project.id);
    }
  });

  test('creates Simple and Kanban template boards and exposes card edit actions', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const accessToken = await login(request);
    const project = await createProject(request, accessToken, uniqueName('E2E Template Project', testInfo));

    await setAuthCookies(page, accessToken);

    try {
      await boardPage.gotoProject(project.id);

      await boardPage.createBoardFromTemplate(uniqueName('E2E Simple Board', testInfo), 'Simple');
      await expect(boardPage.list('Open')).toBeVisible();
      await expect(boardPage.list('Todo')).toBeVisible();
      await expect(boardPage.list('In Progress')).toBeVisible();
      await expect(boardPage.list('Done')).toBeVisible();

      const simpleCard = uniqueName('Simple template card', testInfo);
      await boardPage.createCard(simpleCard);
      await boardPage.openCard(simpleCard);
      await expect(boardPage.cardModalCloseButton()).toBeVisible();
      await boardPage.cardEditButton().click();
      await expect(boardPage.boardAction('Edit Name')).toBeVisible();
      await expect(boardPage.boardAction('Move Card')).toBeVisible();
      await expect(boardPage.boardAction('Duplicate Card')).toBeVisible();
      await expect(boardPage.boardAction('Delete Card')).toBeVisible();

      await boardPage.gotoProject(project.id);
      await boardPage.createBoardFromTemplate(uniqueName('E2E Kanban Board', testInfo), 'Kanban');
      await expect(boardPage.list('Open')).toBeVisible();
      await expect(boardPage.list('Todo')).toBeVisible();
      await expect(boardPage.list('In Progress')).toBeVisible();
      await expect(boardPage.list('To Test')).toBeVisible();

      const kanbanCard = uniqueName('Kanban template card', testInfo);
      await boardPage.createCard(kanbanCard);
      await boardPage.openCard(kanbanCard);
      await expect(boardPage.cardModalCloseButton()).toBeVisible();
      await boardPage.cardEditButton().click();
      await expect(boardPage.boardAction('Edit Labels')).toBeVisible();
      await expect(boardPage.boardAction('Edit Due Date')).toBeVisible();
      await expect(boardPage.boardAction('Check Activity')).toBeVisible();
    } finally {
      await cleanupProject(request, accessToken, project.id);
    }
  });

  test('exercises board top bar member, filter, GitHub, and view controls', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const accessToken = await login(request);
    const project = await createProject(request, accessToken, uniqueName('E2E Top Bar Project', testInfo));
    const userData = uniqueUserData(testInfo);
    const user = await createUser(request, accessToken, userData);
    const boardName = uniqueName('E2E Top Bar Board', testInfo);
    const listName = uniqueName('Top Bar List', testInfo);
    const cardName = uniqueName('Top Bar Card', testInfo);

    await setAuthCookies(page, accessToken);

    try {
      await boardPage.gotoProject(project.id);
      await boardPage.createBoard(boardName);
      await expect(boardPage.boardTitle(boardName)).toBeVisible();

      await boardPage.createList(listName);
      await boardPage.createCard(cardName);
      await expect(boardPage.cardCountText('1 card')).toBeVisible();
      await boardPage.githubConnectionControl().click();
      await expect(page.getByText('Connect to GitHub [Not fully implemented]')).toBeVisible();
      await page.keyboard.press('Escape');

      await boardPage.addUserButton().click();
      await boardPage.userSearchField().fill(userData.name);
      await boardPage.userMenuItem(userData.name).click();
      await boardPage.memberPermission('viewer').click();
      await page.getByRole('button', { name: /Add member/i }).click();
      await expect(boardPage.memberAvatar(userData.name)).toBeVisible();

      await boardPage.filterCardsField().fill(cardName);
      await expect(page.getByText(/1 of 1 cards?/).first()).toBeVisible();
      await boardPage.matchCaseButton().click();
      await boardPage.anyMatchButton().click();
      await boardPage.filterByMembersButton().click();
      await expect(page.getByText('Filter By Members')).toBeVisible();
      await page.keyboard.press('Escape');
      await boardPage.filterByLabelsButton().click();
      await expect(page.getByText('Filter By Labels')).toBeVisible();
      await page.keyboard.press('Escape');
      await boardPage.filterByNotificationsButton().click();
      await boardPage.filterByDueDateButton().click();
      await expect(page.getByText('Filter by Due Date')).toBeVisible();
      await page.keyboard.press('Escape');

      await boardPage.switchToListViewButton().click();
      await expect(boardPage.switchToBoardViewButton()).toBeVisible();
      await boardPage.switchToBoardViewButton().click();
      await expect(boardPage.addListButton()).toBeVisible();
    } finally {
      await cleanupProject(request, accessToken, project.id);
      await deleteUser(request, accessToken, user.id);
    }
  });

  test('exposes board action menu and global profile/settings navigation', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const headerPage = new HeaderPage(page);
    const accessToken = await login(request);
    const project = await createProject(request, accessToken, uniqueName('E2E Menu Project', testInfo));
    const boardName = uniqueName('E2E Menu Board', testInfo);
    let projectCleanedUp = false;

    await setAuthCookies(page, accessToken);

    try {
      await boardPage.gotoProject(project.id);
      await boardPage.createBoard(boardName);

      await expect(boardPage.projectSettingsButton()).toBeVisible();
      await boardPage.boardEditButton().click();
      await expect(boardPage.boardAction('Rename Board')).toBeVisible();
      await expect(boardPage.boardAction('Edit GitHub Connection')).toBeVisible();
      await expect(boardPage.boardAction('Export Board')).toBeVisible();
      await expect(boardPage.boardAction('Check Activity')).toBeVisible();
      await expect(boardPage.boardAction('Delete Board')).toBeVisible();
      await page.keyboard.press('Escape');

      await boardPage.backToProjectButton().click();
      await expect(page).toHaveURL(/\/projects\/\d+$/);

      await expect(headerPage.settingsButton()).toBeVisible();
      await expect(headerPage.usersButton()).toBeVisible();
      await expect(headerPage.notificationsButton()).toBeVisible();

      await headerPage.settingsButton().click();
      await expectRouteHeader(page, headerPage, /\/settings\/profile$/, 'Settings: Profile');
      await expectSettingsPageContent(page, 'Profile');

      await headerPage.usersButton().click();
      await expectRouteHeader(page, headerPage, /\/settings\/users$/, 'Settings: Users');
      await expectSettingsPageContent(page, 'Users');

      await page.goto('/notifications');
      await expectRouteHeader(page, headerPage, /\/notifications$/, 'Notifications');

      await headerPage.profileAndSettingsButton().click();
      await expect(headerPage.menuItem('Profile')).toBeVisible();
      await expect(headerPage.menuItem('Preferences')).toBeVisible();
      await expect(headerPage.menuItem('Account')).toBeVisible();
      await expect(headerPage.menuItem('Authentication')).toBeVisible();
      await expect(headerPage.menuItem('About')).toBeVisible();
      await expect(headerPage.menuItem('Instance Settings')).toBeVisible();
      await expect(headerPage.menuItem('Users')).toBeVisible();
      await expect(headerPage.menuItem('Log Out')).toBeVisible();
      await page.keyboard.press('Escape');

      await cleanupProject(request, accessToken, project.id);
      projectCleanedUp = true;

      await headerPage.profileAndSettingsButton().click();
      await headerPage.menuItem('Log Out').click();
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
    } finally {
      if (!projectCleanedUp) {
        await cleanupProject(request, accessToken, project.id);
      }
    }
  });
});
