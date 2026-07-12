# Board Visual Refresh & List Automation — Implementation Spec

> **Self-contained.** Implement exactly what is written here without needing prior conversation context. Same codebase/conventions as `EXPORT_DRAWER_SPEC.md` and `TEAM_TIMESHEETS_OVERVIEW_SPEC.md`; stands on its own.

## 0. What this is

An HTML mockup (Claude artifact, single self-contained file) was built and iterated on to explore a restyle of the board — lists, cards, topbar chrome — plus three pieces of new functionality:

1. **List type** — every list gets a `type`: `none` / `active` / `blocked` / `done`. `active` carries an optional WIP limit; `done` carries an auto-archive delay (in days). This replaces the manual workflow of creating a new "Done (Month Year)" column every month.
2. **`completedAt` on Card** — stamped automatically when a card lands in a `done`-type list, cleared if it leaves one. This is what makes "completed in June" a query instead of a column.
3. **Archive view** — a new board view (alongside the existing Board/List/Swimlanes views) that lists cards past their list's auto-archive delay, groupable by completed month / label / assignee / priority, with a small stat strip.
4. **Done-card presentation** — check icon, completion meta ("completed 11:42am" / "Jul 06"), auto-archive countdown row ("Auto-archives in 2d" + progress bar), and recency group labels inside the Done list ("Today" / "Earlier this week" / "Older, ready to archive") with an archive teaser row at the bottom (§6.2, §6.6).
5. **Drag placement preview** — while dragging a card, a ghost preview renders at the exact destination position (same or different list), reusing the mechanism the project timeline's `reassignPreview` already ships (§6.7).

The mockup also reproduced the *existing* topbar (members, search, filters, view switcher) and the *existing* list-collapse behavior in its own vocabulary, because it was built standalone with no access to this repo. **Do not re-implement those from the mockup's HTML/CSS** — this spec maps every mockup element back to the real component that already does that job (§2), so implementation is "restyle + extend," not "rebuild."

## 1. Non-goals (explicit — do not do these even though the mockup shows them)

- **Do not build the mockup's Table/Timeline view-switch buttons.** This app already has real `list` and `swimlanes` view modes (`BoardActions.jsx`, driven by `Board.jsx`'s `viewMode` state) that cover that ground on a different axis. The mockup's switcher gets a 4th button (`archive`), not a rename of the existing three.
- **Do not invent a new chip-color system.** The mockup's "Animation / Level Design / Programming / Cleanup / Game Design / UI" colored chips are this app's existing `Label` model rendered via the `Label` component and `LabelColors` palette (`client/src/constants/LabelColors.js`, 25 named colors). Same for priority chips — `Priority` component + `client/src/constants/Priorities.js` (`low`/`medium`/`high` → `bright-moss`/`egg-yellow`/`berry-red`). Only restyle the existing chip presentation (radius, padding, uppercase tracking) to match the mockup; do not add a parallel "discipline" concept.
- **Do not add a cron/scheduler dependency.** There is no job scheduler in this codebase today (confirmed: no `node-cron`, no scheduled-job infra anywhere under `server/`). Auto-archive must be **computed lazily** from `completedAt + list.autoArchiveDays`, not swept by a background job. See §5.3.
- **Do not build the mockup's "board settings" modal verbatim.** No such modal exists today — `BoardActions.jsx` only has a project-settings page link (`Paths.SETTINGS_PROJECT`). §7 gives the real integration point and flags the one open decision it requires.
- **Do not touch the `Archive` Sails model** (`server/api/models/Archive.js`). That table is a generic soft-delete snapshot written whenever *any* model is `.destroy()`d (`archiveModelIdentity: false`) — unrelated to "user archived this finished card." Card archiving in this spec is a plain `archivedAt` timestamp column on `Card` (§4.2).

## 2. What already exists (read before changing anything)

| File | Role | Action needed |
|---|---|---|
| `client/src/components/Board/Board.jsx` | Top-level board container; owns `viewMode` state (`'board'` \| `'list'` \| `'swimlanes'`), renders `BoardActionsContainer` + the active view. | Add `'archive'` as a fourth `viewMode` value; render the new archive view when active (§6.4). |
| `client/src/components/BoardActions/BoardActions.jsx` + `Filters.jsx` | The topbar: GitHub connection badge, board title, card count, `Memberships` (members avatar stack + invite — **this is the mockup's "members in board" cluster, already built**), `CardSearch` (**the mockup's search box**), `Filters` (**the mockup's filter icon buttons** — users/labels/priorities/due-date), the board/list/swimlanes view-switch buttons, project-settings link, back-to-project link. | Restyle only (spacing, icon set, hover states per mockup tokens). Add one more view-switch button for `archive` (§6.3). |
| `client/src/components/List/List.jsx` + `List.module.scss` | List column. **Already has full collapse behavior** — `isCollapsed` prop, `handleToggleCollapseClick`, rotated vertical header text when collapsed (`headerNameCollapsed`, `writing-mode: vertical-rl`), a dedicated collapsed render branch. This is exactly the mockup's "collapsible list" ask — it's already shipped. | Restyle only. Add the type-dot + caption row + WIP stripe to the (non-collapsed) header (§6.1). Do **not** touch the collapse mechanism itself. |
| `client/src/components/List/ActionsPopup.jsx` | The list's kebab (⋮) menu: edit name, check activity, add card, delete — multi-step popup via `useSteps`, `withPopup` HOC, `Button style={ButtonStyle.PopupContext}`. | Add a new step for "List type" (§6.1) using the identical pattern. |
| `server/api/models/List.js` | Sails model: `position`, `name`, `isCollapsed`, `boardId`, `cards`, `createdById`/`updatedById`. No `type`/`wipLimit`/`autoArchiveDays` yet. | Add three attributes (§4.1). |
| `server/api/models/Card.js` | Sails model: no `completedAt`/`archivedAt` yet; has `dueDate`, `startDate`, `priority`, `parentCardId`, etc. | Add two attributes (§4.2). |
| `server/api/controllers/lists/update.js` | Whitelists `position`/`name`/`isCollapsed` via `_.pick`, delegates to `sails.helpers.lists.updateOne`. This is the exact pattern `isCollapsed` used to become editable — copy it. | Extend input whitelist (§5.1). |
| `server/db/migrations/20230112022500_add_list_isCollapsed.js` | Precedent migration: `knex.schema.alterTable('list', ...)` adding one boolean column, with `up`/`down`. | Copy this shape for the two new migrations (§4.3). |
| `client/src/colors.css` | All design tokens for this app, as CSS custom properties, in three theme blocks: default (`:root`, dark), `[data-theme='github-dark']`, `[data-theme='trello-light']`. Also a `--tw-*` bridge block that aliases these for Tailwind/shadcn-style consumers. Has an existing **"Hero card accent system"** (`--heroAccent`, `--heroAccentHover`, `--heroBanner`) described in-file as "hero bar on card faces" — this is the closest existing analog to the mockup's ember accent bar and should be reused (§3.2), not duplicated. | Add ~6 new tokens to all three theme blocks (§3.2). |
| `client/src/components/Utils/Icon/IconType.jsx` | Central SVG icon registry (`Settings`, `Sliders`, `Star`, `Calendar`, `Label`, `Labels`, `EllipsisVertical`, `TriangleDown`, `Check`, `Clock`, `Board`, `List`, `Users`, etc.). | Add one new icon: `Archive` (inbox/drawer glyph, mirror the mockup's `i-archive` symbol — two stacked rects + a handle line). No other new icons needed; everything else in the mockup's topbar already has a registered equivalent. |
| `client/src/constants/Priorities.js`, `client/src/constants/LabelColors.js` | Existing priority/label color systems (see Non-goals). | No changes. |

## 3. Design tokens

### 3.1 Mapping — mockup token → existing app token

The mockup was built with its own placeholder token names (it had no access to this repo). Do not port these names — use the existing ones:

| Mockup token | Use this instead |
|---|---|
| `--surface` (card/column bg) | `--backgroundColorTmpHeader` (cards) / `--backgroundList` (list body) |
| `--surface-raised` | `--backgroundColorTmp1` |
| `--bg` (page) | `--backgroundColor` |
| `--border` | `--backgroundPopupSeparator` |
| `--text` / `--text-muted` / `--text-faint` | `--textColor0` / `--textColor3` / `--textColor4` |
| `--accent` | `--heroAccent` (see below — reuse, don't add a second accent) |
| `--success` | `--backgroundGreen` / `--green` |
| `--warning` | `--textColorWarning` |
| `--critical` | `--backgroundRed` / `--red` |
| `--info` | `--borderOutline` |
| `--radius` / card radius | `--tw-radius-lg` (8px; lists/cards/dialogs/popovers tier) |
| card shadow | `--tw-shadow` |
| `--font-mono` | new — see §3.3, none exists today |

### 3.2 New tokens to add

Add to **all three** theme blocks in `client/src/colors.css` (`:root`, `[data-theme='github-dark']`, `[data-theme='trello-light']`), placed near the existing "Hero card accent system" comment block since they're conceptually related (list/card state accents):

```css
/* List type indicators (List.jsx header dot + ActionsPopup type menu) */
--listTypeNone: var(--textColor4);
--listTypeActive: var(--borderOutline);
--listTypeBlocked: var(--backgroundRed);
--listTypeDone: var(--backgroundGreen);

/* WIP-limit-exceeded / blocked stripe atop a list header */
--listWarningStripe: var(--backgroundRed);
```

Values differ per theme block only through the `var()` refs they resolve against (already theme-aware) — do **not** hardcode hex values in these five lines; they must read exactly as above in all three blocks so each theme's existing red/blue/green/grey carries through automatically.

**Do not add a new accent hue for the auto-archive countdown bar.** Reuse `--heroAccent` / `--heroAccentHover` (already exists, already themed for dark + light in `colors.css`, already documented in-file as the card accent-bar system). This keeps the app to one accent color, matching the "spend your boldness in one place" note the mockup's own design pass followed.

### 3.3 Monospace utility

No `--font-mono` / monospace utility exists in this app. The mockup uses monospace with `font-variant-numeric: tabular-nums` for card counts, dates, WIP figures (`16 / 12`), and cycle times — add one utility class to `client/src/global.module.scss`:

```scss
.fontMono {
  font-family: ui-monospace, 'Cascadia Mono', 'SF Mono', Consolas, 'Liberation Mono', monospace;
  font-variant-numeric: tabular-nums;
}
```

Apply via `clsx(s.someExistingClass, gs.fontMono)` wherever the mockup used monospace: list header card-count, the new WIP/auto-archive caption, archive-view row dates/cycle-time.

### 3.4 Pixel spec (from the approved mockup — implement these values exactly)

The restyle must land visually identical to the approved HTML mockup. These are the mockup's computed values, expressed against this app's tokens. Where a value below conflicts with an existing SCSS value, the value below wins.

**List column** (`List.module.scss`):

| Property | Value |
|---|---|
| Column width | 268px (unchanged from current 272px content box is fine if border-box; match visually) |
| Background / border / radius | `--backgroundList` / 1px `--backgroundPopupSeparator` / 10px |
| Header padding | 11px 6px 9px 12px, 1px bottom border `--backgroundPopupSeparator` |
| List name | 13px, weight 650, letter-spacing -0.005em, `--textColor0` |
| Card count | mono (`gs.fontMono`), 11px, `--textColor4`, right-aligned in the title row |
| Type dot | 8px circle, colored per `--listType*` token, vertically centered against the first line of the name |
| Caption row (WIP / auto-archive / blocked text) | 10.5px, `--textColor4`, 2px below the name row; omitted entirely (no reserved space) when empty |
| Warning stripe | 3px tall, full column width, `--listWarningStripe`, sits directly under the header border |
| Card gap inside the list body | 8px (already `CARD_GAP` in `Card.jsx` — keep) |
| Body padding | 9px |

**Card face** (`Card.module.scss`):

| Property | Value |
|---|---|
| Background / border / radius / shadow | `--backgroundColorTmpHeader` / 1px `--backgroundPopupSeparator` / `--tw-radius-lg` / `--tw-shadow` |
| Padding | 10px 11px; internal vertical gap between rows 7px |
| Title | 12.5px, weight 560 (use 600 if 560 isn't in the loaded font), line-height 1.35, `--textColor0` |
| Hover | border-color shifts to a stronger separator tone (mockup: `--border-strong`; here `--scrollbarThumb` is the closest step) — no translate/scale |
| Label & priority chips | 10px, weight 700, uppercase, letter-spacing 0.02em, padding 2px 7px, radius 4px (fixed 4px, not `--tw-radius`) |
| Task progress bar (existing) | 4px tall track, radius 3px, track `--backgroundPopupSeparator`, fill `--backgroundGreen` |

**Topbar** (`BoardActions.module.scss`): 32px square icon buttons, 7px radius, hover `--backgroundColorTmp1`; pressed/active filter state uses a `--heroAccent`-tinted background with `--heroAccent` icon fill; 1px × 22px vertical divider (`--backgroundPopupSeparator`) between the members cluster / search+filters / view switcher / settings groups; the view-switch group sits in a 1px-bordered `--backgroundColorTmp1` pill (3px inner padding, 8px radius) with the active button raised on `--backgroundColorTmpHeader` + `--tw-shadow`.

## 4. Data model changes (Sails)

### 4.1 `server/api/models/List.js` — add `type`, `wipLimit`, `autoArchiveDays`

Insert alongside the existing attributes (after `isCollapsed`):

```js
type: {
  type: 'string',
  isIn: ['none', 'active', 'blocked', 'done'],
  defaultsTo: 'none',
},
wipLimit: {
  type: 'number',
  allowNull: true,
  columnName: 'wip_limit',
},
autoArchiveDays: {
  type: 'number',
  allowNull: true,
  defaultsTo: 30,
  columnName: 'auto_archive_days',
},
```

`wipLimit` stays nullable (no limit set = no stripe, matches mockup's "Active, no limit" state). `autoArchiveDays` defaults to `30` at the model level so `done`-type lists always have a usable value without null-checks scattered through the archive query (§5.3) — this resolves Open Decision 4 in §7.

### 4.2 `server/api/models/Card.js` — add `completedAt`, `archivedAt`

Insert alongside `dueDate`/`startDate`:

```js
completedAt: {
  type: 'ref',
  columnName: 'completed_at',
},
archivedAt: {
  type: 'ref',
  columnName: 'archived_at',
},
```

Same `type: 'ref'` pattern already used for `dueDate`/`startDate` (Sails' timestamp convention in this codebase).

### 4.3 Migrations

Two new files in `server/db/migrations/`, following `20230112022500_add_list_isCollapsed.js` exactly (`knex.schema.alterTable`, explicit `up`/`down`, snake_case columns matching the `columnName`s above). Use timestamps after the most recent migration in the repo (`20260710091000_...`):

`server/db/migrations/20260711100000_add_list_type_and_limits.js`:

```js
module.exports.up = (knex) =>
  knex.schema.alterTable('list', (table) => {
    table.string('type').notNullable().defaultTo('none');
    table.integer('wip_limit').nullable();
    table.integer('auto_archive_days').nullable().defaultTo(30);
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('list', (table) => {
    table.dropColumn('type');
    table.dropColumn('wip_limit');
    table.dropColumn('auto_archive_days');
  });
```

`server/db/migrations/20260711100001_add_card_completed_and_archived_at.js`:

```js
module.exports.up = (knex) =>
  knex.schema.alterTable('card', (table) => {
    table.timestamp('completed_at').nullable();
    table.timestamp('archived_at').nullable();
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('card', (table) => {
    table.dropColumn('completed_at');
    table.dropColumn('archived_at');
  });
```

## 5. Server behavior

### 5.1 List create/update controllers — whitelist new inputs

`server/api/controllers/lists/update.js`: add to `inputs`:

```js
type: {
  type: 'string',
  isIn: ['none', 'active', 'blocked', 'done'],
},
wipLimit: {
  type: 'number',
  allowNull: true,
},
autoArchiveDays: {
  type: 'number',
  allowNull: true,
},
```

and extend the `_.pick(inputs, [...])` call to include `'type', 'wipLimit', 'autoArchiveDays'`. Same shape in `server/api/controllers/lists/create.js` if it accepts a subset of these at creation time — check its current `inputs` block and mirror whichever of `position`/`name`/`isCollapsed` it already accepts.

### 5.2 Stamping `completedAt` on card move

Find wherever a card's `listId` is changed (the cards-update controller / `sails.helpers.cards.updateOne` call chain — same helper family as `sails.helpers.lists.updateOne` referenced in §2). When `listId` is part of the update values:

1. Look up the destination list's `type`.
2. If destination `type === 'done'` and the card's current `completedAt` is `null`, set `completedAt: new Date()` in the values passed to the update helper.
3. If the destination `type !== 'done'` and the card currently has a non-null `completedAt` (i.e., it's being moved *out* of Done), set `completedAt: null`.
4. Moving a card between two `done`-type lists (if a board has more than one) does not reset `completedAt`.

This mirrors exactly how `isCollapsed` flows through `updateOne` today — no new helper needed, just extra values computed before the existing call.

### 5.3 Auto-archive — computed, not swept

Per §1's non-goal, there is no background job. A card counts as archived when:

```
archivedAt IS NOT NULL
  OR (completedAt IS NOT NULL AND completedAt < now() - (list.autoArchiveDays || 30) days)
```

Apply this predicate in two places:

- **Board card-fetch queries** (wherever the board's normal list/card payload is assembled) must **exclude** cards matching this predicate, so they disappear from the visible Done column once past their delay — same effect as the mockup's "Older, ready to archive" card leaving the board.
- **New archive-listing helper** (§5.4) does the inverse: **only** cards matching this predicate.

The per-card countdown shown in the mockup (`Auto-archives in 26d`, the mini progress bar) is a **pure client computation** from `completedAt + list.autoArchiveDays - now`, not server state — no endpoint needed for it.

### 5.4 New endpoints

- **`GET /api/boards/:id/archived-cards`** — new controller, mirrors the shape of existing `get-many`-style card helpers referenced by the graph (`Get-Many Server Helpers` community). Accepts no required query params for v1 (grouping/filtering happens client-side on the returned set, same as the mockup's `renderArchive()`); returns cards matching the §5.3 predicate with `completedAt`, `archivedAt`, `listId`, labels, assignees, priority.
- **`POST /api/cards/:id/archive`** — sets `archivedAt: new Date()`. Backs the mockup's card-detail-modal "Archive now" button.
- **`POST /api/cards/:id/unarchive`** — sets `archivedAt: null`. Backs "Restore to In Progress" — see Open Decision 2 (§7) for which list a restored card lands in.

Both mutation endpoints follow the same `boardMembership`/`role !== EDITOR` permission check pattern already in `lists/update.js` (§2).

## 6. Client components

### 6.1 List header — type indicator, caption, WIP stripe, type menu

**`client/src/components/List/List.jsx`** (non-collapsed branch only — leave the `isCollapsed` branch untouched):

- Add a small type-dot span before `headerName`, colored via `--listType{None|Active|Blocked|Done}` based on the list's `type` prop (new prop, threaded from the container the same way `isCollapsed` already is).
- Add a caption line under the name (only rendered when non-empty), computed the same way the mockup's `paintColumn()` did it in JS — but here as a plain derived value in the component:
  - `type === 'active' && wipLimit`: `` `WIP ${cardIds.length} / ${wipLimit}` ``, colored via `--listWarningStripe` when `cardIds.length > wipLimit`.
  - `type === 'blocked'`: static caption text (e.g. `t('common.listFlagsCardsAsStuck')`).
  - `type === 'done'`: `` `Auto-archives after ${autoArchiveDays}d` ``.
  - `type === 'none'`: no caption row.
- Add a 3px stripe (`--listWarningStripe`) at the top of `.header`, shown when `type === 'blocked'` OR (`type === 'active'` AND over WIP limit) — same condition as the mockup's `paintColumn`.

**`client/src/components/List/ActionsPopup.jsx`**: add a new step (`StepTypes.LIST_TYPE`), reachable from a new `Button style={ButtonStyle.PopupContext}` row (icon: reuse `IconType.Sliders`) alongside the existing Edit Name / Check Activity / Add Card / Delete rows. The step renders the mockup's four-option list (None/Active/Blocked/Done, each with the one-line description text from the mockup), radio-style via `Button style={ButtonStyle.PopupContext}` rows with a checkmark (`IconType.Check`) on the selected one, plus a conditional number input for WIP limit (when Active) or auto-archive days (when Done) shown below the options — mirror the mockup's `.menu-field` show/hide logic. Selecting an option calls `onUpdate({ type, wipLimit, autoArchiveDays })` (the same `onUpdate` prop `List.jsx` already passes down for name edits) and closes back to the main step.

### 6.2 Card — priority/label chip restyle, Done state

**`client/src/components/Card/Card.jsx`** + `Card.module.scss`: restyle the existing `Label`/`Priority` chip rendering to match the mockup's chip look (smaller uppercase text, tighter padding, `--tw-radius`) — token/spacing changes only, no new props.

Add a "done" treatment gated on the card's parent list type (passed down as a prop, same as `isBlocked` already is today per §2's Card.jsx props list). When `list.type === 'done'`, the card face gains **three** elements, top to bottom, exactly as in the mockup:

1. **Check icon** — `IconType.Check`, `--backgroundGreen` fill, inline before the card name, ~2px right margin, vertically aligned to the first text line.
2. **Completion meta row** — mono (`gs.fontMono`), 10.5px, `--textColor4`, below the chip row. Format rule:
   - completed **today** → `completed {h:mma}` (e.g. `completed 11:42am`)
   - completed **this year, not today** → short date `{MMM DD}` (e.g. `Jul 06`)
   - completed **a previous year** → `{MMM DD, YYYY}`
3. **Auto-archive countdown row** — mono, 10px, layout: label text + a flexible progress bar on one line with 5px gap.
   - Label: `Auto-archives in {N}d` where `N = ceil(autoArchiveDays - daysSinceCompleted)`, floored at 0 (`Auto-archives today` when 0).
   - Bar: 3px tall, radius 2px, flex-grows to fill the remaining row width; track `--backgroundPopupSeparator`; fill width = `min(100%, daysSinceCompleted / autoArchiveDays * 100%)`.
   - Default state: fill and label in the muted treatment (fill `--heroAccent`, label `--textColor4`).
   - **Urgent state** (elapsed ≥ 80%, i.e. the mockup's "Auto-archives in 2d" card at 93%): label text color switches to `--heroAccent` too, so the whole row reads accent-colored.
   - Everything here is derived client-side from `completedAt` + `list.autoArchiveDays` per §5.3 — recompute on render; no timer needed (day-granularity display).

### 6.3 Topbar — add Archive to the view switcher

**`client/src/components/BoardActions/BoardActions.jsx`**: add a fourth button in the same block as the existing board/list/swimlanes `Button style={ButtonStyle.IconBase}` trio:

```jsx
<Button style={ButtonStyle.IconBase} title={t('common.switchToArchiveView')} onClick={() => onViewModeChange('archive')} className={clsx(s.switchViewButton, viewMode === 'archive' && s.active)}>
  <Icon type={IconType.Archive} size={IconSize.Size18} />
</Button>
```

Requires the new `IconType.Archive` entry (§2) and a new i18n key `common.switchToArchiveView` in `client/src/locales/en/core.js` (grep first for an existing key before adding, per this repo's i18n convention).

### 6.4 New Archive view

New sibling to `ListView`/`SwimlanesView`: `client/src/components/Board/ArchiveView/ArchiveView.jsx` + a container (`ArchiveViewContainer`, same container/presentational split as `ListViewContainer`/`SwimlanesViewContainer`). Wire into `Board.jsx`:

```jsx
const archiveView = (
  <div className={clsx(s.listWrapper)}>
    <ArchiveViewContainer />
  </div>
);
// ...
{viewMode === 'archive' && archiveView}
```

The view itself mirrors the mockup's Archive tab: a left rail with "Group by" (month/label/assignee/priority — client-side `Array.prototype.reduce` grouping of the `GET /api/boards/:id/archived-cards` response, same logic as the mockup's `renderArchive()`) and label filter chips (reuse the existing `Label`-derived filter chip styling from `Filters.jsx` rather than a new chip component), a stat strip (total archived / completed this month / avg cycle time — all derived client-side from the fetched set, no new endpoints), and collapsible month/label groups.

### 6.5 Board settings — do not add a new modal

No open decision needed for *where the button lives* (there isn't a new button — the existing project-settings link stays as-is). The **content** question is in §7 Decision 1.

### 6.6 Done-list recency grouping & archive teaser

Inside a `done`-type list only, cards are visually grouped by recency with sticky-feeling section labels, exactly as the mockup's Done column:

**Group labels** — 10.5px, weight 700, uppercase, letter-spacing 0.08em, `--textColor4`, padding 8px 3px 0 (2px top padding for the first label). Bucketing rule, evaluated against `completedAt` at render time:

| Label | Predicate |
|---|---|
| `Today` | `completedAt` is the current calendar day |
| `Earlier this week` | within the last 7 days, not today |
| `Older, ready to archive` | everything else still visible (i.e., not yet past the §5.3 archive threshold) |

Cards within each bucket keep their normal list `position` ordering. Empty buckets render no label. i18n keys: `common.doneGroupToday`, `common.doneGroupEarlierThisWeek`, `common.doneGroupOlder`.

**Implementation note (virtualization):** `List.jsx` renders cards through `react-window`'s `VariableSizeList` with one row per card id. Inject group labels as **synthetic rows** in `filteredCardIds`-derived item data (a `{ type: 'groupLabel', key }` entry, with a fixed row height registered in `getCardSize`) rather than wrapping cards in group containers — grouping must not break virtualization or the droppable's index math. When computing the drag-destination index for §6.7 and for `onCardMove`, label rows are skipped (map row index → card index).

Group labels appear **only** in `done`-type lists; all other list types render exactly as today.

**Archive teaser** — the last row of a `done`-type list (rendered after the final card, before the add-card button, as another synthetic row): a full-width button, 1px **dashed** `--scrollbarThumb` border, radius `--tw-radius-lg`, padding 10px 11px, 11.5px `--textColor3`, transparent background; hover: border and text shift to `--heroAccent` / `--textColor0`. Content: `View full archive — {count} cards, {MMM YYYY} and earlier →` where `{count}` is the board's archived-card total and `{MMM YYYY}` the newest month fully in the archive (both from a lightweight aggregate on the §5.4 GET endpoint — extend its response with `{ total, newestArchivedMonth }` metadata rather than adding a second endpoint). Count and month render in mono (`gs.fontMono`), `--textColor0`. Clicking switches `viewMode` to `'archive'` (§6.4) — thread an `onViewModeChange`-style callback down to `List.jsx` the same way `Board.jsx` already passes it to `BoardActionsContainer`.

### 6.7 Drag placement preview (cards)

**What.** While dragging a card, show a ghost preview of the card at the exact spot it would land — in the same list or a different one — instead of today's behavior where virtual mode gives no visual feedback at the destination. This deliberately copies the mechanism already shipped in the project timeline: `reassignPreview` in `client/src/components/Project/Timeline/Timeline.jsx` (the `useMemo` around line 480 that computes "where the dragged bar would land in the row under the pointer", rendered as an absolutely-positioned tinted box in the target row) with its `.reassignPreview` style in `Timeline.module.scss` (~line 319: dashed 2px border, accent background at 0.7 opacity, radius, item name inside).

**Why it doesn't exist on the board today.** `List.jsx` uses `react-beautiful-dnd` in `mode="virtual"` with `renderClone` — and in virtual mode rbd renders **no placeholder gap** in the destination list. The library still *computes* the destination; it just doesn't visualize it. So the fix is presentation-only, no dnd rework:

1. **Capture the live destination.** `Board.jsx` owns the `DragDropContext` (currently `onDragEnd` only). Add `onDragUpdate` + `onDragStart` + reset in `onDragEnd`, holding `{ draggableId, destination }` in state (throttle-free; rbd already debounces updates). Pass the current drag state down to lists — via the existing container/selector chain or a lightweight React context created next to `Board.jsx`; either is acceptable, but do not introduce a new global Redux action for transient drag state.
2. **Render the ghost in the destination list.** In `List.jsx`, when the live destination's `droppableId` matches this list, render an absolutely-positioned preview element inside `cardsInnerWrapper` at the destination index's pixel offset. The offset is the cumulative sum of row heights above that index — `List.jsx` already maintains exactly this data in `sizeMap.current` / `getCardSize` for `VariableSizeList`, so the computation is a `reduce` over `filteredCardIds.slice(0, destIndex)` (skipping §6.6 label rows). Height: the dragged card's own measured height from the source list's size map when same-list, else `ESTIMATED_CARD_HEIGHT`.
3. **Ghost styling** (`.dropPreview` in `List.module.scss`) — the board translation of the timeline's `.reassignPreview`: 2px dashed `--borderOutline` border, `--borderOutline` at ~12% opacity background fill (use `color-mix(in srgb, var(--borderOutline) 12%, transparent)`; the timeline's solid 0.7-opacity fill is too heavy over card faces), radius `--tw-radius-lg`, and the dragged card's name in 12.5px `--textColor3`, single line, ellipsized, 10px 11px padding. `pointer-events: none`, `z-index` above cards but below the drag clone.
4. **Source card treatment.** The card still rendered in the source list during a cross-list drag gets the timeline's `.barDragging` analog: opacity 0.75 (add `.cardDragging` keyed off `snapshot.isDragging` — `Card.jsx` already receives `snapshot`).
5. **Cross-list into an empty region / end of list:** destination index past the last card renders the ghost after the final row (offset = total measured height). Same-list drags render the ghost at the destination index and keep the source card in place at reduced opacity — matching how the timeline shows both the original bar (dimmed) and the preview simultaneously.

Task drags (`DroppableTypes.TASK`) and list drags are out of scope — cards only, matching the ask.

## 7. Open decisions to confirm before implementation

1. **Where do per-board defaults (default WIP limit for new Active lists, default auto-archive days for new Done lists) live?** Recommend: a new "Automation" section on the existing Project Settings page (`Paths.SETTINGS_PROJECT`) rather than a new modal — smaller change, matches how this app already handles board-adjacent settings. If a lighter-weight per-board popup is preferred instead, that's a `withPopup` step off a new topbar button, not a `withModal` dialog.
2. **Where does a card land when "Restore" / `unarchive` is used, if its original list was since deleted or the board's Done list changed?** Recommend: restore to the first `active`-type list on the board by position; if none exists, leave `listId` unchanged (card just becomes visible again in whatever list it's still in) and let the user drag it manually.
3. **Can a board have more than one `done`-type list?** The mockup's per-list type menu allows any list any type freely. Recommend keeping that freedom (simplest, matches mockup) — the Archive view (§6.4) and the §5.3 predicate already aggregate across *all* lists on the board regardless of how many are `done`-typed, so this costs nothing extra to support.
4. **Default `autoArchiveDays` value.** Resolved in §4.1 — defaults to `30` at the model level, matching the mockup. Flagging here only so it's confirmed rather than silently assumed.

## 8. Acceptance criteria

- [ ] `List` model has `type` (enum, default `none`), `wipLimit` (nullable int), `autoArchiveDays` (nullable int, default 30); migration applied cleanly up and down.
- [ ] `Card` model has `completedAt`, `archivedAt` (both nullable timestamps); migration applied cleanly up and down.
- [ ] List kebab menu has a working "List type" step with the four options, WIP-limit input (Active) and auto-archive-days input (Done), persisting via the existing `onUpdate`/`updateOne` path.
- [ ] List header shows the type dot, contextual caption, and warning stripe exactly per §6.1's three conditions — verified for all four types plus the over-WIP-limit case.
- [ ] Moving a card into a `done`-type list stamps `completedAt`; moving it back out clears it; moving between two `done` lists leaves it untouched.
- [ ] Cards past `completedAt + autoArchiveDays` disappear from the normal board view and appear in the Archive view — no scheduled job involved anywhere in the chain.
- [ ] Archive view groups by month/label/assignee/priority client-side, matches the mockup's stat strip and collapsible-group interaction.
- [ ] Done cards show the check icon, completion meta row (time-today / short-date format rule), and auto-archive countdown bar with the ≥80% urgent accent state — all per §6.2, values per §3.4.
- [ ] Done lists group cards under "Today" / "Earlier this week" / "Older, ready to archive" labels as synthetic virtualized rows (§6.6) without breaking drag-and-drop index math, and end with the dashed archive-teaser row that switches to the Archive view.
- [ ] Dragging a card shows the dashed ghost preview at the destination index — same list and cross-list, including end-of-list and empty-list drops — and the source card dims to 0.75 opacity while dragging (§6.7); verified visually against the timeline's reassign preview for consistency.
- [ ] List, card, chip, and topbar styling matches the §3.4 pixel spec.
- [ ] Existing list collapse, members popover, search, filters, and board/list/swimlanes view switching are all untouched in behavior — only their visual tokens changed.
- [ ] All new/changed CSS uses existing `colors.css` tokens or the ~6 new ones in §3.2 — no hardcoded hex values introduced, and all three theme blocks (default, `github-dark`, `trello-light`) stay in sync.
