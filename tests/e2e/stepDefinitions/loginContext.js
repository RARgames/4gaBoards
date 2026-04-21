import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { LoginPage } from '../pageObject/LoginPage.js';

Given('admin user has navigated to the login page', async function () {
  const login_page = new LoginPage(this.page);
  await login_page.navigateToLoginPage();
  expect(this.page.url()).toBe(`${login_page.baseUrl}login`);
});

When('admin user logs in with following credentials', async function (dataTable) {
  const login_page = new LoginPage(this.page);
  const loginCredentails = dataTable.hashes();
  await login_page.login_dashboard(loginCredentails);
});

Then('admin user should be navigated to admin panel dashboard', async function () {
  const login_page = new LoginPage(this.page);

  await expect(login_page.dashboardSelector).toBeVisible();
});
