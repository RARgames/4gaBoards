import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(private page: Page) {
    this.usernameInput = page.locator('input[name="emailOrUsername"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button:has-text("Log in")');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForURL('/');
  }
}
