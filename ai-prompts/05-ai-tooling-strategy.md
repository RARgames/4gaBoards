# AI Interaction: Tooling Strategy

## Prompt

Explain how AI agents, tools, skills, or MCP-style integrations could make this E2E automation work more effective. Identify what was useful for this take-home and what would be excessive for the current scope.

## Useful AI Output

- AI is useful for quickly exploring an unfamiliar codebase, identifying core workflows, drafting a test plan, and iterating on Playwright selectors.
- Shell/codebase inspection is useful for grounding selectors in real component markup instead of guessing from screenshots.
- Browser inspection or Playwright trace review is useful for debugging strict-mode selector failures and flaky UI timing.
- MCP or plugin integrations can help in larger projects by connecting to GitHub issues, CI logs, browser sessions, design files, or test management systems.
- Sub-agents can be useful when work can be split cleanly, such as one agent exploring auth flows while another explores board/card behavior.

## Human Decision

For this take-home, I used AI assistance for repository exploration, test planning, selector hardening, page object refactoring, and negative-test coverage. I did not add complex MCP/plugin workflows because the assignment is small and local; using heavyweight tooling would add more ceremony than value.

## Interview Talking Point

I would describe the approach as pragmatic AI-assisted QA:

> I used AI to accelerate discovery and implementation, but I kept the final test design human-reviewable. The suite uses normal Playwright patterns, page objects, API setup helpers, and documented test planning. MCP-style integrations would be useful in a larger team environment, especially for CI, GitHub, test management, or browser debugging, but they were not required to satisfy this take-home.

## Future Skill Opportunities

If this automation effort expanded beyond the take-home, specialized AI skills or MCP integrations could make the work faster:

| Skill / Integration | How It Would Help |
| --- | --- |
| Skill / Integration | Repo-local draft | How It Would Help |
| --- | --- | --- |
| Browser inspection skill | `ai-skills/qa-browser-inspection` | Explore UI states, capture screenshots, inspect accessibility roles, and debug Playwright locator failures faster |
| GitHub or CI integration | `ai-skills/qa-ci-triage` | Pull failed test logs, inspect PR diffs, summarize flaky failures, and suggest targeted fixes |
| Test planning skill | `ai-skills/qa-test-planning` | Generate coverage matrices from product requirements, map risks to test cases, and keep scope decisions documented |
| API exploration skill | `ai-skills/qa-api-exploration` | Discover setup/cleanup endpoints and generate reusable test data helpers |
| Performance analysis skill | `ai-skills/qa-performance-analysis` | Collect page-load timings, compare runs, and flag regressions against agreed thresholds |
| Security testing skill | `ai-skills/qa-security-testing` | Help design authorization, session, and input-validation checks without mixing them into functional smoke tests |

I added these as repo-local skill drafts rather than required runtime dependencies. I would introduce them into a real AI-agent workflow only when the suite grows large enough to justify them. For the current assignment, lightweight Playwright structure plus documented AI use gives better signal than adding extra tooling ceremony.
