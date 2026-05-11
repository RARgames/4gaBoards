# Playwright E2E Suite

## Purpose

This branch adds a Playwright E2E framework for 4ga Boards. The suite covers authentication, core board workflows, Simple and Kanban template coverage, practical validation/negative cases, card edit actions, board top-bar controls, card-modal details, member assignment, filters, board actions, global profile/settings navigation, and real settings-page workflows from the avatar menu.

## Structure

```text
playwright.config.js
TEST_PLAN.md
README_E2E.md
ai-prompts/
ai-skills/
tests/e2e/
  auth.spec.js
  board-controls.spec.js
  board-workflow.spec.js
  card-modal.spec.js
  notifications.spec.js
  settings-workflow.spec.js
  validation.spec.js
  cleanup-e2e-data.js
  fixtures/
    card-attachment.txt
  helpers/
    boardsApi.js
  pages/
    LoginPage.js
    BoardPage.js
    CardModalPage.js
    HeaderPage.js
    SettingsPage.js
```

## Prerequisites

- Docker Desktop running
- Node `^24.11`
- pnpm `^10.33.0`
- 4ga Boards available at `http://localhost:3000`

## Run

Start the app:

```bash
docker compose up -d
```

Confirm the app responds:

```bash
curl -I http://localhost:3000/login
```

Install Playwright Chromium:

```bash
pnpm e2e:install
```

Run all E2E tests:

```bash
pnpm e2e:test
```

Keep generated E2E data for debugging a failed run:

```bash
E2E_CLEANUP=false pnpm e2e:test
```

Remove stale E2E projects, users, and API clients from previous runs:

```bash
pnpm e2e:cleanup
```

Run with the Playwright UI:

```bash
pnpm e2e:ui
```

Run one file in headed mode:

```bash
pnpm exec playwright test tests/e2e/board-workflow.spec.js --headed --slow-mo=500
```

Run the expanded board controls coverage:

```bash
pnpm exec playwright test tests/e2e/board-controls.spec.js --project=chromium
```

Run the settings workflow coverage:

```bash
pnpm exec playwright test tests/e2e/settings-workflow.spec.js --project=chromium --workers=1
```

## Notes

- Tests generate unique names with timestamps and worker IDs.
- Cleanup is enabled by default. Set `E2E_CLEANUP=false` only when you intentionally want to inspect generated projects, boards, users, or API clients after a run.
- `pnpm e2e:cleanup` deletes stale resources with E2E naming patterns: projects named `E2E ...`, users with `e2e-...@example.test` emails, and API clients named `E2E API Client ...`.
- The card-modal attachment workflow uploads `tests/e2e/fixtures/card-attachment.txt`.
- The settings workflow tests mutate profile, preferences, API clients, and users only with disposable or reverted data.
- API helpers are used for login, auth cookies, and setup/cleanup when the setup itself is not the UI behavior under test.
- Page objects keep repeated selectors and actions maintainable, especially where the app repeats labels in the sidebar, top bar, board canvas, and modal.
- Playwright caps execution at 2 workers to keep the Docker-backed app stable while still exercising parallel-safe test data.
- `playwright-report/` and `test-results/` are ignored and should not be committed.
