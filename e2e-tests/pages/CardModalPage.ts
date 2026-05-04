import { type Page, type Locator, expect } from '@playwright/test';

export class CardModalPage {
  private readonly modal: Locator;

  constructor(private page: Page) {
    this.modal = page.locator('[class*="CardModal_wrapper"]');
  }

  async goto(cardId: string) {
    await this.page.goto(`/cards/${cardId}`);
    await expect(this.modal).toBeVisible();
  }

  // ─── Selectors ───

  /** The card title in the modal header */
  get title(): Locator {
    return this.modal.locator('[class*="CardModal_headerTitle__"]');
  }

  /** The list name field showing which list the card belongs to */
  get listField(): Locator {
    return this.modal.locator('[class*="CardModal_headerListField"]').first();
  }

  /** A specific section container (Description, Tasks, Attachments, Comments) */
  section(name: 'Description' | 'Tasks' | 'Attachments' | 'Comments'): Locator {
    return this.modal.locator('[class*="CardModal_moduleContainer"]').filter({ hasText: name });
  }

  /** Any button in the modal by its title attribute */
  actionButton(title: string): Locator {
    return this.modal.locator(`button[title="${title}"]`);
  }

  // ─── Header property sections (Members, Labels, Due Date, Timer, Created) ───

  /** The properties area containing Members, Labels, Due Date, Timer */
  get propertiesContainer(): Locator {
    return this.modal.locator('[class*="CardModal_moduleContainer"]').first();
  }

  /** A specific header property section by its label text */
  property(name: 'Members' | 'Labels' | 'Due Date' | 'Timer' | 'Created'): Locator {
    return this.propertiesContainer.locator('[class*="CardModal_headerItems"]').filter({ hasText: name });
  }

  // ─── Actions ───

  async close() {
    await this.actionButton('Close Card').click();
  }

  async subscribe() {
    await this.actionButton('Subscribe').click();
  }

  async unsubscribe() {
    await this.actionButton('Unsubscribe').click();
  }

  async deleteCard() {
    await this.actionButton('Delete Card').click();
  }

  async clickAddMember() {
    await this.actionButton('Add Member').click();
  }

  async clickAddLabel() {
    await this.actionButton('Add Label').click();
  }

  async clickAddDueDate() {
    await this.actionButton('Add Due Date').click();
  }

  async clickEditDescription() {
    await this.actionButton('Edit Description').first().click();
  }

  async clickAddTask() {
    await this.actionButton('Add Task').first().click();
  }

  async clickAddComment() {
    await this.actionButton('Add comment').first().click();
  }

  // ─── Assertions ───

  async expectVisible() {
    await expect(this.modal).toBeVisible();
  }

  async expectClosed() {
    await expect(this.modal).not.toBeVisible();
  }

  async expectTitle(name: string) {
    await expect(this.title).toHaveText(name);
  }

  async expectListName(listName: string) {
    await expect(this.listField).toContainText(listName);
  }

  async expectSectionVisible(name: 'Description' | 'Tasks' | 'Attachments' | 'Comments') {
    await expect(this.section(name)).toBeVisible();
  }

  async expectPropertyVisible(name: 'Members' | 'Labels' | 'Due Date' | 'Timer' | 'Created') {
    await expect(this.property(name)).toBeVisible();
  }

  async expectActionButtonVisible(title: string) {
    await expect(this.actionButton(title)).toBeVisible();
  }
}
