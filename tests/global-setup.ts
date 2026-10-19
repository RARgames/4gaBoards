import { chromium, type FullConfig } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const authStatePath = path.resolve(__dirname, 'auth-state/user.json');

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL || 'http://localhost:3000';
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(new URL('/login', baseURL).toString());
    await page.locator('input[name="emailOrUsername"]').fill(process.env.ADMIN_USER || 'demo');
    await page.locator('input[name="password"]').fill(process.env.ADMIN_PASS || 'demo');
    await page.locator('button[title="Log in"]').click();
    await page.waitForURL(new URL('/', baseURL).toString());

    await mkdir(path.dirname(authStatePath), { recursive: true });
    await context.storageState({ path: authStatePath });
  } finally {
    await browser.close();
  }
}
