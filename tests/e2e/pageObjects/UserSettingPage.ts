import { expect, Locator, Page } from '@playwright/test';

export class UserSettingPage {
  public readonly page: Page;
  public readonly baseUrl: string;
  public readonly userSettingsUrl: string;
  public readonly profileAndSettingButton: Locator;
  public readonly usersButton: Locator;
  public readonly dashboardTitle: Locator;
  public readonly addUserButton: Locator;
  public readonly email: Locator;
  public readonly password: Locator;
  public readonly name: Locator;
  public readonly userName: Locator;
  public readonly addButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = 'http://localhost:3000';
    this.userSettingsUrl = `${this.baseUrl}/settings/users`;
    this.profileAndSettingButton = this.page.locator("button[title='Profile and Settings']");
    this.usersButton = this.page.getByRole('button', { name: /^Users$/ }).nth(0);
    this.dashboardTitle = this.page.locator("div[title='Settings: Users']");
    this.addUserButton = this.page.locator("button[title='Add User']").nth(0);
    this.email = this.page.locator("input[name='email']");
    this.password = this.page.locator("input[name='password']");
    this.name = this.page.locator("input[name='name']");
    this.userName = this.page.locator("input[name='username']");
    this.addButton = this.page.locator("button[title='Add User']").nth(1);
  }

  public async addUser(email: string, password: string, name: string, username: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.name.fill(name);
    await this.userName.fill(username);
    await this.addButton.click();
  }

  public async navigateToUsersSettingPage(): Promise<void> {
    await this.profileAndSettingButton.click();
    await this.usersButton.click();
    await expect(this.page).toHaveURL(this.userSettingsUrl);
    await expect(this.dashboardTitle).toBeVisible();
  }

  public async deleteUserByEmail(email: string): Promise<void> {
    const row = this.page.locator('tr', { has: this.page.getByText(email, { exact: true }) }).first();
    const isUserVisible = await row.isVisible().catch(() => false);

    if (!isUserVisible) {
      return;
    }

    await row.scrollIntoViewIfNeeded();
    await row.locator("button[title='Edit User']").click();

    const popup = this.page.getByRole('dialog').last();
    await expect(popup).toBeVisible();
    await popup.locator("button[title='Delete User']").click();

    const deletePopup = this.page.getByRole('dialog').last();
    await expect(deletePopup).toBeVisible();
    await deletePopup.locator("button[title='Delete User']").click();

    await expect(row).toHaveCount(0);
  }
}
