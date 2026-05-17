# E2E Tests

End-to-end tests for 4ga Boards using [Playwright](https://playwright.dev/).

## Prerequisites

- Node.js 18+
- pnpm
- Docker (for running the app locally)
- The application running at `http://localhost:3000`

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Install Playwright browsers:

```bash
pnpm -C tests test:install
```

3. Start the application (from the project root):

```bash
docker compose -f docker-compose-dev.yml up
```

## Running Tests

From the project root:

```bash
# Run all tests
pnpm test:e2e

# Run all tests (from tests/ directory)
cd tests && pnpm test
```

From the `tests/` directory:

```bash
# Run all tests
pnpm test

# Run a specific spec file
npx playwright test e2e/specs/boardOperations.spec.ts

# Run tests in headed mode (visible browser)
pnpm test:headed

# Run with Playwright UI mode (interactive)
pnpm test:ui

# Run in debug mode (step through tests)
pnpm test:debug

# Run with single worker (avoids parallel flakiness)
npx playwright test --workers=1

# View the HTML test report
pnpm test:report
```

## Test Structure

```
tests/
├── e2e/
│   ├── setup.spec.ts              # Seeds test data (runs before all tests)
│   ├── utils.ts                   # Shared helpers (login, API utilities, constants)
│   ├── testData.ts                # Test users, roles, and project constants
│   ├── pageObjects/
│   │   ├── LoginPage.ts           # Login page interactions
│   │   ├── BoardPage.ts           # Board CRUD operations
│   │   ├── ListPage.ts            # List CRUD operations
│   │   └── UserSettingPage.ts     # User management page
│   └── specs/
│       ├── login.spec.ts              # Basic login test
│       ├── addUser.spec.ts            # User creation test
│       ├── boardOperations.spec.ts    # TC01-TC05: Board CRUD (role-based)
│       ├── listOperations.spec.ts     # TC06-TC10: List CRUD (role-based)
│       ├── pmBehavior.spec.ts         # TC11-TC13: Project Manager behavior
│       ├── dynamicRoleChanges.spec.ts # TC14-TC16: Role upgrades/downgrades
│       ├── validationTests.spec.ts    # TC17-TC20: Input validation
│       ├── persistenceTests.spec.ts   # TC21-TC24: Data persists after reload
│       └── realTimeTests.spec.ts      # TC25-TC29: WebSocket broadcasts
└── playwright.config.ts           # Playwright configuration
```

## Test Cases

| ID | Test | Spec File |
|----|------|-----------|
| TC01 | Create Board (role-based) | boardOperations.spec.ts |
| TC02 | Rename Board (role-based) | boardOperations.spec.ts |
| TC03 | Delete Board (role-based) | boardOperations.spec.ts |
| TC04 | View Board (role-based) | boardOperations.spec.ts |
| TC05 | Manage Board Memberships (role-based) | boardOperations.spec.ts |
| TC06 | Create List (role-based) | listOperations.spec.ts |
| TC07 | Rename List (role-based) | listOperations.spec.ts |
| TC08 | Reorder Lists - drag-and-drop (role-based) | listOperations.spec.ts |
| TC09 | Collapse/Expand List (role-based) | listOperations.spec.ts |
| TC10 | Delete List (role-based) | listOperations.spec.ts |
| TC11 | PM has auto-editor on all boards | pmBehavior.spec.ts |
| TC12 | PM cannot be removed from board | pmBehavior.spec.ts |
| TC13 | Promoting user to PM grants board access | pmBehavior.spec.ts |
| TC14 | Role upgrade: Viewer to Editor | dynamicRoleChanges.spec.ts |
| TC15 | Role downgrade: Editor to Viewer | dynamicRoleChanges.spec.ts |
| TC16 | Membership revocation | dynamicRoleChanges.spec.ts |
| TC17 | Reject board creation with empty name | validationTests.spec.ts |
| TC18 | Reject list creation with empty name | validationTests.spec.ts |
| TC19 | Accept duplicate list names | validationTests.spec.ts |
| TC20 | Long list name handling | validationTests.spec.ts |
| TC21 | Board name persists after reload | persistenceTests.spec.ts |
| TC22 | List order persists after reload | persistenceTests.spec.ts |
| TC23 | Collapsed state persists after reload | persistenceTests.spec.ts |
| TC24 | Deleted list does not reappear | persistenceTests.spec.ts |
| TC25 | List creation broadcasts (WebSocket) | realTimeTests.spec.ts |
| TC26 | List deletion broadcasts (WebSocket) | realTimeTests.spec.ts |
| TC27 | List rename broadcasts (WebSocket) | realTimeTests.spec.ts |
| TC28 | List reorder broadcasts (WebSocket) | realTimeTests.spec.ts |
| TC29 | Board deletion notifies members (WebSocket) | realTimeTests.spec.ts |

## Test Data

The setup spec (`setup.spec.ts`) runs before all tests and creates the following automatically:

- **Project**: "Project 01" (created if not exists)
- **Board**: "Board 01" inside Project 01 (created if not exists)
- **Users** (created if not exist):

| Username | Role | Board Access |
|----------|------|--------------|
| `demo` | Admin | Full access (pre-seeded) |
| `pm_user` | Project Manager | Auto-editor on all boards |
| `editor_user` | Board Editor | Can create/edit/delete lists |
| `commenter_user` | Board Commenter | Read-only + comments |
| `viewer_user` | Board Viewer | Read-only |
| `non_member_user` | Non-Member | No board access |

All passwords for test users: `Test@12345`

## CI

Tests run in GitHub Actions via:

```bash
pnpm ci:test:e2e
```

This uses `start-server-and-test` to spin up the server before running Playwright.

## Notes

- Tests use Chromium by default (configured in `playwright.config.ts`)
- The setup project runs as a dependency before all test specs
- When running in parallel (default), some tests may flake due to server load — use `--workers=1` for reliable runs
- WebSocket/real-time tests (TC25-TC29) use multiple browser contexts to simulate concurrent sessions
