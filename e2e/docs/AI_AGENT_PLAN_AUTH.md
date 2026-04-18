# AI agent brief — Authentication E2E (`tests/auth.spec.ts`)

## Goal

Implement and maintain Playwright coverage for **local username/password login** aligned with `docs/TEST_PLAN.md` user story 1.

## Hard constraints

- TypeScript + `@playwright/test` only in `e2e/`.
- **Page Object Model**: all selectors and navigation live in `pages/LoginPage.ts` (extend there, not in the spec).
- **No CSS locators** (`page.locator('.class')` is forbidden). Use `getByTestId` / roles.
- **No conditional assertions** and **no try/catch around assertions**.
- Use `test.describe` + `test.step` with **await** on every async call.
- Do **not** use `page.waitForTimeout` except with a written justification in the PR (default: avoid entirely).

## Inputs the agent must respect

- `E2E_BASE_URL` (default `http://127.0.0.1:3000`).
- `E2E_DEMO_USER` / `E2E_DEMO_PASSWORD` (defaults `demo` / `demo`).

## Done when

1. `pnpm -C e2e lint` passes.
2. With `pnpm dev` running, `pnpm -C e2e test tests/auth.spec.ts` passes and produces **HTML report**, **trace** (on failure), and **video** per `playwright.config.ts`.
3. Spec steps match the test plan table **US1-1** and **US1-2** verbatim in intent.

## If tests fail

1. Confirm API health (`E2E_API_BASE_URL`, default `http://127.0.0.1:1337`) and that the DB is migrated + seeded.
2. Re-run a single test with trace: `pnpm -C e2e exec playwright test tests/auth.spec.ts --trace on`.
3. Only after reproduction, adjust **POM** or **test ids** in the React app — avoid duplicating selectors inside specs.
