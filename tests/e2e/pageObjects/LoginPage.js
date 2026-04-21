const baseUrl = 'http://localhost:3000'

class LoginPage{

  constructor (){
    this.baseUrl = baseUrl;
    this.loginUrl = `${baseUrl}/login`;
    this.dashboardUrl = `${baseUrl}/`;
    this.loginBtnSelector= "button[title='Log in']";
    this.emailFieldSelector = "input[name='emailOrUsername']";
    this.passwordFieldSelector = "input[name='password']";
    this.dashboardSelector = "div[title='Dashboard']";
  }

  async goToLoginPage() {
    await page.goto(this.loginUrl);
  }

  async inputLogin(inputs){
    await page.locator(this.emailFieldSelector).fill(inputs[0].email)
    await page.locator(this.passwordFieldSelector).fill(inputs[0].password)
    await page.locator(this.loginBtnSelector).click()
  }
}
module.exports = { LoginPage };
