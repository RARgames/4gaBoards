const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const baseUrl = 'http://localhost:3000';

loginBtnSelector= "button[title='Log in']";
emailFieldSelector = "input[name='emailOrUsername']";
passwordFieldSelector = "input[name='password']";
dashboardSelector = "div[title='Dashboard']";

Given('admin user has navigated to the login page', async function () {
  await page.goto(`${baseUrl}/login`);
  await expect(page.url()).toBe(`${baseUrl}/login`);
});

When('admin user logs in with following credentials', async function (dataTable) {
  const loginCredentials = dataTable.hashes();

  await page.locator(emailFieldSelector).fill(loginCredentials[0].email)
  await page.locator(passwordFieldSelector).fill(loginCredentials[0].password)
  await page.locator(loginBtnSelector).click()
});

Then('admin user should be navigated to admin panel dashboard', async function () {
  await expect(page.url()).toBe(`${baseUrl}/`);
  await expect(page.locator(dashboardSelector)).toBeVisible();
});
