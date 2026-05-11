# AI Interaction: Notification Workflow Automation

## User Request

> Where should the notification test be if not in Playwright?
> Include those good E2E Playwright scenarios for me. Add an explanation where the rest of the coverage should be in the Test Plan.

## AI-Assisted Plan

- Keep Playwright focused on high-value user-visible notification behavior, not the entire notification matrix.
- Use API setup for users, project, board, list, and card so the browser time is spent validating notification behavior.
- Create two disposable users:
  - watcher: subscribed to the board and configured with notification preferences
  - actor: performs the task action that should notify the watcher
- Automate three scenarios:
  - Task notification is delivered to a subscribed watcher when another user creates a task.
  - Task notification is not delivered when the watcher disables the `Task` notification type.
  - A delivered task notification can be marked as read from the notification center.
- Update the test plan to explain that the exhaustive notification scope matrix belongs in API/integration/unit coverage.

## Implementation Notes

- Added task and notification API helpers to `tests/e2e/helpers/boardsApi.js`.
- Added focused Playwright coverage in `tests/e2e/notifications.spec.js`.
- Kept task names short because the notification UI truncates long activity values.
- Verified notification creation and read state through API polling, while still asserting the browser-visible notification center behavior.

## Result

```bash
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm exec playwright test tests/e2e/notifications.spec.js --project=chromium --workers=1
```

Result: `3 passed`.
