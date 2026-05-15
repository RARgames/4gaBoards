import { Locator, Page } from '@playwright/test';

export class LoginPage {
  public readonly baseUrl: string;
  public readonly page: Page;
  public readonly emailField: Locator;
  public readonly passwordField: Locator;
  public readonly loginBtn: Locator;
  public readonly dashboardTitle: Locator;
  public readonly loginUrl: string;
  public readonly dashboardUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = 'http://localhost:3000';
    this.loginUrl = `${this.baseUrl}/login`;
    this.dashboardUrl = `${this.baseUrl}/`;

    this.loginBtn = this.page.locator("button[title='Log in']");
    this.emailField = this.page.locator("input[name='emailOrUsername']");
    this.passwordField = this.page.locator("input[name='password']");
    this.dashboardTitle = this.page.locator("div[title='Dashboard']");
  }

  public async navigateToLoginPage(): Promise<void> {
    await this.page.goto(this.loginUrl);
  }

  public async loginToDashboard(email: string, password: string): Promise<void> {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.loginBtn.click();
  }
}
