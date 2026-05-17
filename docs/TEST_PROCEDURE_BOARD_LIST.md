# Test Procedure: Board + List Management

---

## 1. Metadata

- **Author**: achauhan
- **Created On**: 2026-05-16
- **Document Status**: Draft
- **Target Release**: Phase 1
- **Jira Epic / Feature Link**: N/A
- **Reviewers**: TBD

---

## 2. Overview

### Description
Board + List Management is the foundational feature of 4ga Boards. It enables users to:
- Create and organize project boards
- Add, rename, reorder, collapse, and delete lists within boards
- Establish the structure that all downstream features (cards, labels, filters) depend on

**Users**: All project members (project managers for board CRUD, board editors for list CRUD)

**Key workflows**:
1. Project manager creates a board inside a project
2. Board editor adds lists (e.g., "To Do", "In Progress", "Done")
3. Users reorder lists via drag-and-drop
4. Users collapse/expand lists for focus
5. Board editor deletes lists; project manager deletes boards

### References
- Functional Spec: `docs/FUNCTIONAL_FLOW.md`
- E2E Strategy: `docs/E2E_TEST_STRATEGY.md`
- API Controllers: `server/api/controllers/boards/`, `server/api/controllers/lists/`
- Client Components: `client/src/components/Board/`

---

## 3. Feature / Endpoint Overview

| Feature | Endpoint / UI Action | Persisted | Description |
|---------|---------------------|-----------|-------------|
| Create Board | `POST /api/projects/:projectId/boards` | Yes | Creates board with position, name; auto-creates BoardMembership for creator |
| View Board | `GET /api/boards/:id?subscribe=true` | No | Fetches board + lists + cards; subscribes to WebSocket channel |
| Update Board | `PATCH /api/boards/:id` | Yes | Updates name or position |
| Delete Board | `DELETE /api/boards/:id` | Yes | Removes board and cleans up memberships |
| Create List | `POST /api/boards/:boardId/lists` | Yes | Creates list with calculated position |
| Update List | `PATCH /api/lists/:id` | Yes | Updates name, position, or isCollapsed |
| Delete List | `DELETE /api/lists/:id` | Yes | Archives list and removes associated mail tokens |
| Reorder List | `PATCH /api/lists/:id` (position) | Yes | Gap-based position update; may trigger rebalance |

---

## 4. Workflows

### Workflow: Create Board

1. User navigates to a project
2. User clicks "Add Board" button
3. User enters board name and submits
4. Server calculates position, creates board, creates BoardMembership (EDITOR)
5. Server broadcasts `boardCreate` to all project managers via WebSocket
6. Board appears in sidebar/project view

### Workflow: Add Lists to Board

1. User opens a board
2. User clicks "Add List" button (or "+ Add another list")
3. User enters list name and submits (Enter key or button)
4. Server calculates position via gap-based ordering (increment of 65536)
5. Server broadcasts `listCreate` on `board:{boardId}` channel
6. List appears at the end of the board

### Workflow: Reorder Lists

1. User drags a list header to a new position
2. Client uses `react-beautiful-dnd` to detect drop position
3. Client dispatches `LIST_MOVE` action with new index
4. Server recalculates position (midpoint between neighbors)
5. Server broadcasts `listUpdate` with new position
6. All connected clients reorder the list in real-time

### Workflow: Collapse/Expand List

1. User clicks collapse toggle on a list
2. Client dispatches `LIST_UPDATE` with `isCollapsed: true/false`
3. Server persists the state and broadcasts `listUpdate`
4. List UI shrinks/expands accordingly

### Workflow: Delete List

1. User opens list actions menu
2. User clicks "Delete" and confirms
3. Server archives the list (soft delete)
4. Server deletes associated mail tokens
5. Server broadcasts `listDelete` on board channel
6. Server creates Action record for audit trail
7. List disappears from all connected clients

---

## 5. Test Strategy

### Testing Approach
- **End-to-End Testing** (Playwright): Full workflow validation through the UI
- **Integration Testing**: API-level validation of board/list CRUD
- **Real-time Testing**: WebSocket broadcast verification (implicit via E2E)
- **Authorization Testing**: Role-based access control for all operations

### Permission Hierarchy

```
ADMIN (Global)
 └─ Full system access, can manage all resources
     │
PROJECT MANAGER (Project-level)
 └─ Create/update/delete boards, manage board memberships
 └─ Automatically granted "editor" on all boards in project
     │
BOARD EDITOR (Board-level, role: 'editor')
 └─ Create/update/delete lists, cards, labels, tasks, attachments
     │
BOARD COMMENTER (Board-level, role: 'viewer' + canComment: true)
 └─ Read-only board access + can create/edit/delete own comments
     │
BOARD VIEWER (Board-level, role: 'viewer')
 └─ Read-only access; can only subscribe/unsubscribe from cards
```

### Permission Matrix: Board Operations

| Operation | Admin | Project Manager | Board Editor | Board Commenter | Board Viewer |
|-----------|-------|----------------|--------------|-----------------|--------------|
| Create Board | Yes | Yes | No | No | No |
| View Board | Yes | Yes | Yes | Yes | Yes |
| Update Board (name/position) | Yes | Yes | No | No | No |
| Delete Board | Yes | Yes | No | No | No |
| Manage Board Memberships | Yes | Yes | No | No | No |

### Permission Matrix: List Operations

| Operation | Admin | Project Manager | Board Editor | Board Commenter | Board Viewer |
|-----------|-------|----------------|--------------|-----------------|--------------|
| Create List | Yes | Yes (auto-editor) | Yes | No | No |
| View Lists | Yes | Yes | Yes | Yes | Yes |
| Update List (name) | Yes | Yes (auto-editor) | Yes | No | No |
| Update List (position/reorder) | Yes | Yes (auto-editor) | Yes | No | No |
| Update List (collapse/expand) | Yes | Yes (auto-editor) | Yes | No | No |
| Delete List | Yes | Yes (auto-editor) | Yes | No | No |

### Tools / Frameworks
- UI Automation: Playwright
- CI/CD: GitHub Actions (`e2e-tests.yml`)
- Test Runner: `start-server-and-test` + Playwright Test

### Coverage Goals

| Layer | Target Coverage |
|-------|----------------|
| Board CRUD (E2E) | 100% of happy paths |
| List CRUD (E2E) | 100% of happy paths |
| Permission enforcement | All roles tested for board + list operations |
| Real-time sync | Implicit via multi-step E2E flows |

---

## 6. Test Environment

- **Deployment Method**: Docker Compose (`docker-compose-dev.yml`)
- **Test Environments**: Local (Docker) / CI (GitHub Actions)
- **Authentication**: Username/password login (demo/demo for admin)
- **External Dependencies**:
  - PostgreSQL 16 (via Docker: `postgres:16-alpine`)
  - WebSocket (Sails.io auto-connect)

---

## 7. Test Data

### Required Users (by role)

| User | Username | Password | Global Role | Board Role | Setup |
|------|----------|----------|-------------|------------|-------|
| `demo` / `demo` | demo | demo | Admin | — | Pre-seeded |
| `pm_user` | pm_user | Test@1234 | Regular | Project Manager | Created in test setup |
| `editor_user` | editor_user | Test@1234 | Regular | Board Editor | Created in test setup |
| `commenter_user` | commenter_user | Test@1234 | Regular | Board Viewer + canComment | Created in test setup |
| `viewer_user` | viewer_user | Test@1234 | Regular | Board Viewer | Created in test setup |
| `non_member_user` | non_member_user | Test@1234 | Regular | No membership | Created in test setup |

### Role Distinction: Admin vs Project Manager
- **Admin** (`demo`): System-wide admin flag (`isAdmin: true`). Has global access to all resources.
- **Project Manager** (`pm_user`): Promoted to PM for a specific project. Can create/update/delete boards and manage memberships within that project only.

### Required Resources
- Project: Created during test setup (demo is admin, pm_user is project manager)
- Board: Created during test execution
- Lists: Created during test execution (e.g., "To Do", "In Progress", "Done")
- Board Memberships: editor_user (editor), commenter_user (viewer+canComment), viewer_user (viewer)

### Edge / Negative Data
- Empty board name (whitespace only)
- Duplicate list names within same board
- Very long list names (boundary: text field limits)
- Reorder to same position (no-op)
- Delete last remaining list on a board
- User removed from board mid-session (membership deleted while viewing)

---

## 8. Test Case Design

Each test case tests **one operation across all applicable roles**. Roles are grouped by expected outcome to reduce redundancy.

---

### 8.1 Board Operations

| ID | Test Case | Roles | Steps | Expected Result | Type | Category |
|----|-----------|-------|-------|----------------|------|----------|
| TC01 | Create a board | Admin, PM | 1. Login 2. Navigate to project 3. Click "Add Board" 4. Enter name 5. Submit | Board created; appears in project view | E2E | Functional |
| | | Editor, Commenter, Viewer | 1. Login 2. Navigate to project | "Add Board" button NOT visible; cannot create | | Authorization |
| | | Non-Member | 1. Login 2. Navigate to project | Project not accessible; cannot see boards | | Authorization |
| TC02 | Update board name | Admin, PM | 1. Login 2. Open board 3. Rename board 4. Confirm | Board name updated; persists on reload | E2E | Functional |
| | | Editor, Commenter, Viewer | 1. Login 2. Open board | Rename option NOT visible | | Authorization |
| | | Non-Member | 1. Login 2. Navigate to board URL | Board not accessible (404) | | Authorization |
| TC03 | Delete a board | Admin, PM | 1. Login 2. Open board 3. Click Delete 4. Confirm | Board deleted; removed from project view | E2E | Functional |
| | | Editor, Commenter, Viewer | 1. Login 2. Open board | Delete option NOT visible | | Authorization |
| | | Non-Member | 1. Login 2. Navigate to board URL | Board not accessible (404) | | Authorization |
| TC04 | View a board | Admin, PM, Editor | 1. Login 2. Navigate to board | Board loads with all lists and cards (full UI) | E2E | Functional |
| | | Commenter, Viewer | 1. Login 2. Navigate to board | Board loads with all lists and cards (read-only UI) | | Authorization |
| | | Non-Member | 1. Login 2. Navigate to board URL | 404 page (not 403, for security) | | Authorization |
| | | Unauthenticated | 1. Navigate to board URL without login | Redirect to login page | | Authentication |
| TC05 | Manage board memberships | Admin, PM | 1. Login 2. Open board settings 3. Add/remove member or change role | Membership changes applied successfully | E2E | Authorization |
| | | Editor, Commenter, Viewer | 1. Login 2. Open board | Membership management NOT accessible | | Authorization |

---

### 8.2 List Operations

| ID | Test Case | Roles | Steps | Expected Result | Type | Category |
|----|-----------|-------|-------|----------------|------|----------|
| TC06 | Create a list | Admin, PM, Editor | 1. Login 2. Open board 3. Click "Add List" 4. Enter name 5. Submit | List created; appears at end of board | E2E | Functional |
| | | Commenter, Viewer | 1. Login 2. Open board | "Add List" button NOT visible | | Authorization |
| | | Non-Member | 1. Login 2. Navigate to board URL | Board not accessible (404) | | Authorization |
| TC07 | Rename a list | Admin, PM, Editor | 1. Login 2. Open board 3. Click list name 4. Edit 5. Confirm | Name updated; persists on reload | E2E | Functional |
| | | Commenter, Viewer | 1. Login 2. Open board 3. Click list name | List name NOT editable (no edit affordance) | | Authorization |
| TC08 | Reorder lists (drag-and-drop) | Admin, PM, Editor | 1. Login 2. Open board with 3+ lists 3. Drag list to new position | Lists reordered; position persists on reload | E2E | Functional |
| | | Commenter, Viewer | 1. Login 2. Open board 3. Attempt drag | Drag-and-drop disabled; no effect | | Authorization |
| TC09 | Collapse/expand a list | Admin, PM, Editor | 1. Login 2. Open board 3. Click collapse toggle 4. Click expand | List collapses/expands; state persists on reload | E2E | Functional |
| | | Commenter, Viewer | 1. Login 2. Open board | Collapse toggle NOT available or disabled | | Authorization |
| TC10 | Delete a list | Admin, PM, Editor | 1. Login 2. Open board 3. Open list menu 4. Click Delete 5. Confirm | List removed; not visible on reload | E2E | Functional |
| | | Commenter, Viewer | 1. Login 2. Open board | List action menu / Delete option NOT available | | Authorization |

---

### 8.3 Project Manager–Specific Behavior

| ID | Test Case | Roles | Steps | Expected Result | Type | Category |
|----|-----------|-------|-------|----------------|------|----------|
| TC11 | PM has auto-editor on all boards | PM | 1. Admin creates new board 2. Login as PM (NOT explicitly added) 3. Open board 4. Create list | PM can access board and create lists without explicit membership | E2E | Authorization |
| TC12 | PM cannot be removed from board | Admin (actor) | 1. Login as admin 2. Open board membership settings 3. Attempt to remove PM | Operation rejected or remove button hidden | E2E | Authorization |
| TC13 | Promoting user to PM grants board access | Admin (actor), Non-Member (subject) | 1. Admin promotes non_member to PM 2. Login as promoted user 3. Navigate to project boards | User has editor access to all boards; can create lists and boards | E2E | Authorization |

---

### 8.4 Dynamic Role Changes

| ID | Test Case | Roles | Steps | Expected Result | Type | Category |
|----|-----------|-------|-------|----------------|------|----------|
| TC14 | Role upgrade: Viewer → Editor | Admin (actor), Viewer (subject) | 1. Login as viewer — confirm no "Add List" 2. Admin upgrades to Editor 3. Viewer refreshes 4. Attempt create list | "Add List" appears; list creation succeeds | E2E | Authorization |
| TC15 | Role downgrade: Editor → Viewer | Admin (actor), Editor (subject) | 1. Login as editor — confirm can create lists 2. Admin downgrades to Viewer 3. Editor refreshes 4. Attempt create list | "Add List" disappears; list operations blocked | E2E | Authorization |
| TC16 | Membership revocation | Admin (actor), Editor (subject) | 1. Login as editor — open board 2. Admin removes membership 3. Editor refreshes | Board no longer accessible; redirect or 404 | E2E | Authorization |

---

### 8.5 Validation Test Cases

| ID | Test Case | Roles | Steps | Expected Result | Type | Category |
|----|-----------|-------|-------|----------------|------|----------|
| TC17 | Reject board creation with empty name | Admin, PM | 1. Click Add Board 2. Submit with empty/whitespace name | Validation error; board not created | E2E | Validation |
| TC18 | Reject list creation with empty name | Admin, PM, Editor | 1. Click Add List 2. Submit with empty/whitespace name | Validation error; list not created | E2E | Validation |
| TC19 | Accept duplicate list names | Admin, PM, Editor | 1. Create list "To Do" 2. Create another "To Do" | Both lists created (duplicates allowed) | E2E | Validation |
| TC20 | Long list name handling | Admin, PM, Editor | 1. Create list with 200+ character name | List created; name displayed or truncated gracefully | E2E | Validation |

---

### 8.6 Persistence Test Cases

| ID | Test Case | Roles | Steps | Expected Result | Type | Category |
|----|-----------|-------|-------|----------------|------|----------|
| TC21 | Board name persists after reload | Admin, PM | 1. Create board with specific name 2. Reload page | Board name displays correctly | E2E | Persistence |
| TC22 | List order persists after reload | Admin, PM, Editor | 1. Create 3 lists 2. Reorder 3. Reload page | Lists maintain reordered positions | E2E | Persistence |
| TC23 | Collapsed state persists after reload | Admin, PM, Editor | 1. Collapse a list 2. Reload page | List remains collapsed | E2E | Persistence |
| TC24 | Deleted list does not reappear | Admin, PM, Editor | 1. Delete a list 2. Reload page | List remains gone | E2E | Persistence |

---

### 8.7 Real-Time / WebSocket Test Cases

| ID | Test Case | Roles | Steps | Expected Result | Type | Category |
|----|-----------|-------|-------|----------------|------|----------|
| TC25 | List creation broadcasts | Editor (actor), Viewer (observer) | 1. Open board in two sessions 2. Editor creates list | List appears in viewer session without reload | E2E | Real-time |
| TC26 | List deletion broadcasts | Editor (actor), Viewer (observer) | 1. Open board in two sessions 2. Editor deletes list | List disappears from viewer session | E2E | Real-time |
| TC27 | List rename broadcasts | Editor (actor), Viewer (observer) | 1. Open board in two sessions 2. Editor renames list | Updated name appears in viewer session | E2E | Real-time |
| TC28 | List reorder broadcasts | Editor (actor), Viewer (observer) | 1. Open board in two sessions 2. Editor reorders | New order appears in viewer session | E2E | Real-time |
| TC29 | Board deletion notifies members | Admin (actor), Editor + Viewer (observers) | 1. Open board in multiple sessions 2. Admin deletes board | All other sessions redirect away | E2E | Real-time |

---

### Test Coverage Summary

| Category | Test Cases | Count |
|----------|-----------|-------|
| Board Operations (all roles) | TC01–TC05 | 5 |
| List Operations (all roles) | TC06–TC10 | 5 |
| Project Manager–Specific | TC11–TC13 | 3 |
| Dynamic Role Changes | TC14–TC16 | 3 |
| Validation | TC17–TC20 | 4 |
| Persistence | TC21–TC24 | 4 |
| Real-time | TC25–TC29 | 5 |
| **Total** | | **29** |

### Role Coverage Matrix

| Role | Positive (succeeds) | Negative (blocked) |
|------|--------------------|--------------------|
| Admin (`demo`) | TC01–TC10, TC17–TC24, TC29 | — |
| Project Manager (`pm_user`) | TC01–TC10, TC11, TC13, TC17–TC24 | TC12 (cannot remove other PM) |
| Board Editor (`editor_user`) | TC04, TC06–TC10, TC18–TC20, TC22–TC28 | TC01–TC03, TC05 |
| Board Commenter (`commenter_user`) | TC04 (view only) | TC01–TC03, TC05–TC10 |
| Board Viewer (`viewer_user`) | TC04 (view only), TC14 (after upgrade) | TC01–TC03, TC05–TC10 |
| Non-Member (`non_member_user`) | TC13 (after promotion) | TC01, TC04, TC06 |
| Unauthenticated | — | TC04 (redirect to login) |

---

## 9. Workflow / E2E Scenarios

### Scenario 1: Full Board Lifecycle (Admin / Project Manager)
1. Login as admin (project manager)
2. Create a new project (or use existing)
3. Create a board named "Sprint Board"
4. Add lists: "Backlog", "To Do", "In Progress", "Review", "Done"
5. Reorder: move "Backlog" after "To Do"
6. Collapse "Done" list
7. Rename "Review" to "Code Review"
8. Delete "Backlog" list
9. Verify final state: To Do, In Progress, Code Review, Done (collapsed)
10. Delete the board
11. Verify board no longer appears in project

### Scenario 2: Board Editor Workflow
1. Admin creates a board and adds editor_user as Board Editor
2. Login as editor_user
3. Navigate to the board (verify board is accessible)
4. Create lists: "Sprint 1", "Sprint 2", "Sprint 3"
5. Rename "Sprint 1" to "Current Sprint"
6. Reorder lists via drag-and-drop
7. Delete "Sprint 3"
8. Verify: cannot rename the board (no board rename option visible)
9. Verify: cannot delete the board (no board delete option visible)
10. Verify: cannot access board membership settings

### Scenario 3: Viewer Restriction Enforcement
1. Admin creates a board with lists, adds viewer_user as Viewer
2. Login as viewer_user
3. Navigate to the board (verify access granted)
4. Verify all lists and cards are visible (read-only)
5. Verify: "Add List" button is NOT visible
6. Verify: list names are NOT editable (no click-to-edit)
7. Verify: list action menus are NOT available (no delete/rename)
8. Verify: drag-and-drop on lists is disabled
9. Verify: "Add Board" button is NOT visible in project view
10. Open a card and toggle subscribe (verify this works)

### Scenario 4: Commenter Boundary
1. Admin creates board, adds commenter_user as Viewer with canComment=true
2. Login as commenter_user
3. Navigate to board — verify lists visible
4. Verify: cannot create lists (same restrictions as viewer)
5. Verify: cannot rename or delete lists
6. Verify: can open cards and add comments (if comment tests exist)
7. Verify: cannot edit card content or list structure

### Scenario 5: Role Escalation and De-escalation
1. Admin adds user as Viewer on a board
2. Login as that user — verify cannot create lists
3. Admin upgrades user to Editor
4. User refreshes (or receives WebSocket update) — verify "Add List" appears
5. User creates a list successfully
6. Admin downgrades user back to Viewer
7. User refreshes — verify "Add List" disappears, cannot modify lists

### Scenario 6: Project Manager Auto-Editor Behavior
1. Admin creates a new project
2. Admin promotes user to Project Manager for that project
3. Login as the promoted user
4. Verify: can create boards in the project
5. Verify: has automatic editor access to all boards (can create/modify lists)
6. Create a new board — verify user is auto-added as editor
7. Verify: can manage board memberships (add/remove users)

### Scenario 7: Non-Member Access Denial
1. Create a board with specific members
2. Login as non_member_user (not added to the board)
3. Attempt to navigate directly to board URL
4. Verify: server returns 404 (not 403, for security)
5. Verify: board does NOT appear in sidebar or project view

### Scenario 8: Concurrent Multi-Role Editing
1. Open board as editor in browser tab 1
2. Open same board as viewer in browser tab 2
3. Editor creates a list — verify it appears in viewer's tab (WebSocket)
4. Editor renames a list — verify update in viewer's tab
5. Editor deletes a list — verify removal in viewer's tab
6. Verify: viewer tab never shows edit controls despite receiving updates

---

## 10. Cross-Service / Integration Testing

- **Board → List dependency**: Deleting a board cascades to all lists
- **List → Card dependency**: Deleting a list archives all cards within it
- **Board → Membership**: Creating a board auto-creates editor membership for creator
- **Position rebalancing**: When gap-based positions become too small (< 0.125), verify full rebalance works

---

## 11. Non-Functional Testing

| Type | Scope | Notes |
|------|-------|-------|
| Performance | Board with 20+ lists | Verify drag-and-drop remains smooth |
| Performance | Position rebalance trigger | Verify no visible lag during rebalance |
| Stress | Rapid list creation (10+ in sequence) | Verify no position collisions |
| Browser compat | Chrome, Firefox, WebKit | Playwright multi-browser config |

---

## 12. Compatibility Testing

- **Browser**: Chromium (primary), Firefox, WebKit (via Playwright projects)
- **Viewport**: Desktop (1920x1080), Tablet (1024x768)
- **Drag-and-drop**: Verify `react-beautiful-dnd` works across all supported browsers

---

## 13. Cross-Feature Impact

| Feature | Impact | Regression Coverage Needed |
|---------|--------|---------------------------|
| Cards | Cards live inside lists; list deletion archives cards | Verify cards accessible after list operations |
| Labels | Labels are board-scoped; board deletion removes labels | Verify label cleanup |
| Filters | Filters reference lists by ID | Verify filters update after list deletion |
| Import/Export | Board import creates lists in bulk | Verify imported list order |
| Mail Tokens | Mail tokens tied to lists | Verify cleanup on list delete |

---

## 14. Open Issues / Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Drag-and-drop flakiness in CI | Tests may fail intermittently | Use Playwright's built-in drag API; add retries |
| Position rebalance edge case | Rare but could corrupt ordering | Add specific test for many rapid reorders |
| Docker DB state between runs | Leftover data from previous runs | Use test cleanup in `finally` blocks |
| WebSocket timing in tests | Race conditions on broadcast assertions | Use `expect().toBeVisible()` with timeouts |

---

## 15. Automation Plan

### Test Files to Create

| File | Purpose |
|------|---------|
| `tests/e2e/pageObjects/ProjectPage.ts` | Create/delete project, navigate |
| `tests/e2e/pageObjects/BoardPage.ts` | Board CRUD, list CRUD, drag-and-drop |
| `tests/e2e/specs/boardManagement.spec.ts` | Board lifecycle tests (TC01, TC07, TC12) |
| `tests/e2e/specs/listManagement.spec.ts` | List CRUD tests (TC02-TC06, TC08, TC11) |

### CI Pipeline Integration
- Runs via `pnpm run ci:test:e2e` in GitHub Actions (`e2e-tests.yml`)
- Uses `start-server-and-test` to spin up server before tests
- Playwright browsers installed via `pnpm -C tests exec playwright install`

### Regression Coverage Plan
- All tests run on every PR
- Board/list page objects become shared fixtures for card lifecycle tests (Phase 2)

---

## 16. Feature Readiness Criteria

- [ ] All TC01-TC08 tests passing (core functional)
- [ ] TC11-TC12 persistence tests passing
- [ ] No high-severity defects open related to board/list operations
- [ ] Tests stable in CI (< 2% flake rate over 10 runs)
- [ ] Page objects documented and reusable for card lifecycle tests

---

## 17. Test Procedure Review

- Review Notes:
- Approval Status: Pending

---

## 18. Template Feedback

N/A
