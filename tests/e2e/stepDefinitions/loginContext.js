const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { LoginPage } = require('../pageObjects/LoginPage');
const login = new LoginPage();

Given('admin user has navigated to the login page', async function () {
  await login.goToLoginPage();
  await expect(page.url()).toBe(login.loginUrl);
});

When('admin user logs in with following credentials', async function (dataTable) {
  const loginCredentials = dataTable.hashes();
  await login.inputLogin(loginCredentials);
});

Then('admin user should be navigated to admin panel dashboard', async function () {
  await expect(page.url()).toBe(login.dashboardUrl);
  await expect(page.locator(login.dashboardSelector)).toBeVisible();
});
