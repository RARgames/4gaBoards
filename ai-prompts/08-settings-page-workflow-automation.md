# AI Interaction: Settings Page Workflow Automation

## Goal

Convert the top-right avatar dropdown coverage from simple route checks into real page workflows for Profile, Preferences, Account, Authentication, About, Instance Settings, Users, and Logout.

## Prompt Used

> Most top right corner has User profile, Users, notifications, and user logo dropdown pages. Not just click on them. Include an E2E workflow for each of these pages.

## AI Output Reviewed

- Keep the existing board-controls navigation test for route/menu inventory.
- Add a dedicated settings workflow spec so each settings destination has a practical workflow.
- Use the avatar menu as the entry point for each page to match the user journey.
- Use UI interactions for the behavior under test:
  - Profile: update contact fields and verify persistence.
  - Preferences: exercise the dense settings table, including default view, list/user table styles, preferred details font, theme shape, compact sidebar, card-modal display toggles, board/project/user/instance subscription toggles, and notification type checkboxes.
  - Account: validate invalid username/email inputs without mutating the demo account.
  - Authentication: generate, reveal, edit, and delete an API client.
  - About: validate version/resource links without depending on external network loading.
  - Instance Settings: validate invalid allowed-registration domain input and open activity.
  - Users: create, edit, inspect activity for, and delete a disposable user.
  - Logout: verify protected settings routes redirect after logout.
- Add cleanup helpers for API clients, users, and user preferences so interrupted runs do not leave E2E data behind.
- Add downstream behavior checks for the highest-value preferences: default board view, compact sidebar, and hidden card-modal activity.
- Keep the rest of the preference toggles at UI-state and persistence level because behavior-testing every subscription toggle would require heavier notification-generation setup with lower take-home value.

## Final Automation Added

- `tests/e2e/settings-workflow.spec.js`
- `tests/e2e/pages/SettingsPage.js`
- `getCurrentUser`, `getUsers`, `updateUser`, `getUserPrefs`, `updateUserPrefs`, `getApiClients`, and `deleteApiClient` API helpers.

## Verification

```bash
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm exec playwright test tests/e2e/settings-workflow.spec.js --project=chromium --workers=1
```

Result: 8 passed.
