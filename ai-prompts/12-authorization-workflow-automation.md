# AI Interaction: Authorization Workflow Automation

## Goal

Add a focused E2E authorization workflow that validates read-only board access for a viewer user.

## Prompt Used

> Review the 4ga Boards permission model and existing Playwright helpers. Add a focused authorization E2E test where an admin creates a board and card, creates a second user, adds that user as a board viewer, logs in as the viewer, verifies board and card content is readable, and verifies edit/destructive board and card controls are unavailable. Keep setup and cleanup isolated, update the test plan, and avoid broad permission matrices better suited to API/integration tests.

## AI Output Applied

- Added `tests/e2e/authorization.spec.js`.
- Reused API setup helpers for project, board, list, card, user, and viewer membership setup.
- Updated `TEST_PLAN.md` with `AUTHZ-001` and moved non-member access to follow-up coverage.

## Human Review Notes

- This test covers a high-value security/business-rule path without expanding into a full role matrix.
- The test validates the viewer experience through the UI and keeps backend permission permutations documented as future API/integration coverage.
