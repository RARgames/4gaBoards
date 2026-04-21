import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000';

const isCi =
  process.env.GITHUB_ACTIONS === 'true' ||
  process.env.CI === 'true' ||
  process.env.CI === '1';

/** Full WebKit on macOS arm64 avoids flaky headless-shell Chromium builds in some environments. */
const useWebKitOnDarwinArm64 =
  process.env.E2E_BROWSER !== 'chromium' && process.platform === 'darwin' && process.arch === 'arm64';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 2 : undefined,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL,
    locale: 'en-US',
    trace: 'retain-on-failure',
    video: 'on',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  expect: {
    timeout: 10_000,
  },
  projects: [
    useWebKitOnDarwinArm64
      ? {
          name: 'webkit',
          use: {
            ...devices['Desktop Safari'],
          },
        }
      : {
          name: 'chromium',
          use: {
            ...devices['Desktop Chrome'],
          },
        },
  ],
});
