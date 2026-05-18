import { test, expect } from '../../fixtures/auth.fixture';
import { BoardPage } from '../pageObjects/BoardPage';

const PROJECT_NAME = `Test Project ${Date.now()}`;
const BOARD_NAME = `Test Board ${Date.now()}`;

test.describe('Board management', () => {
  test('admin can create a board', { tag: '@smoke' }, async ({ authenticatedPage: page }) => {
    const boardPage = new BoardPage(page);
    let projectId = '';

    try {
      await test.step('Create a project', async () => {
        projectId = await boardPage.createProject(PROJECT_NAME);
        expect(projectId).not.toBe('');
      });

      await test.step('Create a board inside the project', async () => {
        const boardId = await boardPage.createBoard(BOARD_NAME, PROJECT_NAME);
        expect(boardId).not.toBe('');
      });

      await test.step('Verify the board page is displayed', async () => {
        await expect(page).toHaveURL(/\/boards\/\w+/);
        await expect(page.locator(`div[title='${BOARD_NAME}']`)).toBeVisible({ timeout: 10000 });
      });
    } finally {
      await boardPage.deleteBoard().catch((e) => console.warn('Board cleanup failed:', e));
      if (projectId) {
        await boardPage.deleteProject(projectId).catch((e) => console.warn('Project cleanup failed:', e));
      }
    }
  });

  test('admin can add a list to a board', { tag: '@smoke' }, async ({ authenticatedPage: page }) => {
    const boardPage = new BoardPage(page);
    const listName = `Todo ${Date.now()}`;
    let projectId = '';

    try {
      await test.step('Create project and board', async () => {
        projectId = await boardPage.createProject(`${PROJECT_NAME}-list`);
        await boardPage.createBoard(`${BOARD_NAME}-list`, `${PROJECT_NAME}-list`);
      });

      await test.step('Add a list to the board', async () => {
        await boardPage.createList(listName);
      });

      await test.step('Verify the list appears on the board', async () => {
        await expect(page.locator(`div[title='${listName}']`)).toBeVisible();
      });
    } finally {
      await boardPage.deleteBoard().catch((e) => console.warn('Board cleanup failed:', e));
      if (projectId) {
        await boardPage.deleteProject(projectId).catch((e) => console.warn('Project cleanup failed:', e));
      }
    }
  });

  test('cannot create a board without a name', async ({ authenticatedPage: page }) => {
    const boardPage = new BoardPage(page);
    let projectId = '';

    try {
      await test.step('Create a project', async () => {
        projectId = await boardPage.createProject(`${PROJECT_NAME}-validation`);
      });

      await test.step('Open the add board popup and submit without a name', async () => {
        await page.locator("button[title='Add Board']").first().click();
        await page.locator("button[title='Add Board']").nth(1).click();
      });

      await test.step('Verify the form is still open and no navigation occurred', async () => {
        await expect(page.locator("input[placeholder='Enter board name...']")).toBeVisible();
        await expect(page).not.toHaveURL(/\/boards\/\w+/);
      });
    } finally {
      if (projectId) {
        await page.keyboard.press('Escape');
        await boardPage.deleteProject(projectId).catch((e) => console.warn('Project cleanup failed:', e));
      }
    }
  });

  test('cannot create a list without a name', async ({ authenticatedPage: page }) => {
    const boardPage = new BoardPage(page);
    let projectId = '';

    try {
      await test.step('Create project and board', async () => {
        projectId = await boardPage.createProject(`${PROJECT_NAME}-list-validation`);
        await boardPage.createBoard(`${BOARD_NAME}-list-validation`, `${PROJECT_NAME}-list-validation`);
      });

      await test.step('Open add list form and press Enter with empty name', async () => {
        await page.locator("button[title='Add List']").click();
        const textarea = page.locator("textarea[placeholder='Enter list name...']");
        await textarea.waitFor({ state: 'visible' });
        await textarea.press('Enter');
      });

      await test.step('Verify the list form stays open with validation error', async () => {
        await expect(page.locator("textarea[placeholder='Enter list name...']")).toBeVisible();
      });
    } finally {
      await boardPage.deleteBoard().catch((e) => console.warn('Board cleanup failed:', e));
      if (projectId) {
        await boardPage.deleteProject(projectId).catch((e) => console.warn('Project cleanup failed:', e));
      }
    }
  });
});
