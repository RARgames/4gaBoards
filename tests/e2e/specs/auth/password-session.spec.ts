import { test, expect } from '@playwright/test';

const requestHeaders = {
  Origin: 'http://localhost:3000',
  'X-4gaBoards-Request': '1',
};

test('keeps the browser session after changing the current user password', async ({ page, browser }) => {
  test.setTimeout(60000);
  const suffix = Date.now().toString();
  const email = `password-rotation-${suffix}@example.com`;
  const username = `pwrot${suffix.slice(-8)}`;
  const originalPassword = 'Original password! 4Q';
  const updatedPassword = 'Updated password! 7R';
  let userId: string | undefined;
  const createResponse = await page.request.post('http://localhost:1337/api/users', {
    headers: requestHeaders,
    multipart: {
      email,
      password: originalPassword,
      name: 'Password Rotation Test',
      username,
    },
  });
  expect(createResponse.ok()).toBe(true);
  ({
    item: { id: userId },
  } = await createResponse.json());

  const context = await browser.newContext();
  const otherContext = await browser.newContext();
  await context.clearCookies();
  await otherContext.clearCookies();
  const userPage = await context.newPage();
  const otherPage = await otherContext.newPage();

  try {
    const loginResponse = await userPage.request.post('http://localhost:1337/api/access-tokens', {
      headers: requestHeaders,
      multipart: { emailOrUsername: email, password: originalPassword },
    });
    expect(loginResponse.ok()).toBe(true);
    expect(await loginResponse.json()).toEqual({ item: true });
    await userPage.goto('http://localhost:3000/');
    await expect(userPage.locator("div[title='Dashboard']")).toBeVisible();

    const otherLoginResponse = await otherPage.request.post('http://localhost:1337/api/access-tokens', {
      headers: requestHeaders,
      multipart: { emailOrUsername: email, password: originalPassword },
    });
    expect(otherLoginResponse.ok()).toBe(true);
    await otherLoginResponse.json();
    await otherPage.goto('http://localhost:3000/');
    await expect(otherPage.locator("div[title='Dashboard']")).toBeVisible();

    const currentUserResponse = await userPage.request.get('http://localhost:1337/api/users/me', { headers: requestHeaders });
    const { item: currentUser } = await currentUserResponse.json();
    expect(currentUser.id).toBe(userId);

    const beforeCookie = (await context.cookies()).find(({ name }) => name === 'accessToken')?.value;
    expect(beforeCookie).toBeTruthy();

    await userPage.goto('http://localhost:3000/settings/authentication');
    await userPage.getByRole('button', { name: 'Edit Password' }).click();
    await userPage.locator('input[name="currentPassword"]').fill(originalPassword);
    await userPage.locator('input[name="password"]').fill(updatedPassword);
    const reloadPromise = userPage.waitForNavigation({ waitUntil: 'domcontentloaded' });
    const updateResponsePromise = userPage.waitForResponse((response) => response.url().endsWith(`/api/users/${userId}/password`) && response.request().method() === 'PATCH', { timeout: 15000 });
    await userPage.getByRole('button', { name: 'Save' }).click();
    const updateResponse = await updateResponsePromise;
    expect(updateResponse.ok()).toBe(true);
    await reloadPromise;

    const afterCookie = (await context.cookies()).find(({ name }) => name === 'accessToken')?.value;
    expect(afterCookie).toBeTruthy();
    expect(afterCookie).not.toBe(beforeCookie);

    const sessionResponse = await userPage.request.get('http://localhost:1337/api/session', { headers: requestHeaders });
    expect(sessionResponse.ok()).toBe(true);

    await expect(userPage).toHaveURL(/\/settings\/authentication$/);
    await expect(userPage.getByRole('button', { name: 'Edit Password' })).toBeVisible();
    await expect(otherPage).toHaveURL(/\/login$/, { timeout: 10000 });
  } finally {
    if (userId) {
      await page.request.delete(`http://localhost:1337/api/users/${userId}`, { headers: requestHeaders, timeout: 5000 }).catch(() => {});
    }
    await context.close();
    await otherContext.close();
  }
});
