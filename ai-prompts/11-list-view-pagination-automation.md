# AI Interaction: List View Pagination Automation

## Goal

Add focused E2E coverage for List View grid pagination without turning the suite into an exhaustive table-control matrix.

## Prompt Used

> Inspect the 4ga Boards List View pagination implementation and existing Playwright page objects. Add a focused test that seeds enough cards to cross the default page size, verifies page 1 and page 2 boundaries, changes the items-per-page control, uses manual page entry, and opens a card from a later page. Keep selectors reusable and update the test plan.

## AI Output Applied

- Added List View pagination selectors to `tests/e2e/pages/BoardPage.js`.
- Added a pagination workflow in `tests/e2e/board-workflow.spec.js`, including the `25 per page` to `50 per page` UI control.
- Updated `TEST_PLAN.md` with `BOARD-010`.

## Human Review Notes

- The test uses API setup to create 26 cards quickly, then validates pagination, page-size changes, and row opening through the UI.
- Broader pagination matrices, page-size permutations, and column visibility combinations are better suited for component or integration tests unless a user-facing regression appears.
