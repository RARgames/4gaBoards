---
name: qa-api-exploration
description: Explore application APIs to support reliable E2E test setup, teardown, and state verification. Use when Codex needs to inspect routes/controllers, create API helpers, seed test data, clean up generated entities, or verify backend state after UI actions.
---

# QA API Exploration

## Workflow

1. Locate route definitions and client API wrappers.
2. Identify the minimum endpoints needed for setup, cleanup, and verification.
3. Prefer API setup only when the setup itself is not the behavior under test.
4. Keep the important user journey in the UI.
5. Generate unique test data to avoid collisions.
6. Clean up created data in `finally` blocks.
7. Fail fast on non-2xx API responses with useful response details.
8. Avoid depending on private or unstable endpoints unless documented.

## Helper Pattern

Create helpers for:

- Login/token creation
- Auth headers or cookies
- Project/board/list/card setup
- Cleanup
- Backend state verification

## Guardrails

- Do not use API helpers to bypass the actual behavior under test.
- Do not leave created test data behind.
- Do not silently ignore failed cleanup unless the risk is documented.
