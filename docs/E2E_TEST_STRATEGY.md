# E2E Test Strategy — 4ga Boards (Playwright)

## Current Coverage

The existing test suite covers only two flows:

| Spec | What It Tests |
|------|---------------|
| `login.spec.ts` | Admin login with valid credentials |
| `addUser.spec.ts` | Admin creates and deletes a user |

Everything below is **uncovered**.

---

## Features to Consider for E2E Testing

Each feature is scored on three dimensions (1–5 scale):

| Dimension | Meaning |
|-----------|---------|
| **Risk** | How badly does a regression here hurt users? |
| **Breadth** | How many other features depend on or interact with this? |
| **Effort** | How much Playwright code is needed? (lower = cheaper) |

"Bang for buck" = (Risk × Breadth) / Effort

| # | Feature | Risk | Breadth | Effort | Score | Notes |
|---|---------|------|---------|--------|-------|-------|
| 1 | **Card Lifecycle** (create → edit → move → delete) | 5 | 5 | 3 | 8.3 | Core daily workflow; touches lists, labels, members, drag-drop |
| 2 | **Board + List Management** (create board, add lists, reorder) | 5 | 5 | 2 | 12.5 | Prerequisite for every card operation; relatively simple UI |
| 3 | Project CRUD | 4 | 4 | 2 | 8.0 | High level container; fewer interactive elements |
| 4 | Board Member Permissions (editor vs viewer) | 4 | 3 | 3 | 4.0 | Authorization bugs are severe but multi-user setup adds effort |
| 5 | Card Attachments & Cover | 3 | 2 | 3 | 2.0 | File upload testing; moderate complexity |
| 6 | Comments on Cards | 3 | 2 | 2 | 3.0 | Markdown editor; viewer `canComment` edge case |
| 7 | Tasks (Checklist) inside Cards | 3 | 2 | 2 | 3.0 | CRUD + completion toggle + assignees |
| 8 | Labels (create, assign to cards, filter) | 3 | 3 | 2 | 4.5 | Shared across all cards on a board |
| 9 | Card Search & Filters | 3 | 3 | 2 | 4.5 | Cross-cutting; validates data visibility |
| 10 | Notifications (in-app) | 3 | 3 | 3 | 3.0 | Realtime WebSocket; harder to assert timing |
| 11 | Board Import / Export | 4 | 2 | 3 | 2.7 | Data integrity critical but file-based flow |
| 12 | Board Templates | 2 | 2 | 2 | 2.0 | Lower frequency feature |
| 13 | User Settings / Preferences | 2 | 2 | 2 | 2.0 | Mostly form saves; lower regression risk |
| 14 | Registration (local + SSO) | 4 | 2 | 4 | 2.0 | SSO requires mock IdP; local is simpler |
| 15 | Mail-to-Board (Mail Tokens) | 2 | 1 | 4 | 0.5 | Needs email infra mocking; niche feature |
| 16 | API Client Management | 2 | 1 | 3 | 0.7 | Admin-only; API testing better suited for integration tests |
| 17 | Timer (start/stop/edit) | 2 | 1 | 2 | 1.0 | Small surface area |
| 18 | Due Dates | 2 | 2 | 2 | 2.0 | Date picker interaction |

---

## Top 2 Priorities — Bang for Buck

### Priority 1: Board + List Management

**What to test:**
1. Create a new project.
2. Create a board inside the project.
3. Add multiple lists to the board (e.g., "To Do", "In Progress", "Done").
4. Rename a list.
5. Reorder lists via drag-and-drop.
6. Collapse and expand a list.
7. Delete a list.
8. Delete the board.

**Why this is #1:**

| Factor | Reasoning |
|--------|-----------|
| **Highest score (12.5)** | Best ratio of impact to effort in the entire table. |
| **Foundation for everything** | Every other feature (cards, labels, filters, import/export) requires a board with lists to exist first. A regression here blocks *all* downstream workflows. |
| **Low effort** | The UI interactions are straightforward: click buttons, fill names, drag elements. No file uploads, no multi-user setup, no external dependencies. Page objects from the existing `LoginPage` pattern extend naturally. |
| **High regression risk** | Board/list creation is the first thing every user does after login. If this breaks, the product is unusable — zero cards can be created. |
| **Reusable test infrastructure** | The page objects and helper functions built here (project creation, board creation, list creation) become **setup fixtures** for every future test spec. This investment pays compound returns. |

---

### Priority 2: Card Lifecycle (Create → Edit → Move → Delete)

**What to test:**
1. Create a card in a list.
2. Open the card modal; edit the name and description (Markdown).
3. Set a due date on the card.
4. Assign a member to the card.
5. Add a label to the card.
6. Add a task (checklist item) and mark it complete.
7. Move the card to a different list (drag-and-drop or move dialog).
8. Duplicate the card.
9. Delete the card.

**Why this is #2:**

| Factor | Reasoning |
|--------|-----------|
| **Highest risk feature (score 8.3)** | Cards are the atomic unit of work. Every user interacts with cards every session. A card-creation or card-edit bug is immediately visible and blocks productivity. |
| **Maximum breadth** | A single card test touches **6 sub-features** at once: descriptions, due dates, members, labels, tasks, and list assignment. One spec file validates a huge surface area. |
| **Validates the real-time engine** | Card operations trigger WebSocket updates. E2E tests here implicitly verify that the realtime sync pipeline (server → WebSocket → client re-render) works end-to-end. |
| **Moderate effort, high payoff** | The card modal is the most complex UI component, but the interactions are standard Playwright patterns (click, fill, drag, assert). The board/list setup from Priority 1 is reused as a fixture, so incremental effort is lower than it appears. |
| **Covers the "happy path"** | If a QA team can only run two test suites, login + board/list + card lifecycle covers roughly **80% of what a typical user does in a session**. This is the classic Pareto principle applied to testing. |

---

## Recommended Implementation Order

```
Phase 1 (now)        Phase 2 (next)           Phase 3 (later)
─────────────        ──────────────           ───────────────
Login ✅              Card Search & Filters    Board Import/Export
Add User ✅           Labels CRUD              Notifications
Board + List Mgmt    Comments                 Board Templates
Card Lifecycle       Board Permissions        Registration
                     Project CRUD             Settings/Preferences
                     Tasks (checklist)        Mail Tokens / API
                     Attachments              Timer / Due Dates
```

## Suggested Page Objects to Build

Based on the two priorities, these page objects would be created:

| Page Object | Covers |
|-------------|--------|
| `ProjectPage.ts` | Create/delete project, navigate to project |
| `BoardPage.ts` | Create/delete board, add lists, reorder lists, collapse/expand, navigate to board |
| `CardModalPage.ts` | Open card, edit name/description, set due date, assign member, add label, add task, move, duplicate, delete |

These three objects, combined with the existing `LoginPage` and `UserSettingPage`, form the foundation for all future test expansion.

---

## Summary

| Priority | Feature | Why |
|----------|---------|-----|
| **1** | Board + List Management | Foundation for everything; highest score; creates reusable fixtures for all future tests |
| **2** | Card Lifecycle | Core user workflow; tests the most complex UI and real-time sync; covers 80% of daily usage |

Together with the existing login and user management tests, these two suites cover the **critical path** that every user follows: log in → open/create a board → manage lists → work with cards.
