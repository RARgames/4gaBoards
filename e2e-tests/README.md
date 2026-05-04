# 4ga Boards - E2E Tests

> **Submission:** This test suite was developed as a take-home assignment. See [`submission.md`](submission.md) for design decisions, the full test listing, and details on the AI-assisted development process.

End-to-end test suite using [Playwright](https://playwright.dev/) with an API-first test data strategy.

## Prerequisites

- **Node.js** ≥ 18 (developed with v24.15.0)
- **pnpm** — the workspace enforces pnpm as the package manager. Install with `npm install -g pnpm` if not already available.
- A running **4ga Boards** instance (see the root [README](../README.md) for setup)
- A `demo` / `demo` user account (created by default on first run)

## Setup

```bash
cd e2e-tests
pnpm install                        # install dependencies
pnpm exec playwright install        # download browser binaries (first time only)
cp .env.example .env                # configure environment (see below)
```

## Configuration

Copy `.env.example` to `.env` and update values for your environment:

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | `http://localhost:3000` | URL of the 4ga Boards instance |
| `ADMIN_USER` | `demo` | Admin username or email for login |
| `ADMIN_PASS` | `demo` | Admin password |

## Running Tests

```bash
# Run all tests (headless, parallel)
pnpm test

# Run with browser visible
pnpm run test:headed

# Run with browser visible, one test at a time (best for debugging)
pnpm run test:debug

# Run Playwright UI mode (interactive test runner)
pnpm run test:ui

# Run a specific test file
npx playwright test tests/board-view/add-card.spec.ts

# Run a specific test file with browser visible
npx playwright test tests/board-view/add-card.spec.ts --headed

# Run tests matching a name pattern
npx playwright test -g "should add a new card"

# Run with verbose output
npx playwright test --reporter=list
```

## Viewing Results

```bash
# Open the HTML test report
pnpm run report

# Screenshots on failure are saved to test-results/
```

## Architecture

### API-First Test Data

Tests use the UI **only** for the specific flow being tested. All setup and teardown is done via the REST API through the `ApiClient` class (`helpers/api-client.ts`).

### Fixture Chain

Tests declare only the fixtures they need. Dependencies are resolved automatically:

```
testCard -> testList -> testBoard -> testProject -> api + runId
```

Each test gets a unique 6-digit hex `runId` appended to resource names, ensuring parallel tests never collide.

**Cleanup** is automatic — deleting `testProject` in fixture teardown cascades to all child boards, lists, and cards.

### Example Test

```typescript
import { test, expect } from '../../fixtures';

test('should add a new card to a list', async ({ page, testBoard, testList, runId }) => {
  // testBoard and testList were created via API automatically
  await page.goto(`/boards/${testBoard.id}`);

  // ... UI interactions and assertions ...

  // Cleanup happens automatically when the test ends
});
```

### Project Structure

```
e2e-tests/
  fixtures/            # Playwright fixture definitions
    index.ts           # test, expect exports with API-backed fixtures
  helpers/
    api-client.ts      # REST API client for test setup/teardown
    auth.ts            # loginAs() helper for role-based tests
  pages/               # Page object models
    BoardViewPage.ts   # Board/Kanban view interactions
    CardModalPage.ts   # Card modal interactions
    LoginPage.ts       # Login page interactions
  tests/
    auth/              # Login/logout tests
    board-view/        # Board view tests (kanban, filters, cards, lists)
    boards/            # Board management tests
    card-modal/        # Card modal interaction tests
    projects/          # Project management tests
    project-settings/  # Project settings tests
    roles/             # Role-based permission tests
  auth-state/          # Generated browser auth state (gitignored)
  global-setup.ts      # Logs in and saves auth state before all tests
  playwright.config.ts
  e2e-testing-skill.md # AI skill file (DOM patterns, gotchas, selectors)
  submission.md        # Assignment submission document
```

## Test Suite Full Run 

<img width="811" height="204" alt="image" src="https://github.com/user-attachments/assets/28ef14d2-a0dc-4a78-abe9-1afbb16cf031" />


## Tools and Technologies

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev/) | Browser automation and test framework |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe test code |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | AI-assisted test development (Anthropic CLI) |
| [Playwright MCP Server](https://github.com/anthropics/playwright-mcp) | Live DOM exploration during test authoring |

### Playwright MCP Setup

The [Playwright MCP Server](https://github.com/anthropics/playwright-mcp) was used during development to interactively explore the application DOM, discover selectors, and verify UI behavior before writing tests.

**Claude Code:** The MCP server is configured in `.mcp.json` at the project root:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-playwright"]
    }
  }
}
```

See the [Claude Code MCP documentation](https://docs.anthropic.com/en/docs/claude-code/mcp) for setup details.

**VS Code (Copilot):** Add the MCP server in your VS Code settings (`settings.json`):

```json
{
  "mcp": {
    "servers": {
      "playwright": {
        "command": "npx",
        "args": ["@anthropic-ai/mcp-playwright"]
      }
    }
  }
}
```

See the [VS Code MCP documentation](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) for setup details.

### AI Skill File

The [`e2e-testing-skill.md`](e2e-testing-skill.md) file was iteratively built during test development. It captures DOM selector patterns, critical gotchas, API endpoint mappings, and fixture architecture — serving as a persistent knowledge base that made subsequent test writing faster and more reliable. See [`submission.md`](submission.md) for more details.
