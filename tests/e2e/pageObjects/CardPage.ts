import { expect, Page } from '@playwright/test';

export class CardPage {
  public readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async createCard(cardName: string): Promise<void> {
    // Trigger: title='Add Card' (capital C, from t('common.addCard'))
    // The CardAdd inline form is always in DOM but hidden; clicking trigger shows it
    await this.page.locator("button[title='Add Card']").first().click();
    const textarea = this.page.locator("textarea[placeholder='Enter card name... [Ctrl+Enter] - open']");
    await textarea.waitFor({ state: 'visible' });
    await textarea.fill(cardName);
    await textarea.press('Enter');
    await expect(this.page.locator(`div[title='${cardName}']`)).toBeVisible({ timeout: 10000 });
  }

  async openCard(cardName: string): Promise<void> {
    await this.page.locator(`div[title='${cardName}']`).click();
    await expect(this.page.locator("button[title='Close Card']")).toBeVisible({ timeout: 10000 });
  }

  async closeCard(): Promise<void> {
    await this.page.locator("button[title='Close Card']").click();
    await expect(this.page.locator("button[title='Close Card']")).not.toBeVisible({ timeout: 5000 });
  }
}
