import type { APIRequestContext, APIResponse } from '@playwright/test';

export type SessionCredentials = {
  emailOrUsername: string;
  password: string;
};

async function readErrorBody(response: APIResponse): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

export async function obtainAccessToken(
  request: APIRequestContext,
  apiBaseUrl: string,
  credentials: SessionCredentials,
): Promise<string> {
  const response = await request.post(`${apiBaseUrl}/api/access-tokens`, {
    multipart: {
      emailOrUsername: credentials.emailOrUsername,
      password: credentials.password,
    },
  });

  if (!response.ok()) {
    throw new Error(`POST /api/access-tokens failed: ${response.status()} ${await readErrorBody(response)}`);
  }

  const body = (await response.json()) as { item?: unknown };
  if (typeof body.item !== 'string' || body.item.length === 0) {
    throw new Error('POST /api/access-tokens returned no token string in item');
  }

  return body.item;
}
