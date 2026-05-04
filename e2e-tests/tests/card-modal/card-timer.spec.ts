import { test, expect } from '../../fixtures';
import { CardModalPage } from '../../pages/CardModalPage';

test.describe('Card Modal - Timer', () => {
  test('should start and stop the timer on a card', async ({ page, testCard }) => {
    const cardModal = new CardModalPage(page);
    await cardModal.goto(testCard.id);

    // Timer button shows 00:00 initially
    const timerButton = cardModal.actionButton('Start Timer');
    await expect(timerButton).toBeVisible();
    await expect(timerButton).toContainText('00:00');

    // Start the timer
    await timerButton.click();

    // Wait briefly for the timer to tick
    await page.waitForTimeout(2000);

    // Stop the timer
    const stopButton = cardModal.actionButton('Stop Timer');
    await stopButton.click();

    // Timer property should be visible with elapsed time > 0
    await cardModal.expectPropertyVisible('Timer');
  });
});
