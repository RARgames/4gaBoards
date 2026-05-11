---
name: qa-ci-triage
description: Triage failed Playwright, CI, or E2E test runs. Use when Codex needs to read test output, screenshots, traces, videos, or CI logs; identify the likely root cause; separate app failures from test flakiness; and recommend targeted fixes.
---

# QA CI Triage

## Workflow

1. Start with the first failing test and the earliest meaningful error.
2. Group failures by root cause instead of listing every symptom.
3. Check whether the app was reachable before debugging selectors.
4. Use screenshots, traces, and error-context files to confirm the UI state at failure.
5. Classify the failure:
   - Environment or service unavailable
   - Test data/setup issue
   - Selector ambiguity
   - Timing/loading issue
   - Product regression
   - Actual assertion mismatch
6. Recommend the smallest fix that addresses the cause.
7. Rerun the narrow failing spec before rerunning the full suite.

## Output

Use this format:

- Root cause:
- Evidence:
- Fix:
- Verification command:
- Residual risk:

Keep the result concise and actionable.
