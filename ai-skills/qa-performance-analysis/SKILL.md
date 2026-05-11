---
name: qa-performance-analysis
description: Plan lightweight performance checks for web workflows. Use when Codex needs to define practical Playwright-compatible performance measurements, choose thresholds, seed larger data sets, or document performance risks without turning functional E2E tests into full load tests.
---

# QA Performance Analysis

## Workflow

1. Define the user workflow and performance question.
2. Choose a realistic data size and environment.
3. Decide whether the check belongs in E2E, API, load testing, or manual profiling.
4. Measure user-impacting timings, such as page ready, board render, modal open, or API response time.
5. Use thresholds only when there is a baseline or product expectation.
6. Keep performance checks separate from core functional smoke tests unless they are very lightweight.
7. Report trends and regressions, not single-run noise.

## Example Checks

- Board page with many cards renders within an agreed threshold.
- Login completes within a reasonable local benchmark.
- Opening a card modal remains responsive with a large board.
- API setup endpoints do not become a bottleneck for E2E runs.

## Output

Produce:

- Scenario
- Data volume
- Measurement method
- Threshold or baseline
- Verification command
- Risks and noise factors
