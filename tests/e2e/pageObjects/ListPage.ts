import { Locator, Page } from '@playwright/test';

export class ListPage {
  public readonly page: Page;
  public readonly addListButton: Locator;
  public readonly listNameField: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addListButton = this.page.getByRole('button', { name: 'Add list' });
    this.listNameField = this.page.getByPlaceholder('Enter list name...');
  }

  // Returns a locator for the list header title div by name
  public listTitle(name: string): Locator {
    return this.page.locator(`div[title="${name}"]`);
  }

  // Click "Add list" button and wait for the name input to appear
  public async openAddListForm(): Promise<void> {
    await this.addListButton.click();
    await this.listNameField.waitFor({ state: 'visible', timeout: 3000 });
  }

  // Open the add list form, type the name, and submit
  public async createList(name: string): Promise<void> {
    await this.openAddListForm();
    await this.listNameField.fill(name);
    await this.listNameField.press('Enter');
  }

  // Dismiss the add list form by pressing Escape
  public async closeAddListForm(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  // Click the list title to activate inline edit, type new name, and submit
  public async renameList(currentName: string, newName: string): Promise<void> {
    await this.listTitle(currentName).click();
    await this.listNameField.waitFor({ state: 'visible', timeout: 3000 });
    await this.listNameField.fill(newName);
    await this.listNameField.press('Enter');
  }

  // Open the list menu, click delete, and confirm the deletion dialog
  public async deleteList(name: string): Promise<void> {
    await this.openListMenu(name);
    await this.page.getByRole('button', { name: 'Delete List' }).click();
    await this.page.getByText('Are you sure you want to delete this list').waitFor({ state: 'visible', timeout: 3000 });
    await this.page.getByRole('button', { name: 'Delete list' }).click();
  }

  // Click the "Edit List" button in the list header to open the context menu
  public async openListMenu(name: string): Promise<void> {
    await this.listTitle(name).locator('..').locator('button[title="Edit List"]').click();
  }

  // Click the collapse button in the list header to minimize the list
  public async collapseList(name: string): Promise<void> {
    await this.listTitle(name).locator('..').getByTitle('Collapse List').click();
  }

  // Click the expand button to restore a collapsed list
  public async expandList(name: string): Promise<void> {
    await this.listTitle(name).locator('..').getByTitle('Expand List').click();
  }

  // Returns a locator for the expand button of a given list
  public expandButton(name: string): Locator {
    return this.listTitle(name).locator('..').getByTitle('Expand List');
  }

  // Returns a locator for the collapse button of a given list
  public collapseButton(name: string): Locator {
    return this.listTitle(name).locator('..').getByTitle('Collapse List');
  }

  // Drag a list from source position past target using mouse events (steps:30 for react-beautiful-dnd)
  public async dragList(sourceName: string, targetName: string): Promise<void> {
    const sourceHandle = this.listTitle(sourceName).locator('..');
    const targetHandle = this.listTitle(targetName).locator('..');

    const sourceBox = await sourceHandle.boundingBox();
    const targetBox = await targetHandle.boundingBox();
    if (!sourceBox || !targetBox) throw new Error('Could not get bounding boxes');

    await this.page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(targetBox.x + targetBox.width + 30, targetBox.y + targetBox.height / 2, { steps: 30 });
    await this.page.waitForTimeout(200);
    await this.page.mouse.up();
    await this.page.waitForTimeout(500);
  }

  // Returns the current order of list names as displayed on the board
  public async getListOrder(): Promise<string[]> {
    const titleDivs = this.page.locator('[data-drag-scroller] div[title]').filter({ hasNot: this.page.locator('div') });
    return titleDivs.allTextContents();
  }
}
