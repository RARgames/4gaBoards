# AI Interaction: Expanded Board Controls Automation

## Goal

Convert the expanded feature inventory into automated Playwright coverage without turning the suite into brittle click-through noise.

## Prompt Used

> The interviewer may expect coverage beyond the first happy-path workflow. Please automate these board features too: board creation with Simple/Kanban/import template selection where practical, card creation and card edit actions on Simple and Kanban boards, top-bar notification/board title/card count/GitHub/member/filter/view controls, board action menu entries, back/project settings navigation, and global user/profile/settings menu entries. Keep selectors maintainable and update the test plan.

## AI Output Reviewed

- Add a dedicated `board-controls.spec.js` instead of overloading the core workflow spec.
- Add a Simple template workflow to `board-workflow.spec.js` so Simple coverage includes card creation, detail editing, movement, reload, and persistence, not only menu exposure.
- Keep page-level selectors in `BoardPage` and `HeaderPage`.
- Use API setup only for prerequisite data such as projects and temporary users.
- Avoid destructive board-delete execution; verify the action is exposed in the menu.
- Treat GitHub as a placeholder feature by opening the connection popup and asserting the `[Not fully implemented]` UI.
- Exercise top-right navigation as real page checks: settings gear, users shortcut, notifications popup/center, every avatar dropdown settings page with page-specific content assertions, and logout.
- Use role/button locators for card rows because inner title elements are duplicated across card and modal views.
- Document import/export, deeper permissions, multi-user, performance, and security as future coverage unless implemented safely in this scope.

## Final Automation Added

- `tests/e2e/board-controls.spec.js`
- Simple template workflow in `tests/e2e/board-workflow.spec.js`
- `tests/e2e/pages/HeaderPage.js`
- Additional `BoardPage` methods for templates, board actions, filters, member assignment, GitHub connection, and profile/header navigation.
- Additional `HeaderPage` methods for popup-scoped user menu items, header title assertions, and notification center access.
- Additional API helpers for temporary user setup and cleanup.

## Verification

```bash
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm e2e:test
```

Result: 15 passed.
