import { type Page, type Locator, expect } from '@playwright/test';

export class BoardViewPage {
  constructor(private page: Page) {}

  async goto(boardId: string) {
    await this.page.goto(`/boards/${boardId}`);
  }

  // ─── Selectors ───

  /** The list container identified by its list ID */
  list(listId: string): Locator {
    return this.page.locator(`[data-rbd-draggable-id="list:${listId}"]`);
  }

  /** A card element identified by its card ID */
  card(cardId: string): Locator {
    return this.page.locator(`[data-rbd-draggable-id="card:${cardId}"]`);
  }

  /** The card count text within a list */
  listCardCount(listId: string): Locator {
    return this.list(listId).getByText(/\d+ cards?/);
  }

  // ─── Actions ───

  /** Click the "Add card" button within a specific list */
  async clickAddCard(listId: string) {
    const addCardBtn = this.list(listId).getByRole('button', { name: 'Add card' }).first();
    await addCardBtn.click();
  }

  /** Fill in the card name input and submit. Must call clickAddCard first. */
  async submitNewCard(cardName: string) {
    const input = this.page.getByPlaceholder('Enter card name...');
    await expect(input).toBeVisible();
    await input.fill(cardName);
    await input.press('Enter');
  }

  /** Add a card to a specific list by ID — combines clickAddCard + submitNewCard */
  async addCardToList(listId: string, cardName: string) {
    await this.clickAddCard(listId);
    await this.submitNewCard(cardName);
  }

  /** Click the "Add list" button at the end of the board */
  async clickAddList() {
    await this.page.getByRole('button', { name: 'Add list' }).click();
  }

  /** Collapse a list by its ID */
  async collapseList(listId: string) {
    await this.list(listId).locator('button[title="Collapse List"]').click();
  }

  /** Expand a collapsed list by its ID */
  async expandList(listId: string) {
    await this.list(listId).locator('button[title="Expand List"]').click();
  }

  /** Click a card to open its modal */
  async openCard(cardId: string) {
    await this.card(cardId).click();
  }

  /** Get the filter cards input */
  get filterInput(): Locator {
    return this.page.getByPlaceholder('Filter cards...');
  }

  /** Get the total card count in the board header */
  get boardCardCount(): Locator {
    return this.page.locator('[class*="Board_header"], [class*="BoardActions"]').getByText(/\d+ cards?/);
  }

  /** Click Switch to List View */
  async switchToListView() {
    await this.page.locator('button[title="Switch to List View"]').click();
  }

  /** Click Switch to Board View */
  async switchToBoardView() {
    await this.page.locator('button[title="Switch to Board View"]').click();
  }

  /** Submit a new list name. Must call clickAddList first. */
  async submitNewList(listName: string) {
    const input = this.page.getByPlaceholder('Enter list name...');
    await expect(input).toBeVisible();
    await input.fill(listName);
    await input.press('Enter');
  }

  /** Add a list — combines clickAddList + submitNewList */
  async addList(listName: string) {
    await this.clickAddList();
    await this.submitNewList(listName);
  }

  /** Open the Filter By Labels popup */
  async openFilterByLabels() {
    await this.page.locator('button[title="Filter By Labels"]').click();
  }

  /** Open the Filter By Members popup */
  async openFilterByMembers() {
    await this.page.locator('button[title="Filter By Members"]').click();
  }

  /** Open the Filter by Due Date popup */
  async openFilterByDueDate() {
    await this.page.locator('button[title="Filter by Due Date"]').click();
  }

  // ─── Assertions ───

  /** Assert a list is visible on the board */
  async expectListVisible(listId: string) {
    await expect(this.list(listId)).toBeVisible();
  }

  /** Assert the card count text for a list */
  async expectListCardCount(listId: string, count: number) {
    const text = count === 1 ? '1 card' : `${count} cards`;
    await expect(this.listCardCount(listId)).toHaveText(text);
  }

  /** Assert a card with given name is visible within a specific list */
  async expectCardInList(listId: string, cardName: string) {
    await expect(this.list(listId).getByText(cardName, { exact: true })).toBeVisible();
  }

  /** Assert a card element by ID is visible */
  async expectCardVisible(cardId: string) {
    await expect(this.card(cardId)).toBeVisible();
  }
}
