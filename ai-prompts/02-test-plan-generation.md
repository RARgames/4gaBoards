# AI Interaction: Test Plan

## Prompt

Create a concise E2E test plan for a take-home QA exercise on 4ga Boards. Include scope, test data, test cases, risks, and out-of-scope items.

## Useful AI Output

- Keep the scope narrow and product-relevant.
- Use generated test data to avoid collisions.
- Prefer API cleanup to keep the local app reusable.
- Avoid testing SSO and file attachments in the initial suite.

## Human Decision

I kept four automated cases: invalid login, valid login, create board/list/card/description, and move card between lists.
