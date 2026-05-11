# AI Interaction: Playwright Implementation

## Prompt

Implement robust Playwright tests for 4ga Boards using accessible selectors where possible. Use API setup only to reduce brittle UI setup, and avoid arbitrary sleeps.

## Useful AI Output

- Use `getByRole`, `getByPlaceholder`, and exact visible text for most UI interactions.
- Use `/api/access-tokens` to get a token for setup and cleanup.
- Set `accessToken` and `accessTokenVersion` cookies to skip login in workflow tests.
- Create data through API helpers when the test focus is not data setup.

## Human Decision

I kept login as a true UI test, then used API helpers for workflow setup and cleanup. The main board-authoring test still creates board, list, card, and description through the UI.
