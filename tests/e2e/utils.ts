import { expect, Page, request } from '@playwright/test';
import { LoginPage } from './pageObjects/LoginPage';
import { ADMIN, TEST_PROJECT_NAME } from './testData';

export const BASE_URL = 'http://localhost:3000';
export const BOARD_01 = 'Board 01';

export async function loginToDashboard(page: Page, username: string, password: string): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLoginPage();
  await loginPage.loginToDashboard(username, password);
  await expect(loginPage.dashboardTitle).toBeVisible({ timeout: 15000 });
}

export async function loginAndNavigateToBoard(page: Page, username: string, password: string, boardName: string = BOARD_01): Promise<void> {
  await loginToDashboard(page, username, password);
  await page.getByRole('button', { name: 'Project 01', exact: true }).first().click();
  await page.getByRole('link', { name: boardName, exact: true }).last().click();
  await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 5000 });
}

export async function getAdminToken() {
  const apiContext = await request.newContext();
  const authRes = await apiContext.post(`${BASE_URL}/api/access-tokens`, {
    data: { emailOrUsername: ADMIN.username, password: ADMIN.password },
  });
  const { item: token } = await authRes.json();
  return { apiContext, token };
}

export async function getBoardId(apiContext: any, token: string, boardName: string): Promise<string> {
  const projectsRes = await apiContext.get(`${BASE_URL}/api/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const projectsBody = await projectsRes.json();
  const project = projectsBody.items.find((p: any) => p.name === TEST_PROJECT_NAME);

  const projectRes = await apiContext.get(`${BASE_URL}/api/projects/${project.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const projectBody = await projectRes.json();
  const board = projectBody.included.boards.find((b: any) => b.name === boardName);
  return board.id;
}

export async function getBoardMembershipId(apiContext: any, token: string, boardId: string, username: string): Promise<string> {
  const boardRes = await apiContext.get(`${BASE_URL}/api/boards/${boardId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const boardBody = await boardRes.json();

  const user = boardBody.included.users.find((u: any) => u.username === username);
  const membership = boardBody.included.boardMemberships.find((bm: any) => bm.userId === user.id);
  return membership.id;
}
