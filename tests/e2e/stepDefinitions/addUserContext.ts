import { Given, When, Then} from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/customWorld';
import { UserSettingPage } from '../pageObjects/UserSettingPage';

Given('the admin user has navigated to users setting page', async function (this: CustomWorld) {
  this.userSettingPage = new UserSettingPage(this.page);
  await this.userSettingPage.profileAndSettingButton.click();
  await this.userSettingPage.usersButton.click();
  await expect (this.page).toHaveURL(this.userSettingPage.userSettingsUrl);
  await expect(this.userSettingPage.dashboardTitle).toBeVisible();
});

When('the admin user creates a new user with email {string}, password {string}, name {string} and username {string}',
  async function (this: CustomWorld, email: string, password: string, name: string, username: string) {
  await this.userSettingPage.addUserButton.click();
  await this.userSettingPage.addUser(email, password, name, username);
});

Then('the new user with email {string} should be added to users list', async function (this: CustomWorld, email: string) {
  const userLocator = this.page.locator(`div[title='${email}']`);
  await expect(userLocator).toBeVisible();
});
