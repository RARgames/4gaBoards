import { test, request } from '@playwright/test';
import { ADMIN, TEST_USERS, TEST_PROJECT_NAME } from './testData';

const BASE_URL = 'http://localhost:3000';

test('seed test users and assign roles', async () => {
  const apiContext = await request.newContext();

  // 1. Authenticate as admin
  const authRes = await apiContext.post(`${BASE_URL}/api/access-tokens`, {
    data: { emailOrUsername: ADMIN.username, password: ADMIN.password },
  });
  const { item: token } = await authRes.json();

  // 2. Find "Project 01"
  const projectsRes = await apiContext.get(`${BASE_URL}/api/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const projectsBody = await projectsRes.json();
  const project = projectsBody.items.find((p: any) => p.name === TEST_PROJECT_NAME) || projectsBody.items[0];

  // 3. Get the first board in the project
  const projectRes = await apiContext.get(`${BASE_URL}/api/projects/${project.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const projectBody = await projectRes.json();
  const firstBoard = projectBody.included.boards[0];

  console.log(`[Setup] Project: "${project.name}" (${project.id}), Board: "${firstBoard.name}" (${firstBoard.id})`);

  // 4. Create users (idempotent — skips if already exists)
  const userIds: Record<string, string> = {};
  for (const [role, userData] of Object.entries(TEST_USERS)) {
    const res = await apiContext.post(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { email: userData.email, password: userData.password, name: userData.name, username: userData.username },
    });

    if (res.ok()) {
      const body = await res.json();
      userIds[role] = body.item.id;
    } else if (res.status() === 409) {
      const allUsersRes = await apiContext.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allUsersBody = await allUsersRes.json();
      const existing = allUsersBody.items.find((u: any) => u.username === userData.username || u.email === userData.email);
      userIds[role] = existing.id;
    } else {
      throw new Error(`Failed to create user ${role}: ${res.status()} ${await res.text()}`);
    }
  }

  console.log(`[Setup] Users: pm=${userIds.pm}, editor=${userIds.editor}, commenter=${userIds.commenter}, viewer=${userIds.viewer}, nonMember=${userIds.nonMember}`);

  // 5. Assign roles (idempotent — 409 means already assigned)
  // PM → Project Manager
  await apiContext.post(`${BASE_URL}/api/projects/${project.id}/managers`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { userId: userIds.pm },
  });

  // Editor → Board editor
  await apiContext.post(`${BASE_URL}/api/boards/${firstBoard.id}/memberships`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { userId: userIds.editor, role: 'editor' },
  });

  // Commenter → Board viewer with canComment
  await apiContext.post(`${BASE_URL}/api/boards/${firstBoard.id}/memberships`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { userId: userIds.commenter, role: 'viewer', canComment: true },
  });

  // Viewer → Board viewer without canComment
  await apiContext.post(`${BASE_URL}/api/boards/${firstBoard.id}/memberships`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { userId: userIds.viewer, role: 'viewer', canComment: false },
  });

  console.log('[Setup] Roles assigned successfully');

  await apiContext.dispose();
});
