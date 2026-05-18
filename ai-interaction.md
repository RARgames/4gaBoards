# AI Interaction Log — 4ga Boards E2E Take-Home

## How I Used AI

In this exercise, I acted as the decision maker — defining scope, making design calls, and reviewing all output. AI tooling acted as the executor — exploring the codebase, generating code, and assisting with debugging. I reviewed everything before it was finalized.

I started by prompting the AI assistant to "explore the project and identify main features for E2E testing", then directed the implementation from there.

Specifically, I used AI tooling for:
- **Codebase exploration**: reading component files, locale strings, and router paths to help identify stable selectors and relevant components more efficiently
- **Code generation**: page objects, spec files, fixture
- **Debugging**: AI-assisted debugging using Playwright traces, screenshots, and failure logs, which I reviewed and confirmed

---

## My Decisions

### 1. What to test

I identified two P0 feature areas that cover the core user workflow:
- **Authentication** — without login, nothing else works
- **Kanban workflow** — creating boards, lists, and cards is the core value of the product

I also decided to extend the existing test structure rather than rewrite it, since login and user management tests were already on the branch.

### 2. Test scope

I directed the AI to cover both happy path and negative cases. Negative cases were important to include because they verify the app handles invalid input correctly — not just that the golden path works.

### 3. Tagging strategy

The AI initially designed `@smoke` and `@regression` as two independent suites. I questioned this — a regression suite should include smoke tests, not be separate from them. Running regression but skipping smoke doesn't make sense. This led us to simplify: only tag `@smoke` for the critical happy path, and run everything for full coverage.

### 4. Eliminating login boilerplate

I noticed every spec was repeating the same login steps. I asked the AI to extract this into a shared fixture so login is handled automatically before each test.

### 5. Keeping the test plan focused

The AI included POM explanations, fixture details, and design decisions inside `test-plan.md`. I pushed back — a test plan should focus on what is being tested, not how it is implemented. The file was trimmed to test cases and running instructions only.

---

## What AI Contributed

- Read through source components to identify stable selectors
- Generated page objects (`BoardPage.ts`, `CardPage.ts`) and spec files (`board.spec.ts`, `card.spec.ts`)
- Implemented `auth.fixture.ts` based on my direction
- Assisted with failure analysis using screenshots and logs

---

## Division of Work

AI assisted with:
- Codebase exploration
- Initial code generation
- Failure analysis

I was responsible for:
- Feature selection and prioritization
- Test scope and coverage decisions
- Reviewing selectors and implementation quality
- Final validation and cleanup
