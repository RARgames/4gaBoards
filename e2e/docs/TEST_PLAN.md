# End-to-end test plan — 4ga Boards

This plan targets the **local web stack** (React client on port 3000, Sails API on port 1337) with the default seeded **demo** user (`demo` / `demo` after `pnpm server:db:init`).

---

## User story 1 — Sign in with local credentials

As a **returning user**, I want to **sign in with my username and password** so that I can **reach my projects dashboard**.

| ID   | Case | Type | Preconditions | Steps | Expected result |
|------|------|------|---------------|-------|-----------------|
| US1-1 | Successful login | Positive | DB seeded; demo user exists; app running | Open `/login`; enter valid demo credentials; submit | User leaves the login route and the **projects dashboard** is visible |
| US1-2 | Wrong password | Negative | Same as US1-1 | Open `/login`; enter valid username and **wrong** password; submit | An **error message** explains that the username or password is invalid (no successful navigation to the dashboard) |

---

## User story 2 — Work on a Kanban board

As a **board member**, I want to **open a board and add a card** so that **new work appears on the board**.

| ID   | Case | Type | Preconditions | Steps | Expected result |
|------|------|------|---------------|-------|-----------------|
| US2-1 | Add card from list footer | Positive | Authenticated user; project, board, and list created **via API** (setup only) | In the browser, open the board URL; use **Add card** on a list; enter a card name; confirm | The new card **name** is visible on the board |
| US2-2 | Unknown board URL | Negative | Authenticated user (API token) | Navigate to `/boards/<non-existent-id>` | A **board not found** state is shown (user is not stuck on an infinite loader) |

---

## Traceability

| Automated spec | Covers |
|----------------|--------|
| `tests/auth.spec.ts` | US1-1, US1-2 |
| `tests/board.spec.ts` | US2-1, US2-2 |

---

## Running the automated suite

1. Install dependencies from the repository root: `pnpm install --no-frozen-lockfile --engine-strict=false` (or use Node **^24.11** as declared in the root `package.json`).
2. Copy `server/.env.sample` to `server/.env` and ensure Postgres matches `DATABASE_URL`. Start Postgres, migrate, and seed (`pnpm server:db:init` once), then start the stack with `pnpm dev`.
3. Defaults use **`http://127.0.0.1:3000`** / **`http://127.0.0.1:1337`** (see `client/.env` and `e2e/.env.example`) so browsers and Node do not hit **`::1`** when the API only binds on IPv4.
4. Install browsers: `pnpm -C e2e exec playwright install webkit` on **Apple Silicon macOS** (the suite selects WebKit there), otherwise `pnpm -C e2e exec playwright install chromium`. Ensure the installer fetches **arm64** builds on Apple Silicon — mismatched `mac-x64` Chromium builds can crash at launch.
5. Run TypeScript tests: `pnpm -C e2e test`, or the Pytest façade: `pnpm e2e:pytest` (creates `e2e/.venv/` on first run).
6. Open the HTML report: `e2e/playwright-report/index.html`. Failed runs keep **Playwright traces** and **videos** under `e2e/test-results/`.

---

## Assumptions and data

- **English UI** (`en-US`) is used in Playwright so copy-based assertions stay stable.
- **API setup** uses `POST /api/access-tokens`, `POST /api/projects`, `POST /api/projects/:id/boards`, and `POST /api/boards/:boardId/lists` with `Authorization: Bearer <token>`.
- **UI** covers login (story 1) and board interactions (story 2); no CSS selector-based locators — prefer **`data-testid`** and accessible roles where applicable.
