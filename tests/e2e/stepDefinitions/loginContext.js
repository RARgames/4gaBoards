const { Given, When, Then, DataTable } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

const { LoginPage } = require('../pageObjects/LoginPage.js');
const login = new LoginPage();

Given('admin user has navigated to the login page', async function () {
  await login.navigateToLoginPage();

  expect(page.url()).toBe(login.loginUrl);
});

When('admin user log in with following credentials', async function (dataTable) {
  const loginCredentails = dataTable.hashes();

  await login.login(loginCredentails);
});

Then('admin user should be navigated to admin panel dashboard', async function () {
  await expect(page.locator(login.dashboardSelector)).toBeVisible();
});
