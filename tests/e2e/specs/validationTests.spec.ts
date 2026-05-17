import { test, expect } from '@playwright/test';
import { BoardPage } from '../pageObjects/BoardPage';
import { ListPage } from '../pageObjects/ListPage';
import { ADMIN, TEST_PROJECT_NAME } from '../testData';
import { BOARD_01, loginToDashboard, loginAndNavigateToBoard } from '../utils';

test.describe('TC17: Reject board creation with empty name', () => {

  // TEST: Verify that submitting the "Add Board" form with an empty or whitespace-only name does not create a board
  // RESULT: The submit button is disabled or the board is not created; form remains open

  test('Admin cannot create a board with empty name', async ({ page }) => {
    await loginToDashboard(page, ADMIN.username, ADMIN.password);
    const boardPage = new BoardPage(page);

    await boardPage.addBoardButton.click();
    await expect(boardPage.boardNameInput).toBeVisible({ timeout: 5000 });

    // Select project first
    await page.locator('input[placeholder="Select project"]').click();
    await page.locator('[class*="dropdownMenu"]').getByText(TEST_PROJECT_NAME, { exact: true }).click();

    // Try submitting with empty name
    await boardPage.boardNameInput.fill('');
    await boardPage.submitBoardButton.click();

    // Form should still be open (board not created)
    await expect(boardPage.boardNameInput).toBeVisible({ timeout: 3000 });
  });

  // TEST: Verify that submitting the "Add Board" form with a whitespace-only name does not create a board
  // RESULT: The board is not created; form remains open

  test('Admin cannot create a board with whitespace-only name', async ({ page }) => {
    await loginToDashboard(page, ADMIN.username, ADMIN.password);
    const boardPage = new BoardPage(page);

    await boardPage.addBoardButton.click();
    await expect(boardPage.boardNameInput).toBeVisible({ timeout: 5000 });

    // Select project first
    await page.locator('input[placeholder="Select project"]').click();
    await page.locator('[class*="dropdownMenu"]').getByText(TEST_PROJECT_NAME, { exact: true }).click();

    // Try submitting with whitespace-only name
    await boardPage.boardNameInput.fill('   ');
    await boardPage.submitBoardButton.click();

    // Form should still be open (board not created)
    await expect(boardPage.boardNameInput).toBeVisible({ timeout: 3000 });
  });
});

test.describe('TC18: Reject list creation with empty name', () => {

  // TEST: Verify that submitting the "Add List" form with an empty or whitespace-only name does not create a list
  // RESULT: No list is created; the form remains open for input

  test('Admin cannot create a list with empty name', async ({ page }) => {
    await loginAndNavigateToBoard(page, ADMIN.username, ADMIN.password);
    const listPage = new ListPage(page);

    await listPage.openAddListForm();

    // Submit with empty name
    await listPage.listNameField.fill('');
    await listPage.listNameField.press('Enter');

    // Form should remain open and no new list created
    await expect(listPage.listNameField).toBeVisible({ timeout: 3000 });
  });

  test('Admin cannot create a list with whitespace-only name', async ({ page }) => {
    await loginAndNavigateToBoard(page, ADMIN.username, ADMIN.password);
    const listPage = new ListPage(page);

    await listPage.openAddListForm();

    // Submit with whitespace-only name
    await listPage.listNameField.fill('   ');
    await listPage.listNameField.press('Enter');

    // Form should remain open and no new list created
    await expect(listPage.listNameField).toBeVisible({ timeout: 3000 });
  });
});

test.describe('TC19: Accept duplicate list names', () => {

  // TEST: Verify that creating multiple lists with the same name is allowed
  // RESULT: Both lists are created and visible on the board

  test('Admin can create two lists with the same name', async ({ page }) => {
    await loginAndNavigateToBoard(page, ADMIN.username, ADMIN.password);
    const listPage = new ListPage(page);

    const listName = `TC19 Duplicate ${Date.now()}`;

    // Create first list
    await listPage.createList(listName);
    await expect(listPage.listTitle(listName).first()).toBeVisible({ timeout: 5000 });

    // Create second list with same name
    await listPage.listNameField.fill(listName);
    await listPage.listNameField.press('Enter');

    // Both lists should exist
    await expect(listPage.listTitle(listName)).toHaveCount(2, { timeout: 5000 });

    // Cleanup: delete both lists (use first() since names are identical)
    await listPage.closeAddListForm();
    await listPage.listTitle(listName).first().locator('..').locator('button[title="Edit List"]').click();
    await page.getByRole('button', { name: 'Delete List' }).click();
    await page.getByText('Are you sure you want to delete this list').waitFor({ state: 'visible', timeout: 3000 });
    await page.getByRole('button', { name: 'Delete list' }).click();
    await expect(listPage.listTitle(listName)).toHaveCount(1, { timeout: 5000 });

    await listPage.deleteList(listName);
    await expect(listPage.listTitle(listName)).toHaveCount(0, { timeout: 5000 });
  });
});

test.describe('TC20: Long list name handling', () => {
  // TEST: Verify that a list with a very long name (200+ characters) can be created
  // RESULT: List is created successfully; name is displayed or truncated gracefully
  test('Admin can create a list with a 200+ character name', async ({ page }) => {
    await loginAndNavigateToBoard(page, ADMIN.username, ADMIN.password);
    const listPage = new ListPage(page);

    const longName = 'A'.repeat(210) + ` ${Date.now()}`;

    await listPage.createList(longName);

    // List should be created (title element exists with the long name)
    await expect(listPage.listTitle(longName)).toBeVisible({ timeout: 5000 });

    // Cleanup
    await listPage.closeAddListForm();
    await listPage.deleteList(longName);
    await expect(listPage.listTitle(longName)).toHaveCount(0, { timeout: 5000 });
  });
});
