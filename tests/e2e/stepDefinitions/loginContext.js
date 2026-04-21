import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { LoginPage } from '../pageObject/LoginPage.js';

const login = new LoginPage();

Given('admin user has navigated to the login page', async function () {
  await login.navigateToLoginPage();
  expect(page.url()).toBe(`${login.baseUrl}login`);
});

When('admin user logs in with following credentials', async function (dataTable) {
  const loginCredentails = dataTable.hashes();
  await login.login(loginCredentails);
});

Then('admin user should be navigated to admin panel dashboard', async function () {
  await expect(page.locator(login.dashboardSelector)).toBeVisible();
});
