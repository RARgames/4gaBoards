---
name: qa-test-planning
description: Create or update QA test plans for Playwright E2E automation. Use when Codex needs to convert product workflows, risks, or acceptance criteria into scope, test cases, negative coverage, out-of-scope decisions, and maintainable automation priorities.
---

# QA Test Planning

## Workflow

1. Identify the product's core user workflows.
2. Rank workflows by business risk, user frequency, and integration depth.
3. Select a focused initial E2E scope rather than trying to cover everything.
4. Include positive, negative, persistence, and cleanup considerations.
5. Separate automated coverage from manual exploratory follow-ups.
6. Document out-of-scope areas with reasons, not as omissions.
7. Add run instructions and environment assumptions.

## Required Sections

Include these sections when building a plan:

- Objective
- Application under test
- Scope
- Test strategy
- Entry criteria
- Exit criteria
- Test data
- Automated test cases
- Negative coverage
- Risks and mitigations
- Future improvements

## Test Case Guidance

Each test case should include:

- ID
- Feature
- Priority
- Scenario
- Steps
- Expected result
- Automation file or status
