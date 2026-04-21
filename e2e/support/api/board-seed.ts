import { randomUUID } from 'node:crypto';

import type { APIRequestContext, APIResponse } from '@playwright/test';

export type SeededBoard = {
  projectId: string;
  boardId: string;
  listId: string;
};

function bearerHeaders(accessToken: string): { Authorization: string } {
  return { Authorization: `Bearer ${accessToken}` };
}

async function readErrorBody(response: APIResponse): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

export async function seedProjectBoardAndList(
  request: APIRequestContext,
  apiBaseUrl: string,
  accessToken: string,
  uniqueLabel: string,
): Promise<SeededBoard> {
  const headers = bearerHeaders(accessToken);

  const projectResponse = await request.post(`${apiBaseUrl}/api/projects`, {
    headers,
    data: { name: `E2E Project ${uniqueLabel}` },
  });

  if (!projectResponse.ok()) {
    throw new Error(`POST /api/projects failed: ${projectResponse.status()} ${await readErrorBody(projectResponse)}`);
  }

  const projectBody = (await projectResponse.json()) as { item: { id: string | number } };
  const projectId = String(projectBody.item.id);

  const boardResponse = await request.post(`${apiBaseUrl}/api/projects/${projectId}/boards`, {
    headers,
    data: {
      position: 65_535,
      name: `E2E Board ${uniqueLabel}`,
      isGithubConnected: false,
      requestId: randomUUID(),
    },
  });

  if (!boardResponse.ok()) {
    throw new Error(`POST /api/projects/:id/boards failed: ${boardResponse.status()} ${await readErrorBody(boardResponse)}`);
  }

  const boardBody = (await boardResponse.json()) as { item: { id: string | number } };
  const boardId = String(boardBody.item.id);

  const listResponse = await request.post(`${apiBaseUrl}/api/boards/${boardId}/lists`, {
    headers,
    data: {
      position: 65_535,
      name: `E2E List ${uniqueLabel}`,
      isCollapsed: false,
    },
  });

  if (!listResponse.ok()) {
    throw new Error(`POST /api/boards/:boardId/lists failed: ${listResponse.status()} ${await readErrorBody(listResponse)}`);
  }

  const listBody = (await listResponse.json()) as { item: { id: string | number } };
  const listId = String(listBody.item.id);

  return { projectId, boardId, listId };
}
