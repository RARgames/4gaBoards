const { Before, BeforeAll, AfterAll, After, setDefaultTimeout } = require("@cucumber/cucumber");
const { chromium } = require("playwright");

setDefaultTimeout(30000)

let browser;

BeforeAll(async function () {
  browser = await chromium.launch({
      headless: true,
      slowMo: 1000,
  });
});

AfterAll(async function () {
   await browser.close();
});

Before(async function () {
  this.browser = browser;
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function () {
  await this.page.close();
  await this.context.close();
});
