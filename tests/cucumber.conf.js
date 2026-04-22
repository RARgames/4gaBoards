const { Before, BeforeAll, AfterAll, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

setDefaultTimeout(60000);

BeforeAll(async function () {
  global.browser = await chromium.launch({
    headless: true,
    slowMo: 1000,
  });
});

AfterAll(async function () {
  await global.browser.close();
});

Before(async function () {
  this.context = await global.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function () {
  await this.page.close();
  await this.context.close();
});
