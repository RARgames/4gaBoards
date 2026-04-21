const {
  BeforeAll,
  AfterAll,
  Before,
  After,
  setDefaultTimeout
} = require('@cucumber/cucumber');

const { chromium } = require('playwright');

setDefaultTimeout(60000);

let browser;

BeforeAll(async function () {
  browser = await chromium.launch({
    headless: true
  });
});

Before(async function () {
  this.browser = browser;

  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function () {
  if (this.page) {
    await this.page.close();
  }

  if (this.context) {
    await this.context.close();
  }
});

AfterAll(async function () {
  if (browser) {
    await browser.close();
  }
});
