import type { BrowserContext } from '@playwright/test';

const ACCESS_TOKEN_KEY = 'accessToken';
const ACCESS_TOKEN_VERSION_KEY = 'accessTokenVersion';
const ACCESS_TOKEN_VERSION = '1';

export async function primeAccessToken(context: BrowserContext, accessToken: string): Promise<void> {
  await context.addInitScript(
    ({ token, version, tokenKey, versionKey }) => {
      localStorage.setItem(tokenKey, token);
      localStorage.setItem(versionKey, version);
    },
    {
      token: accessToken,
      version: ACCESS_TOKEN_VERSION,
      tokenKey: ACCESS_TOKEN_KEY,
      versionKey: ACCESS_TOKEN_VERSION_KEY,
    },
  );
}
