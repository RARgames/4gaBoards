# AI agent brief — Board & card E2E (`tests/board.spec.ts`)

## Goal

Implement and maintain Playwright coverage for **Kanban card creation** and **board not-found handling**, aligned with `docs/TEST_PLAN.md` user story 2.

## Architecture rules

- **Setup = HTTP API** via Playwright `request` fixture and helpers in `support/api/` (token, project, board, list).
- **Exercise = UI** only for opening the board and adding a card (do not create the card through the API).
- **Session injection** uses `support/browser/auth-storage.ts` (`localStorage` keys must stay aligned with the client `Config` constants).
- **POM** for board interactions lives in `pages/BoardPage.ts`.

## Hard constraints

Same global rules as `AI_AGENT_PLAN_AUTH.md` (TypeScript, POM, no CSS locators, no conditional assertions, `test.step`, minimal `waitForTimeout`).

## API contract checklist

When extending seed helpers, verify against Sails routes:

1. `POST /api/access-tokens` — multipart fields `emailOrUsername`, `password`.
2. `POST /api/projects` — JSON `{ name }` + bearer token.
3. `POST /api/projects/:projectId/boards` — JSON includes **`requestId`** (uuid) and `isGithubConnected: false`.
4. `POST /api/boards/:boardId/lists` — JSON `{ position, name, isCollapsed }`.

**Note:** Board create accepts optional `lists`, but list creation is **not reliably awaited** server-side; the reference implementation creates the list with a **separate** `POST /api/boards/:boardId/lists` call.

## Done when

1. `pnpm -C e2e lint` passes.
2. With `pnpm dev` running, `pnpm -C e2e test tests/board.spec.ts` passes; artifacts land under `e2e/playwright-report/` and `e2e/test-results/`.
3. Tests map to **US2-1** and **US2-2** in `docs/TEST_PLAN.md`.
