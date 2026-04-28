import { DataTable } from '@cucumber/cucumber';
import { Locator, Page } from '@playwright/test';

export class LoginPage {
  dashboard(page: Page) {
    throw new Error('Method not implemented.');
  }
  private page: Page;
  public baseUrl: string;

  private readonly emailFieldSelector: Locator;
  private readonly passwordFieldSelector: Locator;
  private readonly loginBtnSelector: Locator;
  public readonly dashboardSelector: Locator;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = 'http://localhost:3000/';
    this.emailFieldSelector = this.page.locator('input[name="emailOrUsername"]');
    this.passwordFieldSelector = this.page.locator('input[name="password"]');
    this.loginBtnSelector = this.page.locator("button[title='Log in']");
    this.dashboardSelector = this.page.locator("div[title='Dashboard']");
  }

  public async navigateToLoginPage(): Promise<void> {
    await this.page.goto(`${this.baseUrl}login`);
  }

  public async login(dataTable: DataTable): Promise<void> {
    const data = dataTable.hashes();

    await this.emailFieldSelector.fill(data[0].email);
    await this.passwordFieldSelector.fill(data[0].password);

    await Promise.all([this.page.waitForLoadState('networkidle'), this.loginBtnSelector.click()]);
  }
}
