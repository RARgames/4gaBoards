# Test Procedure: Create Card & Drag-and-Drop Card

---

## 1. Metadata

- **Author**: Achauhan
- **Created On**: 2026-05-15
- **Document Status**: Draft
- **Target Release**: TBD
- **Jira Epic / Feature Link**: TBD
- **Reviewers**: TBD

---

## 2. Overview

### Description

4ga Boards is a real-time collaborative project management application (kanban board). This test procedure covers two core features: **Create Card** and **Drag-and-Drop Card**.

- **What problem does it solve?** Teams need a way to create work items and organize them visually across workflow stages (lists) in real-time.
- **Who are the users?** Team members with EDITOR role on a board who manage tasks collaboratively.
- **What are the key workflows?**
  - User opens a board, clicks "Add card" on a list, types a name, presses Enter to create a card
  - User drags a card from one list and drops it into another list to change its status
  - User reorders cards within a list by dragging to a new position
  - Multiple users view the same board and see each other's changes in real-time

### References

- **Functional Spec**: [FUNCTIONAL_FLOW.md](./FUNCTIONAL_FLOW.md)
- **Architecture Design**: TBD
- **API Documentation (Swagger/Postman)**: TBD
- **Related Services**: Socket.io (real-time), PostgreSQL (persistence)

---

## 3. Feature / Endpoint Overview

| Feature | Endpoint / UI Action | Persisted | Description |
|---------|---------------------|-----------|-------------|
| Create Card | `POST /api/lists/:listId/cards` | Yes (PostgreSQL) | Creates a new card in the specified list with auto-calculated position |
| Create Card (UI) | Click "Add card" button → type name → Enter | Yes | Inline form at bottom of list, optimistic UI update |
| Move Card (same list) | `PATCH /api/cards/:id` with `{position}` | Yes (PostgreSQL) | Reorders card within same list |
| Move Card (cross-list) | `PATCH /api/cards/:id` with `{listId, position}` | Yes (PostgreSQL) | Moves card to a different list on same board |
| Transfer Card (cross-board) | `PATCH /api/cards/:id` with `{boardId, listId, position}` | Yes (PostgreSQL) | Moves card to a different board, strips incompatible labels |
| Drag-and-Drop (UI) | Drag card → drop on target list/position | Yes | react-beautiful-dnd interaction triggers move/transfer API |

---

## 4. Workflows

### Workflow: Create Card

1. User navigates to a board and clicks "Add card" on a list
2. Inline textarea form appears; user types card name
3. User presses Enter (or Ctrl+Enter for auto-open)
4. Client generates local ID, calculates gap-based position, dispatches optimistic action
5. Client sends `POST /api/lists/:listId/cards` via WebSocket
6. Server validates EDITOR role, persists card to PostgreSQL
7. Server broadcasts `cardCreate` socket event to all board subscribers
8. Server creates Action record (audit trail)
9. Other connected users see card appear in real-time
10. On success: client merges server data (fixes local ID). On failure: client rolls back optimistic card.

### Workflow: Drag-and-Drop Card

1. User picks up a card (mouse down + drag on card element)
2. react-beautiful-dnd renders drag placeholder and animates surrounding cards
3. User drops card on target position (same list, different list, or cancels)
4. `handleDragEnd` fires in Board.jsx, parses destination list and index
5. If destination is same as source: no-op. If no destination (dropped outside): cancel.
6. Saga calculates new position (midpoint between neighbor cards at target index)
7. Client sends `PATCH /api/cards/:id` with `{listId, position}` via WebSocket
8. Server validates EDITOR role, updates card record, recalculates positions if collision
9. Server broadcasts `cardUpdate` to board channel (plus extra broadcasts for repositioned cards)
10. Server creates CARD_MOVE or CARD_TRANSFER Action record
11. All connected board viewers see card animate to new position

---

## 5. Test Strategy

### Testing Approach

- **Unit Testing** (Developer owned): Isolated component rendering, saga logic, position selectors
- **Integration Testing** (Service layer validation): API controllers, database persistence, socket broadcasts
- **End-to-End Testing** (Full workflow validation): Browser-based user flows, multi-user real-time sync
- **Smoke Testing** (Post-deploy critical path): Subset of E2E tests validating core create and drag flows

### Tools / Frameworks

- **Unit Testing**: Jest + React Testing Library
- **Integration Testing**: Mocha (server-side)
- **E2E / Smoke Testing**: Playwright
- **UI Automation**: Playwright (page object pattern)
- **Mocking**: Jest mocks (client sagas/selectors), Sails test helpers (server)
- **CI/CD**: GitHub Actions (`pnpm test`, `pnpm test:e2e`)

### Test File Locations

```
4gaBoards/
├── tests/
│   ├── e2e/
│   │   ├── specs/
│   │   │   ├── login.spec.ts            (existing)
│   │   │   ├── addUser.spec.ts          (existing)
│   │   │   ├── createCard.spec.ts       (to be created)
│   │   │   └── dragDropCard.spec.ts     (to be created)
│   │   └── pageObjects/
│   │       ├── LoginPage.ts             (existing)
│   │       └── BoardPage.ts             (to be created)
│   └── playwright.config.ts
├── server/
│   └── test/
│       ├── integration/
│       │   ├── models/User.test.js      (existing)
│       │   └── controllers/cards/       (to be created)
│       └── utils/
├── client/
│   └── src/
│       └── tests/                       (existing, Jest)
```

### Coverage Goals

| Layer | Target Coverage |
|-------|-----------------|
| Backend (card controllers/helpers) | 85% |
| Frontend (card sagas/selectors) | 80% |
| E2E (critical paths) | 100% of smoke scenarios |

---

## 6. Test Environment

- **Deployment Method**: Docker Compose (PostgreSQL + App container) or `pnpm dev` (local)
- **Test Environments**: Local Dev (`localhost:3000`), CI (GitHub Actions)
- **Authentication**: JWT token via `POST /api/access-tokens` (demo/demo for local)
- **External Dependencies**:

| Dependency | Type | Purpose | Required For |
|-----------|------|---------|--------------|
| PostgreSQL 16 | Database | Persistent storage for cards, lists, boards, actions | Integration, E2E |
| Socket.io | Service | Real-time event broadcasting | Integration (broadcast), E2E (multi-user) |
| Redis (optional) | Queue/Adapter | Socket.io multi-instance adapter | Clustered deployment only |
| Node.js 24 | Runtime | Server execution | All levels |
| Playwright browsers | Tool | Chromium/Firefox/WebKit | E2E, Smoke |
| Docker | Infrastructure | Container runtime | E2E (containerized) |
| pnpm | Package Manager | Dependency resolution, script execution | All levels |

### Environment Variables

| Variable | Test Value | Purpose |
|----------|-----------|---------|
| `DATABASE_URL` | `postgresql://postgres:notpassword@localhost/4gaBoards` | Database connection |
| `SECRET_KEY` | `notsecretkey` | JWT signing |
| `BASE_URL` | `http://localhost:3000` | Server base URL |
| `NODE_ENV` | `test` | Enables test mode |

---

## 7. Test Data

### Required Data

- **User accounts**: EDITOR user, VIEWER user, COMMENTER user (all on same board)
- **Project**: At least 1 project with a board
- **Board**: Board with 3 lists ("To Do", "In Progress", "Done")
- **Cards**: 3-4 cards in "To Do" list for drag testing
- **Labels**: At least 1 label on a card (for cross-board transfer tests)

### Edge / Negative Data

- Empty string card name
- Card name with special characters: `<script>alert('xss')</script>`, unicode emojis, 500+ chars
- Null / missing `name` field in API request
- Invalid `listId` (non-existent list)
- Position values: 0, negative, extremely large numbers
- Exhausted position gaps (cards at adjacent integer positions)

---

## 8. Test Case Design

### 8.1 Create Card — Test Cases

| ID | Test Case | Steps | Expected Result | Type | Automated |
|----|-----------|-------|-----------------|------|-----------|
| CC-01 | Create card with valid name | 1. Login as EDITOR<br>2. Navigate to board<br>3. Click "Add card" on a list<br>4. Type "New Card"<br>5. Press Enter | Card "New Card" appears at bottom of list | Smoke | No |
| CC-02 | Empty name rejected | 1. Click "Add card"<br>2. Leave name empty<br>3. Press Enter | Form does not submit, no card created, textarea remains focused | Unit | No |
| CC-03 | Ctrl+Enter auto-opens card modal | 1. Click "Add card"<br>2. Type "Auto Open"<br>3. Press Ctrl+Enter | Card created AND detail modal opens with card title | E2E | No |
| CC-04 | Position auto-calculated | 1. List has cards at positions 65536, 131072<br>2. Create new card without specifying position | Card created at position 196608 (last + positionGap) | Integration | No |
| CC-05 | Real-time broadcast to other users | 1. User A and User B view same board<br>2. User A creates card "Broadcast Test" | User B sees "Broadcast Test" appear without refresh | E2E | No |
| CC-06 | Card persists after page reload | 1. Create card "Persist Test"<br>2. Wait for network idle<br>3. Reload page | Card still visible in correct list and position | E2E | No |
| CC-07 | VIEWER cannot see Add card button | 1. Login as VIEWER<br>2. Navigate to board | "Add card" button is hidden or disabled | E2E | No |
| CC-08 | API rejects without authentication | 1. `POST /api/lists/:listId/cards` without auth header | 401 Unauthorized | Integration | No |
| CC-09 | API rejects for VIEWER role | 1. Authenticate as VIEWER<br>2. `POST /api/lists/:listId/cards` with `{name: "Test"}` | 403 Forbidden | Integration | No |
| CC-10 | Card creation with all optional fields | 1. `POST /api/lists/:listId/cards` with `{name, description, dueDate, timer}` | Card created with all fields persisted | Integration | No |
| CC-11 | Action audit record created | 1. Create card via API<br>2. Query Action table for type `cardCreate` | Action record exists with correct userId and cardId | Integration | No |
| CC-12 | Creator auto-subscribed | 1. User has `subscribeToOwnCards` enabled<br>2. Create card | CardSubscription record created for user + card | Integration | No |
| CC-13 | Optimistic update before server response | 1. Mock slow network<br>2. Create card | Card appears instantly in UI before API responds | Unit | No |
| CC-14 | Rollback on API failure | 1. Mock API to return 500<br>2. Trigger createCard saga | Optimistic card removed, error action dispatched | Unit | No |
| CC-15 | CardAdd closes on blur when empty | 1. Open CardAdd form<br>2. Leave empty<br>3. Click outside | Form closes, onClose callback fired | Unit | No |
| CC-16 | Sequential cards maintain order | 1. Create "Card A", "Card B", "Card C" in same list | Cards appear in order A, B, C with incrementing positions | E2E | No |
| CC-17 | Special characters / XSS prevention | 1. Create card with `<script>` in name | Name stored and displayed correctly, no script execution | Integration | No |
| CC-18 | CardAddPopup requires list selection | 1. Open popup without forced list<br>2. Type name, don't select list<br>3. Submit | Form does not submit until list selected | Unit | No |

### 8.2 Drag-and-Drop Card — Test Cases

| ID | Test Case | Steps | Expected Result | Type | Automated |
|----|-----------|-------|-----------------|------|-----------|
| DD-01 | Drag card within same list (reorder) | 1. Login as EDITOR<br>2. Board with 3+ cards in list<br>3. Drag first card to third position<br>4. Release | Card in third position, others shift up | Smoke | No |
| DD-02 | Drag card to different list | 1. Drag card from List A<br>2. Drop on List B | Card removed from List A, appears in List B | Smoke | No |
| DD-03 | Drag card to empty list | 1. Drag card from populated list<br>2. Drop into empty list | Card is sole card in previously empty list | E2E | No |
| DD-04 | Drag cancelled with Escape | 1. Start dragging card<br>2. Press Escape | Card snaps back, no API call | E2E | No |
| DD-05 | Drop outside valid area | 1. Start dragging<br>2. Release outside any droppable | Card returns to original position | E2E | No |
| DD-06 | Drop in same position (no-op) | 1. Pick up card<br>2. Drop in exact same spot | No API call, no state change | Unit | No |
| DD-07 | Position midpoint calculation | 1. Cards at 65536 and 196608<br>2. Move card to index 1 | Position = 131072 (midpoint) | Unit | No |
| DD-08 | Move to end of list | 1. Cards at 65536, 131072<br>2. Move card to index 2 | Position = 196608 (last + gap) | Unit | No |
| DD-09 | Move to beginning of list | 1. First card at 65536<br>2. Move card to index 0 | Position = 32768 (first / 2) | Unit | No |
| DD-10 | Position collision recalculation | 1. Cards with exhausted gaps<br>2. Move card between them | Server recalculates all positions, broadcasts updates | Integration | No |
| DD-11 | Cross-list move persists after reload | 1. Drag from List A to List B<br>2. Reload page | Card still in List B | E2E | No |
| DD-12 | Real-time sync with second user | 1. User A and B on same board<br>2. User A drags card to List 2 | User B sees move without refresh | E2E | No |
| DD-13 | VIEWER cannot drag | 1. Login as VIEWER<br>2. Attempt to drag card | Drag handle hidden or interaction disabled | E2E | No |
| DD-14 | API PATCH moves card between lists | 1. `PATCH /api/cards/:id` with `{listId, position}` | 200 OK, card listId updated, broadcast sent | Integration | No |
| DD-15 | API PATCH rejected for VIEWER | 1. Authenticate as VIEWER<br>2. `PATCH /api/cards/:id` with `{listId, position}` | 403 Forbidden | Integration | No |
| DD-16 | Cross-board transfer removes labels | 1. Card has Board A labels<br>2. Transfer to Board B | Labels not in Board B removed from card | Integration | No |
| DD-17 | Cross-board transfer removes subscriptions | 1. Card has non-Board-B subscribers<br>2. Transfer to Board B | Invalid subscriptions deleted | Integration | No |
| DD-18 | CARD_MOVE action record created | 1. Move card to different list<br>2. Query Action table | Action type=CARD_MOVE with source/dest list | Integration | No |
| DD-19 | CARD_TRANSFER action record created | 1. Transfer card to different board<br>2. Query Action table | Action type=CARD_TRANSFER with source/dest board | Integration | No |
| DD-20 | Broadcast for repositioned cards | 1. Move triggers recalculation for 3 cards<br>2. Listen on socket | 3 `cardUpdate` events broadcast | Integration | No |
| DD-21 | Rapid sequential drags | 1. Drag A to List 2<br>2. Immediately drag B to List 3<br>3. Immediately drag C within List 1 | All succeed, no duplicates, positions correct | E2E | No |
| DD-22 | handleDragEnd parses draggableId | 1. Simulate end with `draggableId: 'card:42'`<br>2. Destination `droppableId: 'list:5'` | `onCardMove(42, 5, index)` called | Unit | No |
| DD-23 | handleDragEnd null destination | 1. Simulate end with `destination: null` | `onCardMove` NOT called, no error | Unit | No |

### Test Coverage Categories

- Happy path: CC-01, CC-03, CC-04, CC-10, DD-01, DD-02, DD-14
- Negative scenarios: CC-02, CC-08, CC-09, DD-15
- Boundary conditions: CC-17, DD-07, DD-08, DD-09, DD-10
- Validation rules: CC-02, CC-18, DD-06
- Integration flows: CC-05, CC-11, CC-12, DD-16, DD-17, DD-18, DD-19, DD-20
- UI workflows: CC-01, CC-03, CC-07, DD-01, DD-02, DD-03, DD-04, DD-05
- Persistence verification: CC-06, DD-11

---

## 9. Workflow / E2E Scenarios

| Scenario | Description | Validation |
|----------|-------------|------------|
| Create → Move → Verify | Create card in List A, drag to List B, reload page | Card in List B after reload |
| Multi-user create + move | User A creates card, User B moves it, User A sees final state | Both users have consistent view |
| Rapid create + reorder | Create 5 cards quickly, reorder them all | Final order matches user intent, no position conflicts |
| Partial failure recovery | Create card, server goes offline mid-move, reconnect | Card returns to last confirmed position on reconnect |
| Cross-board full flow | Create card with labels, transfer to another board | Card transferred, incompatible labels stripped, audit logged |

---

## 10. Cross-Service / Integration Testing

| Integration Point | Validation |
|-------------------|------------|
| App → PostgreSQL | Card record persisted with correct fields (name, position, listId, boardId) |
| App → Socket.io | `cardCreate` / `cardUpdate` events broadcast to correct room |
| Socket.io → Client | Event received triggers Redux action, UI updates |
| App → Action table | Audit records created for create/move/transfer operations |
| App → Notification service | Card subscribers notified on create (if subscribed) |

---

## 11. Non-Functional Testing

| Type | Scope | Notes |
|------|-------|-------|
| Performance | Card creation latency under load | Target: < 200ms API response at 100 concurrent users |
| Performance | Drag-and-drop position calculation | Target: < 50ms client-side computation |
| Memory | Socket connections under load | Monitor memory with 50+ active board viewers |
| Security | XSS in card names | Verify HTML entities escaped in display |
| Security | Authorization bypass | Verify VIEWER cannot PATCH card via direct API |
| Stress | 1000+ cards in a single list | Drag performance and position gap exhaustion |

---

## 12. Compatibility Testing

| Dimension | Scope |
|-----------|-------|
| Browsers | Chrome (latest), Firefox (latest), Edge (latest), Safari (latest) |
| OS | Windows 11, macOS, Ubuntu Linux |
| Viewport sizes | 1920x1080 (desktop), 1366x768 (laptop), 768x1024 (tablet) |
| Drag-and-drop | Mouse input, trackpad input, touch input (if supported) |

---

## 13. Cross-Feature Impact

| Impacted Feature | Impact Description | Regression Needed |
|------------------|-------------------|-------------------|
| Card Labels | Cross-board transfer removes labels | Verify labels intact for same-board moves |
| Card Subscriptions | Transfer removes non-member subscriptions | Verify subscriptions intact for same-board moves |
| Notifications | Card creation triggers subscriber notifications | Verify notification pipeline not broken |
| Activity Feed | Action records power activity UI | Verify actions display correctly after move |
| Board Export | Card positions affect export order | Verify export reflects final card order |
| Search/Filter | Card list membership affects filter results | Verify filters update after move |

---

## 14. Open Issues / Risks

| # | Risk / Issue | Impact | Mitigation |
|---|-------------|--------|------------|
| 1 | react-beautiful-dnd is unmaintained | May break with future React versions | Monitor for alternatives (dnd-kit) |
| 2 | Position gap exhaustion | Cards could get into unorderable state | Server-side recalculation handles this |
| 3 | Race condition on rapid moves | Two users move same card simultaneously | Last-write-wins; socket broadcast resolves |
| 4 | No offline support | Moves lost if disconnected | Request queue + reconnect refresh mitigates |
| 5 | Playwright DnD simulation | Drag-and-drop automation can be flaky | Use mouse event simulation with explicit waits |

---

## 15. Automation Plan

| Phase | Scope | Target Date | CI Integration |
|-------|-------|-------------|----------------|
| Phase 1 | Smoke tests (CC-01, DD-01, DD-02) | TBD | GitHub Actions on every PR |
| Phase 2 | Integration tests (CC-04 to CC-12, DD-10 to DD-20) | TBD | GitHub Actions nightly |
| Phase 3 | Full E2E suite (all E2E classified tests) | TBD | GitHub Actions on release branch |
| Phase 4 | Unit tests (all Unit classified tests) | TBD | GitHub Actions on every PR |

### Automation file locations:
- E2E: `tests/e2e/specs/createCard.spec.ts`, `tests/e2e/specs/dragDropCard.spec.ts`
- Integration: `server/test/integration/controllers/cards/create.test.js`, `server/test/integration/controllers/cards/update.test.js`
- Unit: `client/src/sagas/core/services/__tests__/cards.test.js`, `client/src/components/Board/__tests__/Board.test.jsx`

### Execution Commands

```bash
pnpm test              # All tests (server + client)
pnpm test:e2e          # E2E Playwright tests
pnpm test:headed       # E2E with visible browser
pnpm server:test       # Server integration tests only
pnpm client:test       # Client unit tests only
pnpm test:debug        # Step-through debug mode
```

---

## 16. Feature Readiness Criteria

- [ ] All Smoke tests passing (CC-01, DD-01, DD-02)
- [ ] All Integration tests passing (CC-04 to CC-12, DD-10 to DD-20)
- [ ] No high/critical severity defects open
- [ ] Code coverage meets targets (Backend 85%, Frontend 80%)
- [ ] Performance baseline validated (< 200ms card create, < 50ms position calc)
- [ ] Cross-browser validation complete (Chrome, Firefox, Edge)
- [ ] Real-time sync verified with 2+ concurrent users
- [ ] Security review passed (no XSS, auth bypass confirmed blocked)

---

## 17. Test Procedure Review

- **Review Notes**: TBD
- **Approval Status**: Pending
- **Review Date**: TBD
- **Approved By**: TBD

---

## 18. Summary

| Classification | Count | Purpose |
|----------------|-------|---------|
| Smoke | 3 | Quick validation of critical paths after deploy |
| Unit | 13 | Isolated component/saga logic without external deps |
| Integration | 16 | API + database + socket behavior verification |
| E2E | 9 | Full browser user flows including real-time |
| **Total** | **41** | |
