const { Given, When, Then, DataTable } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

const dashboardSelector = "div[title='Dashboard']";
const emailFieldSelector = "[name='emailOrUsername']";
const paasswordFieldSelector = "[name='password']";
const baseUrl = 'http://localhost:3000/';

Given('admin user has navigated to the login page', async function () {
  await page.goto(`${baseUrl}login`);
  expect(page.url()).toBe(`${baseUrl}login`);
});

When('admin user log in with following credentials', async function (dataTable) {
  const loginCredentails = dataTable.hashes();

  await page.locator(emailFieldSelector).fill(loginCredentails[0].email);

  await page.locator(paasswordFieldSelector).fill(loginCredentails[0].password);
  await page.getByRole('button', { name: 'Log in' }).click();
});

Then('admin user should be navigated to admin panel dashboard', async function () {
  expect(page.url()).toBe(baseUrl);
  await expect(page.locator(dashboardSelector)).toBeVisible();
});
