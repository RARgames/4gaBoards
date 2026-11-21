# 4ga Boards Agent Instructions

## Project

4ga Boards: an open-source Kanban/project management tool. pnpm monorepo. Use the Node and pnpm versions from the root `package.json`; use pnpm, not npm or Yarn, for dependency and script commands (`engine-strict=true`). Never create `yarn.lock` or `package-lock.json`.

- Workspaces are declared in `pnpm-workspace.yaml`: `client`, `server`, `tests`, and `packages/*`.
- `server/` - Sails.js 1.x API (actions2 controllers, helpers), PostgreSQL via `sails-postgresql`, Knex migrations, Socket.IO (sails sockets) for realtime.
- `client/` - React app (custom CRA-style scripts in `client/scripts`), Redux + redux-orm + redux-saga, SCSS modules, i18next.
- `packages/enums`, `packages/locales`, `packages/utils`, and `packages/api-docs` - shared `@4gaboards/*` workspaces. The runtime packages build with Rollup into `dist/` (ESM + CJS + d.ts). Run `pnpm packages:build` before running or testing client/server code that depends on package source changes.
- `tests/` - e2e (Playwright) workspace. Its global setup expects the app running at `http://localhost:3000` and signs in with `ADMIN_USER` / `ADMIN_PASS` (or the default demo account).

## Commands (repo root)

- `pnpm dev` builds and watches the packages, then runs server + client. First-time DB setup is `pnpm server:db:init` and needs `server/.env` copied from `server/.env.sample`.
- Packages build to `dist/`: run `pnpm packages:build` before running or testing code that depends on package changes.
- `pnpm client:ci:test` runs the client tests once (`client:test` is watch mode). `pnpm test:e2e` needs the app at `http://localhost:3000` and signs in with `ADMIN_USER` / `ADMIN_PASS` or the demo account.
- `pnpm api-docs:check` validates the API docs.
- Prefer narrow checks while iterating:
  - `pnpm -C server exec mocha test/lifecycle.test.js <path>`
  - `pnpm -C client exec jest <path> --runInBand --watchAll=false`
  - `pnpm -C client exec eslint <path>` (also `stylelint`, and `-C server` for eslint)
- Finish cross-cutting changes with package-level lint/tests and `git diff --check`.
- If PostgreSQL or the running app is unavailable, report a missing prerequisite, not a regression.

## Server architecture

- Controllers live in `server/api/controllers/<resource>/<action>.js` (actions2 style: `inputs`, `exits`, `fn`). Routes are in `server/config/routes.js`; the default policy is `is-authenticated` (`server/config/policies.js`; there are also `rate-limit-*` policies). Auth is via Bearer JWT access token (current-user hook) or API client headers (`X-Client-Id` / `X-Client-Secret`; the required permission is derived from the action name, e.g. `cards.create`, see `packages/enums/src/permissions.js`).
- Business logic is in helpers: `server/api/helpers/<domain>/<name>.js`, called as `sails.helpers.<domain>.<name>.with({...})`. Controllers should stay thin: resolve the path (`getProjectPath`), check permissions, then call helpers.
- Permission convention: resolve the entity's project path, require board membership (and `BoardMembership.Roles.EDITOR` for writes), or project manager where applicable. When unauthorised, throw the `*_NOT_FOUND` error (marked `// Forbidden`) rather than leaking existence; throw `NOT_ENOUGH_RIGHTS` for visible-but-read-only cases. For new endpoints, verify auth, authorization, and ownership of **every** referenced resource (not just the primary id).
- Mutating helpers (`createOne`, `updateOne`, `deleteOne`) follow a pattern: write the DB record, broadcast a socket event to the `board:<id>` / `user:<id>` room (passing `inputs.request` so the originator is excluded), create an activity via `sails.helpers.actions.createOne` (Action model: scope + type from `@4gaboards/enums`), then call the matching `updateMeta` helper (supports `skipMetaUpdate`). Deletes use Waterline `archiveOne` for soft-deletion records.
- Models in `server/api/models`, `migrate: 'safe'` - **schema changes are only made via Knex migrations** in `server/db/migrations` (timestamp-named, with `up` and `down`). Add a migration for any DB behavior change. Column names are snake_case in the DB and mapped with `columnName` in models. IDs are bigint strings from `next_id()`; validate id inputs with `regex: /^[0-9]+$/`.
- Config: `server/config/custom.js` holds app settings from env vars; `globals.js` exposes `_` and `sails`; models are global.
- Server tests: mocha, `server/test/` (`lifecycle.test.js` lifts Sails with `sails-disk` in-memory for `NODE_ENV=test`).

## Client architecture

- State: redux-orm models (`client/src/models`), selectors (`client/src/selectors`), actions split into two layers:
  - `entry-actions/` - dispatched by containers/UI, picked up by sagas.
  - `actions/` - low-level reducer actions (`X`, `X.success`, `X.failure`, `handleX` for socket events).
  - Sagas: `sagas/core` (watchers -> services -> `request` queue with token handling), `sagas/login`. API wrappers in `client/src/api` (socket for most calls, `http` for uploads/login), with date transformers in `api/transformers`.
- Optimistic updates use local ids (`local:<timestamp>`, see `utils/local-id.js`).
- UI: `components/` (with `Utils/` primitives: Button, Popup via `withPopup`, Modal, Table based on TanStack Table) wired to Redux through `containers/`. Keep `propTypes` and `defaultProps` on React components (no TypeScript). Styles are SCSS modules wrapped in `:global(#app)`, with theme colors as CSS variables.
- Drag and drop uses `@atlaskit/pragmatic-drag-and-drop` with drop-slot hooks in `lib/hooks`.
- Activity text is rendered through `@4gaboards/locales/renderer` (used by both client and server email rendering).

## Development workflow

- **Trace the full client data flow** for any change: container/entry-action -> saga/service -> `api` -> reducer/ORM model -> selector -> container. Inspect every caller, the optimistic failure/rollback path, and the corresponding socket `_HANDLE` action, so local state and other clients stay consistent.
- Start from the nearest owning implementation, a neighboring call site, and the matching test. Keep changes scoped to the request; do not rewrite unrelated behavior while fixing a path.
- Preserve existing naming, file layout, import order, and error/response shapes. Check neighboring implementations before introducing new patterns.
- Do not write extra tests unless asked or really necessary.
- When changing `server/api/controllers` or `server/config/routes.js`, keep `openapi.yaml` (in `packages/api-docs`) in sync, then run `pnpm api-docs:check`.
- Never hand-edit generated output: `client/build/**`, package `dist/**`, Playwright reports, test results. Rebuild instead.
- Never commit secrets (e.g. `server/.env`). Use `server/.env.sample` as the documented environment template.

## Localization

- Translations live in `packages/locales/src/<lang>/{core,activity,login,error}.js`; `en` is the source of truth.
- When a change needs new or changed text, first add only the English version and propose it to the user. After the user accepts it, add the other languages.
- Keep every locale structurally complete (same keys in all languages). Preserve placeholders, interpolation variables, plural forms, HTML-like tags and escapes.
- Locale files are sorted by key (`perfectionist/sort-objects`) and exempt from the 210 print width. Preserve the existing object/file format rather than bulk-reformatting translations.
- Validate with `pnpm client:lang:test`. For bulk translation work follow `.github/agents/translations.agent.md`.

## Conventions

- Adding an API endpoint usually touches: server controller + helper(s), `config/routes.js`, `openapi.yaml`, `packages/enums` permissions/activity types, client `api/`, `actions/`, `entry-actions/`, `sagas/core/{services,watchers}`, the redux-orm model reducer, and locales.
- Adding an activity type: `packages/enums/src/activityTypes.js`, emit it from the server helper, add the translations in `packages/locales`, and handle it in the renderer.
