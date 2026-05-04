import { test, expect } from '../../fixtures';
import { BoardViewPage } from '../../pages/BoardViewPage';

test.describe('Board View - Kanban View', () => {
  test('should display the board with a list', async ({ page, testBoard, testList }) => {
    const boardView = new BoardViewPage(page);

    await boardView.goto(testBoard.id);

    // Verify the fixture list is visible with 0 cards
    await boardView.expectListVisible(testList.id);
    await boardView.expectListCardCount(testList.id, 0);

    // Verify Add list button is present
    await expect(page.getByRole('button', { name: 'Add list' })).toBeVisible();
  });
});

test.describe('Board View - Toggle View', () => {
  test('should switch between Board View and List View', async ({ page, testBoard, testList }) => {
    const boardView = new BoardViewPage(page);

    await boardView.goto(testBoard.id);

    // Default is board (kanban) view — list containers visible
    await boardView.expectListVisible(testList.id);

    // Switch to list view
    await boardView.switchToListView();
    await expect(page.locator('[class*="ListView_wrapper"]')).toBeVisible();

    // Switch back to board view
    await boardView.switchToBoardView();
    await boardView.expectListVisible(testList.id);
  });
});

test.describe('Board View - Filter Cards by Text', () => {
  test('should filter cards by name', async ({ page, api, testBoard, testList, runId }) => {
    const boardView = new BoardViewPage(page);

    // Seed 3 cards with distinct names via API
    const card1 = await api.createCard(testList.id, `Alpha ${runId}`);
    const card2 = await api.createCard(testList.id, `Beta ${runId}`);
    const card3 = await api.createCard(testList.id, `Gamma ${runId}`);

    await boardView.goto(testBoard.id);
    await boardView.expectListCardCount(testList.id, 3);

    // Filter by "Alpha"
    await boardView.filterInput.fill(`Alpha ${runId}`);
    await boardView.expectCardVisible(card1.id);
    await expect(boardView.card(card2.id)).not.toBeVisible();
    await expect(boardView.card(card3.id)).not.toBeVisible();

    // Clear filter — all cards visible again
    await boardView.filterInput.clear();
    await boardView.expectCardVisible(card1.id);
    await boardView.expectCardVisible(card2.id);
    await boardView.expectCardVisible(card3.id);
  });
});

test.describe('Board View - Filter Cards by Labels', () => {
  test('should filter cards by label', async ({ page, api, testBoard, testList, runId }) => {
    const boardView = new BoardViewPage(page);

    // Seed: create a label, 2 cards, assign label to 1 card
    const label = await api.createLabel(testBoard.id, `Filter Label ${runId}`, 'berry-red');
    const labeledCard = await api.createCard(testList.id, `Labeled ${runId}`);
    const plainCard = await api.createCard(testList.id, `Plain ${runId}`);
    await api.addCardLabel(labeledCard.id, label.id);

    await boardView.goto(testBoard.id);
    await boardView.expectListCardCount(testList.id, 2);

    // Open label filter and select the label
    await boardView.openFilterByLabels();
    const popup = page.locator('[class*="Popup_popup"]');
    await expect(popup).toBeVisible();
    await popup.locator(`[class*="Item_name"][title="Filter Label ${runId}"]`).click();
    await popup.locator('button[title="Close"]').click();

    // Only the labeled card should be visible
    await boardView.expectCardVisible(labeledCard.id);
    await expect(boardView.card(plainCard.id)).not.toBeVisible();
  });
});

test.describe('Board View - Filter Cards by Members', () => {
  test('should filter cards by member', async ({ page, api, testBoard, testList, testProject, runId }) => {
    const boardView = new BoardViewPage(page);

    // The admin user (Demo Demo) is a board member — assign them to one card
    const adminUser = await api.getCurrentUser();
    const memberCard = await api.createCard(testList.id, `Member Card ${runId}`);
    const noMemberCard = await api.createCard(testList.id, `No Member ${runId}`);
    await api.addCardMember(memberCard.id, adminUser.id);

    await boardView.goto(testBoard.id);
    await boardView.expectListCardCount(testList.id, 2);

    // Open member filter and select the admin user
    await boardView.openFilterByMembers();
    const popup = page.locator('[class*="Popup_popup"]');
    await expect(popup).toBeVisible();
    await popup.locator(`button[title="${adminUser.name}"]`).click();
    await popup.locator('button[title="Close"]').click();

    // Only the card with the member should be visible
    await boardView.expectCardVisible(memberCard.id);
    await expect(boardView.card(noMemberCard.id)).not.toBeVisible();
  });
});

test.describe('Board View - Filter Cards by Due Date', () => {
  test('should filter cards by due date', async ({ page, api, testBoard, testList, runId }) => {
    const boardView = new BoardViewPage(page);

    // Seed: 2 cards, one with a due date
    const dueCard = await api.createCard(testList.id, `Due Card ${runId}`);
    const noDueCard = await api.createCard(testList.id, `No Due ${runId}`);
    await api.updateCard(dueCard.id, { dueDate: '2026-12-15T00:00:00.000Z' });

    await boardView.goto(testBoard.id);
    await boardView.expectListCardCount(testList.id, 2);

    // Open due date filter, enter a date, and save
    await boardView.openFilterByDueDate();
    const popup = page.locator('[class*="Popup_popup"]');
    await expect(popup).toBeVisible();
    const dateInput = popup.locator('input[name="date"]');
    await dateInput.clear();
    await dateInput.fill('15.12.2026');
    await popup.locator('button[title="Save"]').click();

    // Only the card with the due date should be visible
    await boardView.expectCardVisible(dueCard.id);
    await expect(boardView.card(noDueCard.id)).not.toBeVisible();
  });
});

test.describe('Board View - Collapse and Expand List', () => {
  test('should collapse and expand a list', async ({ page, api, testBoard, testList, runId }) => {
    const boardView = new BoardViewPage(page);

    // Seed a card so the list has content
    await api.createCard(testList.id, `Card ${runId}`);

    await boardView.goto(testBoard.id);
    await boardView.expectListVisible(testList.id);
    await boardView.expectListCardCount(testList.id, 1);

    // Collapse the list
    await boardView.collapseList(testList.id);

    // Expand it back
    await boardView.expandList(testList.id);
    await boardView.expectListCardCount(testList.id, 1);
  });
});

test.describe('Board View - Add List', () => {
  test('should add a new list to the board', async ({ page, testBoard, runId }) => {
    const boardView = new BoardViewPage(page);
    const listName = `New List ${runId}`;

    await boardView.goto(testBoard.id);

    // Add a new list
    await boardView.addList(listName);

    // Verify the new list appears on the board
    await expect(page.getByText(listName, { exact: true })).toBeVisible();
  });
});
