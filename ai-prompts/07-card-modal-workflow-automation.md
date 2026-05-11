# AI Interaction: Card Modal Workflow Automation

## Goal

Expand the E2E suite to cover the rich card modal shown in the screenshot: the top-right Edit Card action menu, member assignment, label, due date, timer, description, tasks, attachments, and comments.

## Prompt Used

> When clicking on a card, it opens a detailed card page/modal with many buttons. Include an end-to-end workflow where a user verifies the 3-dot Edit Card action menu, assigns the card to a member, adds a label, due date, timer, description, tasks, attachments with a dummy fixture, and comments.

## AI Output Reviewed

- Add a dedicated card-modal spec instead of expanding the existing board workflow test.
- Use API setup for project, board, list, and temporary board member so the E2E time is spent on card-modal behavior.
- Add a `CardModalPage` page object for modal-specific selectors and workflows.
- Exercise the full Edit Card menu as workflows: rename, edit members, edit labels, edit due date, edit timer, move card, duplicate card, copy link, check activity, and delete a disposable card.
- Add a safe text fixture at `tests/e2e/fixtures/card-attachment.txt`.
- Use the timer edit UI to set a deterministic `00:03` timer instead of relying on a running clock.
- Seed prerequisite board labels with the API, then apply them through the UI to avoid testing label creation and label application in the same crowded popup flow.

## Final Automation Added

- `tests/e2e/card-modal.spec.js`
- `tests/e2e/pages/CardModalPage.js`
- `tests/e2e/fixtures/card-attachment.txt`
- `createBoardMembership` and `createLabel` API helpers for reliable member and label setup.

## Verification

```bash
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm exec playwright test tests/e2e/card-modal.spec.js --project=chromium --workers=1
```

Result: 1 passed.
