import { randomUUID } from 'node:crypto';

import { test, expect } from '@playwright/test';

import { BoardPage } from '../pages/BoardPage.js';
import { obtainAccessToken } from '../support/api/session.js';
import { seedProjectBoardAndList } from '../support/api/board-seed.js';
import { primeAccessToken } from '../support/browser/auth-storage.js';
import { getApiBaseUrl, getDemoCredentials } from '../support/env.js';

test.describe('Boards and cards', () => {
  test('user adds a card from the list footer on a Kanban board', async ({ page, request }) => {
    const apiBaseUrl = getApiBaseUrl();
    const credentials = getDemoCredentials();
    const label = randomUUID();
    const cardName = `E2E Card ${label}`;

    const accessToken = await test.step('Create access token via API', async () => {
      return obtainAccessToken(request, apiBaseUrl, credentials);
    });

    const seeded = await test.step('Seed project, board, and list via API', async () => {
      return seedProjectBoardAndList(request, apiBaseUrl, accessToken, label);
    });

    await test.step('Attach session to the browser context', async () => {
      await primeAccessToken(page.context(), accessToken);
    });

    const boardPage = new BoardPage(page);

    await test.step('Open the prepared board', async () => {
      await boardPage.gotoBoard(seeded.boardId);
    });

    await test.step('Create a card through the UI', async () => {
      await boardPage.addCardViaListFooter(cardName);
    });

    await test.step('The new card is visible on the board', async () => {
      await expect(page.getByText(cardName, { exact: true })).toBeVisible();
    });
  });

  test('authenticated user sees not-found for an unknown board id', async ({ page, request }) => {
    const apiBaseUrl = getApiBaseUrl();
    const credentials = getDemoCredentials();

    const accessToken = await test.step('Create access token via API', async () => {
      return obtainAccessToken(request, apiBaseUrl, credentials);
    });

    await test.step('Attach session to the browser context', async () => {
      await primeAccessToken(page.context(), accessToken);
    });

    const boardPage = new BoardPage(page);

    await test.step('Navigate to a board id that does not exist', async () => {
      await boardPage.gotoNonExistingBoard('999999999999999999');
    });

    await test.step('A not-found message is shown', async () => {
      await expect(page.getByTestId('board-not-found-heading')).toBeVisible();
    });
  });
});
