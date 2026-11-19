import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pageObjects/LoginPage';

test.use({ storageState: { cookies: [], origins: [] } });

test('redirects an unauthenticated protected route to login', async ({ page }) => {
  await page.goto('/boards/123');
  await expect(page).toHaveURL(/\/login/);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pre_login_path') || 'null'))).toBe('/boards/123');
});

test('upgrades an existing readable token cookie', async ({ page }) => {
  const response = await page.request.post('http://localhost:1337/api/access-tokens', {
    form: { emailOrUsername: 'demo', password: 'demo' },
  });
  const { item: accessToken } = await response.json();
  expect(typeof accessToken).toBe('string');
  const bearerResponse = await page.request.get('http://localhost:1337/api/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(bearerResponse.status()).toBe(200);

  await page.context().addCookies([{ name: 'accessToken', value: accessToken, domain: 'localhost', path: '/' }]);
  await page.goto('/');
  await expect(page.locator("div[title='Dashboard']")).toBeVisible({ timeout: 15000 });

  const cookie = (await page.context().cookies()).find(({ name }) => name === 'accessToken');
  expect(cookie?.httpOnly).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain('accessToken=');
});

test('admin user logs in with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await test.step('Navigate to login page', async () => {
    await loginPage.navigateToLoginPage();
    await expect(page).toHaveURL(loginPage.loginUrl);
  });

  await test.step('Log in with admin credentials', async () => {
    const loginResponse = page.waitForResponse((response) => response.url().endsWith('/api/access-tokens') && response.request().method() === 'POST');
    await loginPage.loginToDashboard('demo', 'demo');
    expect(await (await loginResponse).json()).toEqual({ item: true });
  });

  await test.step('Validate dashboard is visible', async () => {
    await expect(page).toHaveURL(loginPage.dashboardUrl);
    await expect(loginPage.dashboardTitle).toBeVisible({ timeout: 15000 });
  });

  await test.step('Keep the session inaccessible to JavaScript across reloads', async () => {
    const cookie = (await page.context().cookies()).find(({ name }) => name === 'accessToken');
    expect(cookie?.httpOnly).toBe(true);
    expect(await page.evaluate(() => document.cookie)).not.toContain('accessToken=');

    const missingHeader = await page.request.get('http://localhost:1337/api/session');
    expect(missingHeader.status()).toBe(401);
    const untrustedOrigin = await page.request.get('http://localhost:1337/api/session', {
      headers: { Origin: 'https://evil.example', 'X-4gaBoards-Request': '1' },
    });
    expect(untrustedOrigin.status()).toBe(401);

    await page.reload();
    await expect(loginPage.dashboardTitle).toBeVisible({ timeout: 15000 });

    await page.goto('/login');
    await expect(page).toHaveURL(loginPage.dashboardUrl);
    await expect(loginPage.dashboardTitle).toBeVisible({ timeout: 15000 });
  });

  await test.step('Complete a token-free SSO callback', async () => {
    await page.goto('/google-callback?success=1');
    await expect(page).toHaveURL(loginPage.dashboardUrl);
    await expect(loginPage.dashboardTitle).toBeVisible({ timeout: 15000 });
  });
});
