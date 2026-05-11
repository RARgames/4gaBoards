const { expect } = require('@playwright/test');

const { login, setAuthCookies } = require('./boardsApi');

async function waitForAuthenticatedShell(page) {
  const header = page.locator('[class*="Header_menuRight"]');

  try {
    await expect(header).toBeVisible({ timeout: 20000 });
  } catch (error) {
    await page.reload();
    await expect(header).toBeVisible({ timeout: 20000 });
  }
}

async function signInWithAccessToken(page, accessToken, path = '/') {
  await page.context().clearCookies();
  await setAuthCookies(page, accessToken);
  await page.goto(path);
  await waitForAuthenticatedShell(page);
}

async function signIn(page, request, username, password) {
  const accessToken = await login(request, username, password);
  await signInWithAccessToken(page, accessToken);

  return accessToken;
}

module.exports = {
  signIn,
  signInWithAccessToken,
  waitForAuthenticatedShell,
};
