const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

const baseUrl = 'http://localhost:3000/';
const emailFieldSelector = 'input[name="emailOrUsername"]';
const passwordFieldSelector = 'input[name="password"]';
const loginBtnSelector = "button[title='Log in']";
const dashboardSelector = "div[title='Dashboard']";

Given('admin user has navigated to the login page', async function () {
  await page.goto(`${baseUrl}login`);
  expect(page.url()).toBe(`${baseUrl}login`);
});

When('admin user logs in with following credentials', async function (dataTable) {
  const loginCredentails = dataTable.hashes();
  await page.locator(emailFieldSelector).fill(loginCredentails[0].email);
  await page.locator(passwordFieldSelector).fill(loginCredentails[0].password);
  await page.locator(loginBtnSelector).click();
});

Then('admin user should be navigated to admin panel dashboard', async function () {
  expect(page.url()).toBe(baseUrl);
  await expect(page.locator(dashboardSelector)).toBeVisible();
});
