import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:1337';

export default async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[name="emailOrUsername"]').fill('demo');
  await page.locator('input[name="password"]').fill('demo');
  await page.locator('button:has-text("Log in")').click();
  await page.waitForURL(`${BASE_URL}/`);

  await context.storageState({ path: './auth-state/user.json' });
  await browser.close();
}
