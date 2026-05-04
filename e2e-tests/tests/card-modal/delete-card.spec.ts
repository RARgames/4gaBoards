import { test, expect } from '../../fixtures';
import { CardModalPage } from '../../pages/CardModalPage';

test.describe('Card Modal - Delete Card', () => {
  test('should delete a card', async ({ page, testCard }) => {
    const cardModal = new CardModalPage(page);
    await cardModal.goto(testCard.id);

    // Click Delete Card
    await cardModal.deleteCard();

    // Confirmation popup appears
    const popup = page.getByRole('dialog');
    await expect(popup).toBeVisible();
    await expect(popup.getByText('Are you sure you want to delete this card?')).toBeVisible();

    // Confirm deletion
    await popup.getByRole('button', { name: 'Delete card' }).click();

    // Card modal should close
    await cardModal.expectClosed();
  });
});
