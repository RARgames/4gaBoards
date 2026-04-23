class LoginPage {
  constructor() {
    this.page = page;

    this.baseUrl = 'http://localhost:3000/';
    this.emailFieldSelector = this.page.locator('input[name="emailOrUsername"]');
    this.passwordFieldSelector = this.page.locator('input[name="emailOrUsername"]');
    this.loginBtnSelector = this.page.locator("button[title='Log in']");
    this.dashboardSelector = this.page.locator("div[title='Dashboard']");
  }
  async navigateToLoginPage() {
    await this.page.goto(`${this.baseUrl}login`);
  }

  async login(dataTable) {
    await this.page.fill(this.emailFieldSelector, dataTable[0].email);
    await this.page.fill(this.passwordFieldSelector, dataTable[0].password);

    1;
    await this.page.click(this.loginBtnSelector);
  }
}
export { LoginPage };
