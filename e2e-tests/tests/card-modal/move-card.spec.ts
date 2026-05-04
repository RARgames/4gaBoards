import { test, expect } from '../../fixtures';
import { CardModalPage } from '../../pages/CardModalPage';

test.describe('Card Modal - Move Card', () => {
  test('should move a card to a different list', async ({ page, api, testCard, testList, testBoard, runId }) => {
    // Create a second list via API
    const targetList = await api.createList(testBoard.id, `Target List ${runId}`, 2);

    const cardModal = new CardModalPage(page);
    await cardModal.goto(testCard.id);

    // Verify card is in the original list
    await cardModal.expectListName(testList.name);

    // Click the list field to open the move card popup
    await cardModal.listField.click();

    // The move popup shows all lists — click the target list
    const popup = page.getByRole('dialog');
    await expect(popup).toBeVisible();
    await popup.getByText(targetList.name, { exact: true }).click();

    // Verify the card modal now shows the new list name
    await cardModal.expectListName(targetList.name);
  });
});
