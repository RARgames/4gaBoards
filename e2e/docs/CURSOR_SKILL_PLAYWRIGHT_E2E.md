# Cursor skill template — 4ga Boards Playwright E2E

Copy the following block into `~/.cursor/skills-cursor/4gaboards-playwright-e2e/SKILL.md` (create the folder) so Cursor agents load it automatically when relevant.

Use a short **name** and a concrete **description** in the YAML frontmatter. Keep the body under 500 lines; focus on commands, invariants, and failure triage.

---

**Suggested `SKILL.md` body (YAML frontmatter + markdown):**

- **When to use:** Any request to add, fix, or run browser E2E tests for this repository.
- **Primary docs:** `e2e/docs/TEST_PLAN.md`, `e2e/docs/AI_AGENT_PLAN_AUTH.md`, `e2e/docs/AI_AGENT_PLAN_BOARD.md`.
- **Commands:**
  - `pnpm -C e2e lint`
  - `pnpm -C e2e test` (requires `pnpm dev` against a migrated + seeded database)
  - `pnpm e2e:pytest` (Pytest wrapper that shells to the same Playwright suite)
- **Invariants:** Page Object Model under `e2e/pages/`; API seeding under `e2e/support/api/`; no CSS locators; no conditional expectations; avoid `page.waitForTimeout`.
- **Artifacts:** HTML report in `e2e/playwright-report/`; traces and videos under `e2e/test-results/` per `e2e/playwright.config.ts`.
- **If failing:** Verify `E2E_BASE_URL` / `E2E_API_BASE_URL`; confirm demo user exists; re-run a single file with `--trace on` and inspect the Playwright trace viewer.

This repository ships the **canonical technical detail** in the files above; the skill should stay short and point back to them instead of duplicating API contracts.
