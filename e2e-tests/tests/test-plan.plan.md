# 4ga Boards E2E Test Plan

## Application Overview

4ga Boards is a Kanban-style project management application. Users can create projects containing boards, boards containing lists, and lists containing cards. Cards have properties including members, labels, due dates, timers, tasks, attachments, comments, and descriptions. The app supports filtering, searching, drag-and-drop card movement, collapsible lists, board/list view toggle, and role-based access (Admin vs regular user). Authentication is via username/password login.

## Test Data Strategy

All tests use **API-first fixtures** for setup and teardown. No tests depend on pre-existing data (e.g., the "Learn 4ga Boards" project).

- **Fixtures**: `testProject`, `testBoard`, `testList`, `testCard` — created via API, auto-cleaned on teardown
- **Isolation**: Each test gets a unique 6-digit hex `runId` appended to resource names
- **Cleanup**: Deleting `testProject` cascades to all child boards, lists, and cards
- **UI only for the path under test** — everything else is API

## Test Scenarios

### 1. Authentication

#### 1.1. should log in with valid credentials

**File:** `tests/auth/login.spec.ts`
**Setup:** `test.use({ storageState: { cookies: [], origins: [] } })` (unauthenticated)

**Steps:**
  1. Navigate to /login
    - expect: Login page displays username and password fields and a Log in button
  2. Fill in credentials and click Log in
    - expect: User is redirected to the dashboard at /
    - expect: Page title is '4ga Boards'

#### 1.2. should show error with invalid credentials

**File:** `tests/auth/login-invalid.spec.ts`
**Setup:** Unauthenticated (clear storageState)

**Steps:**
  1. Navigate to /login
  2. Fill in 'wronguser' / 'wrongpass' and click Log in
    - expect: An error message is displayed
    - expect: User remains on the login page

#### 1.3. should log out successfully

**File:** `tests/auth/logout.spec.ts`

**Steps:**
  1. Click the user avatar button in the top-right header
    - expect: A user menu appears
  2. Click the logout option
    - expect: User is redirected to the login page

### 2. Projects

#### 2.1. should display a project on the dashboard

**File:** `tests/projects/view-projects.spec.ts`
**Fixtures:** `testProject`

**Steps:**
  1. Navigate to /
    - expect: The dashboard shows the fixture project name
    - expect: The project appears in the sidebar

#### 2.2. should filter projects by name in the sidebar

**File:** `tests/projects/filter-projects.spec.ts`
**Fixtures:** `testProject`

**Steps:**
  1. Type the fixture project name into 'Filter projects...'
    - expect: The fixture project remains visible in the sidebar
  2. Clear and type 'NonExistent'
    - expect: No projects are shown

#### 2.3. should create a new project (Admin)

**File:** `tests/projects/create-project.spec.ts`
**Fixtures:** `api`, `runId` (for cleanup)

**Steps:**
  1. Click the 'Add Project' button in the sidebar
    - expect: A form appears for the project name
  2. Enter 'New Project {runId}' and submit
    - expect: The new project appears in the sidebar and on the dashboard
  3. **Teardown:** Delete created project via API

#### 2.4. should add a board from the sidebar (Admin)

**File:** `tests/projects/add-board-from-sidebar.spec.ts`
**Fixtures:** `testProject`

**Steps:**
  1. Click the 'Add Board' button in the sidebar
    - expect: A form appears for the board name
  2. Enter board name and submit
    - expect: The new board appears under the project in the sidebar

### 3. Boards

#### 3.1. should display boards within a project

**File:** `tests/boards/view-boards.spec.ts`
**Fixtures:** `testProject`, `testBoard`

**Steps:**
  1. Navigate to the fixture project
    - expect: The fixture board is visible in the sidebar and project view

#### 3.2. should create a new board within a project (Admin)

**File:** `tests/boards/create-board.spec.ts`
**Fixtures:** `testProject`, `runId`

**Steps:**
  1. Navigate to the fixture project view
  2. Click 'Add Board'
  3. Enter 'New Board {runId}' and submit
    - expect: The new board appears in the sidebar and project view

#### 3.3. should subscribe and unsubscribe to a board

**File:** `tests/boards/subscribe-board.spec.ts`
**Fixtures:** `testBoard`

**Steps:**
  1. Navigate to the fixture board
    - expect: An 'Unsubscribe' or 'Subscribe' button is visible
  2. Toggle subscribe/unsubscribe
    - expect: Button text changes accordingly

### 4. BoardView

#### 4.1. should display the board in Kanban view with a list

**File:** `tests/board-view/kanban-view.spec.ts`
**Fixtures:** `testBoard`, `testList`

**Steps:**
  1. Navigate to the fixture board
    - expect: The board view displays the fixture list with its name
    - expect: The list shows '0 cards'

#### 4.2. should switch between Board View and List View

**File:** `tests/board-view/toggle-view.spec.ts`
**Fixtures:** `testBoard`, `testList`

**Steps:**
  1. Navigate to the fixture board
  2. Click 'Switch to List View'
    - expect: The board switches to list/table view
  3. Click 'Switch to Board View'
    - expect: The board switches back to Kanban view

#### 4.3. should filter cards by text

**File:** `tests/board-view/filter-cards-text.spec.ts`
**Fixtures:** `testBoard`, `testList`, `api`, `runId`
**API Seed:** Create 3 cards with distinct names via API

**Steps:**
  1. Navigate to the fixture board
  2. Type a specific card name in 'Filter cards...'
    - expect: Only the matching card is visible
  3. Clear the filter
    - expect: All 3 cards are visible again

#### 4.4. should filter cards by labels

**File:** `tests/board-view/filter-cards-labels.spec.ts`
**Fixtures:** `testBoard`, `testList`, `api`, `runId`
**API Seed:** Create a label on the board, create 2 cards, assign label to 1 card

**Steps:**
  1. Navigate to the fixture board
  2. Click 'Filter By Labels' and select the seeded label
    - expect: Only the labeled card is visible

#### 4.5. should filter cards by members

**File:** `tests/board-view/filter-cards-members.spec.ts`
**Fixtures:** `testBoard`, `testList`, `testProject`, `testUser`, `api`, `runId`
**API Seed:** Create 2 cards, add testUser as project manager, assign testUser to 1 card

**Steps:**
  1. Navigate to the fixture board
  2. Click 'Filter By Members' and select the seeded user
    - expect: Only the card with the member is visible

#### 4.6. should filter cards by due date

**File:** `tests/board-view/filter-cards-due-date.spec.ts`
**Fixtures:** `testBoard`, `testList`, `api`, `runId`
**API Seed:** Create 2 cards, set due date on 1 card

**Steps:**
  1. Navigate to the fixture board
  2. Click 'Filter by Due Date' and select a filter option
    - expect: Only the card with a due date is visible

#### 4.7. should collapse and expand a list

**File:** `tests/board-view/collapse-expand-list.spec.ts`
**Fixtures:** `testBoard`, `testList`

**Steps:**
  1. Navigate to the fixture board
    - expect: The fixture list is expanded
  2. Click 'Collapse List' on the fixture list
    - expect: The list collapses showing only name and card count
  3. Click 'Expand List'
    - expect: The list expands again

#### 4.8. should add a new list to the board

**File:** `tests/board-view/add-list.spec.ts`
**Fixtures:** `testBoard`, `runId`

**Steps:**
  1. Navigate to the fixture board
  2. Click 'Add list'
  3. Enter 'New List {runId}' and submit
    - expect: The new list appears on the board

#### 4.9. should add a new card to a list

**File:** `tests/board-view/add-card.spec.ts`
**Fixtures:** `testBoard`, `testList`, `runId`

**Steps:**
  1. Navigate to the fixture board
    - expect: The fixture list shows 0 cards
  2. Click 'Add card' on the fixture list
  3. Enter 'New Card {runId}' and submit
    - expect: The new card appears in the list
    - expect: The card count updates to 1

### 5. CardModal

#### 5.1. should display card modal with all sections

**File:** `tests/card-modal/card-modal.spec.ts`
**Fixtures:** `testCard`, `testList`

**Steps:**
  1. Navigate to /cards/{testCard.id}
    - expect: Card title matches fixture card name
    - expect: List name matches fixture list name
    - expect: Buttons visible: Add Member, Add Label, Add Due Date, Edit Timer
    - expect: Module sections visible: Add Description, Add Task, Add Attachment, Add comment
    - expect: Header actions visible: Subscribe, Delete Card, Close Card

#### 5.2. should close the card modal

**File:** `tests/card-modal/card-modal.spec.ts`
**Fixtures:** `testCard`

**Steps:**
  1. Navigate to /cards/{testCard.id}
  2. Click 'Close Card'
    - expect: The card modal closes

#### 5.3. should add a member to a card

**File:** `tests/card-modal/card-modal.spec.ts`
**Fixtures:** `testCard`, `testBoard`, `testProject`, `testUser`, `api`
**API Seed:** Add testUser as project manager

**Steps:**
  1. Navigate to /cards/{testCard.id}
  2. Click 'Add Member'
    - expect: Popup opens with header 'Members'
  3. Click the testUser's button in the member list
  4. Close popup
    - expect: Members property is visible on the card

#### 5.4. should add a label to a card

**File:** `tests/card-modal/card-modal.spec.ts`
**Fixtures:** `testCard`, `testBoard`, `api`, `runId`
**API Seed:** Create label 'Label {runId}' with color 'berry-red' on the board

**Steps:**
  1. Navigate to /cards/{testCard.id}
  2. Click 'Add Label'
    - expect: Popup opens with header 'Labels'
  3. Click the seeded label by its title
  4. Close popup
    - expect: Labels property is visible on the card

#### 5.5. should set a due date on a card

**File:** `tests/card-modal/card-modal.spec.ts`
**Fixtures:** `testCard`

**Steps:**
  1. Navigate to /cards/{testCard.id}
  2. Click 'Add Due Date'
    - expect: Popup opens with header 'Due Date' and a date input
  3. Clear input and enter '15.12.2026'
  4. Click 'Save'
    - expect: Due Date property is visible on the card

#### 5.6. should add a task to a card

**File:** `tests/card-modal/card-modal.spec.ts`
**Fixtures:** `testCard`, `runId`

**Steps:**
  1. Navigate to /cards/{testCard.id}
  2. Click 'Add Task' (icon button, use .first())
  3. Fill textarea (placeholder 'Enter task description...') with 'Task {runId}'
  4. Press Enter
    - expect: The task appears in the Tasks section

#### 5.7. should add a comment to a card

**File:** `tests/card-modal/card-modal.spec.ts`
**Fixtures:** `testCard`, `runId`

**Steps:**
  1. Navigate to /cards/{testCard.id}
  2. Click 'Add comment' (icon button, use .first())
  3. Fill markdown textarea (`.w-md-editor-text-input`) with 'Test comment {runId}'
  4. Click 'Save'
    - expect: The comment appears in the Comments section

#### 5.8. should subscribe and unsubscribe to a card

**File:** `tests/card-modal/card-subscribe.spec.ts`
**Fixtures:** `testCard`

**Steps:**
  1. Navigate to /cards/{testCard.id}
    - expect: 'Subscribe' button is visible
  2. Click 'Subscribe'
    - expect: Button changes to 'Unsubscribe'
  3. Click 'Unsubscribe'
    - expect: Button changes back to 'Subscribe'

#### 5.9. should delete a card

**File:** `tests/card-modal/delete-card.spec.ts`
**Fixtures:** `testCard`

**Steps:**
  1. Navigate to /cards/{testCard.id}
  2. Click 'Delete Card'
    - expect: A confirmation appears
  3. Confirm deletion
    - expect: The card modal closes

#### 5.10. should add a description to a card

**File:** `tests/card-modal/card-description.spec.ts`
**Fixtures:** `testCard`, `runId`

**Steps:**
  1. Navigate to /cards/{testCard.id}
  2. Click the 'Add Description' body button
    - expect: Markdown editor appears
  3. Type 'Description {runId}' and save
    - expect: The description text is displayed in the card

#### 5.11. should start and stop the timer on a card

**File:** `tests/card-modal/card-timer.spec.ts`
**Fixtures:** `testCard`

**Steps:**
  1. Navigate to /cards/{testCard.id}
    - expect: Timer shows '00:00'
  2. Click the timer button to start
    - expect: Timer starts counting
  3. Click the timer button to stop
    - expect: Timer stops with elapsed time > 0

#### 5.12. should move a card to a different list

**File:** `tests/card-modal/move-card.spec.ts`
**Fixtures:** `testCard`, `testList`, `testBoard`, `api`, `runId`
**API Seed:** Create a second list 'Target List {runId}'

**Steps:**
  1. Navigate to /cards/{testCard.id}
    - expect: List name shows the original fixture list
  2. Click the list name / 'Move Card To List'
  3. Select the second list
    - expect: Card modal updates to show the new list name

### 6. ProjectSettings

#### 6.1. should view project settings

**File:** `tests/project-settings/view-settings.spec.ts`
**Fixtures:** `testProject`

**Steps:**
  1. Navigate to /projects/{testProject.id}/settings
    - expect: Project name is shown in the Name field
    - expect: Managers section is visible
    - expect: Background options are visible
    - expect: Danger Zone with 'Delete Project' is visible

#### 6.2. should rename a project

**File:** `tests/project-settings/rename-project.spec.ts`
**Fixtures:** `testProject`, `runId`

**Steps:**
  1. Navigate to /projects/{testProject.id}/settings
  2. Clear name field and type 'Renamed {runId}'
  3. Click 'Save'
    - expect: Project name updates in sidebar and header

#### 6.3. should add a manager to a project

**File:** `tests/project-settings/project-settings.spec.ts`
**Fixtures:** `testProject`, `testUser`

**Steps:**
  1. Navigate to /projects/{testProject.id}/settings
  2. Click 'Add user'
    - expect: A user selection popup appears
  3. Select testUser
    - expect: The user appears in the Managers section (shown as avatar with `title` attribute)

### 7. Roles

#### 7.1. should not show Settings: Users link in header

**File:** `tests/roles/roles.spec.ts`
**Setup:** Unauthenticated (clear storageState), `testUser`

**Steps:**
  1. Log in as testUser (non-admin)
    - expect: Settings link (`a[href="/settings"]`) is visible in the header
    - expect: Users link (`a[href="/settings/users"]`) is NOT visible

#### 7.2. should deny access to user management page

**File:** `tests/roles/roles.spec.ts`
**Setup:** Unauthenticated (clear storageState), `testUser`

**Steps:**
  1. Log in as testUser
  2. Navigate directly to /settings/users
    - expect: Heading "You are not authorized to edit instance users!" is visible

#### 7.3. should not show Instance Settings or Users in settings sidebar

**File:** `tests/roles/roles.spec.ts`
**Setup:** Unauthenticated (clear storageState), `testUser`

**Steps:**
  1. Log in as testUser
  2. Navigate to /settings/profile
    - expect: Profile, Preferences, Account links are visible
    - expect: "Instance Settings" and "Users" links are NOT visible

#### 7.4. should deny access to a project the user is not a member of

**File:** `tests/roles/roles.spec.ts`
**Setup:** Unauthenticated (clear storageState), `testUser`, `testProject`

**Steps:**
  1. Log in as testUser
  2. Navigate to /projects/{testProject.id}/settings
    - expect: Heading "Project Not Found" is visible

#### 7.5. should allow a project manager to access project settings

**File:** `tests/roles/roles.spec.ts`
**Setup:** Unauthenticated (clear storageState), `testUser`, `testProject`, `api`
**API Seed:** Add testUser as project manager via `api.createProjectManager()`

**Steps:**
  1. Log in as testUser
  2. Navigate to /projects/{testProject.id}/settings
    - expect: "Project Settings" heading is visible
    - expect: Project name input has the correct value
