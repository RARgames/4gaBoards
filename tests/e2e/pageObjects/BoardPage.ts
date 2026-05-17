import { expect, Locator, Page } from '@playwright/test';

export class BoardPage {
  public readonly page: Page;
  public readonly baseUrl: string;

  public readonly addBoardButton: Locator;
  public readonly boardNameInput: Locator;
  public readonly submitBoardButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = 'http://localhost:3000';

    this.addBoardButton = this.page.getByRole('button', { name: 'Add Board' }).first();
    this.boardNameInput = this.page.locator("input[name='name']");
    this.submitBoardButton = this.page.getByRole('button', { name: 'Add Board' }).last();
  }

  public async createBoard(boardName: string, projectName?: string): Promise<void> {
    await this.addBoardButton.click();
    await expect(this.boardNameInput).toBeVisible({ timeout: 5000 });
    await this.boardNameInput.fill(boardName);

    if (projectName) {
      await this.page.locator('input[placeholder="Select project"]').click();
      await this.page.locator('[class*="dropdownMenu"]').getByText(projectName, { exact: true }).click();
    }

    await this.submitBoardButton.click();
  }

  public async isBoardVisibleInSidebar(boardName: string): Promise<boolean> {
    const boardLink = this.page.getByRole('button', { name: boardName, exact: true });
    return boardLink.isVisible();
  }

  public async navigateToBoard(boardName: string): Promise<void> {
    const boardLink = this.page.getByRole('link', { name: boardName, exact: true });
    await boardLink.click();
  }

  public async deleteBoard(boardName: string): Promise<void> {
    // Navigate into the board if not already there
    const backToProject = this.page.getByRole('button', { name: 'Back to Project' });
    if (!(await backToProject.isVisible())) {
      await this.page.getByRole('link', { name: boardName, exact: true }).first().click();
      await backToProject.waitFor({ state: 'visible', timeout: 5000 });
    }

    // Click the board header's "Edit Board" (⋮) button
    // It's the last "Edit Board" button on the page (after all sidebar ones)
    await this.page.getByRole('button', { name: 'Edit Board' }).last().click();
    await this.page.getByRole('button', { name: 'Delete Board' }).waitFor({ state: 'visible', timeout: 5000 });
    await this.page.getByRole('button', { name: 'Delete Board' }).click();
    await this.page.getByText('Are you sure you want to delete this board').waitFor({ state: 'visible', timeout: 5000 });
    await this.page.getByRole('button', { name: 'Delete Board' }).click();
  }

  public async isAddBoardButtonVisible(): Promise<boolean> {
    return this.addBoardButton.isVisible();
  }

  public async isProjectInAddBoardDropdown(projectName: string): Promise<boolean> {
    const projectInput = this.page.locator('input[placeholder="Select project"]');
    await projectInput.click();
    const option = this.page.locator('[class*="dropdownMenu"]').getByText(projectName, { exact: true });
    const visible = await option.isVisible();
    await this.page.keyboard.press('Escape');
    return visible;
  }

  public async openBoardActionsPopup(): Promise<void> {
    const backToProject = this.page.getByRole('button', { name: 'Back to Project' });
    await backToProject.waitFor({ state: 'visible', timeout: 5000 });
    await this.page.getByRole('button', { name: 'Edit Board' }).last().click();
  }

  public async renameCurrentBoard(newName: string): Promise<void> {
    await this.openBoardActionsPopup();
    await this.page.getByRole('button', { name: 'Rename Board' }).click();
    const nameField = this.page.locator('textarea[name="name"]');
    await nameField.waitFor({ state: 'visible', timeout: 3000 });
    await nameField.fill(newName);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }
}
