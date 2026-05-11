const { expect } = require('@playwright/test');

const DEFAULT_USER = process.env.E2E_USERNAME || 'demo';
const DEFAULT_PASSWORD = process.env.E2E_PASSWORD || 'demo';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const POSITION_GAP = 65535;

function isCleanupEnabled() {
  return !['0', 'false'].includes((process.env.E2E_CLEANUP || 'true').toLowerCase());
}

async function parseJsonResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`Expected JSON response from ${response.url()}, got: ${text}`);
  }
}

async function expectOk(response, action) {
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`${action} failed with ${response.status()} ${response.statusText()}: ${body}`);
  }
}

async function login(request, username = DEFAULT_USER, password = DEFAULT_PASSWORD) {
  const response = await request.post('/api/access-tokens', {
    form: {
      emailOrUsername: username,
      password,
    },
  });

  await expectOk(response, 'Login');
  const body = await parseJsonResponse(response);
  expect(body.item, 'login response should include an access token').toBeTruthy();

  return body.item;
}

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function apiPost(request, accessToken, url, data) {
  const response = await request.post(url, {
    data,
    headers: authHeaders(accessToken),
  });

  await expectOk(response, `POST ${url}`);
  return parseJsonResponse(response);
}

async function apiPatch(request, accessToken, url, data) {
  const response = await request.patch(url, {
    data,
    headers: authHeaders(accessToken),
  });

  await expectOk(response, `PATCH ${url}`);
  return parseJsonResponse(response);
}

async function apiGet(request, accessToken, url) {
  const response = await request.get(url, {
    headers: authHeaders(accessToken),
  });

  await expectOk(response, `GET ${url}`);
  return parseJsonResponse(response);
}

async function apiDelete(request, accessToken, url, options = {}) {
  const response = await request.delete(url, {
    headers: authHeaders(accessToken),
  });

  if (options.tolerateNotFound && response.status() === 404) {
    return {};
  }

  await expectOk(response, `DELETE ${url}`);
  return parseJsonResponse(response);
}

async function cleanupProject(request, accessToken, projectId) {
  if (!projectId || !isCleanupEnabled()) {
    return;
  }

  await apiDelete(request, accessToken, `/api/projects/${projectId}`, { tolerateNotFound: true });
}

async function createProject(request, accessToken, name) {
  const body = await apiPost(request, accessToken, '/api/projects', { name });
  return body.item;
}

async function getCurrentUser(request, accessToken) {
  const body = await apiGet(request, accessToken, '/api/users/me');
  return body.item;
}

async function getUserPrefs(request, accessToken, userId) {
  const body = await apiGet(request, accessToken, `/api/user-prefs/${userId}`);
  return body.item;
}

async function updateUserPrefs(request, accessToken, userId, data) {
  const body = await apiPatch(request, accessToken, `/api/user-prefs/${userId}`, data);
  return body.item;
}

async function getUsers(request, accessToken) {
  const body = await apiGet(request, accessToken, '/api/users');
  return body.items;
}

async function getNotifications(request, accessToken) {
  return apiGet(request, accessToken, '/api/notifications');
}

async function getApiClients(request, accessToken) {
  const body = await apiGet(request, accessToken, '/api/api-clients');
  return body.items;
}

async function deleteApiClient(request, accessToken, apiClientId) {
  if (!apiClientId || !isCleanupEnabled()) {
    return;
  }

  await apiDelete(request, accessToken, `/api/api-clients/${apiClientId}`, { tolerateNotFound: true });
}

async function updateUser(request, accessToken, userId, data) {
  const body = await apiPatch(request, accessToken, `/api/users/${userId}`, data);
  return body.item;
}

async function createBoard(request, accessToken, projectId, name) {
  const body = await apiPost(request, accessToken, `/api/projects/${projectId}/boards`, {
    position: POSITION_GAP,
    name,
    isGithubConnected: false,
    githubRepo: '',
  });

  return body.item;
}

async function createList(request, accessToken, boardId, name, index = 0) {
  const body = await apiPost(request, accessToken, `/api/boards/${boardId}/lists`, {
    position: (index + 1) * POSITION_GAP,
    name,
    isCollapsed: false,
  });

  return body.item;
}

async function createCard(request, accessToken, listId, name, index = 0, data = {}) {
  const body = await apiPost(request, accessToken, `/api/lists/${listId}/cards`, {
    position: (index + 1) * POSITION_GAP,
    name,
    ...data,
  });

  return body.item;
}

async function createTask(request, accessToken, cardId, name, index = 0, data = {}) {
  const body = await apiPost(request, accessToken, `/api/cards/${cardId}/tasks`, {
    position: (index + 1) * POSITION_GAP,
    name,
    ...data,
  });

  return body.item;
}

async function createLabel(request, accessToken, boardId, name, color = 'lagoon-blue') {
  const body = await apiPost(request, accessToken, `/api/boards/${boardId}/labels`, {
    name,
    color,
  });

  return body.item;
}

async function createUser(request, accessToken, data) {
  const body = await apiPost(request, accessToken, '/api/users', {
    phone: null,
    organization: null,
    ...data,
  });

  return body.item;
}

async function createBoardMembership(request, accessToken, boardId, userId, role = 'editor') {
  const body = await apiPost(request, accessToken, `/api/boards/${boardId}/memberships`, {
    userId,
    role,
  });

  return body.item;
}

async function deleteUser(request, accessToken, userId) {
  if (!userId || !isCleanupEnabled()) {
    return;
  }

  await apiDelete(request, accessToken, `/api/users/${userId}`, { tolerateNotFound: true });
}

async function setAuthCookies(page, accessToken) {
  await page.context().addCookies([
    {
      name: 'accessToken',
      value: accessToken,
      url: BASE_URL,
      sameSite: 'Strict',
    },
    {
      name: 'accessTokenVersion',
      value: '1',
      url: BASE_URL,
      sameSite: 'Strict',
    },
  ]);
}

function uniqueName(prefix, testInfo) {
  return `${prefix} ${Date.now()} ${testInfo.workerIndex}`;
}

function uniqueUserData(testInfo) {
  const suffix = `${Date.now().toString().slice(-8)}${testInfo.workerIndex}`;

  return {
    email: `e2e-${suffix}@example.test`,
    name: `E2E User ${suffix}`,
    password: 'StrongPass123!',
    username: `e2e${suffix}`.slice(0, 16),
  };
}

module.exports = {
  DEFAULT_PASSWORD,
  DEFAULT_USER,
  cleanupProject,
  createBoard,
  createBoardMembership,
  createCard,
  createLabel,
  createList,
  createProject,
  createTask,
  createUser,
  deleteApiClient,
  deleteUser,
  getApiClients,
  getCurrentUser,
  getNotifications,
  getUserPrefs,
  getUsers,
  isCleanupEnabled,
  login,
  setAuthCookies,
  updateUser,
  updateUserPrefs,
  uniqueName,
  uniqueUserData,
};
