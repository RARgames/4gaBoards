import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/customWorld';
import { LoginPage } from '../pageObjects/LoginPage';


Given('the admin user has navigated to the login page', async function (this: CustomWorld) {
  this.loginPage = new LoginPage(this.page);

  await this.loginPage.navigateToLoginPage();
  await expect(this.page).toHaveURL(this.loginPage.loginUrl);
});

When('the admin user logs in with the following credentials:', async function (this: CustomWorld, loginCredentials: DataTable) {
  if (!this.loginPage) {
    this.loginPage = new LoginPage(this.page);
  }

  await this.loginPage.loginToDashboard(loginCredentials);
});

Then('the admin user should be navigated to admin panel dashboard', async function (this: CustomWorld) {
  if (!this.loginPage) {
    this.loginPage = new LoginPage(this.page);
  }

  await expect(this.page).toHaveURL(this.loginPage.dashboardUrl);
  await expect(this.loginPage.dashboardTitle).toBeVisible();
});

Given('the admin user has logged in with the following credentials:', async function (this: CustomWorld, loginCredentials: DataTable) {
  if (!this.loginPage) {
    this.loginPage = new LoginPage(this.page);
  }

  await this.loginPage.navigateToLoginPage();
  await expect(this.page).toHaveURL(this.loginPage.loginUrl);
  await this.loginPage.loginToDashboard(loginCredentials);
  await expect(this.page).toHaveURL(this.loginPage.dashboardUrl);
  await expect(this.loginPage.dashboardTitle).toBeVisible();
});
