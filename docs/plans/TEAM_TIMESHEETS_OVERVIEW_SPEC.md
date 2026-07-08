# Team Timesheets Overview — Implementation Spec

**Status:** Approved for implementation. This document is self-contained — implement exactly what is written here without needing prior conversation context.

**Goal:** A Jibble-style admin overview of *everyone's* timesheets: one table where rows are members, columns are days, cells are that member's total tracked time for that day, with a Total column, week/month navigation, member search, drill-down into an individual's timesheet, and Export. Reference: Jibble's "Timesheets" screen (Weekly Timesheets ▾ | ‹ › date range | Export; search box; member rows with avatars; M/T/W/T/F/S/S day columns showing durations like `4h 30m` or `-`; bold Total column).

---

## 1. What already exists (do not rebuild)

The personal timesheet feature (Milestone 3) is complete and live:

| Area | Files |
|---|---|
| Server model/table | `server/api/models/TimeEntry.js` (`time_entry`: `user_id`, `project_id?`, `card_id?`, `started_at`, `ended_at`, `description`, `imported_from`, `created_by_id`, `updated_by_id`) |
| Server helpers | `server/api/helpers/time-entries/` (`create-one`, `update-one`, `delete-one`, `get-many`, `get-one`, `resolve-link`) |
| Server controllers | `server/api/controllers/time-entries/` (`index`, `create`, `update`, `delete`, `export`, `import`) |
| Routes | `server/config/routes.js` — `GET/POST /api/time-entries`, `PATCH/DELETE /api/time-entries/:id`, `GET /api/time-entries/export`, `POST /api/time-entries/import` |
| Client page | `client/src/components/Timesheet/` (`Timesheet.jsx` — week grid page with admin member switcher "Viewing: Me ▾", Import/Export buttons; `WeekGrid.jsx`; `EntryPopup.jsx`; `ProjectTicketPicker.jsx`; `ExportStep.jsx`/`ExportPopup.jsx`; `ImportStep.jsx`/`ImportPopup.jsx`; `PrintSummary.jsx`) + `client/src/containers/TimesheetContainer.js` |
| Client data layer | Full vertical slice: `client/src/api/time-entries.js`, transformers, `models/TimeEntry.js` (redux-orm), actions/entry-actions/sagas/watchers/socket handlers, `selectors/time-entries.js` |
| Routing | `Paths.TIMESHEET = /timesheet` → `Root.jsx` route → `Static.jsx` branch rendering `<SidebarContainer><TimesheetContainer/></SidebarContainer>`; Header clock icon + UserPopup menu entry |

Key behavioral facts you must stay consistent with:

- **Duration attribution:** the personal week grid attributes an entry's **full duration to its start day** (`WeekGrid.jsx` header totals group by `startOfDay(entry.startedAt)` and sum full `endedAt - startedAt`). The overview MUST use the same rule so numbers match when drilling down.
- **Week starts Monday:** `startOfWeek(date, { weekStartsOn: 1 })` everywhere.
- **Duration formatting:** `Xh Ym` (`4h 30m`, `45m`, `2h`) — a local `formatDuration(minutes)` helper currently duplicated in `Timesheet.jsx`, `WeekGrid.jsx`, and `PrintSummary.jsx`.

---

## 2. Codebase conventions (mandatory)

1. **`connect()` HOC only.** This codebase has ZERO `useSelector`/`useDispatch`. Containers live in `client/src/containers/`, use `connect(mapStateToProps, mapDispatchToProps)` with `bindActionCreators` over `entryActions`. React-router hooks (`useNavigate`, `useLocation`) inside presentational components are fine (precedent: `UserPopup.jsx`).
2. **Aggregate endpoints use a `ui` reducer slice, not the ORM.** Mirror the existing `membersOverview` slice exactly (see §4.2 for the precedent shapes).
3. **SCSS modules** wrapped in `:global(#app) { ... }`, colors via CSS variables from `client/src/colors.css` (e.g. `--backgroundColorTmpSeparatorLight`, `--backgroundColorTmpDarkerField1`, `--textColor0..3`, `--backgroundSidebarItemActive`, `--colorDanger`). Import as `import * as s from './X.module.scss';`.
4. **UI primitives** from `client/src/components/Utils`: `Button/ButtonStyle`, `Icon/IconType/IconSize`, `Dropdown/DropdownStyle`, `Input/InputStyle`, `Loader/LoaderSize`. Avatars via the `User` component (`client/src/components/User`): `<User name={u.name} avatarUrl={u.avatarUrl} size="small" />`.
5. **Locale:** all strings in `client/src/locales/en/core.js` under `translation.common` (or `translation.action` for verbs). `_title` suffix keys are used with `t('key', { context: 'title' })`.
6. **Sails controllers:** actions2 style — `inputs`/`exits`/`async fn(inputs)`, an `Errors` map of plain objects, `throw Errors.X` mapped via `exits.*.responseType` (`forbidden`, `notFound`, etc.).
7. **Lint before done:** `cd client && npx eslint src` and `cd server && npm run lint`. Both currently have a fixed set of pre-existing findings in unrelated files (Priorities/discord/http.js etc.) — introduce **zero new** findings. Use `npx eslint --fix` for prettier formatting. Then `cd client && CI=true npm run build` must print `Compiled successfully.`
8. **Server restarts:** route/controller changes need a server restart. If port 1337 is occupied by an orphaned `node.exe`, kill that PID and start again.
9. **Prettier:** long lines are fine (print width ~200+); let `--fix` settle formatting rather than hand-wrapping.

---

## 3. Server work

### 3.1 New controller: `server/api/controllers/time-entries/overview.js`

Admin-only aggregation endpoint. Shape it like `server/api/controllers/members-overview/index.js` (admin gate) combined with the input style of `time-entries/index.js`.

```
GET /api/time-entries/overview?from=<ISO>&to=<ISO>&timezone=<IANA>
```

**Inputs:**
- `from` — string, required (ISO datetime; inclusive lower bound)
- `to` — string, required (ISO datetime; exclusive upper bound)
- `timezone` — string, optional, defaults to `'UTC'` (browser-reported IANA zone; used only for day bucketing)

**Auth:** `if (!this.req.currentUser.isAdmin) throw Errors.NOT_ENOUGH_RIGHTS;` (`notEnoughRights` → `forbidden`).

**Logic:**
1. `const timeEntries = await sails.helpers.timeEntries.getMany({ startedAt: { '<': new Date(inputs.to) }, endedAt: { '>': new Date(inputs.from) } });`
2. Bucket each entry by its **start day in the requested timezone**, attributing the **full duration** to that day (this matches the personal week grid — see §1):
   ```js
   const dayKey = new Date(entry.startedAt).toLocaleDateString('en-CA', { timeZone }); // 'YYYY-MM-DD'
   const minutes = Math.round((new Date(entry.endedAt).getTime() - new Date(entry.startedAt).getTime()) / 60000);
   ```
3. Aggregate per user: `days[dayKey] += minutes`, `totalMinutes += minutes`, and count entries per user (`entriesCount`).
4. **Response:**
   ```json
   {
     "items": [
       { "userId": "123", "totalMinutes": 2233, "entriesCount": 9, "days": { "2026-07-06": 480, "2026-07-07": 271 } }
     ]
   }
   ```
   Only include users who have at least one entry in range. Do **not** return user names/avatars — the client joins against the users it already has in the ORM (admins always have the full user list loaded).

### 3.2 Route

In `server/config/routes.js`, next to the existing time-entries routes:

```js
'GET /api/time-entries/overview': 'time-entries/overview',
```

(No conflict exists — there is no `GET /api/time-entries/:id` route.)

---

## 4. Client work

### 4.1 API module

In `client/src/api/time-entries.js` add and export:

```js
const getTimeEntriesOverview = (data, headers) => socket.get('/time-entries/overview', data, headers);
```

(`data = { from: ISO string, to: ISO string, timezone }`.)

### 4.2 New `ui` slice: `timesheetOverview`

Mirror the `membersOverview` slice **file-for-file** (read these files first and copy their exact structure):

| Precedent file | New file |
|---|---|
| `client/src/reducers/ui/members-overview.js` | `client/src/reducers/ui/timesheet-overview.js` |
| `client/src/selectors/members-overview.js` | `client/src/selectors/timesheet-overview.js` |
| `client/src/actions/members-overview.js` | `client/src/actions/timesheet-overview.js` |
| `client/src/entry-actions/members-overview.js` | `client/src/entry-actions/timesheet-overview.js` |
| `client/src/sagas/core/services/members-overview.js` | `client/src/sagas/core/services/timesheet-overview.js` |
| `client/src/sagas/core/watchers/members-overview.js` | `client/src/sagas/core/watchers/timesheet-overview.js` |

Differences from the precedent:
- The fetch takes params: `fetchTimesheetOverview(params)` where `params = { from: Date, to: Date }`. The **service** converts to the wire format and appends the browser timezone:
  ```js
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  ({ items } = yield call(request, api.getTimeEntriesOverview, { from: params.from.toISOString(), to: params.to.toISOString(), timezone }));
  ```
- ActionTypes / EntryActionTypes: `TIMESHEET_OVERVIEW_FETCH`, `TIMESHEET_OVERVIEW_FETCH__SUCCESS`, `TIMESHEET_OVERVIEW_FETCH__FAILURE` — add to `client/src/constants/ActionTypes.js` and `EntryActionTypes.js` in a `/* Timesheet overview */` block near the time-entries block.
- Reducer state: `{ isFetching: false, items: [], error: null }` — same as precedent.

**Registration (all of these, or the feature silently won't work):**
- `client/src/reducers/ui/index.js` — add `timesheetOverview` to `combineReducers`.
- `client/src/selectors/index.js`, `client/src/actions/index.js`, `client/src/entry-actions/index.js` — spread imports (alphabetical-ish near `time-entries`).
- `client/src/sagas/core/services/index.js` — spread object; `client/src/sagas/core/watchers/index.js` — **array**, not spread (check the file, it differs from services).
- `client/src/api/index.js` — already spreads `timeEntries`; the new function rides along.

### 4.3 Routing + access points

1. `client/src/constants/Paths.js`: add `const TIMESHEET_TEAM = \`${Config.BASE_PATH}/timesheet/team\`;` and include it in the export object right after `TIMESHEET`. (Path matching against `Object.values(Paths)` is automatic — no other router wiring beyond the two files below.)
2. `client/src/components/Root.jsx`: add `<Route path={Paths.TIMESHEET_TEAM} element={<CoreContainer />} />` right after the TIMESHEET route.
3. `client/src/components/Static/Static.jsx`: add a branch right after the `Paths.TIMESHEET` branch, identical in structure, rendering `<SidebarContainer><TeamOverviewContainer /></SidebarContainer>`.
4. `client/src/components/Header/Header.jsx`: in `getPageHeaderTitle`, add `case Paths.TIMESHEET_TEAM: return t('common.teamTimesheets');` (place the case **before** `Paths.TIMESHEET`'s case is irrelevant — it's a switch on exact path, just add it).
5. **Access points:**
   - In `Timesheet.jsx` toolbar (admin only, next to the member switcher): a `Button` (`ButtonStyle.NoBackground` styled like the existing `todayButton`) linking to the team view. Use `Link` from `react-router` like `Header.jsx` does: `<Link to={Paths.TIMESHEET_TEAM}>…</Link>` with label `t('common.teamView')`. Render only when `isAdmin`.
   - In the team overview toolbar: a `Link` back to `Paths.TIMESHEET` labeled `t('common.myTimesheet')`.

### 4.4 Shared util: extract `formatDuration`

Create `client/src/utils/format-duration.js`:

```js
export default (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
};
```

Update `Timesheet.jsx`, `WeekGrid.jsx`, and `PrintSummary.jsx` to import it and delete their local copies. The new overview component uses it too.

### 4.5 Container: `client/src/containers/TeamOverviewContainer.js`

```js
mapStateToProps: {
  isAdmin: !!(currentUser && currentUser.isAdmin),   // selectors.selectCurrentUser
  users: selectors.selectUsers(state),                // already sorted, has name + avatarUrl
  overview: selectors.selectTimesheetOverview(state), // { isFetching, items, error }
  projects,                                           // selectors.selectProjectsForCurrentUser(state).projects — for ExportPopup
  accessToken: selectors.selectAccessToken(state),    // for the export download fetch
}
mapDispatchToProps: {
  onFetch: entryActions.fetchTimesheetOverview,
}
```

Export handling: reuse the exact `handleDownloadCsv` approach from `Timesheet.jsx` (calls `api.exportTimeEntries` directly with `Authorization: Bearer ${accessToken}` and `triggerDownload` from `client/src/utils/trigger-download.js`) — the overview page passes `allMembers: true` by default in its export handler when the admin picks "All members" scope (the existing `ExportStep` already has the member-scope dropdown; just render `<ExportPopup projects={projectOptions} isAdmin viewedUserName={undefined} …>` the same way `Timesheet.jsx` does).

### 4.6 Component: `client/src/components/Timesheet/TeamOverview.jsx` (+ `.module.scss`)

`React.memo` function component. **Local state** (not redux): `viewMode` (`'week' | 'month'`), `periodStart` (a `Date`; `startOfWeek(new Date(), { weekStartsOn: 1 })` or `startOfMonth` depending on mode), `query` (search string), `hideEmpty` (bool, default `false`).

**Admin gate:** if `!isAdmin`, `useEffect` → `navigate(Paths.TIMESHEET)` and render `null`. (Import `useNavigate` from `react-router`.)

**Data fetch:** `useEffect` on `[viewMode, periodStart]` → `onFetch({ from: periodStart, to: periodEnd })` where `periodEnd = addWeeks(periodStart, 1)` or `addMonths(periodStart, 1)`.

**Derived data (useMemo):**
- `days = eachDayOfInterval({ start: periodStart, end: subDays(periodEnd, 1) })` (date-fns; 7 or 28–31 days).
- `overviewByUserId = new Map(overview.items.map((i) => [i.userId, i]))`.
- `rows`: map over `users` (all of them — admins have the full list), join `{ user, days, totalMinutes }`, then:
  - filter by `query` (case-insensitive substring on `user.name`),
  - if `hideEmpty`, drop rows with `totalMinutes === 0` (or missing).
  - Keep the `selectUsers` order (current user first, then alphabetical) — do not re-sort.
- Day keys for cell lookup: `format(day, 'yyyy-MM-dd')` — this matches the server's `en-CA` bucketing because the browser's timezone was sent with the request.

**Page layout** (mirror the structure/classes of `Timesheet.jsx` — `pageHeader` with `pageTitle`/`pageDescription`, then a `toolbar`, then `content`):

- **Header:** title `t('common.teamTimesheets')`, description `t('common.teamTimesheetsDescription')`.
- **Toolbar row:**
  1. View-mode `Dropdown` (`DropdownStyle.Default`, ~150px): options `t('common.weeklyTimesheets')` / `t('common.monthlyTimesheets')`. Switching mode re-anchors `periodStart` (`startOfWeek(today)` / `startOfMonth(today)`).
  2. Nav group identical to `Timesheet.jsx`: `‹` prev, `Today`, `›` next (`addWeeks(d, ±1)` or `addMonths(d, ±1)`), then a period label: week → `MMM d – MMM d, yyyy`; month → `MMMM yyyy`.
  3. Search `Input` (`InputStyle.Default`, placeholder `t('common.searchMembers')`, ~200px) bound to `query`.
  4. A `Checkbox` + label `t('common.hideMembersWithNoTime')` toggling `hideEmpty`.
  5. `<div className={s.spacer} />`
  6. `Link` to `Paths.TIMESHEET` → `Button` `ButtonStyle.NoBackground` label `t('common.myTimesheet')`.
  7. `ExportPopup` trigger `Button` `ButtonStyle.DefaultBorder` label `t('common.export')` (see §4.5).
- **Table** (`content` area, `overflow: auto` both axes; plain divs with CSS grid or an HTML `<table>` — implementer's choice, but must have):
  - **Sticky header row** (`position: sticky; top: 0;` background `var(--backgroundColorTmpBackground)`): first column blank/member header, one column per day showing weekday initial/abbrev (`format(day, 'EEE')` for week, `format(day, 'EEEEE')` or day-of-month only for month) over the day number (`format(day, 'd')`), last column `t('common.total')`.
  - **Sticky first column** (member): `position: sticky; left: 0;` same background — required for the month view's horizontal scroll.
  - **Today column** highlighted (`isSameDay(day, new Date())` → background `var(--backgroundColorTmpDarkerField1)` on header cell and body cells). Weekend columns (Sat/Sun) slightly dimmed (`opacity: 0.75` on the cell text or a subtle background).
  - **Member cell:** `<User name size="small" …/>` + name, click target (see drill-down).
  - **Data cells:** `formatDuration(minutes)` or the literal `–` (en dash, `opacity: 0.4`) when 0/absent. Right-align or center; `font-size: 12px`.
  - **Total cell:** bold (`font-weight: 700`, `color: var(--textColor0)`), `–` when zero.
  - Row hover: `background: var(--backgroundColorTmpBackgroundHover)`.
  - Column widths: member column `minmax(180px, 240px)`; day columns week mode `1fr`, month mode fixed `~64px`; total `~90px`.
- **Loading:** while `overview.isFetching` and `overview.items` is empty, show `<Loader size={LoaderSize.Normal} />` centered. (On subsequent period changes it's fine to keep showing stale data until the new payload lands.)
- **Empty state:** if after filtering `rows.length === 0`, show a centered dimmed line `t('common.noMembersFound')`.

**Drill-down (must-have):**
- Clicking a **member cell (name/avatar)** → `navigate(Paths.TIMESHEET, { state: { viewedUserId: user.id, weekStart: periodStart.toISOString() } })` (for month mode pass `startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString()` — the current week — since a month isn't a week).
- Clicking a **day cell** → same, but `weekStart: startOfWeek(day, { weekStartsOn: 1 }).toISOString()`.
- **`Timesheet.jsx` change to receive it:** import `useLocation` from `react-router`; initialize state lazily:
  ```js
  const location = useLocation();
  const [weekStart, setWeekStart] = useState(() =>
    location.state && location.state.weekStart ? startOfWeek(new Date(location.state.weekStart), { weekStartsOn: 1 }) : startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [selectedViewedUserId, setSelectedViewedUserId] = useState(() => (location.state && location.state.viewedUserId) || null);
  ```
  The existing guard `isAdmin && selectedViewedUserId ? selectedViewedUserId : currentUserId` already neutralizes this for non-admins — keep it.

**Real-time updates are explicitly out of scope:** data refreshes on mount and period navigation only. Do not attempt to join per-user socket rooms.

### 4.7 Popup wrapper reuse

`ExportPopup` already exists (`client/src/components/Timesheet/ExportPopup.jsx`); import it directly. Do not duplicate `ExportStep`.

### 4.8 Locale keys (exact strings, `translation.common` in `client/src/locales/en/core.js`)

```js
teamTimesheets: 'Team Timesheets',
teamTimesheetsDescription: "Everyone's tracked time at a glance. Click a member or a day to open their timesheet.",
teamView: 'Team view',
myTimesheet: 'My timesheet',
weeklyTimesheets: 'Weekly',
monthlyTimesheets: 'Monthly',
searchMembers: 'Search members...',
hideMembersWithNoTime: 'Hide members with no time',
total: 'Total',
noMembersFound: 'No members match your search.',
```

Before adding each key, grep `core.js` for it — `total`, in particular, may already exist; if a key exists with the same meaning, reuse it instead of adding a duplicate (duplicate keys in the object are an eslint error and the later one silently wins).

---

## 5. Explicitly out of scope

- Jibble's Approvals tab, Groups/Schedules/Payroll-hours/Tracked-hours filters (no matching data model), pagination (we scroll; team is ~22 people), per-day footer totals, live socket updates of the overview, editing entries from the overview (drill-down covers it), and "Managed by me" scoping.

---

## 6. Verification checklist (do all of it, in order)

1. `cd server && npx eslint api/controllers/time-entries/overview.js config/routes.js` → clean.
2. `cd client && npx eslint src` → no findings beyond the pre-existing baseline (Priorities/discord/boards.js/etc.).
3. `cd client && CI=true npm run build` → `Compiled successfully.`
4. Restart the Sails server (kill any orphaned `node.exe` on port 1337 first) and confirm it lifts with no errors.
5. **Live smoke (admin user):**
   - Create 2–3 time entries on your own timesheet across different days, plus (via the "Viewing" member switcher) one entry on another member's timesheet.
   - Open `/timesheet` → "Team view" button visible → navigates to `/timesheet/team`.
   - Table shows all users; the members with entries show correct per-day durations and Total matching what their personal week grids show (same numbers).
   - Today's column is highlighted; empty cells show `–`.
   - Search filters rows; "Hide members with no time" removes zero rows.
   - Prev/next week navigation refetches and updates; Monthly mode shows the full month with horizontal scroll and a sticky member column.
   - Click a day cell with time → lands on `/timesheet` with that member selected in the switcher AND that week displayed; the "Viewing X's timesheet" banner appears.
   - Export popup opens; "All members" CSV downloads.
   - Clean up the test entries via the personal grid.
6. **Non-admin gate:** the server returns 403 for `GET /api/time-entries/overview` without an admin token (verify with curl); a non-admin hitting `/timesheet/team` is redirected to `/timesheet`; the "Team view" button does not render for non-admins.

## 7. File-by-file checklist

**New:** `server/api/controllers/time-entries/overview.js` · `client/src/reducers/ui/timesheet-overview.js` · `client/src/selectors/timesheet-overview.js` · `client/src/actions/timesheet-overview.js` · `client/src/entry-actions/timesheet-overview.js` · `client/src/sagas/core/services/timesheet-overview.js` · `client/src/sagas/core/watchers/timesheet-overview.js` · `client/src/utils/format-duration.js` · `client/src/components/Timesheet/TeamOverview.jsx` · `client/src/components/Timesheet/TeamOverview.module.scss` · `client/src/containers/TeamOverviewContainer.js`

**Modified:** `server/config/routes.js` · `client/src/api/time-entries.js` · `client/src/constants/ActionTypes.js` · `client/src/constants/EntryActionTypes.js` · registration indexes (`reducers/ui/index.js`, `selectors/index.js`, `actions/index.js`, `entry-actions/index.js`, `sagas/core/services/index.js`, `sagas/core/watchers/index.js`) · `client/src/constants/Paths.js` · `client/src/components/Root.jsx` · `client/src/components/Static/Static.jsx` · `client/src/components/Header/Header.jsx` · `client/src/components/Timesheet/Timesheet.jsx` (Team view button, `useLocation` drill-down init, formatDuration import) · `client/src/components/Timesheet/WeekGrid.jsx` + `PrintSummary.jsx` (formatDuration import) · `client/src/locales/en/core.js`
