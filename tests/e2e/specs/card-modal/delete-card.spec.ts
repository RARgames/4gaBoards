import { test, expect } from '../../fixtures';
import { CardModalPage } from '../../pageObjects/CardModalPage';

test.describe('Card Modal - Delete Card', () => {
  test('should delete a card', async ({ page, testCard }) => {
    const cardModal = new CardModalPage(page);
    await cardModal.goto(testCard.id);

    await cardModal.actionButton('Mark as Done').click();
    await expect(cardModal.actionButton('Delete Card')).toBeVisible();

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
