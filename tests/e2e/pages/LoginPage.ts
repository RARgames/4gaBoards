import { DataTable } from '@cucumber/cucumber';
import { Locator, Page } from '@playwright/test';

export class LoginPage {
  page: Page;
  baseUrl: string;

  emailFieldSelector: Locator;
  passwordFieldSelector: Locator;
  loginBtnSelector: Locator;
  dashboardSelector: Locator;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = 'http://localhost:3000/';
    this.emailFieldSelector = this.page.locator('input[name="emailOrUsername"]');
    this.passwordFieldSelector = this.page.locator('input[name="password"]');
    this.loginBtnSelector = this.page.locator("button[title='Log in']");
    this.dashboardSelector = this.page.locator("div[title='Dashboard']");
  }

  async navigateToLoginPage(): Promise<void> {
    await this.page.goto(`${this.baseUrl}login`);
  }

  async login(dataTable: DataTable): Promise<void> {
    const data = dataTable.hashes();

    console.log('Login data:', data);

    await this.emailFieldSelector.fill(data[0].email);
    await this.passwordFieldSelector.fill(data[0].password);

    await Promise.all([
      this.page.waitForLoadState('networkidle'),
      this.loginBtnSelector.click()
    ]);
  }
}
