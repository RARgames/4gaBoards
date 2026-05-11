const { expect, test } = require('@playwright/test');

const { BoardPage } = require('./pages/BoardPage');
const { HeaderPage } = require('./pages/HeaderPage');
const { SettingsPage } = require('./pages/SettingsPage');
const {
  DEFAULT_PASSWORD,
  cleanupProject,
  createBoard,
  createBoardMembership,
  createCard,
  createList,
  createProject,
  createUser,
  deleteApiClient,
  deleteUser,
  getApiClients,
  getCurrentUser,
  getUserPrefs,
  getUsers,
  login,
  updateUser,
  updateUserPrefs,
  uniqueName,
  uniqueUserData,
} = require('./helpers/boardsApi');
const { signIn, signInWithAccessToken, waitForAuthenticatedShell } = require('./helpers/session');

async function cleanupUserByEmail(request, accessToken, email) {
  const users = await getUsers(request, accessToken);
  const user = users.find((item) => item.email === email);

  if (user) {
    await deleteUser(request, accessToken, user.id);
  }
}

async function cleanupApiClientByName(request, accessToken, name) {
  const apiClients = await getApiClients(request, accessToken);
  const apiClient = apiClients.find((item) => item.name === name);

  if (apiClient) {
    await deleteApiClient(request, accessToken, apiClient.id);
  }
}

async function cleanupApiClientsByPrefix(request, accessToken, prefix) {
  const apiClients = await getApiClients(request, accessToken);
  const matchingClients = apiClients.filter((item) => item.name?.startsWith(prefix));

  for (const apiClient of matchingClients) {
    await deleteApiClient(request, accessToken, apiClient.id);
  }
}

function apiClientItem(page, name) {
  return page.locator('[class*="AuthenticationSettings_item"]').filter({ hasText: name }).first();
}

test.describe('settings page workflows', () => {
  test.describe.configure({ mode: 'serial' });

  test('updates profile contact fields and persists them after reload', async ({ page, request }, testInfo) => {
    const headerPage = new HeaderPage(page);
    const settingsPage = new SettingsPage(page, headerPage);
    const accessToken = await signIn(page, request);
    const currentUser = await getCurrentUser(request, accessToken);
    const phone = `555-010-${testInfo.workerIndex}`;
    const organization = uniqueName('E2E Profile Org', testInfo);

    try {
      await settingsPage.openFromAvatar('Profile', /\/settings\/profile$/, 'Settings: Profile');
      await settingsPage.profileField('phone').fill(phone);
      await settingsPage.profileField('organization').fill(organization);
      await page.getByRole('button', { name: 'Save' }).click();

      await page.reload();
      await waitForAuthenticatedShell(page);
      await expect(headerPage.headerTitle('Settings: Profile')).toBeVisible();
      await expect(settingsPage.profileField('phone')).toHaveValue(phone);
      await expect(settingsPage.profileField('organization')).toHaveValue(organization);
    } finally {
      await updateUser(request, accessToken, currentUser.id, {
        name: currentUser.name,
        phone: currentUser.phone || null,
        organization: currentUser.organization || null,
      });
    }
  });

  test('changes and restores preferences across view, layout, notification, and display settings', async ({ page, request }) => {
    const headerPage = new HeaderPage(page);
    const settingsPage = new SettingsPage(page, headerPage);
    const accessToken = await signIn(page, request);
    const currentUser = await getCurrentUser(request, accessToken);
    const originalPrefs = await getUserPrefs(request, accessToken, currentUser.id);

    try {
      await settingsPage.openFromAvatar('Preferences', /\/settings\/preferences$/, 'Settings: Preferences');

      const dropdownSettings = [
        ['Default View', ['Board', 'List']],
        ['List View Style', ['Default', 'Compact']],
        ['Users Settings Style', ['Default', 'Compact']],
        ['Preferred Details Font', ['Default', 'Monospace']],
      ];

      for (const [label, options] of dropdownSettings) {
        await settingsPage.selectAlternateDropdownSetting(label, options);
      }

      const themeShapeOriginalValue = await settingsPage.rowCurrentValueText('Theme Shape');
      const expectedThemeShapeValue = themeShapeOriginalValue === 'Rounded' ? 'default' : 'rounded';
      await settingsPage.selectThemeShape(themeShapeOriginalValue === 'Rounded' ? 'Default' : 'Rounded');

      const booleanSettings = [
        'Compact Sidebar',
        'Hide Card Modal Activity',
        'Hide Closest Due Date',
        'Subscribe to my own cards',
        'Subscribe to new boards',
        'Subscribe to new projects',
        'Subscribe to users notifications',
        'Subscribe to instance notifications',
      ];

      for (const label of booleanSettings) {
        await settingsPage.toggleBooleanSetting(label);
      }

      const taskNotificationsWereChecked = await settingsPage.toggleNotificationType('Task');
      await expect
        .poll(async () => {
          const prefs = await getUserPrefs(request, accessToken, currentUser.id);
          return prefs.notificationTypes.includes('task');
        })
        .toBe(!taskNotificationsWereChecked);

      await expect
        .poll(async () => {
          const prefs = await getUserPrefs(request, accessToken, currentUser.id);

          return {
            defaultView: prefs.defaultView,
            taskNotificationEnabled: prefs.notificationTypes.includes('task'),
            themeShape: prefs.themeShape,
          };
        })
        .toEqual({
          defaultView: originalPrefs.defaultView === 'board' ? 'list' : 'board',
          taskNotificationEnabled: !taskNotificationsWereChecked,
          themeShape: expectedThemeShapeValue,
        });

      await page.reload();
      await waitForAuthenticatedShell(page);
      await expect(headerPage.headerTitle('Settings: Preferences')).toBeVisible();
      await expect(page.getByText('Default View', { exact: true })).toBeVisible();
    } finally {
      await updateUserPrefs(request, accessToken, currentUser.id, {
        subscribeToOwnCards: originalPrefs.subscribeToOwnCards,
        subscribeToNewBoards: originalPrefs.subscribeToNewBoards,
        subscribeToNewProjects: originalPrefs.subscribeToNewProjects,
        subscribeToUsers: originalPrefs.subscribeToUsers,
        subscribeToInstance: originalPrefs.subscribeToInstance,
        sidebarCompact: originalPrefs.sidebarCompact,
        defaultView: originalPrefs.defaultView,
        listViewStyle: originalPrefs.listViewStyle,
        usersSettingsStyle: originalPrefs.usersSettingsStyle,
        preferredDetailsFont: originalPrefs.preferredDetailsFont,
        hideCardModalActivity: originalPrefs.hideCardModalActivity,
        hideClosestDueDate: originalPrefs.hideClosestDueDate,
        themeShape: originalPrefs.themeShape,
        notificationTypes: originalPrefs.notificationTypes,
      });
    }
  });

  test('applies high-value preference behavior on boards and card modals', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const adminAccessToken = await signIn(page, request);
    const userData = uniqueUserData(testInfo);
    const user = await createUser(request, adminAccessToken, userData);
    const project = await createProject(request, adminAccessToken, uniqueName('E2E Preference Behavior Project', testInfo));
    const board = await createBoard(request, adminAccessToken, project.id, uniqueName('E2E Preference Behavior Board', testInfo));
    const list = await createList(request, adminAccessToken, board.id, uniqueName('Preference Behavior List', testInfo));
    const card = await createCard(request, adminAccessToken, list.id, uniqueName('Preference Behavior Card', testInfo));
    await createBoardMembership(request, adminAccessToken, board.id, user.id);

    const userAccessToken = await login(request, userData.username, userData.password);
    const currentUser = await getCurrentUser(request, userAccessToken);
    const originalPrefs = await getUserPrefs(request, userAccessToken, currentUser.id);

    try {
      await signInWithAccessToken(page, userAccessToken);
      await updateUserPrefs(request, userAccessToken, currentUser.id, {
        defaultView: 'list',
        sidebarCompact: true,
        hideCardModalActivity: true,
      });

      await page.goto(`/boards/${board.id}`);
      await expect(boardPage.switchToBoardViewButton()).toBeVisible();

      const compactSidebar = page.locator('[class*="Sidebar_sidebarCompact"]').first();
      await expect(compactSidebar).toBeVisible();
      await expect
        .poll(async () => Math.round((await compactSidebar.boundingBox()).width), {
          message: 'compact sidebar should render narrower than the default 230px sidebar',
        })
        .toBeLessThanOrEqual(190);

      await boardPage.switchToBoardViewButton().click();
      await expect(boardPage.switchToListViewButton()).toBeVisible();
      await boardPage.openCard(card.name);
      await expect(boardPage.cardModalCloseButton()).toBeVisible();

      const cardModal = page.locator('[class*="CardModal_wrapper"]').last();
      await expect(cardModal.getByText('Created', { exact: true })).toBeHidden();
      await expect(cardModal.getByText('Updated', { exact: true })).toBeHidden();
    } finally {
      await updateUserPrefs(request, userAccessToken, currentUser.id, {
        defaultView: originalPrefs.defaultView,
        sidebarCompact: originalPrefs.sidebarCompact,
        hideCardModalActivity: originalPrefs.hideCardModalActivity,
      });
      await cleanupProject(request, adminAccessToken, project.id);
      await deleteUser(request, adminAccessToken, user.id);
    }
  });

  test('validates account username and email edit forms without mutating the demo account', async ({ page, request }) => {
    const headerPage = new HeaderPage(page);
    const settingsPage = new SettingsPage(page, headerPage);

    await signIn(page, request);
    await settingsPage.openFromAvatar('Account', /\/settings\/account$/, 'Settings: Account');

    await page.getByRole('button', { name: 'Edit Username' }).click();
    await settingsPage.popup().locator('input[name="username"]').fill('bad username');
    await settingsPage.popup().getByRole('button', { name: 'Save' }).click();
    await expect(settingsPage.popup().locator('input[name="username"]')).toBeFocused();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Edit Email' }).click();
    await settingsPage.popup().locator('input[name="email"]').fill('not-an-email');
    await settingsPage.popup().getByRole('button', { name: 'Save' }).click();
    await expect(settingsPage.popup().locator('input[name="email"]')).toBeFocused();
  });

  test('creates, edits, reveals, and deletes an API client on authentication settings', async ({ page, request }, testInfo) => {
    const headerPage = new HeaderPage(page);
    const settingsPage = new SettingsPage(page, headerPage);
    const accessToken = await signIn(page, request);
    const apiClientName = uniqueName('E2E API Client', testInfo);
    const editedApiClientName = `${apiClientName} edited`;

    try {
      await cleanupApiClientsByPrefix(request, accessToken, 'E2E API Client');
      await settingsPage.openFromAvatar('Authentication', /\/settings\/authentication$/, 'Settings: Authentication');

      await page.getByRole('button', { name: 'Generate API Client' }).click();
      await settingsPage.popup().locator('input[name="name"]').fill(apiClientName);
      await settingsPage.popup().getByRole('checkbox', { name: 'all', exact: true }).check();
      await settingsPage.popup().getByRole('button', { name: 'Generate' }).click();
      await expect(settingsPage.popup().getByText('Client ID:')).toBeVisible();
      await expect(settingsPage.popup().getByText('Client Secret:')).toBeVisible();
      await settingsPage.popup().getByText('Close', { exact: true }).click();
      await page.reload();
      await expect(apiClientItem(page, apiClientName)).toBeVisible();

      await apiClientItem(page, apiClientName).getByRole('button', { name: 'Edit API Client' }).click();
      await settingsPage.popup().locator('input[name="name"]').fill(editedApiClientName);
      await settingsPage.popup().getByRole('button', { name: 'Save' }).click();
      await expect(apiClientItem(page, editedApiClientName)).toBeVisible();

      await apiClientItem(page, editedApiClientName).getByRole('button', { name: 'Delete API Client' }).click();
      await settingsPage.popup().getByRole('button', { name: 'Delete API Client' }).click();
      await expect(apiClientItem(page, editedApiClientName)).toBeHidden();
    } finally {
      await cleanupApiClientByName(request, accessToken, apiClientName);
      await cleanupApiClientByName(request, accessToken, editedApiClientName);
      await cleanupApiClientsByPrefix(request, accessToken, 'E2E API Client');
    }
  });

  test('uses About links as real external resources without leaving the app tab', async ({ page, request }) => {
    const headerPage = new HeaderPage(page);
    const settingsPage = new SettingsPage(page, headerPage);

    await signIn(page, request);
    await settingsPage.openFromAvatar('About', /\/settings\/about$/, 'Settings: About');

    await expect(page.getByRole('heading', { name: 'About 4ga Boards' })).toBeVisible();
    await expect(page.getByText(/^Version:/)).toBeVisible();
    await expect(page.getByText(/^Latest version:/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', 'https://docs.4gaboards.com');
    await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/RARgames/4gaBoards');
  });

  test('validates instance settings and opens instance activity', async ({ page, request }) => {
    const headerPage = new HeaderPage(page);
    const settingsPage = new SettingsPage(page, headerPage);

    await signIn(page, request);
    await settingsPage.openFromAvatar('Instance Settings', /\/settings\/instance$/, 'Settings: Instance');

    const allowedDomainsRow = settingsPage.row('Allowed Registration Domains');
    await allowedDomainsRow.getByRole('textbox').fill('invalid-domain');
    await allowedDomainsRow.getByRole('textbox').press('Enter');
    await expect(allowedDomainsRow.getByRole('textbox')).toBeFocused();

    await page.getByRole('button', { name: 'Check Activity' }).click();
    await expect(settingsPage.popup()).toContainText('Activity');
  });

  test('creates a user, validates login, edits, checks activity, and deletes the user', async ({ page, request }, testInfo) => {
    const headerPage = new HeaderPage(page);
    const settingsPage = new SettingsPage(page, headerPage);
    const accessToken = await signIn(page, request);
    const userData = uniqueUserData(testInfo);
    const editedName = `${userData.name} Edited`;

    try {
      await settingsPage.openFromAvatar('Users', /\/settings\/users$/, 'Settings: Users');

      await page.getByRole('button', { name: 'Add User' }).click();
      await settingsPage.popup().locator('input[name="email"]').fill(userData.email);
      await settingsPage.popup().locator('input[name="password"]').fill(userData.password);
      await settingsPage.popup().locator('input[name="name"]').fill(userData.name);
      await settingsPage.popup().locator('input[name="username"]').fill(userData.username);
      await settingsPage.popup().getByRole('button', { name: 'Add User' }).click();
      await expect(settingsPage.row(userData.name)).toBeVisible();

      await page.context().clearCookies();
      await page.goto('/login');
      await page.locator('input[name="emailOrUsername"]').fill(userData.username);
      await page.locator('input[name="password"]').fill(userData.password);
      await page.getByRole('button', { name: 'Log in' }).click();
      await expect(page.locator('[class*="Header_menuRight"]')).toBeVisible();
      await expect(page).not.toHaveURL(/\/login$/);

      await signInWithAccessToken(page, accessToken);
      await settingsPage.openFromAvatar('Users', /\/settings\/users$/, 'Settings: Users');
      await expect(settingsPage.row(userData.name)).toBeVisible();

      await settingsPage.row(userData.name).getByRole('button', { name: 'Edit User' }).click();
      await settingsPage.popup().getByRole('button', { name: 'Edit Information' }).click();
      await settingsPage.popup().locator('input[name="name"]').fill(editedName);
      await settingsPage.popup().getByRole('button', { name: 'Save' }).click();
      await expect(settingsPage.row(editedName)).toBeVisible();

      await settingsPage.row(editedName).getByRole('button', { name: 'Edit User' }).click();
      await settingsPage.popup().getByRole('button', { name: 'Check Activity' }).click();
      await expect(settingsPage.popup()).toContainText('Activity by');
      await page.keyboard.press('Escape');

      await settingsPage.row(editedName).getByRole('button', { name: 'Edit User' }).click();
      await settingsPage.popup().getByRole('button', { name: 'Delete User' }).click();
      await settingsPage.popup().getByRole('button', { name: 'Delete User' }).click();
      await expect(settingsPage.row(editedName)).toBeHidden();
    } finally {
      await cleanupUserByEmail(request, accessToken, userData.email);
    }
  });

  test('logs out from the avatar menu and clears the authenticated route', async ({ page, request }) => {
    const headerPage = new HeaderPage(page);

    await signIn(page, request);

    await headerPage.profileAndSettingsButton().click();
    await headerPage.menuItem('Log Out').click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();

    await page.goto('/settings/profile');
    await expect(page).toHaveURL(/\/login$/);
    await page.locator('input[name="emailOrUsername"]').fill('demo');
    await page.locator('input[name="password"]').fill(DEFAULT_PASSWORD);
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).not.toHaveURL(/\/login$/);
  });
});
