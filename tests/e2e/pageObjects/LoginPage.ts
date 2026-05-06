import {Locator, Page} from '@playwright/test';
import {DataTable} from '@cucumber/cucumber';


export class LoginPage{

  public readonly baseUrl: string;
  public readonly page: Page;
  public readonly emailField: Locator;
  public readonly passwordField: Locator;
  public readonly loginBtn: Locator;
  public readonly dashboardTitle: Locator;
  public readonly loginUrl: string;
  public readonly dashboardUrl: string;


  constructor (page: Page){
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

  public async loginToDashboard(loginDataTable: DataTable): Promise<void> {
    const loginCredentials = loginDataTable.hashes();
    await this.emailField.fill(loginCredentials[0].email)
    await this.passwordField.fill(loginCredentials[0].password)
    await this.loginBtn.click()
  }
}
