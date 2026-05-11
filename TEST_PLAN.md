# 4ga Boards Playwright E2E Test Plan

## Objective

Validate that the most important 4ga Boards user journeys work against a real local application stack. The suite is focused on end-to-end confidence across authentication, board authoring, templates, card details, card-modal editing, persistence, card movement, board controls, member assignment, filtering, notifications, and navigation through the real frontend, backend, and PostgreSQL database.

## Application Under Test

- Product: 4ga Boards
- Type: Kanban-style project and task management application
- Local URL: `http://localhost:3000`
- Runtime: Docker Compose
- Browser automation: Playwright, Chromium project
- Default user: `demo`
- Default password: `demo`

## Scope

In scope:

- Local username/password authentication.
- Default seeded demo user.
- Viewer authorization: a read-only board member can see board/card content but cannot access edit controls.
- Creating and entering a board inside a project.
- Creating a list on a board.
- Creating a card in a list.
- Adding and saving a card description.
- Verifying card data remains visible after page reload.
- Moving a card between lists through the card modal list selector.
- Creating boards from the `Simple` and `Kanban` templates.
- Completing a card create/edit/move/persistence workflow on a `Simple` template board.
- Opening card edit actions from template-created boards.
- Card modal detail workflow: using the top-right Edit Card action menu to rename the card, assign a card member, apply a label, set a due date, set a timer value, move the card, duplicate it, copy its link, check activity, and delete a disposable card; also adding a description, task, attachment, and comment from the modal body.
- Board top-bar controls: subscription bell, board title, filtered card count, GitHub connection placeholder, member assignment, filter controls, and board/list view switching.
- Board action menu: rename, GitHub connection, export, activity, delete, project settings, and back navigation.
- Global header/profile navigation: settings, users, notifications, notification center, profile/preferences/account/authentication/about/instance settings/users pages, and logout.
- Settings page workflows from the avatar menu: profile contact update/revert; broad preferences coverage across view defaults, list/user table styles, details font, theme shape, compact sidebar, card-modal display toggles, subscription toggles, and notification type checkboxes; account edit validation; API client create/edit/delete; About external-resource verification; instance settings validation/activity; user create/edit/activity/delete; and logout session clearing.
- Notification workflows for high-value user-visible behavior: a subscribed board member receives a task notification from another user's action; disabling the `Task` notification type suppresses that notification; and the user can mark the notification as read from the notification center.
- API-assisted setup and cleanup for reliable, isolated test data.

Out of scope for this initial submission:

- SSO login providers: Google, GitHub, Microsoft, OIDC.
- User registration.
- Board import.
- End-to-end validation of exported board file contents.
- Real-time multi-user collaboration.
- Email notification behavior.
- Exhaustive notification scope matrix across project, board, list, card, task, comment, attachment, user, and instance events.
- Mobile/responsive layout testing.
- Full non-admin permission matrix.
- Full drag-and-drop coverage.

## Test Strategy

The suite uses a hybrid E2E strategy:

- Tests interact with the UI for the behavior being validated.
- API helpers create prerequisite data when the setup itself is not the behavior under test.
- API helpers delete generated projects, users, and API clients after each workflow test to reduce data pollution.
- Cleanup is on by default and can be disabled with `E2E_CLEANUP=false` when debugging a failed run.
- Stale E2E data from interrupted runs can be removed with `pnpm e2e:cleanup`.
- Test data names include timestamps and worker IDs so tests can run repeatedly without collisions.
- Page objects keep repeated selectors and actions maintainable.
- Runs are capped at 2 Playwright workers to preserve Docker app stability while still validating parallel-safe test data.

This keeps the tests fast enough for a take-home submission while still exercising the real app stack.

## Entry Criteria

- Docker Desktop is installed and running.
- 4ga Boards is available at `http://localhost:3000`.
- The database is initialized with the default `demo/demo` user.
- Dependencies are installed with the repository-required versions:
  - Node `^24.11`
  - pnpm `^10.33.0`
- Playwright Chromium browser is installed.

## Exit Criteria

- All automated tests pass locally with:

```bash
pnpm e2e:test
```

- No generated test data remains after workflow tests complete.
- If a run is interrupted or cleanup is intentionally disabled, `pnpm e2e:cleanup` removes stale E2E projects, users, and API clients.
- Any known failures or environment limitations are documented.

## Test Data

| Data | Value / Pattern | Purpose |
| --- | --- | --- |
| Username | `demo` | Default seeded login user |
| Password | `demo` | Default seeded login password |
| Project name | `E2E Project <timestamp> <worker>` | Isolated project container for workflow tests |
| Board name | `E2E Board <timestamp> <worker>` | UI-created board for authoring workflow |
| List name | `Ready <timestamp> <worker>` | UI-created list |
| Card name | `Write smoke test <timestamp> <worker>` | UI-created card |
| Description | `Created by Playwright at <ISO timestamp>` or `Card modal description <timestamp>` | Persistence and modal edit checks |
| Secondary user | `E2E User <timestamp><worker>` | Temporary user for member assignment workflow |
| Notification watcher | `E2E watcher <timestamp><worker>` | Disposable user subscribed to a board for notification delivery checks |
| Notification actor | `E2E actor <timestamp><worker>` | Disposable user who performs the action that should notify the watcher |
| Settings user | `E2E User <timestamp><worker>` | Disposable user created, edited, and deleted through Users settings |
| API client | `E2E API Client <timestamp> <worker>` | Disposable API client created, edited, revealed, and deleted through Authentication settings |
| Attachment | `tests/e2e/fixtures/card-attachment.txt` | Small dummy file uploaded through the card modal |

## Automated Test Cases

| ID | Feature | Priority | Scenario | Steps | Expected Result | File |
| --- | --- | --- | --- | --- | --- | --- |
| AUTH-001 | Authentication | High | Invalid login shows validation feedback | Open `/login`; enter `demo` with an invalid password; submit | User remains on login page and sees `Invalid username or password` | `tests/e2e/auth.spec.js` |
| AUTH-002 | Authentication | High | Default user can log in | Open `/login`; enter `demo/demo`; submit | User leaves `/login` and dashboard actions are available | `tests/e2e/auth.spec.js` |
| AUTHZ-001 | Authorization | High | Viewer can read a board but cannot edit board or card content | Admin creates an isolated project, board, list, card, and disposable viewer user; admin adds viewer to the board with `viewer` permission; log in as viewer; open the board; verify board/list/card/description are visible; verify add-list/add-card/project-settings, board rename/export/delete, and card edit/member/label/task/attachment/delete actions are unavailable | Viewer gets read-only access to board and card content while edit/destructive controls are hidden | `tests/e2e/authorization.spec.js` |
| BOARD-001 | Board authoring | High | User can create a board, list, card, and description | Create isolated project through API; open project; create board through UI; create list through UI; create card through UI; open card; add description | Board workspace is usable, list and card appear, and description is saved | `tests/e2e/board-workflow.spec.js` |
| BOARD-002 | Persistence | High | Card details persist after reload | Continue from BOARD-001; reload the page while card modal is open | Card modal remains usable and saved description is still visible | `tests/e2e/board-workflow.spec.js` |
| BOARD-003 | Board creation options | High | Add-board flow exposes board name, templates, and import choices | Open add-board popup; verify name field; open template dropdown; verify `Simple` and `Kanban`; open import step; verify 4ga Boards and Trello import sources | Board creation options are discoverable without submitting invalid data | `tests/e2e/board-controls.spec.js` |
| BOARD-004 | Board templates | High | Simple template creates expected starting lists and supports card edit actions | Create isolated project; add board with `Simple` template; verify template lists; add a card; open card edit menu | `Open`, `Todo`, `In Progress`, and `Done` lists are visible; edit/move/duplicate/delete card actions are available | `tests/e2e/board-controls.spec.js` |
| BOARD-005 | Board templates | High | Kanban template creates expected starting lists and supports richer card edit actions | Create board with `Kanban` template; verify the visible Kanban-specific lists; add a card; open card edit menu | `Open`, `Todo`, `In Progress`, and `To Test` lists are visible; label, due date, and activity actions are available | `tests/e2e/board-controls.spec.js` |
| BOARD-006 | Board top bar | High | Board top bar exposes member, filter, GitHub, and view controls | Create board/list/card; open GitHub connection UI; add a temporary user as viewer; filter for the card; open member/label/notification/due-date filters; switch to list view and back | Controls are visible and usable; filtered count updates; list/board view toggle works | `tests/e2e/board-controls.spec.js` |
| BOARD-007 | Board actions | Medium | Board action menu exposes project and board management actions | Create a board; open board action menu; assert rename, GitHub connection, export, activity, delete; navigate back to project | Board menu actions are available and back navigation returns to the project page | `tests/e2e/board-controls.spec.js` |
| BOARD-008 | Simple board workflow | High | User can create and progress a card on a Simple template board | Create isolated project; create board from `Simple` template; verify the starting `Open` and `Todo` lanes; create a card; add description; move card from `Open` to `Todo`; reload | Simple board creation supports card authoring; card details persist; card remains in `Todo` after reload | `tests/e2e/board-workflow.spec.js` |
| BOARD-009 | List view workflow | High | User can find and open a card from List View | Create isolated project, board, list, and card; switch to List View; verify table columns and card row with list context; filter for the card; open the card from the row; return to Board View | List View exposes the card as actionable table data, filtering keeps the correct result, card modal opens from the row, and Board View still shows the card | `tests/e2e/board-workflow.spec.js` |
| BOARD-010 | List view pagination | Medium | User can paginate grid rows, change items per page, and open a card from a later page | Seed 26 cards through API; open the board; switch to List View; verify page 1 shows the first card and hides the 26th; go to page 2; verify the 26th card; enter page `1`; change items per page from `25` to `50`; verify all cards fit on one page; change back to `25`; return to page 2 and open the 26th card | Pagination boundaries, next-page navigation, manual page entry, page-size selection, and card opening from a later page work as expected | `tests/e2e/board-workflow.spec.js` |
| NAV-001 | Global navigation | Medium | Header and profile menu expose top-right destinations | Verify settings/users/notifications buttons; open Settings and Users from header; navigate to notification center; open avatar dropdown; verify profile, preferences, account, authentication, about, instance settings, users, logout; log out | Header shortcuts route correctly, dropdown inventory is complete, notification center route is reachable, and logout returns to `/login` | `tests/e2e/board-controls.spec.js` |
| SETTINGS-001 | Profile settings | High | User can update profile contact fields and see persistence | Open Profile from avatar dropdown; update phone and organization; save; reload; cleanup through API | Saved profile contact fields persist after reload and are restored after the test | `tests/e2e/settings-workflow.spec.js` |
| SETTINGS-002 | Preferences settings | High | User can change and restore dense preference options | Open Preferences from avatar dropdown; change Default View, List View Style, Users Settings Style, Preferred Details Font, and Theme Shape; toggle Compact Sidebar, Hide Card Modal Activity, Hide Closest Due Date, Subscribe to my own cards, Subscribe to new boards, Subscribe to new projects, Subscribe to users notifications, Subscribe to instance notifications; toggle a Notification Types checkbox; reload; cleanup through API | Dropdown, shape, display, subscription, and notification-type preferences update in the UI, persist through reload, and are restored after the test | `tests/e2e/settings-workflow.spec.js` |
| SETTINGS-003 | Preferences behavior | High | High-value preferences affect downstream product behavior | Set Default View to `list`, Compact Sidebar to enabled, and Hide Card Modal Activity to enabled; open a disposable board; verify list view opens by default and sidebar is narrower; open a disposable card modal | Selected preferences change visible board/card behavior, not only table state | `tests/e2e/settings-workflow.spec.js` |
| SETTINGS-004 | Account settings | Medium | Username and email edit forms reject invalid input safely | Open Account from avatar dropdown; submit invalid username; submit invalid email | Invalid fields retain focus and the seeded demo username/email are not mutated | `tests/e2e/settings-workflow.spec.js` |
| SETTINGS-005 | Authentication settings | High | User can manage API clients end to end | Open Authentication from avatar dropdown; generate API client with all permissions; verify secret reveal; reload; edit API client name; delete it | API client is created, visible in the list, editable, and removable without leaving test data | `tests/e2e/settings-workflow.spec.js` |
| SETTINGS-006 | About settings | Low | About page exposes version and external product resources | Open About from avatar dropdown; verify version/latest-version area; verify Documentation and GitHub links | Product metadata and external resource URLs are present without navigating away from the app tab | `tests/e2e/settings-workflow.spec.js` |
| SETTINGS-007 | Instance settings | Medium | Instance settings validate domain input and expose activity | Open Instance Settings from avatar dropdown; enter invalid allowed-registration domain; press Enter; open activity | Invalid domain input is not accepted; activity popup is reachable | `tests/e2e/settings-workflow.spec.js` |
| SETTINGS-008 | Users settings | High | Admin can create a user, validate login, edit, audit, and delete the user | Open Users from avatar dropdown; add disposable user; log in with the new username/password through the real login page; return as admin; edit information; open user activity; delete the user | User is created, can authenticate with its credentials, is renamed, activity is reachable, and user is deleted/cleaned up | `tests/e2e/settings-workflow.spec.js` |
| SETTINGS-009 | Logout | High | Logout clears the authenticated route | Open avatar dropdown; log out; attempt to open settings route; log back in | User returns to `/login`; protected settings route redirects to login; default credentials still authenticate | `tests/e2e/settings-workflow.spec.js` |
| NOTIF-001 | Notifications | High | Subscribed user receives a task notification caused by another user | Create watcher and actor users; enable watcher task notifications and board subscription; actor creates a task on a shared board; watcher opens notification center | Notification is created through the real backend pipeline and the task activity is visible in the UI | `tests/e2e/notifications.spec.js` |
| NOTIF-002 | Notifications | High | Disabled task notification type suppresses task notification delivery | Create watcher and actor users; remove `Task` from watcher notification types; actor creates a task on a shared board; watcher opens notification center | No notification is created for that task and the task text is not visible in the notification center | `tests/e2e/notifications.spec.js` |
| NOTIF-003 | Notifications | High | User can mark a notification as read from notification center | Create a task notification for the watcher; open notification center; click `Mark as read` on the notification row | Notification `isRead` becomes true and the row changes to offer `Mark as unread` | `tests/e2e/notifications.spec.js` |
| CARD-001 | Card movement | High | User can move a card between lists | Create isolated project through API; create board, two lists, and a card through UI; open card; change list from card modal; reload | Card modal shows the target list before and after reload | `tests/e2e/board-workflow.spec.js` |
| CARD-002 | Card modal details | High | User can complete card edit workflows from the modal | Create project/board/list through API; add temporary board member and label; create card through UI; open card; use the Edit Card menu to rename, assign member, apply label, save default due date, set timer to `00:03`, move to another list, duplicate, copy link, check activity, and delete a disposable card; add description, task, dummy attachment, and comment from the modal body | Card menu actions mutate the card as expected; each card-modal section reflects the saved value in the UI; deleted card disappears from the board | `tests/e2e/card-modal.spec.js` |

## Negative Test Coverage

Automated in this submission:

| ID | Feature | Scenario | Expected Result | Status |
| --- | --- | --- | --- | --- |
| NEG-AUTH-001 | Authentication | Login with valid username and invalid password | User is not authenticated and sees an error message | Automated as `AUTH-001` |
| NEG-AUTH-002 | Authentication | Submit login with empty username | Username field is focused or marked invalid; user remains on login page | Automated in `tests/e2e/validation.spec.js` |
| NEG-AUTH-003 | Authentication | Submit login with empty password | Password field is focused or marked invalid; user remains on login page | Automated in `tests/e2e/validation.spec.js` |
| NEG-BOARD-001 | Board creation | Attempt to create a board with an empty name | Board is not created; name field remains active/invalid | Automated in `tests/e2e/validation.spec.js` |
| NEG-LIST-001 | List creation | Attempt to create a list with an empty name | List is not created; list name field remains active/invalid | Automated in `tests/e2e/validation.spec.js` |
| NEG-CARD-001 | Card creation | Attempt to create a card with an empty name | Card is not created; card input remains active/invalid | Automated in `tests/e2e/validation.spec.js` |
| NEG-ACCOUNT-001 | Account settings | Submit an invalid username from the Account edit popup | Invalid username is rejected client-side and the demo account is not changed | Automated in `tests/e2e/settings-workflow.spec.js` |
| NEG-ACCOUNT-002 | Account settings | Submit an invalid email from the Account edit popup | Invalid email is rejected client-side and the demo account is not changed | Automated in `tests/e2e/settings-workflow.spec.js` |
| NEG-INSTANCE-001 | Instance settings | Submit an invalid allowed-registration domain | Invalid domain remains focused and is not persisted | Automated in `tests/e2e/settings-workflow.spec.js` |
| NEG-NOTIF-001 | Notifications | Disable the `Task` notification type, then trigger a task event from another user | Task notification is not created or shown to the subscribed watcher | Automated in `tests/e2e/notifications.spec.js` |
| NEG-AUTHZ-001 | Authorization | Log in as a board viewer and attempt to find edit/destructive board and card controls | Viewer can read board/card content but edit/destructive controls are unavailable | Automated in `tests/e2e/authorization.spec.js` |

Recommended next negative tests:

| ID | Feature | Scenario | Expected Result | Priority |
| --- | --- | --- | --- | --- |
| NEG-CARD-002 | Card movement | Try to move a card to a deleted or unavailable list through API setup | App rejects or recovers gracefully without corrupting card state | Low |
| NEG-AUTHZ-002 | Authorization | Use a non-member user to access a private board | User cannot view or mutate board data | Medium, useful follow-up after viewer-role coverage |

I automated the practical negative cases that fit the selected authentication, board/card, settings, and notification workflows. The remaining negative cases require additional user/permission setup or lower-level API fault injection, so they are documented as follow-up coverage rather than included in the first suite.

## Notification Coverage Placement

Notification coverage is intentionally split by test layer:

- Playwright E2E should cover the user-visible contract: a meaningful product action creates a visible notification, a high-value preference suppresses it, and the user can change read state from the notification center. That is what `tests/e2e/notifications.spec.js` now covers.
- API/integration tests should cover the exhaustive event matrix: project, board, list, card, task, comment, attachment, user, and instance scopes; creator exclusion; board and card subscription rules; deleted entity behavior; notification filtering; and read/delete bulk actions.
- Unit tests should cover pure preference and selector logic: `notificationTypes`, `emailNotificationsTypes`, subscription defaults, unread-count selectors, notification-center filters, and activity-message rendering/truncation.
- Email notification delivery should be tested below Playwright with service-level tests or mocked mail-provider integration tests. Browser E2E should not depend on real email delivery because it is slower, flaky in local Docker, and mostly validates infrastructure rather than core UI behavior.

This gives the take-home strong E2E signal without forcing Playwright to own every notification permutation.

## Manual Exploratory Test Ideas

These are useful follow-ups if more time is available:

- Drag a card between lists using the board drag-and-drop interaction.
- Rename a card from the board view and from the card modal.
- Delete a card and confirm it no longer appears after reload.
- Import a board and validate imported lists/cards.
- Export a board and validate the downloaded file contents.
- Collapse and expand a list.
- Edit or delete labels, members, tasks, attachments, and comments after creation.
- Verify logout clears the session.
- Check notification filters/search against multiple notification types.
- Exercise non-admin member permissions across viewer/editor/manager roles.
- Multi-user realtime behavior: two browser contexts editing the same board and verifying updates propagate.
- Performance smoke: measure board load time with many lists/cards and establish a practical threshold.
- Security smoke: unauthorized board access, basic stored-XSS checks in card names/descriptions, and GitHub repo input validation.
- Test behavior when the backend is unavailable or network connection drops.

## Risks And Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| App is not running before tests start | All tests fail with connection refused | Document Docker startup and require `curl -I http://localhost:3000/login` before running |
| Duplicate visible text in sidebar, board, and modal | Playwright strict mode failures | Use page objects and scoped locators such as placeholders, roles, and stable title/name attributes |
| Repeated controls in template lists | Tests click the wrong list/card control | Target interactive role buttons and wait for created cards before opening them |
| Drag-and-drop can be flaky in browser automation | False negatives for card movement | Initial automated movement test uses the card modal list selector; drag-and-drop remains a manual/future test |
| Test data pollution | Later runs become noisy or flaky | Generate unique names and clean up created projects in `finally` blocks |
| Interrupted run leaves E2E data behind | Dashboard, notification counts, or user tables become noisy | Keep cleanup enabled by default and use `pnpm e2e:cleanup` to remove stale `E2E ...` projects, `e2e-...@example.test` users, and `E2E API Client ...` records |
| Parallel workers share the seeded demo user | Potential cross-test noise from global notifications or shared account state | Keep projects/users unique, avoid relying on global counts, and clean up generated projects/users |
| Too many browser workers overload local Docker | Timeouts unrelated to product behavior | Cap Playwright workers at 2 |
| Environment mismatch | Dependency install fails | Document required Node and pnpm versions |
| Slow Docker startup | Tests start before app is ready | Manually verify app health before running; future improvement could add a Playwright `webServer` or health-check script |

## Maintainability Notes

- Page objects live in `tests/e2e/pages`.
- API setup helpers live in `tests/e2e/helpers/boardsApi.js`.
- Tests avoid fixed sleeps and rely on Playwright auto-waiting plus explicit assertions.
- Selectors prefer user-facing roles/placeholders/text first, then stable product attributes when app markup is ambiguous.
- The expanded board-control tests intentionally verify breadth of high-value controls without performing destructive actions such as deleting the active board.
- Preferences coverage is intentionally layered: most preferences are tested for UI state change and persistence, while high-impact display/navigation preferences and the `Task` notification type get downstream behavior assertions. Repeating full behavior checks for every notification subscription toggle would add brittle setup and low signal, so the rest of the notification matrix belongs in API/integration tests.
- I did not automate downstream behavior for every preferences toggle in Playwright. The suite verifies broad toggle state and persistence, then validates selected high-value behaviors end to end; exhaustive toggle permutations belong in unit/API/integration tests where they are faster and less flaky.

## How To Run

Start the app:

```bash
docker compose up -d
```

Confirm it responds:

```bash
curl -I http://localhost:3000/login
```

Install Playwright Chromium:

```bash
pnpm e2e:install
```

Run all E2E tests:

```bash
pnpm e2e:test
```

Keep generated data for debugging:

```bash
E2E_CLEANUP=false pnpm e2e:test
```

Clean stale E2E data from interrupted or debug runs:

```bash
pnpm e2e:cleanup
```

Run with the Playwright UI:

```bash
pnpm e2e:ui
```

Run one workflow file in headed mode:

```bash
pnpm exec playwright test tests/e2e/board-workflow.spec.js --headed --slow-mo=500
```

Use a non-default app URL:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm e2e:test
```

## Future Improvements

- Add a project-level health check so Playwright waits for the app automatically.
- Add a dedicated cleanup script for interrupted runs.
- Add `data-testid` attributes to high-value UI controls if the product team accepts testability changes.
- Add a drag-and-drop test once a stable interaction strategy is confirmed.
- Add visual or accessibility checks for the core board page.
- For larger feature expansion, introduce the repo-local skill drafts in `ai-skills/` or equivalent MCP integrations for browser inspection, CI failure triage, API exploration, performance analysis, and security test planning.
