# Export Panel → Right-Side Drawer — Implementation Spec

> **Self-contained.** Implement exactly what is written here without needing prior conversation context. This is a companion to `TEAM_TIMESHEETS_OVERVIEW_SPEC.md` (same codebase, same conventions) but stands on its own.

## 0. What this is

Today, clicking the "Export" button on the Timesheet pages opens a small anchored dropdown-style popup (positioned next to the button, `client/src/components/Utils/Popup`). The user wants it to instead open a **full right-side sliding panel** — a drawer that slides in from the right edge of the viewport over a dimmed backdrop, similar to Jibble's "Export Weekly Timesheets Data" panel (reference screenshot: title top-left, close X top-right, stacked labeled fields, a footer pinned to the bottom with action buttons).

**Explicit scope decision (already made — do not re-litigate):** this is a **visual/container change only**. All existing export fields, state, and logic in `ExportStep.jsx` (date range preset + custom range, Project, Group by, admin-only Member scope, Print Summary / Download CSV actions) stay exactly as they are today — same props, same behavior, same CSV-only output. Do **not** add: an XLS/CSV file-format picker, "Timesheets list" vs "Time entries list" checkboxes, Payroll hours/Groups/Schedules filters, or Time format/Duration format pickers. Jibble has those because it's a different product; ours doesn't need them. The only thing changing is the container the existing form renders inside.

This drawer container is also being built as a **new reusable primitive** (`withDrawer`), not a one-off, because it sits alongside the existing `withModal`/`withPopup` HOCs in `client/src/components/Utils/` and follows their exact pattern — this isn't speculative future-proofing, it's the natural place this code belongs given how the other two are structured.

**Applies to both call sites.** `ExportPopup`/`ExportStep` is shared by two pages today — `client/src/components/Timesheet/Timesheet.jsx` (personal timesheet) and `client/src/components/Timesheet/TeamOverview.jsx` (admin team overview). Both reuse the same component and both automatically get the new drawer once `ExportPopup.jsx` is changed. **Neither of those two files needs to change** — they just render `<ExportPopup ...><Button .../></ExportPopup>` and that call shape stays identical.

## 1. What already exists (read before changing anything)

| File | Role |
|---|---|
| `client/src/components/Timesheet/ExportPopup.jsx` | `export default withPopup(ExportStep);` — the only line in this file. |
| `client/src/components/Timesheet/ExportStep.jsx` | The actual form: presets/custom date range, project dropdown, group-by dropdown, admin member-scope dropdown, Print Summary + Download CSV buttons. Uses `Popup.Header` / `Popup.Content` from `PopupElements`. |
| `client/src/components/Timesheet/ExportStep.module.scss` | `.fieldLabel`, `.field` (260px), `.customRangeRow` — field-level styling; gets small additions/tweaks per §5.2 (full-width fields, `.footerActions`). |
| `client/src/components/Utils/Popup/with-popup.jsx` | HOC: anchors a floating dropdown near the trigger element via `@floating-ui/react` (`useFloating` + `shift`/`flip`/`size` middleware). No backdrop/scrim. This is the "small dropdown" behavior being replaced for Export specifically — **do not modify this file**, other popups in the app still need it as-is. |
| `client/src/components/Utils/Modal/with-modal.jsx` | HOC: full-viewport centered modal using `FloatingOverlay` (scrim) + `FloatingFocusManager` (focus trap) + `useDismiss`/`useRole`. **This is the closest prior art and the base to copy for the new Drawer** — same overlay/dismiss/focus machinery, just anchored to the right edge instead of centered, with a slide transition. Do not modify this file either; copy its shape into a new sibling. |
| `client/src/components/Utils/Modal/Modal.module.scss` | Reference for the overlay/box styling variables to reuse: `--modalOverlay`, `--backgroundPopup`, `--backgroundPopupShadow`, `--textColor1`. |
| `client/src/components/Utils/PopupElements/PopupHeader.jsx`, `PopupContent.jsx` | Generic presentational header/content wrappers (`Popup.Header`, `Popup.Content`) — no dependency on which HOC contains them. Reuse as-is inside the new drawer; do not fork them. |
| `client/src/components/Utils/index.js` | Exports `withModal`, `withPopup`, `Popup` (PopupElements), etc. Add `withDrawer` here. |
| `client/src/global.module.scss` | Has `.controlsSpaceBetween` (flex, `justify-content: space-between`) already used by `ExportStep.jsx`'s button row — reuse the same pattern for the new footer's button group. |
| `client/src/colors.css` | CSS variables (see §4 for the exact ones this needs). |

No animation library (framer-motion, react-transition-group, etc.) is a dependency of this project — the slide-in transition must be plain CSS. There is intentionally **no exit animation**: `with-modal.jsx`'s pattern of `{isOpen && modalContent}` unmounts immediately on close, and matching that (enter-transition only, no exit-transition) is the pragmatic choice here rather than introducing new state machinery just for a closing animation. Note this as accepted, not a bug.

## 2. Codebase conventions relevant here

1. HOCs like `withModal`/`withPopup` are default exports from a folder: each has an `index.js` that re-exports the `with-*.jsx` default, and `Utils/index.js` imports from the folder (`import withModal from './Modal';`). Mirror this exactly for `Drawer` (see §3.2).
2. `:global(#app) { ... }` SCSS module wrapper convention — every `.module.scss` file in this codebase wraps its rules this way.
3. `t('common.xxx')` for i18n; before adding any new key, grep `client/src/locales/en/core.js` for it first — `close` and `cancel` **already exist** under `translation.common` (confirmed at time of writing — verify the lines are still there before assuming). Reuse them, don't duplicate.
4. Components are `React.memo`, PropTypes declared explicitly including `defaultProps`, no class components anywhere.
5. `React.forwardRef` is used on `Modal` for imperative `setIsOpen` access via `useImperativeHandle` — the new `Drawer` should offer the same optional ref API for parity (even though the Export use case here only needs the `children`-as-trigger mode, not the imperative-ref mode).

## 3. New primitive: `withDrawer`

### 3.1 File: `client/src/components/Utils/Drawer/with-drawer.jsx` (new)

Copy `client/src/components/Utils/Modal/with-modal.jsx` verbatim as the starting point, then change only:

- Replace `<FloatingOverlay lockScroll className={s.modalOverlay}>` centering behavior — the overlay itself (scrim, `lockScroll`) stays; only its flex alignment changes so the inner panel (`s.modal` → rename to `s.drawer`) is pushed to the right edge instead of centered. The positioning is done entirely by the overlay's `justify-content: flex-end` plus the drawer's `height: 100%` — exactly as written in §3.3's CSS; the drawer itself stays `position: relative` (needed for the absolutely-positioned close button), no `position: fixed` on it. Do not pass a `placement`/`middleware` to `useFloating` — this drawer doesn't need floating-ui's positioning logic at all (unlike `with-popup.jsx`), since it's always pinned to the same edge. Keep `useFloating({ open, onOpenChange })` only for the open-state/context machinery `useClick`/`useDismiss`/`useRole`/`FloatingFocusManager` need — same as `with-modal.jsx` already does (it also doesn't use placement middleware).
- Rename the component/export from `Modal` to `Drawer`, `s.modal`→`s.drawer`, `s.modalOverlay`→`s.drawerOverlay` (or reuse the class name `s.overlay` — your call, just be internally consistent).
- Everything else (props: `disabled`, `className`, `hideCloseButton`, `closeButtonClassName`, `wrapperClassName`, `onClose`, ref-forwarding, `children`-as-trigger vs. standalone-with-ref modes, `useDismiss`, `useRole`, `FloatingFocusManager` with `returnFocus={false}`) stays identical to `with-modal.jsx`.

### 3.2 File: `client/src/components/Utils/Drawer/index.js` (new)

`client/src/components/Utils/Modal/index.js` exists and is exactly:

```js
import withModal from './with-modal';

export default withModal;
```

Create `Drawer/index.js` the same way (`import withDrawer from './with-drawer'; export default withDrawer;`), and in `Utils/index.js` add `import withDrawer from './Drawer';` next to the existing `import withModal from './Modal';` line, plus `withDrawer` in the export block.

### 3.3 File: `client/src/components/Utils/Drawer/Drawer.module.scss` (new)

```scss
:global(#app) {
  .closeButton {
    position: absolute;
    right: 12px;
    top: 12px;
  }

  .drawerOverlay {
    background: var(--modalOverlay);
    display: flex;
    justify-content: flex-end;
    z-index: 2000;
  }

  .drawer {
    position: relative;
    display: flex;
    flex-direction: column;
    background: var(--backgroundPopup);
    color: var(--textColor1);
    width: 420px;
    max-width: calc(100vw - 20px);
    height: 100%;
    box-shadow: -2px 0 8px var(--backgroundPopupShadow);
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
}
```

Notes:
- `justify-content: flex-end` on the overlay (a flex row) is what pins the drawer to the right edge — this replaces `with-modal.jsx`'s centering (`align-items: center; justify-content: center`).
- `height: 100%` + the overlay being the full viewport (via `FloatingOverlay`) makes the drawer span the full viewport height, matching the reference screenshot.
- The CSS `animation` (not `transition`) is the enter-only approach discussed in §1 — no JS state needed to trigger it, it just plays once on mount.
- Width `420px` is a starting point matching the reference screenshot's proportions; adjust only if the actual field content (§5) overflows or looks cramped at that width — don't gold-plate this number.

## 4. Colors used (all already defined in `client/src/colors.css` for every theme — dark, light, etc. — don't add new variables)

`--modalOverlay`, `--backgroundPopup`, `--backgroundPopupShadow`, `--textColor0`, `--textColor1`, `--backgroundColorTmpSeparatorLight`.

## 5. Changes to the Export components

### 5.1 `client/src/components/Timesheet/ExportPopup.jsx`

```js
import { withDrawer } from '../Utils';
import ExportStep from './ExportStep';

export default withDrawer(ExportStep);
```

(Only the import name and HOC call change — `withPopup` → `withDrawer`.)

### 5.2 `client/src/components/Timesheet/ExportStep.jsx`

Keep all existing state/handlers (`preset`, `customFrom`/`customTo`, `projectId`, `groupBy`, `memberScope`, `range`, `handleDownloadCsv`, `handlePrintSummary`) **unchanged**. Only restructure the returned JSX and add one new button:

1. Keep `<Popup.Header>{t('common.exportTimesheet', { context: 'title' })}</Popup.Header>` as-is — it renders the title; it'll now sit inside the drawer instead of the old floating popup, which is fine since `PopupHeader` has no positioning assumptions.
2. Keep `<Popup.Content>` wrapping the `<Form>`, but **drop the `isMinContent` prop** — it applies `max-width: min-content` (`PopupContent.module.scss` `.minContent`), which would collapse the form instead of letting it fill the 420px drawer. Don't change `PopupContent.jsx` itself; other call sites depend on the prop. Two more facts about `PopupContent`'s `.wrapper` that matter here: it has `min-width: 274px` (harmless inside 420px) and `overflow: hidden` (relevant only if you do the optional scroll-area step 5 below — the scrollable element must be inside or instead of this wrapper, e.g. pass a `className` that overrides to `overflow-y: auto`, since `PopupContent` forwards `className`).
2b. Make the fields fill the drawer width: in `ExportStep.module.scss`, change `.field { width: 260px; ... }` to `width: 100%;` (and let `.customRangeRow`'s two inputs share the row with `flex: 1` each). The 260px width was sized for the old small anchored popup; full-width fields are what makes the panel read like the reference screenshot.
3. In the footer button row (`<div className={gs.controlsSpaceBetween}>`), add a new **Cancel** button before the existing two, so the row now reads: Cancel (left) — Print Summary + Download CSV (right, grouped). Concretely:

```jsx
<div className={gs.controlsSpaceBetween}>
  <Button style={ButtonStyle.DefaultBorder} content={t('common.cancel')} onClick={onClose} />
  <div className={s.footerActions}>
    <Button
      style={ButtonStyle.DefaultBorder}
      content={t('common.printSummary')}
      onClick={handlePrintSummary}
      disabled={isAllMembers}
      title={isAllMembers ? t('common.printSummaryDisabledForAllMembers') : undefined}
    />
    <Button style={ButtonStyle.Submit} content={t('common.downloadCsv')} onClick={handleDownloadCsv} />
  </div>
</div>
```

`onClose` is already a prop `ExportStep` receives (from the HOC) — it's already used elsewhere in the file, just wire the new Cancel button to it directly (no new handler needed). `common.cancel` already exists in `core.js` (verify, don't assume) — no new locale key needed for this line.

4. Add a `.footerActions { display: flex; gap: 8px; }` rule to `ExportStep.module.scss` for the new button group (a plain flex row, mirroring how `gs.controlsSpaceBetween` itself is just `display:flex; justify-content:space-between` — no new pattern being introduced, just one more small flex wrapper).
5. Optional but recommended for visual fidelity with the reference screenshot: wrap the field stack in a scrollable content area and pin the button row as a footer with a top border separator, e.g. give the `<Form>` (or a new wrapping `<div>`) `flex: 1; overflow-y: auto; padding-bottom: 12px;` and give the button-row div `border-top: 1px solid var(--backgroundColorTmpSeparatorLight); padding-top: 12px; margin-top: auto;` — this only matters if the field list is tall enough to need scrolling within the fixed-height drawer; if it comfortably fits, this is unnecessary and you can skip it (don't add scroll machinery nothing needs).

## 6. Explicitly out of scope (do not build)

- XLS/CSV file-format selector — CSV is the only export format this app supports; do not add a format picker UI with no backend behind it.
- "Timesheets list" vs "Time entries list" checkboxes — no equivalent concept in this app's export.
- Payroll hours / Groups / Schedules filters, "Add filter" — no equivalent data model.
- Time format / Duration format pickers — this app's duration formatting (`formatDuration` util) is fixed, not user-configurable.
- Any change to `Timesheet.jsx` or `TeamOverview.jsx` — they don't need to change at all; the drawer swap is entirely internal to `ExportPopup.jsx`/`ExportStep.jsx`.
- Any change to `with-popup.jsx` or `with-modal.jsx` — both stay exactly as they are; `Drawer` is a new sibling, not a modification of either.
- An exit/closing animation — accepted as out of scope per §1; enter-only is fine.
- Making `Drawer` configurable to open from the left/top/bottom — only the right-edge case is needed right now; don't build a `position` prop for hypothetical future call sites.

## 7. Verification checklist

1. Client lint (no server files change in this task): `cd client && npx eslint src/components/Utils/Drawer/with-drawer.jsx src/components/Utils/index.js src/components/Timesheet/ExportPopup.jsx src/components/Timesheet/ExportStep.jsx src/components/Timesheet/ExportStep.module.scss` — zero new findings.
2. `CI=true npm run build` from `client/` → "Compiled successfully."
3. Live smoke test on `/timesheet` (personal page) as an admin:
   - Click "Export" → a right-side panel slides in from the right edge over a dimmed backdrop (not the old small anchored dropdown).
   - Title reads "Export Timesheet" (or whatever `common.exportTimesheet_title` currently resolves to), with a close (X) in the top-right corner.
   - All fields present and functioning exactly as before: date range preset dropdown (+ custom from/to inputs when "Custom" selected), Project dropdown, Group by dropdown, Member scope dropdown (admin-only).
   - Footer shows Cancel / Print Summary / Download CSV. Cancel and the X both close the drawer without side effects. Clicking the dimmed backdrop also closes it (inherited from `useDismiss`, same as Modal). Escape key closes it.
   - Download CSV still downloads a CSV with the correct filter values (re-verify one real download, don't just trust the wiring).
   - Print Summary still opens the existing print summary flow, disabled + tooltipped when Member scope is "All members" (unchanged behavior).
4. Repeat step 3 on `/timesheet/team` (Team Timesheets Overview) — confirm the same drawer behavior appears there too, since it's the same shared component.
5. Resize the viewport narrow (mobile-width) and confirm the drawer's `max-width: calc(100vw - 20px)` keeps it from overflowing off-screen.
6. Confirm no other call site in the app uses `withPopup` or `withModal` in a way that's now broken — you aren't touching those files, but grep for `withPopup`/`withModal` usages once after the change and spot-check one or two other popups (e.g. any settings popup) still work, since `Utils/index.js` is a shared barrel file you're editing.

## 8. File-by-file checklist

**New:**
- `client/src/components/Utils/Drawer/with-drawer.jsx`
- `client/src/components/Utils/Drawer/Drawer.module.scss`
- `client/src/components/Utils/Drawer/index.js` (re-export, mirroring `Modal/index.js` — see §3.2)

**Modified:**
- `client/src/components/Utils/index.js` (export `withDrawer`)
- `client/src/components/Timesheet/ExportPopup.jsx` (`withPopup` → `withDrawer`)
- `client/src/components/Timesheet/ExportStep.jsx` (add Cancel button + minor layout wrapper changes; no state/handler changes)
- `client/src/components/Timesheet/ExportStep.module.scss` (add `.footerActions`; `.field` → `width: 100%`; the scroll/footer-border tweak from §5.2 step 5 if needed)

**Untouched (verify they don't need changes, per §6):**
- `client/src/components/Timesheet/Timesheet.jsx`
- `client/src/components/Timesheet/TeamOverview.jsx`
- `client/src/components/Utils/Popup/with-popup.jsx`
- `client/src/components/Utils/Modal/with-modal.jsx`
