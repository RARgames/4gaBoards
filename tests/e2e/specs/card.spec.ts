import { test, expect } from '../../fixtures/auth.fixture';
import { loginAsAdmin } from '../../fixtures/auth.fixture';
import { LoginPage } from '../pageObjects/LoginPage';
import { BoardPage } from '../pageObjects/BoardPage';
import { CardPage } from '../pageObjects/CardPage';

const PROJECT_NAME = `Card Test Project ${Date.now()}`;
const BOARD_NAME = `Card Test Board ${Date.now()}`;
const LIST_NAME = 'To Do';

test.describe('Card management', () => {
  let projectId: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);
    const boardPage = new BoardPage(page);
    projectId = await boardPage.createProject(PROJECT_NAME);
    await boardPage.createBoard(BOARD_NAME, PROJECT_NAME);
    await boardPage.createList(LIST_NAME);
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);
    const boardPage = new BoardPage(page);
    await page.locator(`[title='${BOARD_NAME}']`).first().click();
    await boardPage.deleteBoard().catch((e) => console.warn('Board cleanup failed:', e));
    if (projectId) {
      await boardPage.deleteProject(projectId).catch((e) => console.warn('Project cleanup failed:', e));
    }
    await page.close();
  });

  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.locator(`[title='${BOARD_NAME}']`).first().click();
    await expect(page).toHaveURL(/\/boards\/\w+/);
  });

  test('admin can create a card in a list', { tag: '@smoke' }, async ({ authenticatedPage: page }) => {
    const cardPage = new CardPage(page);
    const cardName = `My Card ${Date.now()}`;

    await test.step('Create a card', async () => {
      await cardPage.createCard(cardName);
    });

    await test.step('Verify the card appears in the list', async () => {
      await expect(page.locator(`div[title='${cardName}']`)).toBeVisible();
    });
  });

  test('admin can open and close a card modal', async ({ authenticatedPage: page }) => {
    const cardPage = new CardPage(page);
    const cardName = `Modal Card ${Date.now()}`;

    await test.step('Create a card', async () => {
      await cardPage.createCard(cardName);
    });

    await test.step('Open the card modal', async () => {
      await cardPage.openCard(cardName);
    });

    await test.step('Verify the card modal is open', async () => {
      await expect(page.locator("button[title='Close Card']")).toBeVisible();
      await expect(page).toHaveURL(/\/cards\/\w+/);
    });

    await test.step('Close the card modal', async () => {
      await cardPage.closeCard();
      await expect(page).toHaveURL(/\/boards\/\w+/);
    });
  });
});
