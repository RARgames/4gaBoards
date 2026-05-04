import { test, expect } from '../../fixtures';
import { BoardViewPage } from '../../pages/BoardViewPage';

test.describe('Board View - Add Card', () => {
  test('should add a new card to a list', async ({ page, testBoard, testList, runId }) => {
    const boardView = new BoardViewPage(page);
    const cardName = `New Test Card ${runId}`;

    // Navigate to the fixture-created board
    await boardView.goto(testBoard.id);

    // Verify the board loaded with our test list showing 0 cards
    await boardView.expectListVisible(testList.id);
    await boardView.expectListCardCount(testList.id, 0);

    // Add a card to the specific list (targeted by list ID)
    await boardView.addCardToList(testList.id, cardName);

    // Verify the new card appears in the correct list
    await boardView.expectCardInList(testList.id, cardName);

    // Verify the card count updated
    await boardView.expectListCardCount(testList.id, 1);
  });
});
