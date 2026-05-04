import { test, expect } from '../../fixtures';
import { BoardViewPage } from '../../pages/BoardViewPage';

test.describe('Boards - View', () => {
  test('should display boards within a project', async ({ page, testProject, testBoard }) => {
    await page.goto(`/projects/${testProject.id}`);

    // Board visible in sidebar
    await expect(page.locator(`a[href="/boards/${testBoard.id}"]`).first()).toBeVisible();

    // Board visible in project view
    await expect(page.getByText(testBoard.name, { exact: true }).first()).toBeVisible();
  });
});

test.describe('Boards - Create', () => {
  test('should create a new board within a project', async ({ page, testProject, runId }) => {
    const boardName = `New Board ${runId}`;

    await page.goto(`/projects/${testProject.id}`);

    // Click Add Board in sidebar
    await page.getByRole('button', { name: 'Add Board' }).first().click();

    const popup = page.getByRole('dialog');
    await expect(popup).toBeVisible();
    await popup.getByPlaceholder('Enter board name...').fill(boardName);

    // Submit
    await popup.getByRole('button', { name: 'Add Board' }).click();

    // Verify the new board appears
    await expect(page.getByText(boardName, { exact: true }).first()).toBeVisible();
  });
});

test.describe('Boards - Subscribe', () => {
  test('should subscribe and unsubscribe to a board', async ({ page, testBoard }) => {
    const boardView = new BoardViewPage(page);
    await boardView.goto(testBoard.id);

    // Board header has Subscribe/Unsubscribe button
    const subscribeBtn = page.locator('button[title="Subscribe"]').first();
    const unsubscribeBtn = page.locator('button[title="Unsubscribe"]').first();

    // If currently unsubscribed, subscribe first
    if (await subscribeBtn.isVisible()) {
      await subscribeBtn.click();
      await expect(unsubscribeBtn).toBeVisible();

      // Unsubscribe
      await unsubscribeBtn.click();
      await expect(subscribeBtn).toBeVisible();
    } else {
      // Already subscribed — unsubscribe then re-subscribe
      await unsubscribeBtn.click();
      await expect(subscribeBtn).toBeVisible();

      await subscribeBtn.click();
      await expect(unsubscribeBtn).toBeVisible();
    }
  });
});
