import type { Page } from '@playwright/test';

export class BoardPage {
  constructor(private readonly page: Page) {}

  async gotoBoard(boardId: string): Promise<void> {
    await this.page.goto(`/boards/${boardId}`);
    await this.page.getByTestId('list-open-add-card').waitFor({ state: 'visible' });
  }

  async addCardViaListFooter(name: string): Promise<void> {
    await this.page.getByTestId('list-open-add-card').click();
    await this.page.getByTestId('card-add-name-input').fill(name);
    await this.page.getByTestId('card-add-submit').click();
  }

  async gotoNonExistingBoard(boardId: string): Promise<void> {
    await this.page.goto(`/boards/${boardId}`);
  }
}
