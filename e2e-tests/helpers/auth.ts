import { type Page, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Log the browser page in as a specific user.
 * Clears existing session, navigates to /login, and authenticates.
 */
export async function loginAs(page: Page, username: string, password: string) {
  await page.context().clearCookies();
  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[name="emailOrUsername"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button:has-text("Log in")').click();
  await page.waitForURL(`${BASE_URL}/`);
}
