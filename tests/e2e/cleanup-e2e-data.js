const DEFAULT_USER = process.env.E2E_USERNAME || 'demo';
const DEFAULT_PASSWORD = process.env.E2E_PASSWORD || 'demo';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

async function parseJsonResponse(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${options.method || 'GET'} ${path} failed with ${response.status} ${response.statusText}: ${body}`);
  }

  return parseJsonResponse(response);
}

async function login() {
  const body = await request('/api/access-tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      emailOrUsername: DEFAULT_USER,
      password: DEFAULT_PASSWORD,
    }),
  });

  return body.item;
}

async function deleteResource(path, accessToken) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DELETE ${path} failed with ${response.status} ${response.statusText}: ${body}`);
  }

  return true;
}

function isE2eProject(project) {
  return project.name?.startsWith('E2E ');
}

function isE2eUser(user) {
  return user.email?.startsWith('e2e-') && user.email.endsWith('@example.test');
}

function isE2eApiClient(apiClient) {
  return apiClient.name?.startsWith('E2E API Client');
}

async function main() {
  const accessToken = await login();
  const authHeaders = {
    Authorization: `Bearer ${accessToken}`,
  };

  const [{ items: projects }, { items: users }, { items: apiClients }] = await Promise.all([
    request('/api/projects', { headers: authHeaders }),
    request('/api/users', { headers: authHeaders }),
    request('/api/api-clients', { headers: authHeaders }),
  ]);

  const e2eProjects = projects.filter(isE2eProject);
  const e2eUsers = users.filter(isE2eUser);
  const e2eApiClients = apiClients.filter(isE2eApiClient);

  const summary = {
    projects: 0,
    users: 0,
    apiClients: 0,
  };

  for (const project of e2eProjects) {
    if (await deleteResource(`/api/projects/${project.id}`, accessToken)) {
      summary.projects += 1;
      console.log(`Deleted project: ${project.name}`);
    }
  }

  for (const apiClient of e2eApiClients) {
    if (await deleteResource(`/api/api-clients/${apiClient.id}`, accessToken)) {
      summary.apiClients += 1;
      console.log(`Deleted API client: ${apiClient.name}`);
    }
  }

  for (const user of e2eUsers) {
    if (await deleteResource(`/api/users/${user.id}`, accessToken)) {
      summary.users += 1;
      console.log(`Deleted user: ${user.email}`);
    }
  }

  console.log(`Cleanup complete: ${summary.projects} projects, ${summary.users} users, ${summary.apiClients} API clients deleted.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
