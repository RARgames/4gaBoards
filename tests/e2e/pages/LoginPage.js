class LoginPage {
  constructor(page) {
    this.page = page;
  }

  heading() {
    return this.page.getByRole('heading', { name: 'Log in' });
  }

  usernameField() {
    return this.page.locator('input[name="emailOrUsername"]');
  }

  passwordField() {
    return this.page.locator('input[name="password"]');
  }

  submitButton() {
    return this.page.getByRole('button', { name: 'Log in' });
  }

  errorMessage(message) {
    return this.page.getByText(message);
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username, password) {
    await this.usernameField().fill(username);
    await this.passwordField().fill(password);
    await this.submit();
  }

  async submit() {
    await this.submitButton().click();
  }
}

module.exports = { LoginPage };
