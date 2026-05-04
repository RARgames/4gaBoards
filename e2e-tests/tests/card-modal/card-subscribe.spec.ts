import { test, expect } from '../../fixtures';
import { CardModalPage } from '../../pages/CardModalPage';

test.describe('Card Modal - Subscribe', () => {
  test('should subscribe and unsubscribe to a card', async ({ page, testCard }) => {
    const cardModal = new CardModalPage(page);
    await cardModal.goto(testCard.id);

    // Default: Subscribe button visible
    await cardModal.expectActionButtonVisible('Subscribe');

    // Subscribe
    await cardModal.subscribe();
    await cardModal.expectActionButtonVisible('Unsubscribe');

    // Unsubscribe
    await cardModal.unsubscribe();
    await cardModal.expectActionButtonVisible('Subscribe');
  });
});
