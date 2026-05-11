# AI Interaction: Project Exploration

## Prompt

Explore the 4ga Boards repository and identify one or two high-value workflows for Playwright E2E coverage. Prefer workflows that exercise the core Kanban behavior and can run against the Docker Compose default user.

## Useful AI Output

- The app is a React/Sails/PostgreSQL Kanban system.
- Docker Compose exposes the app at `http://localhost:3000`.
- The seeded default user is `demo/demo`.
- Core hierarchy is project -> board -> list -> card.
- Good E2E candidates are login, board/list/card creation, card details, and moving cards between lists.

## Human Decision

I selected authentication and board/card workflows because they cover the most important user journey without spreading the suite too thin.
