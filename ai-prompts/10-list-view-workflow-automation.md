# AI Interaction: List View Workflow Automation

## Goal

Add focused Playwright coverage for the board List View so the suite proves more than the presence of the view toggle.

## Prompt Used

> Review the existing 4ga Boards Playwright page objects and board workflow tests. Add a focused E2E test for List View that creates isolated test data, switches from Board View to List View, validates the card row includes its list context, filters for the card, opens the card modal from the row, and switches back to Board View. Keep selectors reusable in the page object and update the test plan.

## AI Output Applied

- Added List View table/row selectors to `tests/e2e/pages/BoardPage.js`.
- Added a workflow test in `tests/e2e/board-workflow.spec.js`.
- Updated `TEST_PLAN.md` with the new `BOARD-009` automated scenario.

## Human Review Notes

- The workflow validates an end-user outcome: a user can locate and open work from List View.
- The test intentionally avoids exhaustive table column configuration because those are better covered with lower-level component/integration tests unless specific regressions appear.
