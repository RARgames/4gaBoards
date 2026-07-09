# Timesheet Export: CSV or PDF Invoice — Implementation Spec

> **Self-contained.** Implement exactly what is written here without needing prior conversation context. Companion to `TEAM_TIMESHEETS_OVERVIEW_SPEC.md` and `EXPORT_DRAWER_SPEC.md` (same codebase, same conventions), but stands on its own.

## 0. What this is

The Export drawer on the Timesheet page currently produces a CSV (and a printable summary). The user wants the export to offer a **format choice: CSV or PDF**, where the PDF is a **contractor invoice** generated from the tracked time, modeled on a real invoice the team uses today. Text transcription of the reference invoice (an actual contractor invoice PDF):

```
INVOICE

Invoice Number: 4
Invoice Date: 06/23/2026

BILL TO:                                  PAYABLE TO: Elijah Roth
                                          6435 Pitt Street, West
Lucid Rain Studios                        Vancouver, B.C.
Edmonton, AB                              V7W2C1
Lucidrainstudios@gmail.com

No.  Description                            Qty.       Price        Total
1    Total Hours worked meetings            6 hrs      $20/hr      135.00
                                            45 mins
2    Total Hours worked development work    84 hrs     $20/hr     1690.00
                                            30 mins

PAYMENT METHOD                            Subtotal                1825.00
Bank Name: Royal Bank of Canada           Tax
Account Number: 5046255                   Grand Total
Transit #: 08400 Institution # 003
```

**Requirements as given by the user (verbatim intent, do not weaken):**
- Export button offers **CSV or PDF**.
- PDF has fields for **contractor's name, address, and billing information**.
- Line-item **descriptions are set automatically from the tracked time's task** (meeting, development, admin, …) — in this app that is the time entry's `description` field.
- **Hourly rate is user-set. Quantity is non-editable**, pulled directly from the tracked timesheet.
- A field for **GST owed (if applicable)**.
- **Invoice date automatic. Invoice number editable**, prefilled as an **increment of the previous invoice's number**.
- **BILL TO editable**, prefilled as `Lucid Rain Studios / Edmonton, AB / Lucidrainstudios@gmail.com`.
- **All calculations must be 100% correct** — see §6, which is normative: implement the integer-cents arithmetic exactly as written; no floating-point money math.

**"PDF" delivery mechanism (decided — do not re-litigate):** this codebase has no PDF library and already ships a printable overlay (`PrintSummary.jsx`) that renders clean HTML and calls `window.print()`, where the user picks "Save as PDF". The invoice reuses that exact mechanism with a new `InvoicePrint` component. Do not add jspdf/pdfmake/etc.

## 1. What already exists (read these before changing anything)

| File | Role |
|---|---|
| `client/src/components/Timesheet/ExportStep.jsx` | The Export drawer's form. Current fields: Date Range preset (+ custom from/to inputs), Project, Group by, admin-only Member scope. Footer: Cancel / Print Summary / Download CSV. Receives props `projects, isAdmin, viewedUserName, onDownloadCsv, onPrintSummary, onClose`. Computes `range` (`{from, to}` Dates) from the preset. This file gains the format selector and the invoice fields. |
| `client/src/components/Timesheet/ExportPopup.jsx` | `withDrawer(ExportStep)` — right-side drawer HOC wrapper. No changes needed here. |
| `client/src/components/Timesheet/PrintSummary.jsx` + `.module.scss` | **The template to copy for `InvoicePrint`.** Full-screen overlay (`position: fixed; inset: 0; z-index: 3000`), white `printArea` box, toolbar with Print (`window.print()`) and Close buttons. On mount it fetches entries: `onFetch({ userId: viewedUserId, from: range.from, to: range.to, subscribe: false })`, then filters `timeEntries` by `timeEntry.userId === viewedUserId && timeEntry.startedAt < range.to && timeEntry.endedAt > range.from && (!range.projectId \|\| timeEntry.projectId === range.projectId)`. Per-entry minutes: `Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)`. The `.module.scss` ends with a top-level `@media print` block that hides everything except elements with the **global** classes `timesheet-print-area` / `timesheet-print-toolbar`. |
| `client/src/components/Timesheet/Timesheet.jsx` | Wires PrintSummary: `handlePrintSummary({from,to,projectId})` sets `printRange` state; `{printRange && <PrintSummary range={printRange} viewedUserId={viewedUserId} viewedUserName={...} timeEntries={timeEntries} projectsById={projectsById} onFetch={onFetch} onClose={...} />}`. Also passes `viewedUser`, `projectsById` (a `Map<projectId, name>`), and renders `<ExportPopup projects={projectOptions} isAdmin={isAdmin} viewedUserName={...} onDownloadCsv={...} onPrintSummary={handlePrintSummary}>`. The invoice flow mirrors this exactly with a second piece of state. |
| `client/src/components/Timesheet/TeamOverview.jsx` | Also renders `ExportPopup`, but passes a **no-op** `onPrintSummary` and has no `timeEntries`. The PDF Invoice option must NOT appear there (see §3.1) and this file must not be modified. |
| `client/src/models/TimeEntry.js` | Client model fields: `id, startedAt, endedAt, description, importedFrom, userId, projectId, cardId, createdAt, createdById, updatedAt, updatedById`. `startedAt`/`endedAt` are `Date` objects in selectors. `description` is the free-text task label ("meetings", "development", …) — this is what invoice line items group by. |
| `client/src/utils/format-duration.js` | `formatDuration(minutes)` → `"6h 45m"` / `"84h 30m"` / `"45m"`. Use for the Qty column. |
| `client/src/locales/en/core.js` | i18n keys. Structure: `translation: { common: {...}, action: {...}, format: {...} }`. **`common:` starts ~line 9, `action:` starts ~line 761 — a key physically below the `action: {` line is in the `action` namespace, NOT `common`.** This has caused two real bugs already (`t('common.cancel')` rendered literally; correct is `t('action.cancel')`). Before referencing ANY key, grep the file and check which block the match sits in by line number. Known-good: `action.cancel`, `action.print`, `common.close`, `common.description`, `common.export`, `common.downloadCsv`, `common.printSummary`, `common.dateRange`, `common.noTimeEntriesWeek`. |
| `client/src/components/Utils/Dropdown/Dropdown.jsx` | Shared dropdown. **Gotcha (bit us already):** any `Dropdown` rendered inside the export drawer needs `dropdownMenuClassName={s.dropdownMenu}` where the SCSS defines `.dropdownMenu { z-index: 2001; }` — otherwise the drawer's z-index:2000 overlay paints above the dropdown's menu and clicks pass through to fields underneath. `ExportStep.module.scss` already has this class; reuse it for the new Format dropdown. |
| `client/src/components/Utils/Drawer/with-drawer.jsx` | The drawer HOC. Already sets `FloatingFocusManager modal={false}` (required for nested dropdowns — do not change). No changes needed. |

## 2. Conventions

1. `React.memo` function components, explicit `propTypes` + `defaultProps`, no classes.
2. SCSS modules wrapped in `:global(#app) { ... }`; top-level `@media print` blocks (outside the `#app` wrapper) for print rules, exactly like `PrintSummary.module.scss`.
3. i18n via `t('common.xxx')` / `t('action.xxx')` — see the namespace warning in §1's locale row. Grep before adding; duplicate keys in the same object are an eslint error and the later one silently wins.
4. Lint after every file: `cd client && npx eslint <files>`. Build check: `CI=true npm run build`.
5. No new npm dependencies.

## 3. Export drawer changes (`ExportStep.jsx`)

### 3.1 Format selector

At the top of the form (above Date Range), add a **Format** dropdown with options:

- `{ id: 'csv', name: t('common.formatCsv') }` → "CSV"
- `{ id: 'invoice', name: t('common.formatPdfInvoice') }` → "PDF Invoice"

State: `const [exportFormat, setExportFormat] = useState('csv');` — CSV remains the default so existing muscle memory is unchanged.

**The `invoice` option is only rendered when an `onPrintInvoice` prop was provided** (new optional func prop, `defaultProps: undefined`). `Timesheet.jsx` passes it; `TeamOverview.jsx` does not (and must not be edited), so the team-overview drawer stays CSV-only automatically. When `onPrintInvoice` is absent, don't render the Format dropdown at all — the drawer looks exactly as it does today.

Give the Format dropdown `dropdownMenuClassName={s.dropdownMenu}` like every other dropdown in this file (§1 gotcha).

### 3.2 Conditional fields

Visible in **both** formats: Date Range (+ custom range inputs), Project.

Visible only when `exportFormat === 'csv'`: Group by, Member scope (admin-only), and the existing footer buttons **Print Summary** and **Download CSV** — all completely unchanged in behavior.

Visible only when `exportFormat === 'invoice'` (new fields, in this order, each using the existing `.fieldLabel` + `.field` styling):

| Field | Control | Prefill / behavior |
|---|---|---|
| Invoice number (`common.invoiceNumber` → "Invoice number") | `Input`, free text | Prefilled per §7. |
| Hourly rate (`common.hourlyRate` → "Hourly rate ($/hr)") | `Input`, text | Prefilled from saved settings (§5), else empty. Validated per §3.3. **This is the only money input the user sets — quantity is never editable.** |
| GST rate (`common.gstRate` → "GST rate (%) — leave 0 if not applicable") | `Input`, text | Prefilled from saved settings, else `0`. |
| GST number (`common.gstNumber` → "GST number (optional)") | `Input`, free text | Prefilled from saved settings, else empty. Printed on the invoice only when non-empty. |
| Contractor name (`common.payableToName` → "Contractor name") | `Input` | Prefilled from saved settings, else `viewedUserName \|\| ''`. |
| Contractor address (`common.payableToAddress` → "Contractor address") | `TextArea` (multi-line) | Prefilled from saved settings, else empty. |
| Payment details (`common.paymentDetails` → "Payment details (bank info)") | `TextArea` (multi-line) | Prefilled from saved settings, else empty. Rendered under "PAYMENT METHOD" on the invoice, one line per input line. |
| Bill to (`common.billTo` → "Bill to") | `TextArea` (multi-line) | Prefilled from saved settings, else the constant `'Lucid Rain Studios\nEdmonton, AB\nLucidrainstudios@gmail.com'`. |

`TextArea` is exported from `../Utils` (`TextArea, TextAreaStyle`) — check its existing usage elsewhere (e.g. grep `TextAreaStyle`) for the right style enum value before using.

Footer when `exportFormat === 'invoice'`: `Cancel` (left, unchanged) and a single `Generate Invoice` submit-style button (`common.generateInvoice`) on the right. Print Summary / Download CSV buttons are hidden in this mode.

### 3.3 Validation (invoice mode)

- **Hourly rate**: after trimming and stripping a leading `$`, must match `/^\d{1,6}(\.\d{1,2})?$/` and parse to > 0. Invalid or empty → Generate Invoice disabled.
- **GST rate**: after trimming, must match `/^\d{1,3}(\.\d{1,2})?$/` and be ≤ 100. Empty string is treated as `0`. Invalid → Generate disabled.
- `range` must be non-null (existing check for custom dates).
- Everything else is free text; no validation.

On Generate: persist settings (§5), then call `onPrintInvoice({ from: range.from, to: range.to, projectId: projectId || undefined, invoice: { number, rateCents, gstBp, gstNumber, payableToName, payableToAddress, paymentDetails, billTo } })` and `onClose()`. `rateCents` and `gstBp` are the parsed integers from §6 — parse once here, pass integers down, so the print component never touches the raw strings.

## 4. Wiring in `Timesheet.jsx`

Mirror the existing PrintSummary wiring exactly:

1. New state: `const [invoiceParams, setInvoiceParams] = useState(null);`
2. New handler `handlePrintInvoice = useCallback((params) => setInvoiceParams(params), [])`, passed to `ExportPopup` as `onPrintInvoice={handlePrintInvoice}`. Also pass `viewedUserId={viewedUserId}` to `ExportPopup` (new ExportStep prop, needed for the localStorage key in §5).
3. Render block, next to the existing `{printRange && <PrintSummary .../>}`:

```jsx
{invoiceParams && (
  <InvoicePrint
    params={invoiceParams}
    viewedUserId={viewedUserId}
    viewedUserName={viewedUser ? viewedUser.name : undefined}
    timeEntries={timeEntries}
    projectsById={projectsById}
    cardsById={cardsById}
    onFetch={onFetch}
    onClose={() => setInvoiceParams(null)}
  />
)}
```

`cardsById` already exists in `Timesheet.jsx` (a `Map` of card id → card object) — pass it for the description fallback chain in §8.

## 5. Settings persistence (localStorage)

Key: `` `invoiceSettings:${viewedUserId}` `` — settings belong to the person being invoiced, so an admin generating for different members keeps separate rates/addresses per member.

Value: JSON object `{ lastInvoiceNumber, rate, gstRate, gstNumber, payableToName, payableToAddress, paymentDetails, billTo }` where `rate`/`gstRate` are the raw input strings and `lastInvoiceNumber` is the raw invoice-number string last used.

- **Read** once when ExportStep mounts (lazy `useState` initializers). Wrap `JSON.parse` in try/catch; on any failure fall back to defaults.
- **Write** on Generate Invoice click (before calling `onPrintInvoice`).
- No server-side storage in this iteration (see §10).

## 6. Money math — NORMATIVE, implement exactly

All money is computed in **integer cents**. No dollar-value floats ever flow through arithmetic. Put these three pure functions in a new file `client/src/utils/invoice-math.js` so they're isolated and testable:

```js
// "27.53" | "$27.53" | "20" -> 2753 | 2753 | 2000 ; returns null when invalid
export const parseRateToCents = (raw) => {
  const cleaned = String(raw).trim().replace(/^\$/, '');
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(cleaned)) return null;
  const cents = Math.round(parseFloat(cleaned) * 100); // Math.round kills float wobble (27.53*100 === 2752.9999…)
  return cents > 0 ? cents : null;
};

// "5" -> 500 basis points ; "" -> 0 ; invalid -> null
export const parseGstToBasisPoints = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === '') return 0;
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(cleaned)) return null;
  const bp = Math.round(parseFloat(cleaned) * 100);
  return bp <= 10000 ? bp : null;
};

// 182500 -> "1,825.00"
export const formatCents = (cents) => (cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
```

Line/total computation (inside `InvoicePrint`):

- Per entry, minutes = `Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)` — **identical** to PrintSummary and the week-total in Timesheet.jsx, so the invoice always agrees with what the timesheet screen shows.
- Per line-item group: `groupMinutes` = sum of its entries' minutes.
- `lineTotalCents = Math.round(groupMinutes * rateCents / 60)` — integer × integer before the divide, single rounding at the end.
- `subtotalCents = sum of lineTotalCents` — **sum the rounded line totals**, not the raw minutes, so the printed column visibly adds up to the printed subtotal.
- `taxCents = Math.round(subtotalCents * gstBp / 10000)`.
- `grandTotalCents = subtotalCents + taxCents` — pure integer addition, no rounding.

**Worked examples (must hold; use as manual test cases):**

| Case | Input | Expected |
|---|---|---|
| Reference line 1 | 6h 45m (405 min) @ $20/hr | `round(405×2000/60)` = 13500 → `135.00` |
| Reference line 2 | 84h 30m (5070 min) @ $20/hr | `round(5070×2000/60)` = 169000 → `1,690.00` |
| Reference subtotal | 13500 + 169000 | 182500 → `1,825.00` |
| GST 5% on reference | `round(182500×500/10000)` | 9125 → `91.25`; grand `1,916.25` |
| Rounding edge | 25 min @ $27.53/hr (2753¢) | `round(25×2753/60)` = `round(1147.08…)` = 1147 → `11.47` |
| GST 0 / blank | gstBp 0 | tax 0; grand = subtotal; GST row not rendered |

## 7. Invoice number: prefill and increment

- Prefill logic (ExportStep, on mount): read `lastInvoiceNumber` from settings (§5). If it matches `/^\d+$/`, prefill the field with `String(parseInt(lastInvoiceNumber, 10) + 1)`. If it's non-empty but non-numeric, prefill with it unchanged (the user manages their own scheme). If absent, prefill `"1"`.
- The field stays fully editable — whatever string is in the field at Generate time is printed verbatim and stored as the new `lastInvoiceNumber`.
- Invoice **date** is not a field: always the generation day, rendered with `format(new Date(), 'MMM d, yyyy')` (date-fns, already imported everywhere in this folder).

## 8. `InvoicePrint` component (new: `client/src/components/Timesheet/InvoicePrint.jsx` + `InvoicePrint.module.scss`)

Copy the structure of `PrintSummary.jsx` (overlay, toolbar with `t('action.print')` → `window.print()` and `t('common.close')` → `onClose`, fetch-on-mount effect, same entry filter — including the `projectId` filter when `params.projectId` set).

**Line-item grouping** (replaces PrintSummary's by-day grouping):

- Group key: `description.trim().toLowerCase()` when the trimmed description is non-empty.
- Fallback chain for entries with empty descriptions: linked card's name (`cardsById.get(cardId)?.name`) → project name (`projectsById.get(projectId)`) → `t('common.generalWork')` ("General work"). The fallback string is both the key and the label.
- Display label: first-seen original (trimmed, original casing) description for the group.
- Sort groups by `groupMinutes` descending; ties alphabetically by label.
- If no entries in range: render `t('common.noTimeEntriesWeek')` in the print area and keep the toolbar so the user can close (identical to PrintSummary's empty state; Print button may remain enabled — harmless).

**Layout** (all inside the white `printArea`, mirroring the reference in §0):

1. `INVOICE` title (large, bold).
2. `Invoice Number: {number}` and `Invoice Date: {date}` lines.
3. Two-column row: left `BILL TO:` with each line of the `billTo` string on its own line (split on `\n`, render as separate `<div>`s — never `dangerouslySetInnerHTML`); right `PAYABLE TO: {payableToName}` followed by the `payableToAddress` lines, and `GST #: {gstNumber}` as the last line when `gstNumber` is non-empty.
4. Items table with columns `No. | Description | Qty. | Price | Total`:
   - No.: 1-based index.
   - Description: group label.
   - Qty.: `formatDuration(groupMinutes)`.
   - Price: `` `$${formatCents(rateCents)}/hr` `` (e.g. `$20.00/hr`).
   - Total: `formatCents(lineTotalCents)` (right-aligned).
5. Two-column footer row: left `PAYMENT METHOD` heading with the `paymentDetails` lines under it; right a small totals table:
   - `Subtotal` → `formatCents(subtotalCents)`
   - `GST ({gstPercentDisplay}%)` → `formatCents(taxCents)` — **row rendered only when `gstBp > 0`**; `gstPercentDisplay` = `gstBp / 100` trimmed of trailing zeros (5, 5.5, 12.75).
   - `Grand Total` (bold) → `formatCents(grandTotalCents)`.

**Print CSS:** reuse the exact same **global** marker classes `timesheet-print-area` and `timesheet-print-toolbar` on the printArea/toolbar divs, and include a copy of PrintSummary's top-level `@media print` block in `InvoicePrint.module.scss` so the component prints correctly regardless of which stylesheet chunks are loaded. The printArea styles themselves (white background, black text, `max-width: 800px`) mirror `PrintSummary.module.scss`; borders/typography can echo `.dayTable`'s look. Money columns right-aligned.

**Props** (see §4 for the call site): `params` (shape: `{ from: Date, to: Date, projectId: string?, invoice: {...} }`), `viewedUserId`, `viewedUserName`, `timeEntries`, `projectsById` (Map), `cardsById` (Map), `onFetch`, `onClose`.

## 9. Locale keys

Add to `translation.common` (grep each first per §2.3; all of these are expected to be new): `formatCsv: 'CSV'`, `formatPdfInvoice: 'PDF Invoice'`, `invoiceNumber: 'Invoice number'`, `hourlyRate: 'Hourly rate ($/hr)'`, `gstRate: 'GST rate (%) — leave 0 if not applicable'`, `gstNumber: 'GST number (optional)'`, `payableToName: 'Contractor name'`, `payableToAddress: 'Contractor address'`, `paymentDetails: 'Payment details (bank info)'`, `billTo: 'Bill to'`, `generateInvoice: 'Generate Invoice'`, `generalWork: 'General work'`, `invoice_title: 'Invoice'`, `invoiceDate: 'Invoice Date'`, `billToHeading: 'BILL TO:'`, `payableToHeading: 'PAYABLE TO:'`, `paymentMethodHeading: 'PAYMENT METHOD'`, `subtotal: 'Subtotal'`, `grandTotal already exists as 'Grand total'` — reuse `common.grandTotal`, do not add a duplicate. Reuse `common.export`, `action.cancel`, `action.print`, `common.close`, `common.description`, `common.total` where applicable.

## 10. Explicitly out of scope (do not build)

- A real PDF library (jspdf/pdfmake/puppeteer) — browser print-to-PDF only.
- Server-side invoice storage, invoice history, or a `last_invoice_number` DB column — localStorage only this iteration.
- PDF invoice from the Team Overview page (`TeamOverview.jsx` is untouched; admins drill into a member's timesheet to invoice them).
- Per-line GST, multiple tax types, multi-currency, discounts.
- Editable quantities or per-line rate overrides — the user explicitly wants quantity non-editable and a single hourly rate.
- Changing anything about the existing CSV export, Print Summary, or the drawer container.

## 11. Verification checklist

1. Lint changed files; `CI=true npm run build` → "Compiled successfully."
2. Live, as admin on `/timesheet` with at least two differently-described entries in the current week (e.g. "meetings" 6h45m and "development" 84h30m, rate 20, GST 5):
   - Export drawer shows Format dropdown; default CSV; CSV mode is pixel-identical to before and Download CSV still works.
   - **Format dropdown's menu opens above the drawer** (z-index gotcha, §1) and selections apply.
   - Switch to PDF Invoice → invoice fields appear, Group by / Member scope / Print Summary / Download CSV disappear; Bill to prefilled with the Lucid Rain Studios block; invoice number prefilled `1` on first ever use.
   - Generate Invoice → overlay shows the invoice; verify against §6's worked examples **digit for digit**: lines 135.00 and 1,690.00, subtotal 1,825.00, GST (5%) 91.25, Grand Total 1,916.25; Qty column shows `6h 45m` / `84h 30m` and cannot be edited anywhere.
   - GST rate 0 → no GST row, grand total equals subtotal.
   - Print button opens the browser print dialog with only the invoice visible in the preview (toolbar and app chrome hidden).
   - Close, reopen drawer → all invoice fields re-prefilled from the previous run; invoice number now prefilled `2`.
   - Rate `27.53` with a 25-minute entry → line shows `11.47` (rounding edge).
   - Invalid rate (`abc`, empty, `0`) → Generate disabled.
   - Entry with empty description linked to a card → line labeled with the card name; unlinked/blank → "General work".
3. `/timesheet/team` Export drawer: **no Format dropdown**, unchanged CSV-only behavior.
4. Non-admin user on `/timesheet`: PDF invoice works for their own timesheet (no admin gate on invoicing yourself).

## 12. File-by-file checklist

**New:**
- `client/src/utils/invoice-math.js` (§6)
- `client/src/components/Timesheet/InvoicePrint.jsx` (§8)
- `client/src/components/Timesheet/InvoicePrint.module.scss` (§8)

**Modified:**
- `client/src/components/Timesheet/ExportStep.jsx` (§3 — format selector, invoice fields, validation, persistence, new props `onPrintInvoice`/`viewedUserId`)
- `client/src/components/Timesheet/Timesheet.jsx` (§4 — state, handler, `InvoicePrint` render, extra props to `ExportPopup`)
- `client/src/locales/en/core.js` (§9)

**Untouched (verify no changes needed):**
- `client/src/components/Timesheet/TeamOverview.jsx`, `ExportPopup.jsx`, `PrintSummary.jsx`, `client/src/components/Utils/Drawer/*`, all server files (this feature is entirely client-side).
