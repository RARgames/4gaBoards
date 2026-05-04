import { test, expect } from '../../fixtures';
import { BoardViewPage } from '../../pages/BoardViewPage';

test.describe('Board View - Drag Card', () => {
  test('should drag a card to the next list using keyboard', async ({ page, api, testBoard, testList, testCard, runId }) => {
    // Create a second list to drag into
    const targetList = await api.createList(testBoard.id, `Target List ${runId}`, 2);

    const boardView = new BoardViewPage(page);
    await boardView.goto(testBoard.id);

    // Verify card starts in the source list
    await boardView.expectCardInList(testList.id, testCard.name);
    await boardView.expectListCardCount(testList.id, 1);
    await boardView.expectListCardCount(targetList.id, 0);

    // Keyboard drag: focus card → Space (grab) → ArrowRight (move list) → Space (drop)
    const card = page.locator(`[data-rbd-draggable-id="card:${testCard.id}"]`);
    await card.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    await page.keyboard.press('Space');

    // Verify card moved to the target list
    await boardView.expectCardInList(targetList.id, testCard.name);
    await boardView.expectListCardCount(targetList.id, 1);
    await boardView.expectListCardCount(testList.id, 0);
  });
});
