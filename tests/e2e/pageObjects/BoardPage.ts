import { expect, Page } from '@playwright/test';

export class BoardPage {
  public readonly page: Page;
  public readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = 'http://localhost:3000';
  }

  async createProject(name: string): Promise<string> {
    await this.page.locator("button[title='Add Project']").first().click();
    const input = this.page.locator("input[placeholder='Enter project name...']");
    await input.waitFor({ state: 'visible' });
    await input.fill(name);
    await input.press('Enter');
    await this.page.waitForURL(/\/projects\/\w+/, { timeout: 15000 });
    const match = this.page.url().match(/\/projects\/(\w+)/);
    return match ? match[1] : '';
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.page.goto(`${this.baseUrl}/projects/${projectId}/settings`);
    await this.page.locator("button[title='Delete Project']").click();
    await this.page.locator("button[title='Delete project']").click();
    await this.page.waitForURL(this.baseUrl + '/');
  }

  async createBoard(name: string, projectName: string): Promise<string> {
    await this.page.locator("button[title='Add Board']").first().click();
    const nameInput = this.page.locator("input[placeholder='Enter board name...']");
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill(name);

    // Select project from dropdown only if not already pre-selected
    const needsSelection = await this.page.locator("input[title='Select project']").isVisible({ timeout: 2000 }).catch(() => false);
    if (needsSelection) {
      await this.page.locator("input[title='Select project']").click();
      await this.page.getByRole('dialog').getByText(projectName, { exact: true }).click();
    }

    // Submit via Enter on the name input (bubbles up to form's keyDown handler)
    await nameInput.press('Enter');
    await this.page.waitForURL(/\/boards\/\w+/, { timeout: 15000 });
    const match = this.page.url().match(/\/boards\/(\w+)/);
    return match ? match[1] : '';
  }

  async deleteBoard(): Promise<void> {
    // Use nth(1) — nth(0) is the sidebar hover button, nth(1) is the board header button
    await this.page.locator("button[title='Edit Board']").nth(1).click();
    await this.page.locator("button[title='Delete Board']").first().click();
    await this.page.locator("button[title='Delete Board']").click();
    // Best-effort wait — board is async deleted, cleanup doesn't need to block long
    await this.page.waitForURL(/\/(projects\/\w+|)$/, { timeout: 5000 }).catch(() => {});
  }

  async createList(name: string): Promise<void> {
    // Board trigger: title='Add List' (common locale, capital L)
    // Form submit:   title='Add list' (action locale, lowercase l)
    await this.page.locator("button[title='Add List']").click();
    await this.page.locator("textarea[placeholder='Enter list name...']").fill(name);
    await this.page.locator("button[title='Add list']").click();
    await expect(this.page.locator(`div[title='${name}']`)).toBeVisible({ timeout: 10000 });
  }
}
