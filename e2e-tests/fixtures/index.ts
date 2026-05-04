import { test as base } from '@playwright/test';
import crypto from 'crypto';
import { ApiClient, type Project, type Board, type List, type Card, type User } from '../helpers/api-client';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_USER = process.env.ADMIN_USER || 'demo';
const ADMIN_PASS = process.env.ADMIN_PASS || 'demo';

type Fixtures = {
  /** 6-digit hex unique to this test invocation, for parallel isolation */
  runId: string;
  /** Authenticated API client (admin) */
  api: ApiClient;
  /** API-created project, auto-deleted in teardown (cascades to children) */
  testProject: Project;
  /** API-created board inside testProject */
  testBoard: Board;
  /** API-created list inside testBoard */
  testList: List;
  /** API-created card inside testList */
  testCard: Card;
  /** API-created non-admin user, auto-deleted in teardown */
  testUser: User & { password: string };
  /** Authenticated API client for testUser */
  testUserApi: ApiClient;
};

export const test = base.extend<Fixtures>({
  runId: async ({}, use) => {
    await use(crypto.randomBytes(3).toString('hex'));
  },

  api: async ({}, use) => {
    const api = await ApiClient.login(BASE_URL, ADMIN_USER, ADMIN_PASS);
    await use(api);
  },

  testProject: async ({ api, runId }, use) => {
    const project = await api.createProject(`Test Project ${runId}`);
    await use(project);
    await api.deleteProject(project.id);
  },

  testBoard: async ({ api, testProject, runId }, use) => {
    const board = await api.createBoard(testProject.id, `Test Board ${runId}`);
    await use(board);
    // Cleaned up by testProject cascade delete
  },

  testList: async ({ api, testBoard, runId }, use) => {
    const list = await api.createList(testBoard.id, `Test List ${runId}`);
    await use(list);
    // Cleaned up by testProject cascade delete
  },

  testCard: async ({ api, testList, runId }, use) => {
    const card = await api.createCard(testList.id, `Test Card ${runId}`);
    await use(card);
    // Cleaned up by testProject cascade delete
  },

  testUser: async ({ api, runId }, use) => {
    const password = 'T3stP@ss!secure';
    const user = await api.createUser({
      name: `Test User ${runId}`,
      username: `user_${runId}`,
      email: `user_${runId}@test.local`,
      password,
    });
    await use({ ...user, password });
    await api.deleteUser(user.id);
  },

  testUserApi: async ({ testUser }, use) => {
    const userApi = await ApiClient.login(BASE_URL, testUser.username, testUser.password);
    await use(userApi);
  },
});

export { expect } from '@playwright/test';
