# Boards Overview Page Redesign — Implementation Spec

> **Self-contained.** Implement exactly what is written here without needing prior conversation context. Same codebase/conventions as `BOARD_VISUAL_REFRESH_AND_LIST_AUTOMATION_SPEC.md`; stands on its own.
>
> **Track progress in §10.** Tick each checkbox as you complete it and keep the status line current. Work phase by phase; each phase leaves the app shippable.

## 0. What this is

A redesign of the **boards overview page** (`client/src/components/Boards/Boards.jsx` — the screen shown after selecting a project, listing its boards as tiles). A self-contained HTML mockup lives next to this spec: **`docs/plans/BOARDS_OVERVIEW_REDESIGN_MOCKUP.html`** — open it in a browser; it is the visual source of truth for styling, spacing, and type treatment.

Current problems being fixed:

1. Board tiles are flat `--backgroundProject` (`#3b3b3b`) boxes — a gray that is not part of the slate-navy theme — showing nothing but a name.
2. No way to tell which board is busy, stale, or needs attention without opening it.
3. The page header is a single centered "Showing 8 Boards [Selected Project]" line; the rest of the viewport is empty.

What the redesign adds:

1. **Informative board tiles** — team accent dot, board name, **lane fingerprint** (mini bar chart of the board's lists, heights ∝ card counts, done-type lanes in green), progress hairline (% cards in done lists), open-card count, member avatar stack (max 3 + `+N`), relative last-activity time, and a `N new` notification pill replacing the bare red square.
2. **Project header** — mono uppercase `PROJECT` eyebrow, project name as a real H1, and four aggregate stat chips: open cards, members, due this week (gold number), done in last 7 days. **No subtitle line under the H1** (the mockup's "8 boards across 6 teams · playtest cycle: May 2026" line is explicitly excluded).
3. **Toolbar** — "Showing X of Y boards" count, a Grid/List segmented toggle, and the gold "＋ New board" primary button.
4. **List (rows) view mode** — the same tiles laid out as full-width rows.
5. **Ghost "＋ New board" tile** at the end of the grid (project managers only).
6. Server-side **board stats aggregation** feeding all of the above in a single SQL query (§4) — this is the performance backbone of the whole feature.

## 1. Non-goals (explicit — do not do these even though the mockup shows them)

- **Do not build the "Teams" / "Playtest & QA" section grouping.** No data model backs board categories. Render one flat grid. (If categories ever exist, the section-label style in the mockup is the reference.)
- **Do not add per-board description subtitles** ("Engine, netcode, tooling" etc.). No data field exists; do not add one.
- **Do not show the project subtitle line** ("… playtest cycle: May 2026"). Excluded by request.
- **Do not rebuild the topbar or sidebar.** The mockup redrew them only to frame the page. Phase 4 restyles the existing `Static/Sidebar` rows minimally (accent swatch + count); the `Header` component is untouched.
- **Do not add live socket updates for tile stats.** Stats refresh whenever `/projects` is refetched (login, reconnect, project switch, board create/delete). Card-level socket events going stale on tiles is accepted for v1. Do not subscribe tiles to card events.
- **Do not add any new npm dependency.** Everything needed (date-fns, redux-orm, clsx) is already installed.
- **Do not invent a second filter mechanism.** The existing sidebar filter (`userModel.filter`, driving `isFiltered` / `filteredProjects` props already consumed by `Boards.jsx`) stays the single filter. The mockup's toolbar filter input is **optional** (§6.6) and, if built, dispatches the existing filter action — no new state.
- **Do not use the mockup's `color-mix()` calls verbatim without checking browser support policy.** The app targets evergreen browsers; `color-mix()` is fine (Chrome 111+/Firefox 113+/Safari 16.2+), but if the project's browserslist says otherwise, precompute the mixed colors as static hex tokens instead.

## 2. What already exists (read before changing anything)

| File | Role | Action needed |
|---|---|---|
| `client/src/components/Boards/Boards.jsx` | The page. Receives `projectId`, `projects`, `filteredProjects`, `managedProjects`, `isFiltered`, `isAdmin`, `onCreate`. Boards arrive with `notificationsTotal` and `memberships` already computed. | Rewrite render per §6. Keep `React.memo`, keep props contract, keep `BoardAddPopup` usage. |
| `client/src/components/Boards/Boards.module.scss` | Tile styles (`.boardWrapper`, `.board`, `.notification`…). | Replace per §6/§7. |
| `client/src/selectors/users.js` (~line 87–129) | Builds project → boards refs for the current user, already iterating boards once (notifications count, memberships). | `stats` rides along automatically via `...boardModel.ref` once the Board model declares it (§5.2). Add project-level aggregate sums here (§5.3) — inside the existing loop, not a second pass. |
| `client/src/models/Board.js` | redux-orm Board model. | Add `stats: attr()` (§5.2). |
| `server/api/controllers/projects/index.js` | Returns `items: projects, included: { …boards… }` — the payload this page renders from. | Attach `stats` to each board record via one aggregate query (§4). |
| `server/api/models/List.js` | Has `type: 'none' \| 'active' \| 'blocked' \| 'done'`. | No change. `type === 'done'` identifies green fingerprint lanes and the progress numerator. |
| `server/api/models/Card.js` | Has `listId`, `dueDate`, `archivedAt`, `updatedAt`. | No change. Stats exclude `archived_at IS NOT NULL`. |
| `server/api/helpers/labels/create-one.js` | Precedent for `sails.sendNativeQuery` usage in this repo. | Copy the calling pattern for the stats query (§4.1). |
| `client/src/colors.css` | All design tokens, three theme blocks (`:root` dark, `github-dark`, `trello-light`), plus the `--tw-*` bridge. | Add the few tokens in §3.2 to **all three** blocks. |
| `client/src/global.module.scss` (line ~48) | Existing mono stack: `ui-monospace, 'Cascadia Mono', 'SF Mono', Consolas, 'Liberation Mono', monospace`. | Reuse as `--fontMono` (§3.3). |
| `client/src/components/Utils/UserAvatar` (or equivalent avatar component — locate it) | Renders initials avatars with the avatar palette. | Reuse for the tile avatar stack; do not hand-roll a new avatar. |
| `client/src/components/BoardAddPopup` | Popup for creating boards, already used twice in `Boards.jsx`. | Wrap the ghost tile and the toolbar button with it. |

## 3. Design tokens

### 3.1 Mapping — mockup token → existing app token

The mockup carries its own token names. Do not port the names; map them:

| Mockup token | Use this instead |
|---|---|
| `--bg` `#1b2230` | `--backgroundColor` |
| `--panel` `#161b24` | `--backgroundHeader` |
| `--surface` `#232a3a` | `--backgroundList` |
| `--card` `#2b3346` | `--backgroundColorTmpHeader` |
| `--raised` `#303a4e` | `--backgroundColorTmpHighlighted` |
| `--line` `#2a3245` | `--backgroundColorTmpSeparatorLight` |
| `--text0` / `--text1` / `--text3` / `--text4` | `--textColor0` / `--textColor1` / `--textColor3` / `--textColor4` |
| `--blue` `#5ba4cf` | `--borderOutline` |
| `--gold` `#f1c40f` (button + "due this week" stat) | `--heroBanner` (bg) + `--heroBannerText` (label) |
| `--red` `#eb5a46` (notification pill) | `--notificationRed` |
| `--green` `#21ba45` (done lanes, progress fill) | `--backgroundGreen` |
| team accents `--t-tech` … | existing avatar palette vars: `--peterRiver`, `--turquoise`, `--wisteria`, `--carrot`, `--emerald`, `--alizarin`, `--midnightBlue`, `--textColorGold` (§6.2) |
| radii 12px (tile) / 9px (controls) | `--tw-radius-lg` / `--tw-radius` |

Because everything maps to existing tokens, **the redesign works in all three themes for free**. Verify in `trello-light` that fingerprint bars remain visible (they mix the accent into `--backgroundList`; on light theme that still yields a readable tint — check visually, adjust the mix percentage per-theme via one override token if needed).

### 3.2 New tokens to add (`client/src/colors.css`, all three theme blocks)

```css
/* Boards overview tiles (Boards.jsx) */
--boardTileAccentMix: 38%;      /* fingerprint bar: accent mixed into --backgroundList */
--boardTileAccentMixHover: 62%;
--boardTileBorderMix: 55%;      /* hover border: accent mixed into separator */
```

(Only percentages — colors themselves come from the accent var per tile. If `trello-light` needs different mixes for contrast, override there.)

### 3.3 Typography

Add three font tokens to `:root` in `colors.css` (fonts don't vary by theme — one block only):

```css
--fontSans: 'Segoe UI Variable Text', 'Segoe UI', 'Museo Sans', system-ui, -apple-system, sans-serif;
--fontDisplay: 'Segoe UI Variable Display', 'Segoe UI', 'Museo Sans', system-ui, sans-serif;
--fontMono: ui-monospace, 'Cascadia Mono', 'SF Mono', Consolas, 'Liberation Mono', monospace;
```

Apply `--fontSans`/`--fontDisplay`/`--fontMono` **within the Boards page module only** (set `font-family: var(--fontSans)` on `.wrapper`). Rolling `--fontSans` app-wide (replacing the global `'Museo Sans'` declaration in `root.module.scss:194`) is a separate opt-in checklist item in §10 — do not do it as a side effect.

Type treatment (from mockup — reproduce exactly):

| Element | Spec |
|---|---|
| Eyebrow `PROJECT` | `--fontMono`, 10.5px, `letter-spacing: .22em`, uppercase, `--borderOutline` |
| H1 project name | `--fontDisplay`, 30px, weight 700, `--textColor0`, `line-height: 1.05` |
| Stat chip number | `--fontMono`, 19px, weight 600, `font-variant-numeric: tabular-nums` |
| Stat chip label | 11px, `--textColor3` |
| Board name | `--fontDisplay`, 15.5px, weight 600, `--textColor0`, `line-height: 1.25`, `text-wrap: balance` |
| Card count / notification pill / lane labels / % | `--fontMono`, 11.5px / 10.5px / 8.5px / 10px, `tabular-nums` where numeric |
| "Showing X of Y" | 12.5px, `--textColor3`, `tabular-nums` |
| Updated time | 10.5px, `--textColor4` |

Spacing (from mockup): main padding `26px 30px 34px`; grid `repeat(auto-fill, minmax(252px, 1fr))`, `gap: 14px`; tile padding `15px 16px 13px`, internal `gap: 12px`; toolbar `margin: 22px 0 6px`, `gap: 12px`.

## 4. Server — board stats aggregation

### 4.1 One query, attached in `projects/index.js`

After `boardIds` is computed (~line 46), run **exactly one** native query for all boards and attach results to the board records already being returned. No per-board queries, no extra HTTP round trip — stats ride the existing `/projects` payload.

```js
const queryResult = await sails.sendNativeQuery(
  `SELECT l.board_id                                   AS "boardId",
          l.id                                         AS "listId",
          l.name                                       AS "listName",
          l.type                                       AS "listType",
          l.position                                   AS "listPosition",
          COUNT(c.id)::int                             AS "cardCount",
          COUNT(c.id) FILTER (
            WHERE l.type <> 'done'
              AND c.due_date IS NOT NULL
              AND c.due_date <= NOW() + INTERVAL '7 days'
          )::int                                       AS "dueSoonCount",
          COUNT(c.id) FILTER (
            WHERE l.type = 'done'
              AND c.updated_at >= NOW() - INTERVAL '7 days'
          )::int                                       AS "doneRecentCount",
          MAX(c.updated_at)                            AS "lastCardActivity"
     FROM list l
LEFT JOIN card c ON c.list_id = l.id AND c.archived_at IS NULL
    WHERE l.board_id IN ($1)
 GROUP BY l.board_id, l.id
 ORDER BY l.board_id, l.position`,
  [boardIds],
);
```

> Note on `IN ($1)`: check how this repo's other `sendNativeQuery` calls bind arrays (the labels helpers are the precedent). If array binding isn't supported, build a `$1,$2,…` placeholder list from `boardIds` — never string-interpolate ids.
>
> Verify an index exists on `card.list_id` (check `server/db/migrations/`). Planka-lineage schemas ship one; if it's missing, add a migration for it — this query is a straight indexed join + group-by either way.

### 4.2 Shape attached to each board record

Fold rows into a `stats` object and attach before returning (`boards = boards.map(...)`). Boards with no lists get the zero-value object, never `undefined`:

```js
stats: {
  lists: [ { id, name, type, cardCount } ],   // ordered by position; done-type lanes render green
  totalCount,        // sum of cardCount over all lists
  openCount,         // sum over lists where type !== 'done'
  doneCount,         // sum over lists where type === 'done'
  dueSoonCount,      // board-level sum
  doneRecentCount,   // board-level sum
  lastActivityAt,    // max(lastCardActivity) as ISO string or null
}
```

Keep `lists` lean — four fields only, no card payloads. For a project with ~10 boards × ~6 lists this is under 2 KB of extra JSON.

### 4.3 Also attach in `projects/show.js`

`show.js` returns a single project the same way (used on direct navigation / refresh into a project URL). Factor the query + fold into a helper `server/api/helpers/boards/get-stats-by-ids.js` and call it from both controllers so the two payloads can't drift.

## 5. Client — data layer

### 5.1 No new fetches

Stats arrive on the board objects inside the existing `/projects` (and project show) payloads. No saga, no API function, no action type changes.

### 5.2 `client/src/models/Board.js`

Add to `static fields`:

```js
stats: attr({ getDefault: () => null }),
```

redux-orm upserts unknown attrs only when declared; without this line the payload field is dropped. Everything downstream must handle `stats === null` (older cached state, race during create) by rendering the tile without fingerprint/progress/meta — name and notification pill only, no crash.

### 5.3 Project-level aggregates (`client/src/selectors/users.js`)

The selector already loops the project's boards once (notifications). In the **same loop**, sum `openCount`, `dueSoonCount`, `doneRecentCount` from each board's `stats` (skip null), and attach to the project ref as `statsTotals: { openCount, dueSoonCount, doneRecentCount }`. Members count needs no work — `memberships.length` already exists on the project ref. **Do not add a second iteration or a new selector that re-walks the ORM** — this selector is already the page's hot path.

### 5.4 Board accent color

New util `client/src/utils/board-accent.js`:

```js
const ACCENTS = ['--peterRiver', '--turquoise', '--wisteria', '--carrot', '--emerald', '--alizarin', '--midnightBlue', '--textColorGold'];
// Tiny deterministic hash of the board id string → stable accent. No deps.
export default function getBoardAccent(boardId) {
  let h = 0;
  for (let i = 0; i < boardId.length; i += 1) h = (h * 31 + boardId.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}
```

The tile sets `style={{ '--accent': \`var(${getBoardAccent(board.id)})\` }}` once; all accent styling inside the tile derives from `var(--accent)` in CSS. Deterministic ⇒ same board always renders the same color, across sidebar and tiles, with zero schema changes.

## 6. Client — UI implementation

### 6.1 Component structure

Split the tile into its own memoized component:

```
client/src/components/Boards/
  Boards.jsx            (page: header, toolbar, grid)
  Boards.module.scss
  BoardTile.jsx         (one tile; React.memo)
  BoardTile.module.scss
```

`BoardTile` receives the board ref object (`{ id, name, notificationsTotal, memberships, stats }`) and `viewMode`. All derived values (fingerprint heights, progress %, relative time) are computed inside `useMemo(() => …, [board.stats, board.notificationsTotal])`. Because the selector produces new refs only when underlying data changes, `React.memo` keeps unchanged tiles from re-rendering on page-level state changes (view toggle flips a class on the grid, not tile props — pass `viewMode` via a single `rows` class on the grid container and let CSS restyle tiles, so toggling view **re-renders zero tiles**).

### 6.2 Tile anatomy (grid mode) — match mockup

Top row: 9×9px accent dot (`border-radius: 3px`, `var(--accent)`), board name, and — right-aligned — the notification pill when `notificationsTotal > 0`: mono 10.5px, text `N new`, red-tinted pill (`--notificationRed` at ~18% bg / ~45% border via `color-mix`, text `#ff9e91`-equivalent: use `color-mix(in srgb, var(--notificationRed) 60%, var(--textColorWhite))`).

**Lane fingerprint** (the signature — get this right):
- Container: flex row, `align-items: flex-end`, `gap: 5px`, height 46px.
- Up to **6 lanes**: `stats.lists.slice(0, 6)`. Each lane = flex column: a bar div + an `<em>` label (list name, mono 8.5px, `--textColor4`, ellipsized, centered).
- Bar height = `max(6, round(count / maxCount * 100))%` of the bar area, where `maxCount` = max cardCount across the board's shown lanes (min height keeps empty lanes visible). Set as inline `style={{ height }}` — computed once in `useMemo`.
- Bar color: `color-mix(in srgb, var(--accent) var(--boardTileAccentMix), var(--backgroundList))`; lanes with `type === 'done'` use `--backgroundGreen` instead of the accent. Hover swaps to the `Hover` mix percentage (CSS only).
- `aria-hidden="true"` on the whole fingerprint; the meta row carries the accessible numbers.

**Progress hairline**: 3px track (`--backgroundList`), green fill `width: {doneCount/totalCount*100}%`, `border-radius: 2px`, with mono % label to the right. Hide the whole row when `totalCount === 0`.

**Meta row**: `{openCount} cards` (mono, "cards" in `--textColor4`) · avatar stack right-aligned (existing avatar component, 21px, first 3 members, then a `+N` chip in `--backgroundColorTmpHighlighted`) · relative updated time (`lastActivityAt`).

Relative time: date-fns `formatDistanceToNowStrict(date, { addSuffix: true })` is acceptable; shorten with a tiny formatter to the mockup's vocabulary (`just now`, `14m ago`, `2h ago`, `1d ago`, `6w ago`). Compute in the tile's `useMemo`. **Do not set up an interval to re-tick times** — staleness within a page visit is fine.

Stale accent: when `lastActivityAt` is more than 7 days old, the time label uses `--textColorGold`.

Whole tile is the existing `<Link>` to the board (keep current routing); hover/focus states per §7.

### 6.3 List (rows) mode

A `rows` class on the grid container switches `grid-template-columns: 1fr`, `gap: 8px`, and restyles tiles to horizontal: name block `flex: 0 0 250px`, fingerprint `flex: 0 0 190px; height: 34px` with lane labels hidden (`display: none`), progress row flexes to fill, meta pinned right. Pure CSS — no conditional JSX between modes.

Persist the mode in `localStorage` key `boardsViewMode` (`'grid' | 'rows'`, default `'grid'`). Read once at mount (`useState` initializer — not an effect).

### 6.4 Project header

Eyebrow `PROJECT` + H1 `{project.name}` + stat chips right-aligned (`margin-left: auto`, wrap on narrow):

| Chip | Value | Source |
|---|---|---|
| open cards | `statsTotals.openCount` | §5.3 |
| members | `project.memberships.length` | exists |
| due this week | `statsTotals.dueSoonCount` — number in `--heroBanner` gold | §5.3 |
| done in last 7 days | `statsTotals.doneRecentCount` | §5.3 |

Chips: `--backgroundList` bg, `--backgroundColorTmpSeparatorLight` 1px border, `--tw-radius-lg`, padding `9px 14px`, min-width 92px. **No subtitle line under the H1.**

### 6.5 Toolbar

Left: "Showing {filtered} of {total} boards" (replaces the current centered header text; reuse the existing `getBoardsText`-style i18n keys — add a new key rather than string-concatenating, see §8). Right: Grid/List segmented control (`--backgroundList` track, active segment `--backgroundColorTmpHighlighted` + `--textColor0`, `aria-pressed`), then the primary button: `--heroBanner` bg, `--heroBannerText` text, weight 700, `--tw-radius`, wrapped in the existing `BoardAddPopup` (manager-only, same condition as today). Keep the existing project-settings and back-to-dashboard icon buttons from the current header, right of the primary button.

### 6.6 Optional — toolbar filter input

Only if trivial: an input styled per mockup (`--backgroundList` bg, 240px) that dispatches the **existing** filter action the sidebar search uses (target `board`). If the existing action isn't cleanly dispatchable from here, skip — the sidebar filter already covers filtering and `isFiltered`/`filteredProjects` already drive the "Showing X of Y" text.

### 6.7 Ghost tile & empty state

Ghost tile (managers only) at the end of the grid: 1.5px dashed `--backgroundColorTmpSeparatorLight` border, `--tw-radius-lg`, min-height matches tiles, centered `＋ New board` in `--textColor4`; hover → `--borderOutline` border/text. Wrapped in `BoardAddPopup`. When the project has zero boards, the ghost tile **is** the empty state (replaces the current `.info` block).

## 7. Performance requirements (hard constraints)

1. **One extra SQL query per `/projects` request, total.** Never per-board. No new endpoints, no client-side fan-out fetching.
2. **Zero extra client fetches.** Stats ride existing payloads.
3. **Compositor-only animations.** Tile hover: `transform: translateY(-3px)` + shadow via a pre-rendered `::after` (`box-shadow` painted once, `opacity` 0→1 transitioned). **Do not transition `box-shadow` directly** (paints every frame) — this differs from the mockup, which took the lazy path. Transition `transform`, `opacity`, `border-color` only, 180ms ease.
4. **`prefers-reduced-motion: reduce`** disables the transform/opacity transitions (border-color may stay).
5. **Fingerprint = plain divs.** No SVG, no canvas, no chart lib, no mount animation.
6. **Memoization discipline.** `BoardTile` wrapped in `React.memo`; derived values in one `useMemo`; view toggle must not re-render tiles (class flip on the container, verified with React DevTools profiler).
7. **No timers.** No `setInterval` for relative times, no polling.
8. **No new dependencies.**
9. **Selector budget.** The only selector change is additive sums inside the existing board loop in `users.js` (§5.3). No new ORM-walking selectors.
10. **Bundle discipline.** date-fns imports must be per-function (`import { formatDistanceToNowStrict } from 'date-fns'` — check existing import style in the repo and match it so tree-shaking holds).

## 8. i18n

All new strings go through the existing i18n setup (`client/src/locales/en/core.js` + the pattern used for other locales): `showingOfBoards` ("Showing {{filtered}} of {{total}} boards"), `openCards`, `members`, `dueThisWeek`, `doneLast7Days`, `newBoard`, `gridView`, `listView`, `newNotifications` ("{{count}} new"), plus relative-time short forms if not derivable from date-fns locale. Follow how `common.showing` / `common.ofBoards` are structured today.

## 9. Verification

1. `cd server && npm run lint` · `cd client && npm run lint` — both clean.
2. Seeded project: open the boards page — tiles show fingerprints matching real list card counts (cross-check one board by opening it and counting); archived cards excluded.
3. Board with zero lists and board with `stats: null` render name-only tiles without errors.
4. Grid/List toggle: instant, persists across reload (localStorage), and React profiler shows **zero tile re-renders** on toggle.
5. Filter (sidebar): "Showing X of Y boards" updates; hidden tiles unmount or hide consistently with current behavior.
6. All three themes (`default`, `github-dark`, `trello-light`): tiles legible, fingerprint bars visible, gold button readable.
7. Notification pill appears only when `notificationsTotal > 0` and matches the sidebar count.
8. Network tab: `/projects` payload grew only by the `stats` objects; no new requests on page load or view toggle.
9. Keyboard: tiles focusable in DOM order, visible focus ring (`--borderOutline` 2px outline), Enter opens board; toggle is `aria-pressed`-correct.
10. `prefers-reduced-motion` emulation: no hover lift.
11. After code changes: `graphify update .` (repo convention, AGENTS.md/CLAUDE.md).

## 10. Progress tracking

> Update this section as you work: tick boxes, and keep the status line below current. If you deviate from the spec, record what and why under **Deviations**.

**Status:** All phases (1–6) implemented; §9 verified live for Phases 1–3 · Last updated: 2026-07-14 · Updated by: Sonnet (implementation pass); §9 verified live by RicardoRheeder. Phase 4/5/6 additions (filter input, admin board-create, sidebar/topbar reskin, members-count fix) confirmed by build/lint only — not yet re-verified live.

### Phase 1 — Server stats (shippable: payload grows, UI unchanged)
- [x] `server/api/helpers/boards/get-stats-by-ids.js` — single aggregate query (§4.1) + fold to shape (§4.2)
- [x] Verify/add index on `card.list_id` (check migrations) — already indexed in `20180722003614_create_card_table.js`, no migration needed
- [x] Attach `stats` in `projects/index.js`
- [x] Attach `stats` in `projects/show.js`
- [x] Client `models/Board.js`: `stats: attr(...)` (§5.2)
- [x] Manual check: `/projects` response carries correct `stats` for a seeded board — confirmed against live DB

### Phase 2 — Tokens & data plumbing
- [x] `colors.css`: §3.2 mix tokens — added to `:root` (inherited by `github-dark` per file's existing convention) and overridden in `trello-light` for contrast
- [x] `colors.css`: §3.3 font tokens in `:root`
- [x] Board accent color — reused existing `utils/board-colors.js` (`getBoardAccentColor`) instead of building a new `board-accent.js`; see Deviations
- [x] `selectors/users.js`: `statsTotals` sums inside existing loop (§5.3)

### Phase 3 — Boards page UI (the visible change)
- [x] `BoardTile.jsx` + `BoardTile.module.scss` — tile anatomy §6.2, perf rules §7
- [x] `Boards.jsx` rewrite — header (§6.4), toolbar (§6.5), grid, ghost/empty (§6.7)
- [x] List/rows mode + localStorage persistence (§6.3)
- [x] i18n keys (§8) — added `openCards`, `dueThisWeek`, `doneLast7Days`, `unreadNotificationsCount_one/_other`; `showingOfBoards`/`newBoard`/`gridView`/`listView`/`members` reused existing keys, see Deviations
- [x] Verification pass §9 complete — all 11 items confirmed against a live DB-backed instance

### Phase 4 — Optional polish (each independently skippable)
- [x] Toolbar filter input wired to existing filter action (§6.6) — `BoardsContainer.js` now selects `filterQuery` (from `selectFilterForCurrentUser`, target `'board'`) and dispatches `entryActions.updateCurrentUserFilterQuery`; `Boards.jsx` renders a controlled `Input` reading that value directly from the store (not local component state) so it stays in sync with the sidebar's own `Filter` instance instead of duplicating/desyncing it — see Deviations #9
- [x] Sidebar board rows: accent swatch (same accent util) + right-aligned mono open-count from `stats` — `Sidebar.jsx` board rows now show a `getBoardAccentColor(board.id)` swatch and `board.stats.openCount` (guarded for boards with `stats: null`)
- [x] App-wide `--fontSans` rollout — **explicit sign-off given by RicardoRheeder on 2026-07-14.** Replaced the global `body` font-family in `assets/styles.css` and the `.react-datepicker` override in `root.module.scss`; left the `@font-face` blocks in `assets/styles.css` untouched (still needed — `--fontSans` keeps `'Museo Sans'` as a fallback). Removed now-redundant per-component `font-family: var(--fontSans)` declarations in `Boards.module.scss` (`.wrapper`, `.seg button`, `.ghost`, `.filterInput`) since form controls and the page body already inherit it via the existing sanitize.css-style reset (`button, input, ... { font-family: inherit }`).

### Phase 5 — Follow-up from live review (not in original spec; added 2026-07-14)

Prompted by live feedback after Phase 4 shipped: the "+ Add Board" button was missing for a non-manager admin account, and the sidebar/topbar didn't visually match the mockup.

- [x] **"+ Add Board" visible to admins, not just project managers** — `Boards.jsx`: split the old single `isProjectManager` gate into `isProjectManager` (unchanged) and `canCreateBoards = isProjectManager || isAdmin`; the button and ghost tile now use `canCreateBoards`, the project-settings gear link stays `isProjectManager`-only (that's a different, more consequential authorization surface — rename/delete project, manage managers — not part of this ask). Also fixed `BoardAddPopup`'s `projects` prop: it derives its initial selection from `projects.find(p => p.id === projectId)`, and since `managedProjects` doesn't include a project the admin doesn't manage, submission was failing client-side (`isDropdownError`) even with the gate open — `boardAddPopupProjects` now appends `{id, name}` for the current project when it's missing from `managedProjects`.
- [x] **Server-side admin bypass for board creation** — `server/api/controllers/boards/create.js:95`: `if (!isProjectManager)` → `if (!isProjectManager && !currentUser.isAdmin)`. This was necessary, not optional: the server rejected the request regardless of what the client showed, and `BoardAddPopup` closes optimistically before the server responds, so a rejected request would have silently made the new board vanish with no visible error. Confirmed the board creator is auto-added as a board member (`create-one.js:124-131`, unconditional on manager status) so the admin can see/access boards they create this way.
- [x] **Sidebar/topbar visual reskin to match the mockup** — CSS-only, no JSX/functional changes (drag-and-drop reordering, project collapse, settings-only mode, sidebar-compact mode, the target-toggle filter all untouched):
  - `Sidebar.module.scss`: `.sidebar` background darkened from `--backgroundSidebar` to `--backgroundHeader` (matches the mockup's panel tone, and now matches `Header`/`ProjectNav`'s existing background for a cohesive chrome); added `10px 8px` padding and `8px` gap between the filter/list/footer sections. Project and board rows lost their flat boxed backgrounds in favor of the mockup's flatter language — transparent by default, `--backgroundSidebarItem2` on hover, `var(--tw-radius)` corners. Project row labels gained uppercase/letter-spacing/bold (`.sidebarItemProject .sidebarButton`) to read as a group header purely through type, matching the mockup's `.proj` styling, instead of a boxed bar. Added `.scrollable > div + div { margin-top: 6px }` (structural sibling selector, no new className) to keep spacing between project groups now that the border-top separator is gone. Active-row highlighting (`.sidebarItemActive`/`.sidebarActive`) kept its existing background/left-border accent — the mockup never depicted a "current board" state to reference — just gained matching corner radius.
  - `Filter.module.scss`: `.field` (the search input) background changed to `--backgroundColor` (`!important`, overriding the shared `Input` component's default) — needed once the sidebar darkened, since the `Input` default background (`--backgroundColorTmpDarkerField2`) is nearly identical to the new `--backgroundHeader` sidebar bg and the box would have visually disappeared. Verified the same relative-lightness relationship holds in `github-dark` and `trello-light`.
  - `Button.module.scss`: `.header` (the 50×50 icon buttons in the app's top `Header.jsx` — single consumer, confirmed via grep) gained rounded corners on hover, matching the mockup's icon-button treatment. Kept the 50×50 hit area rather than shrinking it to the mockup's 30×30 — a bigger click target isn't a regression.
  - **`ProjectNav.jsx`/`.module.scss` (the Boards/Gantt/Wiki/… tab row) was left unchanged** — it already uses `--backgroundHeader`, a bottom-border active indicator in `--borderOutline`, and hover color transitions, which is functionally the same treatment the mockup's tab row was going for. No mismatch to fix there.
  - **Not done:** `Header.jsx` itself (logo lockup, dashboard title, notification bell, avatar) was left as-is beyond the icon-button radius touch above — it was already dark, bordered, and icon-driven like the mockup's topbar, and a fuller pass wasn't clearly asked for versus the sidebar specifically. Flag if a closer visual match is wanted there too.

### Phase 6 — Bug fix: incomplete "Members" count on first load (not in original spec; added 2026-07-14)

**Symptom (reported by RicardoRheeder):** the project header's "Members" stat showed `1` on first landing on the Boards page, then corrected itself after visiting a board and navigating back. Expected: the union of every unique member across all of the project's boards.

**Root cause — pre-existing, not introduced by this feature.** `server/api/controllers/projects/index.js` and `server/api/controllers/projects/show.js` both fetched `boardMemberships` scoped to `userId: currentUser.id` (via `sails.helpers.users.getBoardMemberships` / `sails.helpers.boardMemberships.getMany({ ..., userId: currentUser.id })`) and returned *that* same current-user-only list to the client as `included.boardMemberships`. `client/src/selectors/users.js`'s `memberships` aggregation (§5.3, the logic feeding the "Members" stat) was already correct — it unions `boardModel.memberUsers` across every board — but `boardModel.memberUsers` is a redux-orm relation resolved through the client's local `BoardMembership` table, which only ever had one row per board (the current user's own). So the stat was only ever as complete as whatever board-membership data happened to already be in the store. Opening a board fetches that board's *own* full membership list via a different endpoint, which is why "enter a board and exit" fixed it — it backfilled the store for that one board, and redux-orm state persists across in-app navigation.

The same pattern was already fixed once for `projectMemberships` in `projects/index.js` (see the comment at line 36: *"Every accessible project's full member list... so Gantt/Team Planner can resolve all project members"*) but the equivalent fix was never applied to `boardMemberships` — this is that same fix, applied to the sibling case.

- [x] **`projects/index.js`** — the original `boardMemberships` fetch (current-user-scoped) is kept, renamed `currentUserBoardMemberships`, and used *only* for its original purpose: computing `membershipBoardIds`, i.e. which non-managed boards this user can see. A new, separate `boardMemberships` is fetched *after* the final `boardIds` set is known: `sails.helpers.boardMemberships.getMany({ boardId: boardIds })` — no `userId` filter, so it returns every member of every returned board. `userIds`/`users` (needed so the client's `User` table actually has an entity for each referenced member) now also unions in `mapRecords(boardMemberships, 'userId', true)`.
- [x] **`projects/show.js`** — same shape: the current-user-scoped fetch is kept (renamed `currentUserBoardMemberships`) and still drives the exact same access-control branch (`if (!isProjectManager) { ...forbidden check...; boardIds = ...; boards = boards.filter(...) }`, unchanged). The full `boardMemberships` for the client is fetched afterward, scoped to the *final* `boardIds` (so a non-manager still only sees memberships for boards they can access — no broadening of what's visible, only completeness of who's shown as a member of what they can already see). `users` also gained the board-membership user ids.
- **No access-control change.** Both fixes are purely about what's *returned* to an already-authorized client, not about which projects/boards a user can see — the exact same `membershipBoardIds`/`boardIds` narrowing logic drives visibility before and after.
- **Cost:** one additional batched query per request (`boardId IN (...)`, no per-board fan-out) — same "one extra query, never per-item" constraint the stats work (§7.1) already established.
- Verified: client's `BoardMembership` model (`models/BoardMembership.js`) already `upsert`s every row in `payload.boardMemberships` individually keyed by its own id — confirmed no client-side capping, the bug was entirely the server payload.
- [ ] Live re-check pending — same caveat as Phase 4/5, confirmed by lint only so far.

### Deviations

1. **Board accent color reuses `utils/board-colors.js` instead of a new `board-accent.js` (§5.4).** That util (`getBoardAccentColor(boardId)`) already exists and is already used by Gantt/Timeline/Timesheet for deterministic per-board coloring. Reusing it means a board now has the *same* accent color in its Gantt bars, timesheet rows, and its boards-overview tile — better than a second, unrelated hash → 8-color-avatar-palette system the spec proposed before this file was found. `BoardTile.jsx` sets `style={{ '--accent': getBoardAccentColor(board.id) }}`; all tile accent CSS derives from `var(--accent)` exactly as spec'd, just fed by a different (better) source.
2. **"Due this week" stat number uses `--dueDateClose` instead of `--heroBanner` (§3.1, §6.4).** `--heroBanner`/`--heroAccent` are the app's existing "hero card" feature tokens (List/Card/ArchiveView/CardModal), a specific unrelated concept (pinned/highlighted cards) — reusing them for a due-soon stat would overload that meaning app-wide. `--dueDateClose` is the token `DueDate.jsx` already uses for "due soon" warning color, in both dark and light themes, and delivers the same gold/amber visual the mockup wanted while staying semantically correct. `--heroBanner`/`--heroBannerText` were kept for the "＋ Add Board" CTA per §6.5, since that's a plain accent-CTA reuse, not a semantic mismatch.
3. **"＋ Add Board" button text stays as `common.addBoard` ("Add Board"), not the mockup's "New board" copy.** The existing `BoardAddPopup` trigger elsewhere in the app already reads "Add Board"; keeping the same string for the same action avoids the interface using two names for one thing (see the copy-consistency rule: an action keeps its name through the whole flow).
4. **Toolbar "Showing X of Y boards" text reuses the existing `getBoardsText()` logic verbatim** (`common.showing` + `common.boards`/`common.ofBoards`, both already pluralization-aware) instead of adding a new `showingOfBoards` key as §8 proposed — the existing keys already produce the exact string needed, so no new key was justified.
5. **Relative "updated" time uses `date-fns`'s default English phrasing** (`formatDistanceToNowStrict(date, { addSuffix: true })`, e.g. "2 hours ago") rather than the mockup's terse "14m ago" style, and does **not** wire in the 16-language locale map `DueDate.jsx` uses for due dates. Terse abbreviations aren't used anywhere else in the app and don't localize; wiring the full locale map for a decorative staleness indicator was judged disproportionate. Net effect: this one label always renders in English regardless of UI language — flagged here in case that's not acceptable, in which case copy `DueDate.jsx`'s `localeMap` into a shared util.
6. **Progress hairline and lane fingerprint are hand-rolled `<div>`s in `BoardTile.module.scss`, not the existing `ProgressBar` component.** `ProgressBar` hardcodes a white track background and a red→green traffic-light color scale keyed off percentage — both wrong for a tile that always shows a flat green "done" fill on a dark/theme-aware track. Overriding that much of `ProgressBar`'s own CSS would fight it more than building the thin hairline directly, so it's a new, purpose-built (and much simpler) element instead.
7. **"Showing 8 Boards [Selected Project]" bracket suffix was dropped entirely**, not just the requested subtitle. `common.selectedProject` was a static, always-on qualifier with no dynamic behavior; now that the project name is a prominent H1, repeating "[Selected Project]" next to it was redundant. `common.selectedProject` itself is untouched — it's reused elsewhere (project pickers in `BoardAddPopup`, `CardMoveStep`, etc.) — only this one static usage was removed.
8. **Member avatars reuse the existing `User` component at `size="tiny"` (24px)** rather than a new 21px avatar, and the "+N" overflow chip is a small custom element (not `Memberships.jsx`, which is a full editable-membership popup system — far more than a read-only stack needs).
9. **Toolbar filter input (§6.6) does not reuse `Filter.jsx` directly.** `Filter.jsx` keeps its typed `value` as local component state, and it's already mounted once, persistently, in `Sidebar.jsx`. Mounting a second `<Filter>` instance in the Boards toolbar would give two independent local-state inputs both writing to the *same* shared redux `filter` state — typing in one would not update the other's displayed value, a real desync bug, not just a style mismatch. Instead, `Boards.jsx` renders a plain controlled `Input` whose `value` comes straight from the store (`filterQuery` prop, sourced via `selectFilterForCurrentUser` in `BoardsContainer.js`) and whose `onChange` dispatches the same `entryActions.updateCurrentUserFilterQuery({ query, target: 'board' })` action `Filter.jsx` uses internally. Both inputs now read/write the one source of truth, so they can't drift apart. `Filter.jsx` itself is untouched.
10. **Several `font-family: var(--fontSans)` declarations added during Phase 3 were removed as part of the Phase 4 font rollout**, not just added-to. Once `body`'s font-family became `var(--fontSans)` (Phase 4), the app's existing `button, input, optgroup, select, textarea { font-family: inherit }` reset (`assets/styles.css`) meant those controls already inherited it — the per-component declarations in `Boards.module.scss` (`.wrapper`, `.seg button`, `.ghost`, `.filterInput`) became dead, redundant CSS and were deleted rather than left in place.

### Verification results

- **Lint (Phase 1–3):** `cd client && npx eslint` over all changed files (`Boards.jsx`, `BoardTile.jsx`, `Boards.module.scss`-adjacent JS, `selectors/users.js`, `models/Board.js`, `locales/en/core.js`, `utils/board-colors.js`) — clean, 0 errors/warnings. `cd server && npx eslint` over `get-stats-by-ids.js`, `projects/index.js`, `projects/show.js` — clean.
- **Lint (Phase 4):** `cd client && npx eslint` over `Boards.jsx`, `BoardsContainer.js`, `Sidebar.jsx` — clean, 0 errors/warnings.
- **SCSS syntax:** `npx sass` compiled `BoardTile.module.scss`, `Boards.module.scss`, `Sidebar.module.scss`, `root.module.scss`, `colors.css`, and `assets/styles.css` standalone — no syntax errors.
- **Build:** `npm run client:start` compiled successfully; app boots and runs sagas/i18n with zero runtime errors from the new code (confirmed via browser console in a sandbox without a reachable Postgres instance, so this only covered bundling/boot, not the live page).
- **§9 items 2–11** (seeded-project fingerprint accuracy, zero/null-stats boards, Grid/List re-render behavior, filter interaction, three-theme visual check, notification pill parity, network payload diff, keyboard/focus behavior, reduced-motion check) — **verified live by RicardoRheeder against a running DB-backed instance on 2026-07-14. All good.** (Verification predates Phase 4; the Phase 4 additions — toolbar filter input, sidebar swatches/counts, app-wide font — have not yet had a separate live pass.)
- `graphify update .` — run after Phase 1–3 and again after Phase 4; graph current.
