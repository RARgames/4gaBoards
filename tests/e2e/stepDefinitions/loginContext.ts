import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { CustomWorld } from '../support/CustomWorld';
import { LoginPage } from '../pageObject/LoginPage';

Given('admin user has navigated to the login page', async function (this: CustomWorld) {
  this.loginPage = new LoginPage(this.page);

  await this.loginPage.navigateToLoginPage();
  await expect(this.page).toHaveURL(`${this.loginPage.baseUrl}login`);
});

When('admin user logs in with following credentials', async function (this: CustomWorld, dataTable: DataTable) {
  if (!this.loginPage) {
    this.loginPage = new LoginPage(this.page);
  }
  await this.loginPage.login(dataTable);
});

Then('admin user should be navigated to admin panel dashboard', async function (this: CustomWorld) {
  if (!this.loginPage) {
    this.loginPage = new LoginPage(this.page);
  }

  await expect(this.page).toHaveURL(this.loginPage.baseUrl);
  await expect(this.page.locator("div[title='Dashboard']")).toBeVisible();
});
