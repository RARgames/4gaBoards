# E2E Testing Patterns - 4ga Boards

> **Navigation:** [Submission Overview](submission.md) · [Test Plan](tests/test-plan.plan.md) · [Playwright Config](playwright.config.ts)

## Project Structure
- Tests live in: `e2e-tests/`
- Page objects: `e2e-tests/pages/` (`BoardViewPage.ts`, `CardModalPage.ts`, `LoginPage.ts`)
- Helpers: `e2e-tests/helpers/` (`api-client.ts`, `auth.ts`)
- Fixtures: `e2e-tests/fixtures/index.ts`
- Test files: `e2e-tests/tests/{category}/` (auth, projects, boards, board-view, card-modal, project-settings)
- Config: `e2e-tests/playwright.config.ts`
- Base URL: `http://localhost:3000` (set in `.env`, config defaults to 1337)
- Auth state stored in: `e2e-tests/auth-state/user.json` (admin session from global-setup)
- Test plan: `e2e-tests/tests/test-plan.plan.md`

## Critical Gotchas (learned the hard way)
- **`page.locator('dialog')` matches `<dialog>` HTML tag only** — popups use `role="dialog"` so use `page.getByRole('dialog')` instead
- **Duplicate elements everywhere** — project links appear in sidebar AND main content; always use `.first()` on `a[href="/projects/..."]`
- **Logout test breaks parallel tests** — must use `storageState: { cookies: [], origins: [] }` and log in fresh within the test
- **User avatar button** — use `button[title="Profile and Settings"]`, NOT `button:has-text("DD")` (matches other buttons containing those letters)
- **Add Manager popup auto-closes** after selecting a user — don't try to click Close
- **Managers shown as avatars** with `title` attribute, not full text — assert with `[title="User Name"]`
- **`count()` doesn't wait** — use `await expect(locator.first()).toBeVisible()` before counting
- **Dropdown popups** (e.g., project selector in Add Board) open as a separate `dialog` — use `page.getByRole('dialog').last()` to target the dropdown options

## DOM Patterns — General
- CSS modules with hashes: `ComponentName_propertyName__hash` (e.g., `CardModal_wrapper__abc12`)
- Use `[class*="ComponentName_propertyName"]` to match regardless of hash
- Input fields: `name` attribute (e.g., `input[name="emailOrUsername"]`)
- No `data-testid` attributes anywhere — rely on `data-rbd-*`, `title`, URL patterns, and CSS module prefixes

### Selector Strategy by UI Area

#### Board View (Kanban)
- **List**: `[data-rbd-draggable-id="list:{listId}"]` — scope all list operations within this
- **Card**: `[data-rbd-draggable-id="card:{cardId}"]`
- **Board (sidebar)**: `[data-rbd-draggable-id="{boardId}"]` (no prefix)
- "Add card" button: 2 per list; use `list(listId).getByRole('button', { name: 'Add card' }).first()`
- Add card form input: `page.getByPlaceholder('Enter card name...')`
- Card count: text within list matching `/\d+ cards?/`
- Collapse/Expand: `button[title="Collapse List"]` / `button[title="Expand List"]` (not getByRole — drag handle wrapper also matches)
- Filter input: `page.getByPlaceholder('Filter cards...')`
- View toggle: `button[title="Switch to List View"]` / `button[title="Switch to Board View"]`
- Filter popups: `button[title="Filter By Labels"]`, `button[title="Filter By Members"]`, `button[title="Filter by Due Date"]`
- Page object: `BoardViewPage.ts`

#### Card Modal
- **Container**: `[class*="CardModal_wrapper"]`
- **Navigate directly**: `page.goto(\`/cards/${cardId}\`)`
- **Card title selector**: Use `[class*="CardModal_headerTitle__"]` (with trailing `__`) to avoid matching `CardModal_headerTitleWrapper`
- **List name display**: `[class*="CardModal_headerListField"]` — clickable to open move-card popup
- **Move card popup**: clicking list field opens a `dialog` listing all lists as clickable items
- **Sections** (Description, Tasks, Attachments, Comments): each wrapped in `[class*="CardModal_moduleContainer"]`
  - Scope by section text: `.filter({ hasText: 'Description' })` etc.
- **All action buttons use `title` attribute** (no text content, just icons):
  - `button[title="Subscribe"]` / `button[title="Unsubscribe"]`
  - `button[title="Delete Card"]`, `button[title="Edit Card"]`, `button[title="Close Card"]`
  - `button[title="Add Member"]`, `button[title="Add Label"]`, `button[title="Add Due Date"]`
  - `button[title="Edit Timer"]`, `button[title="Start Timer"]` / `button[title="Stop Timer"]`
  - `button[title="Edit Description"]`, `button[title="Toggle Description"]`
  - `button[title="Add Task"]`, `button[title="Toggle Tasks"]`
  - `button[title="Add Attachment"]`, `button[title="Toggle Attachments"]`
  - `button[title="Add comment"]`, `button[title="Toggle Comments"]`
- **Duplicate buttons**: Description, Tasks, Attachments, Comments each have TWO buttons with same `title` — icon button + body button. Use `.first()`.
- **Delete Card confirmation**: opens popup with "Are you sure you want to delete this card?" and `button "Delete card"` (lowercase 'c')
- **Timer**: `button[title="Start Timer"]` shows "00:00", changes to `button[title="Stop Timer"]` when running
- **Description editor**: markdown textarea `textarea.w-md-editor-text-input`, save with `button[title="Save"]`
- **Task input**: `textarea` with placeholder `"Enter task description..."`, submit on Enter
- **Comment editor**: `textarea.w-md-editor-text-input` (same as description), `button[title="Save"]` to submit
- Page object: `CardModalPage.ts`

#### Popup Interactions (Add Member, Add Label, Add Due Date)
- **Common structure**: `[class*="Popup_popup"]` with `role="dialog"`, use `page.getByRole('dialog')`
- **Header text**: `[class*="PopupHeader_content"]` (not `PopupHeader` which matches wrapper too)
- **Close button**: `button[title="Close"]`
- **Add Member**: header "Members", `input[placeholder="Search members..."]`, member buttons with `title="User Name"`
- **Add Label**: header "Labels", label items `[class*="Item_name"][title="LabelName"]` — click to toggle
- **Add Due Date**: header "Due Date", `input[name="date"]`, date format `DD.MM.YYYY`, `button[title="Save"]`

#### Login Page (`/login`)
- Username: `input[name="emailOrUsername"]`
- Password: `input[name="password"]`
- Submit: `button:has-text("Log in")`
- Invalid login error: `page.getByText('Invalid username or password')`
- Test credentials: demo / demo

#### Dashboard / Sidebar
- **Project links**: `a[href="/projects/{projectId}"]` — appears in BOTH sidebar and main content, use `.first()`
- **Board links**: `a[href="/boards/{boardId}"]`
- **Filter input**: `page.getByPlaceholder('Filter projects...')` (on dashboard) or `'Filter boards...'` (on project page)
- **Add Project**: opens dialog with `textbox "Enter project name..."` + `button "Add Project"`
- **Add Board**: opens dialog with `textbox "Enter board name..."`, project dropdown (`getByPlaceholder('Select project')`), `button "Add Board"`
- **User menu**: `button[title="Profile and Settings"]` → opens `dialog` with `button "Log Out"`, Profile, Preferences, etc.

#### Project Settings (`/projects/{id}/settings`)
- **Heading**: `h2` "Project Settings"
- **Name input**: `page.getByPlaceholder('Enter project name...')`
- **Save button**: `button "Save"` (disabled when unchanged)
- **Managers**: shown as avatars with `title="User Name"`, `button[title="Add user"]`
- **Add Manager popup**: `dialog` with header "Add Manager", `textbox "Search users..."`, user buttons — auto-closes after selection
- **Background swatches**: `[class*="BackgroundPane_gradientButton"]` buttons
- **Danger Zone**: `h4` "Danger Zone", `button "Delete Project"`

## Test Data Strategy: API-First, UI Only for the Test Path

**Core principle: UI is only used when testing the specific UI path. Everything else is set up and torn down via the API client.**

### Playwright Fixtures (`fixtures/index.ts`)
- `runId` — unique 6-digit hex per test
- `api` — authenticated `ApiClient` instance (admin)
- `testProject` — API-created project, auto-deleted in teardown (cascades)
- `testBoard` — inside `testProject`
- `testList` — inside `testBoard`
- `testCard` — inside `testList`
- `testUser` — non-admin user, auto-deleted in teardown
- `testUserApi` — authenticated API client for `testUser`
- Tests declare only what they need; fixture chain creates parents automatically

### Auth Tests
- Must clear storageState: `test.use({ storageState: { cookies: [], origins: [] } });`
- Logout test MUST use cleared storageState + login within the test to avoid breaking parallel tests

### Cleanup
- Primary: fixture teardown deletes `testProject` (cascade deletes everything)
- UI-created resources (e.g., create project test): clean up via API in test body
- Never leave test-generated data behind

## Role-Based Permission Boundaries
- **Non-admin header**: has `a[href="/settings"]` but NOT `a[href="/settings/users"]`
- **Non-admin settings sidebar**: Profile, Preferences, Account, Authentication, About — NO "Instance Settings" or "Users"
- **Non-admin navigates to `/settings/users`**: shows `h1 "You are not authorized to edit instance users!"`
- **Non-member navigates to another user's project**: shows `h1 "Project Not Found"`
- **Manager CAN access their project's settings**: shows "Project Settings" heading + name input
- **Role tests use cleared storageState** + `loginAs()` helper — prevents interference with admin session
- Tests create `testUser` via fixture, optionally add as project manager via `api.createProjectManager()`

## Current Test Suite (47 tests)
- Auth: login, invalid login, logout (3)
- API client smoke tests (7)
- Projects: view, filter, create, add board (4)
- Boards: view, create, subscribe (3)
- Board View: kanban view, toggle view, filter by text/labels/members/due date, collapse/expand, add list, add card (9)
- Card Modal: view, close, add member/label/due date/task/comment, subscribe, delete, description, timer, move card (12)
- Project Settings: view, rename, add manager (3)
- Roles: non-admin header, user management denied, settings sidebar, project access denied, manager access (5)
- Seed test (1)
