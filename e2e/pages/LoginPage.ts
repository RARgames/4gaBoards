import type { Page } from '@playwright/test';

import type { SessionCredentials } from '../support/api/session.js';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async fillCredentials(credentials: SessionCredentials): Promise<void> {
    await this.page.getByTestId('login-email-or-username').fill(credentials.emailOrUsername);
    await this.page.getByTestId('login-password').fill(credentials.password);
  }

  async submit(): Promise<void> {
    await this.page.getByTestId('login-submit').click();
  }

  async login(credentials: SessionCredentials): Promise<void> {
    await this.fillCredentials(credentials);
    await this.submit();
  }
}
