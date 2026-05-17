# E2E Test — Action Items

- [ ] Add a `teardown` project to clean up seeded test data (users, boards) after test runs
- [ ] Clean up leftover "TC01 Test Board Admin" boards from previous failed test runs
- [ ] Add setup step to create "Project 01" if it doesn't exist (currently assumes it's pre-existing in the DB)
- [ ] Add code coverage reporting for E2E tests
- [ ] Add accessibility tests (axe-core / @axe-core/playwright)
- [ ] Add comments to test files (describe test intent, document non-obvious locator choices)

## Bugs to Report

- [ ] **PM removal UI allows confirmation but silently fails (server rejects with 404)**
  - Steps: Admin → Board 01 → Add user → Search PM → Click "Remove from board" → Confirm "Remove member"
  - Expected: UI should either (a) hide the "Remove from board" button for PMs, or (b) show an error message after the server rejects
  - Actual: The confirmation dialog appears, user clicks "Remove member", the popup closes with no error — PM is still a member
  - Why this is wrong: From a QE perspective, the user performed a destructive action and received no feedback that it failed. This violates the principle of least surprise — the UI should never let a user confirm an action that the server will silently reject. Either prevent the action upfront (hide the button) or surface the error (toast/notification). The current behavior makes it appear as if removal succeeded, requiring the user to manually verify the member list to discover it didn't.
  - Reference: TC12 in `tests/e2e/specs/pm-behavior/pmBehavior.spec.ts` (lines 85-98)
