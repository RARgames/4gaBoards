# E2E Test Plan — 4ga Boards

## Features Under Test

This plan focuses on two core feature areas, with additional coverage for admin user management:

1. **Authentication** — prerequisite for accessing protected application workflows
2. **Board and card workflow** — core Kanban functionality used for organizing and tracking work items
3. **User management** — admin workflow for managing user accounts

---

## Test Cases

### 1. Authentication (`login.spec.ts`)

| ID | Description | Tag |
|----|-------------|-----|
| AUTH-01 | Admin logs in with valid credentials → redirected to dashboard | `@smoke` |
| AUTH-02 | Login with wrong password → error message shown, stays on login page | — |

---

### 2. User Management (`addUser.spec.ts`)

| ID | Description | Tag |
|----|-------------|-----|
| USER-01 | Admin creates a new user → user appears in users list | — |

---

### 3. Board Management (`board.spec.ts`)

| ID | Description | Tag |
|----|-------------|-----|
| BOARD-01 | Admin creates a board → navigated to board page, board title visible | `@smoke` |
| BOARD-02 | Admin adds a list to a board → list appears on board | `@smoke` |
| BOARD-03 | Submit empty board name → validation error shown, board is not created | — |
| BOARD-04 | Submit empty list name → validation error shown, list is not created | — |

---

### 4. Card Management (`card.spec.ts`)

| ID | Description | Tag |
|----|-------------|-----|
| CARD-01 | Admin creates a card in a list → card appears in list | `@smoke` |
| CARD-02 | Admin opens a card → URL changes to `/cards/:id`, modal visible | — |
| CARD-03 | Admin closes the card modal → URL returns to `/boards/:id` | — |

---

## Test Suites

| Suite | When to run | Command |
|-------|------------|---------|
| Smoke | PR validation / deploy verification | `playwright test --grep @smoke` |
| Full | Nightly or pre-release regression | `playwright test` |

---

## Stability Considerations

- Prefer user-facing attributes (`title`) over CSS class selectors, which get hashed by CSS Modules
- Rely on Playwright auto-waiting and assertions rather than fixed waits
- Use unique timestamp-based test data to reduce cross-test interference
- Keep tests independent — each test creates and cleans up its own data in a `finally` block

---

## Running Tests

All commands must be run from the `tests/` directory in the project root.

```bash
cd tests

# Full suite
pnpm test

# Smoke tests only
pnpm exec playwright test --grep @smoke

# Single spec file
pnpm exec playwright test e2e/specs/board.spec.ts

# Single test by name
pnpm exec playwright test --grep "invalid credentials"

# Single test within a specific file
pnpm exec playwright test e2e/specs/login.spec.ts --grep "invalid credentials"

# With UI (headed)
pnpm test:headed

# Single test with UI
pnpm exec playwright test e2e/specs/login.spec.ts --grep "invalid credentials" --headed

# Single test with UI (slow motion, e.g. 1000ms between each step)
PLAYWRIGHT_SLOW_MO=1000 pnpm exec playwright test e2e/specs/login.spec.ts --grep "invalid credentials" --headed

# UI mode — step through each action, pause and replay
pnpm exec playwright test e2e/specs/login.spec.ts --ui
```
