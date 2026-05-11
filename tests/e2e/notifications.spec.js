const { expect, test } = require('@playwright/test');
const crypto = require('crypto');

const { HeaderPage } = require('./pages/HeaderPage');
const {
  cleanupProject,
  createBoard,
  createBoardMembership,
  createCard,
  createList,
  createProject,
  createTask,
  createUser,
  deleteUser,
  getNotifications,
  getUserPrefs,
  login,
  updateUserPrefs,
  uniqueName,
} = require('./helpers/boardsApi');
const { signInWithAccessToken } = require('./helpers/session');

const TASK_NOTIFICATION_SCOPE = 'task';

function notificationUserData(testInfo, role) {
  const suffix = `${testInfo.workerIndex}${crypto.randomBytes(4).toString('hex')}`;
  const rolePrefix = role === 'watcher' ? 'w' : 'a';

  return {
    email: `e2e-${role}-${suffix}@example.test`,
    name: `E2E ${role} ${suffix}`,
    password: 'StrongPass123!',
    username: `e2en${rolePrefix}${suffix}`.slice(0, 16),
  };
}

function uniqueTaskName(prefix, testInfo) {
  return `${prefix} ${Date.now().toString().slice(-6)}${testInfo.workerIndex}`;
}

async function findTaskNotification(request, accessToken, taskName) {
  const body = await getNotifications(request, accessToken);
  const action = body.included.actions.find((item) => item.data?.taskName === taskName);

  if (!action) {
    return null;
  }

  return body.items.find((item) => String(item.actionId) === String(action.id)) || null;
}

async function expectTaskNotification(request, accessToken, taskName) {
  return expect
    .poll(async () => findTaskNotification(request, accessToken, taskName), {
      message: `task notification should be created for "${taskName}"`,
    })
    .toBeTruthy();
}

async function signInToNotificationCenter(page, accessToken) {
  const headerPage = new HeaderPage(page);

  await signInWithAccessToken(page, accessToken);
  await page.goto('/notifications');
  await expect(page).toHaveURL(/\/notifications$/);
  try {
    await expect(headerPage.headerTitle('Notifications')).toBeVisible({ timeout: 20000 });
  } catch (error) {
    await page.reload();
    await expect(headerPage.headerTitle('Notifications')).toBeVisible({ timeout: 20000 });
  }
}

async function setupTaskNotificationScenario(request, testInfo, { taskNotificationsEnabled }) {
  const adminAccessToken = await login(request);
  const watcherData = notificationUserData(testInfo, 'watcher');
  const actorData = notificationUserData(testInfo, 'actor');
  const watcher = await createUser(request, adminAccessToken, watcherData);
  const actor = await createUser(request, adminAccessToken, actorData);
  const watcherAccessToken = await login(request, watcherData.username, watcherData.password);
  const actorAccessToken = await login(request, actorData.username, actorData.password);
  const originalPrefs = await getUserPrefs(request, watcherAccessToken, watcher.id);
  const notificationTypes = taskNotificationsEnabled
    ? [...new Set([...originalPrefs.notificationTypes, TASK_NOTIFICATION_SCOPE])]
    : originalPrefs.notificationTypes.filter((type) => type !== TASK_NOTIFICATION_SCOPE);

  await updateUserPrefs(request, watcherAccessToken, watcher.id, {
    notificationTypes,
    subscribeToNewBoards: true,
  });

  const project = await createProject(request, adminAccessToken, uniqueName('E2E Notifications Project', testInfo));
  const board = await createBoard(request, adminAccessToken, project.id, uniqueName('E2E Notifications Board', testInfo));
  const list = await createList(request, adminAccessToken, board.id, uniqueName('Notifications List', testInfo));
  const card = await createCard(request, adminAccessToken, list.id, uniqueName('Notifications Card', testInfo));

  await createBoardMembership(request, adminAccessToken, board.id, watcher.id);
  await createBoardMembership(request, adminAccessToken, board.id, actor.id);

  return {
    actor,
    actorAccessToken,
    adminAccessToken,
    card,
    project,
    watcher,
    watcherAccessToken,
  };
}

test.describe('notifications', () => {
  test('delivers a task notification to a subscribed board member', async ({ page, request }, testInfo) => {
    const scenario = await setupTaskNotificationScenario(request, testInfo, {
      taskNotificationsEnabled: true,
    });
    const taskName = uniqueTaskName('Review task', testInfo);

    try {
      await createTask(request, scenario.actorAccessToken, scenario.card.id, taskName);
      await expectTaskNotification(request, scenario.watcherAccessToken, taskName);

      await signInToNotificationCenter(page, scenario.watcherAccessToken);
      await expect(page.getByText(taskName, { exact: true })).toBeVisible();
      await expect(page.getByText('Created task')).toBeVisible();
    } finally {
      await cleanupProject(request, scenario.adminAccessToken, scenario.project.id);
      await deleteUser(request, scenario.adminAccessToken, scenario.actor.id);
      await deleteUser(request, scenario.adminAccessToken, scenario.watcher.id);
    }
  });

  test('does not deliver task notifications when the user disables the task notification type', async ({ page, request }, testInfo) => {
    const scenario = await setupTaskNotificationScenario(request, testInfo, {
      taskNotificationsEnabled: false,
    });
    const taskName = uniqueTaskName('Muted task', testInfo);

    try {
      await createTask(request, scenario.actorAccessToken, scenario.card.id, taskName);

      await expect
        .poll(async () => findTaskNotification(request, scenario.watcherAccessToken, taskName), {
          intervals: [250, 500, 1000],
          message: 'muted task notification should not be created',
          timeout: 2500,
        })
        .toBeNull();

      await signInToNotificationCenter(page, scenario.watcherAccessToken);
      await expect(page.getByText(taskName, { exact: true })).toHaveCount(0);
    } finally {
      await cleanupProject(request, scenario.adminAccessToken, scenario.project.id);
      await deleteUser(request, scenario.adminAccessToken, scenario.actor.id);
      await deleteUser(request, scenario.adminAccessToken, scenario.watcher.id);
    }
  });

  test('marks a task notification as read from the notification center', async ({ page, request }, testInfo) => {
    const scenario = await setupTaskNotificationScenario(request, testInfo, {
      taskNotificationsEnabled: true,
    });
    const taskName = uniqueTaskName('Read task', testInfo);

    try {
      await createTask(request, scenario.actorAccessToken, scenario.card.id, taskName);
      await expectTaskNotification(request, scenario.watcherAccessToken, taskName);

      await signInToNotificationCenter(page, scenario.watcherAccessToken);
      const notification = page.locator('div[class*="Notifications_item__"]').filter({ hasText: taskName });
      await expect(notification).toBeVisible();
      await notification.getByRole('button', { name: 'Mark as read' }).click();

      await expect
        .poll(async () => {
          const item = await findTaskNotification(request, scenario.watcherAccessToken, taskName);
          return item?.isRead ?? false;
        })
        .toBe(true);
      await expect(notification.getByRole('button', { name: 'Mark as unread' })).toBeVisible();
    } finally {
      await cleanupProject(request, scenario.adminAccessToken, scenario.project.id);
      await deleteUser(request, scenario.adminAccessToken, scenario.actor.id);
      await deleteUser(request, scenario.adminAccessToken, scenario.watcher.id);
    }
  });
});
