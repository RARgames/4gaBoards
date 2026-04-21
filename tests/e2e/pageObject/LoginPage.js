export class LoginPage {
  constructor(page) {
    this.page = page;

    this.baseUrl = 'http://localhost:3000/';
    this.emailFieldSelector = this.page.locator('input[name="emailOrUsername"]');
    this.passwordFieldSelector = this.page.locator('input[name="password"]');
    this.loginBtnSelector = this.page.locator("button[title='Log in']");
    this.dashboardSelector = this.page.locator("div[title='Dashboard']");
  }
  async navigateToLoginPage() {
    await this.page.goto(`${this.baseUrl}login`);
  }

  async login_dashboard(dataTable) {
    await this.emailFieldSelector.fill(dataTable[0].email);
    await this.passwordFieldSelector.fill(dataTable[0].password);
    await this.loginBtnSelector.click();
  }
}
