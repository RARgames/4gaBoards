# E2E Test Suite — 4ga Boards

## Features Under Test

Two main features were selected for comprehensive E2E coverage:

1. **Board View (Kanban)** — The primary workspace where users interact with lists and cards, including creating cards/lists, filtering by text/labels/members/due dates, collapsing/expanding lists, and toggling between board and list views.

2. **Card Modal** — The detailed card editing interface covering all card properties: members, labels, due dates, timers, descriptions, tasks, comments, subscriptions, deletion, and moving cards between lists.

Supporting tests cover **Authentication**, **Projects**, **Boards**, and **Project Settings** to ensure the full user journey is validated end-to-end.

## Design Decisions

### API-First Test Data Strategy

All test data is created and destroyed via a custom REST API client — UI is **only** used for the specific interaction under test. This makes tests fast (~18s for 42 tests), deterministic, and completely independent of each other. Each test gets a unique `runId` to prevent collisions under parallel execution.

### Fixture-Based Isolation

Playwright fixtures (`testProject`, `testBoard`, `testList`, `testCard`, `testUser`) form an automatic dependency chain. Tests declare only what they need — requesting `testCard` automatically creates the list, board, and project beneath it. Teardown cascades: deleting the project cleans everything.

### No Dependency on Pre-Existing Data

Tests never rely on the default "Getting started" project or any seed data. Every test creates its own isolated world and tears it down. This means tests can run on a fresh instance or alongside other test data without interference.

### Admin Browser Session with API-Seeded Users

The browser session runs as the admin user (pre-authenticated via `global-setup`). Non-admin users are created via API fixtures and used for data seeding (e.g., adding a member to a card). A minimum-privilege browser approach was explored but deferred due to flaky WebSocket race conditions under parallel execution.

For the full test plan with detailed steps, fixtures, and API seeds for each scenario, see [`tests/test-plan.plan.md`](tests/test-plan.plan.md).

## AI-Assisted Development — Skill File

Throughout test development, a **skill file** ([`e2e-testing-skill.md`](e2e-testing-skill.md)) was iteratively built and refined using Claude Code. This file serves as a persistent knowledge base that captures:

- **DOM selector patterns** discovered through live browser exploration (CSS module conventions, `data-rbd-*` attributes, `title`-based button selectors)
- **Critical gotchas** learned through test failures (e.g., `page.locator('dialog')` vs `page.getByRole('dialog')`, duplicate element handling, popup auto-close behaviors)
- **API endpoint mappings** for the test data client
- **Fixture architecture** and cleanup strategies
- **Selector strategies** organized by UI area (board view, card modal, sidebar, project settings)

The skill file was loaded automatically at the start of each Claude Code session, allowing the AI to build on prior discoveries rather than re-exploring the DOM from scratch. Each time a new pattern or failure mode was encountered, the file was updated — making subsequent test writing faster and more reliable.

## Test Suite (47 tests)

### Authentication (3 tests)
| File | Test |
|---|---|
| `auth/login.spec.ts` | should log in with valid credentials |
| `auth/login-invalid.spec.ts` | should show error with invalid credentials |
| `auth/logout.spec.ts` | should log out successfully |

### Projects (4 tests)
| File | Test |
|---|---|
| `projects/projects.spec.ts` | should display a project on the dashboard |
| `projects/projects.spec.ts` | should filter projects by name in the sidebar |
| `projects/projects.spec.ts` | should create a new project |
| `projects/projects.spec.ts` | should add a board from the sidebar |

### Boards (3 tests)
| File | Test |
|---|---|
| `boards/boards.spec.ts` | should display boards within a project |
| `boards/boards.spec.ts` | should create a new board within a project |
| `boards/boards.spec.ts` | should subscribe and unsubscribe to a board |

### Board View (9 tests)
| File | Test |
|---|---|
| `board-view/board-view.spec.ts` | should display the board with a list |
| `board-view/board-view.spec.ts` | should switch between Board View and List View |
| `board-view/board-view.spec.ts` | should filter cards by name |
| `board-view/board-view.spec.ts` | should filter cards by label |
| `board-view/board-view.spec.ts` | should filter cards by member |
| `board-view/board-view.spec.ts` | should filter cards by due date |
| `board-view/board-view.spec.ts` | should collapse and expand a list |
| `board-view/board-view.spec.ts` | should add a new list to the board |
| `board-view/add-card.spec.ts` | should add a new card to a list |

### Card Modal (12 tests)
| File | Test |
|---|---|
| `card-modal/card-modal.spec.ts` | should display card modal with all sections |
| `card-modal/card-modal.spec.ts` | should close card modal |
| `card-modal/card-modal.spec.ts` | should add a member to the card |
| `card-modal/card-modal.spec.ts` | should add a label to the card |
| `card-modal/card-modal.spec.ts` | should set a due date on the card |
| `card-modal/card-modal.spec.ts` | should add a task to the card |
| `card-modal/card-modal.spec.ts` | should add a comment to the card |
| `card-modal/card-subscribe.spec.ts` | should subscribe and unsubscribe to a card |
| `card-modal/card-timer.spec.ts` | should start and stop the timer on a card |
| `card-modal/delete-card.spec.ts` | should delete a card |
| `card-modal/card-description.spec.ts` | should add a description to a card |
| `card-modal/move-card.spec.ts` | should move a card to a different list |

### Project Settings (3 tests)
| File | Test |
|---|---|
| `project-settings/project-settings.spec.ts` | should view project settings |
| `project-settings/project-settings.spec.ts` | should rename a project |
| `project-settings/project-settings.spec.ts` | should add a manager to a project |

### Roles (5 tests)
| File | Test |
|---|---|
| `roles/roles.spec.ts` | should not show Settings: Users link in header |
| `roles/roles.spec.ts` | should deny access to user management page |
| `roles/roles.spec.ts` | should not show Instance Settings or Users in settings sidebar |
| `roles/roles.spec.ts` | should deny access to a project the user is not a member of |
| `roles/roles.spec.ts` | should allow a project manager to access project settings |

### API Client Smoke Tests (7 tests)
| File | Test |
|---|---|
| `api-client.smoke.spec.ts` | should create and navigate to a fixture-provided project |
| `api-client.smoke.spec.ts` | should create full chain: project > board > list > card |
| `api-client.smoke.spec.ts` | should create labels and assign to a card |
| `api-client.smoke.spec.ts` | should create a task on a card |
| `api-client.smoke.spec.ts` | should create a comment on a card |
| `api-client.smoke.spec.ts` | should create a user and add as board member |
| `api-client.smoke.spec.ts` | should create a user and add as project manager |

### Seed (1 test)
| File | Test |
|---|---|
| `seed.spec.ts` | seed |

## Running the Tests

```bash
cd e2e-tests
pnpm install
npx playwright test
```

Requires the 4ga Boards application running at `http://localhost:3000` (configurable via `BASE_URL` env var).
