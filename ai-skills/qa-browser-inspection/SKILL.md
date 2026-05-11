---
name: qa-browser-inspection
description: Inspect a web application's real browser UI to support Playwright E2E automation. Use when Codex needs to explore local UI states, identify stable locators, review screenshots/traces, debug strict-mode selector failures, or verify that a user workflow is automatable.
---

# QA Browser Inspection

## Workflow

1. Confirm the app URL, required login state, and target workflow.
2. Open the relevant page in a real browser or Playwright debug session.
3. Inspect user-visible controls first: roles, labels, placeholders, text, and titles.
4. Prefer selectors in this order:
   - `getByRole`
   - `getByLabel`
   - `getByPlaceholder`
   - `getByText` with strict scoping
   - stable product attributes such as `data-testid`, `name`, or `title`
5. Avoid generated CSS module classes, DOM depth selectors, and arbitrary waits.
6. When Playwright strict mode fails, identify every matching element and narrow by role, visible text, container, or page object method.
7. Capture the debugging decision in the relevant test or AI notes if it changes the automation strategy.

## Output

Produce one or more of:

- A proposed Playwright locator.
- A short explanation of why that locator is stable.
- A note about ambiguous UI markup.
- A recommendation for adding `data-testid` only when user-facing selectors are not reliable.
