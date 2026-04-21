class LoginPage {
  constructor() {
    this.dashboardSelector = "div[title='Dashboard']";
    this.emailSelector = "[name='emailOrUsername']";
    this.paasswordSelector = "[name='password']";
    this.loginUrl = 'http://localhost:3000/login';
  }
  async navigateToLoginPage() {
    await page.goto(this.loginUrl);
  }
  async login(loginCredentails) {
    await page.locator(this.emailSelector).fill(loginCredentails[0].email);

    await page.locator(this.paasswordSelector).fill(loginCredentails[0].password);
    await page.getByRole('button', { name: 'Log in' }).click();
  }
}
module.exports = { LoginPage };
