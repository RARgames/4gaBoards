class LoginPage {
  constructor() {
    this.baseUrl = 'http://localhost:3000/';
    this.emailFieldSelector = 'input[name="emailOrUsername"]';
    this.passwordFieldSelector = 'input[name="password"]';
    this.loginBtnSelector = "button[title='Log in']";
    this.dashboardSelector = "div[title='Dashboard']";
  }
  async navigateToLoginPage() {
    await page.goto(`${this.baseUrl}login`);
  }

  async login(dataTable) {
    await page.fill(this.emailFieldSelector, dataTable[0].email);
    await page.fill(this.passwordFieldSelector, dataTable[0].password);

    await page.click(this.loginBtnSelector);
  }
}
module.exports = { LoginPage };
