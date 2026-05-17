# Functional Flow — 4ga Boards

## 1. Authentication & Session Management

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LOCAL LOGIN:                                                   │
│  Browser → POST /api/access-tokens {email, password}            │
│    → Server: lookup user, bcrypt verify, create JWT             │
│    → Response: {accessToken}                                    │
│    → Client: store in cookie (SameSite=strict, Secure, HttpOnly)│
│    → Redux: update auth state → redirect to dashboard           │
│                                                                 │
│  SSO (Google/GitHub/Microsoft/OIDC):                            │
│  Browser → GET /auth/{provider}                                 │
│    → Redirect to provider OAuth consent screen                  │
│    → Provider callback → GET /auth/{provider}/callback?code=... │
│    → Server: exchange code for tokens, get profile              │
│    → Find/create/link user by ssoId or email                    │
│    → Redirect to /{provider}-callback?accessToken=...           │
│    → Client: extract token from URL, store in cookie            │
│                                                                 │
│  EVERY SUBSEQUENT REQUEST:                                      │
│  Client sends: Authorization: Bearer <JWT>                      │
│    → Hook extracts token, verifies signature + expiry           │
│    → Loads Session record, loads User                           │
│    → Checks passwordChangedAt < token issuedAt                  │
│    → Sets req.currentUser → Policy allows/denies                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Security features:** bcrypt (10 rounds), zxcvbn password strength, timing-attack-safe dummy hash, rate limiting on failed attempts, token invalidation on password change.

---

## 2. Project & Board Hierarchy (CRUD)

```
┌──────────────────────────────────────────────────────────────────┐
│                    DATA HIERARCHY                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Project                                                         │
│  ├── ProjectManager (user role)                                  │
│  ├── ProjectMembership (access control)                          │
│  └── Board                                                       │
│      ├── BoardMembership (EDITOR / VIEWER / COMMENTER)           │
│      ├── Label (name, color — shared across cards in board)      │
│      └── List (position, name, isCollapsed)                      │
│          └── Card (position, name, description, dueDate, timer)  │
│              ├── Task (checklist item, isCompleted, dueDate)      │
│              │   └── TaskMembership (assigned users)              │
│              ├── Attachment (file, image with thumbnails)         │
│              ├── Comment (markdown text, author)                  │
│              ├── CardLabel (many-to-many → Label)                 │
│              ├── CardMembership (assigned users)                  │
│              └── CardSubscription (notification subscribers)      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Position management:** Gap-based ordering (increments of 65536). Inserts compute midpoint between neighbors — no full-list reorder needed. Handled by `insertToPositionables()` utility on both client and server.

---

## 3. Card Lifecycle (Create → Move → Update → Delete)

```
┌──────────────────────────────────────────────────────────────────┐
│                   CARD CREATION FLOW                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  UI: User clicks "Add Card" in a list                            │
│    ↓                                                             │
│  Redux: dispatch CARD_CREATE entry action                        │
│    ↓                                                             │
│  Saga: createCard()                                              │
│    → Generate local ID                                           │
│    → Calculate position via selector (gap-based)                 │
│    → Dispatch optimistic CARD_CREATE action (instant UI update)  │
│    → API: socket.post('/lists/:listId/cards', {name, position})  │
│    ↓                                                             │
│  Server: cards/create controller                                 │
│    → Validate board membership (EDITOR role required)            │
│    → Helper: cards/create-one                                    │
│      → Insert card with calculated position                      │
│      → Auto-subscribe creator (if preference set)                │
│      → Broadcast: socket.broadcast('board:boardId', 'cardCreate')│
│      → Create Action record (audit trail)                        │
│    ↓                                                             │
│  Client: receives 'cardCreate' socket event                      │
│    → Saga: handleCardCreate → merge server data (fix local ID)   │
│    → All connected board viewers see the new card                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   DRAG-AND-DROP MOVE FLOW                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  UI: User drags card from List A → List B (react-beautiful-dnd)  │
│    ↓                                                             │
│  Board.jsx: handleDragEnd({draggableId, source, destination})    │
│    → Parse destination listId and index                          │
│    → Dispatch CARD_MOVE entry action                             │
│    ↓                                                             │
│  Saga: moveCard(cardId, listId, index)                           │
│    → Selector: calculate new position (midpoint in target list)  │
│    → API: socket.patch('/cards/:id', {listId, position})         │
│    ↓                                                             │
│  Server: cards/update controller                                 │
│    → Helper: cards/update-one                                    │
│      → If same board: CARD_MOVE action                           │
│      → If different board: CARD_TRANSFER action                  │
│        (removes incompatible labels, recreates matching ones)    │
│      → Broadcast cardUpdate to board channel                     │
│    ↓                                                             │
│  All connected clients: card animates to new position            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Real-Time Communication Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│               HYBRID REST + WEBSOCKET PATTERN                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    Socket.io (REST-like methods)    ┌──────────┐   │
│  │         │ ──────────────────────────────────→ │          │   │
│  │ Client  │    socket.post/patch/delete(url)    │  Server  │   │
│  │ (React) │ ←────────────────────────────────── │ (Sails)  │   │
│  │         │    Real-time event broadcasts        │          │   │
│  └─────────┘                                     └──────────┘   │
│                                                                  │
│  CHANNEL ARCHITECTURE:                                           │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  board:{boardId}  → card/list/attachment/comment     │        │
│  │  user:{userId}    → notifications, preferences       │        │
│  │  project:{projId} → project-level changes            │        │
│  │  instance         → system-wide broadcasts           │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  CLIENT SUBSCRIPTION:                                            │
│  User opens board → GET /api/boards/:id?subscribe=true           │
│    → Server: sails.sockets.join(req, 'board:boardId')            │
│    → Client now receives all board-scoped events                 │
│                                                                  │
│  60+ EVENT TYPES:                                                │
│  cardCreate, cardUpdate, cardDelete, cardDuplicate               │
│  listCreate, listUpdate, listDelete                              │
│  commentCreate, commentUpdate, commentDelete                     │
│  attachmentCreate, attachmentUpdate, attachmentDelete            │
│  taskCreate, taskUpdate, taskDelete                              │
│  notificationCreate, notificationUpdate                          │
│  boardUpdate, boardMembershipCreate/Update/Delete                │
│  ... and more                                                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Why hybrid?** All CRUD operations go over WebSocket (low latency, automatic subscription). File uploads use HTTP multipart (better for large payloads). Downloads use HTTP with cookie-based auth.

---

## 5. Notification & Subscription System

```
┌──────────────────────────────────────────────────────────────────┐
│                   NOTIFICATION PIPELINE                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Any action (comment, card move, assignment, etc.)               │
│    ↓                                                             │
│  helpers/actions/create-one.js                                   │
│    → Create Action record (audit log)                            │
│    → Find subscribers: getSubscriptionUserIds(cardId)            │
│    ↓                                                             │
│  For each subscribed user:                                       │
│    ↓                                                             │
│  helpers/notifications/create-one.js                             │
│    → Create Notification DB record                               │
│    → Real-time: broadcast to user:{userId} channel               │
│    → Email: if enabled, send via mail service                    │
│      - INSTANT mode: send immediately                            │
│      - BATCHED mode: aggregate similar notifications (5 min)     │
│                                                                  │
│  USER SUBSCRIPTION RULES:                                        │
│  • Auto-subscribe to cards you create (if preference set)        │
│  • Manual subscribe/unsubscribe per card                         │
│  • Board-level subscription for all changes                      │
│  • Per-user notification type preferences                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Client-Side State Management (Redux + Saga)

```
┌──────────────────────────────────────────────────────────────────┐
│                   REDUX ARCHITECTURE                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STORE SHAPE:                                                    │
│  ├── orm         (Redux-ORM: normalized entities)                │
│  │   ├── Card, List, Board, Project, User, Task, etc.           │
│  │   └── Relationships managed by ORM (foreign keys)            │
│  ├── auth        (currentUser, accessToken)                      │
│  ├── ui          (modals, forms, drag state, preferences)        │
│  ├── router      (currentProjectId, boardId, cardId)             │
│  └── socket      (connection status)                             │
│                                                                  │
│  DATA FLOW (Optimistic Updates):                                 │
│                                                                  │
│  User Action → Entry Action → Saga                              │
│       │                         │                                │
│       │                         ├─→ Dispatch optimistic action   │
│       │                         │     → Reducer updates store    │
│       │                         │     → UI re-renders instantly  │
│       │                         │                                │
│       │                         └─→ API call (socket.post/patch) │
│       │                               │                          │
│       │                               ├─ Success → merge server  │
│       │                               │   data (fix IDs, etc.)   │
│       │                               │                          │
│       │                               └─ Failure → rollback      │
│       │                                                          │
│  Socket Event (from other users) → Entry Action → Reducer        │
│       → UI re-renders with remote changes                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. File Upload Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                   ATTACHMENT UPLOAD                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User selects file → POST /api/cards/:cardId/attachments         │
│    (HTTP multipart, NOT socket — better for large files)         │
│    ↓                                                             │
│  Server: attachments/create controller                           │
│    → Sails Skipper processes multipart stream                    │
│    → File saved: /private/attachments/{uuid}/{filename}          │
│    → Image processing: generate thumbnails (Sharp library)       │
│    → Create Attachment record                                    │
│    → Broadcast 'attachmentCreate' to board channel               │
│    → Create Action record                                        │
│    ↓                                                             │
│  All board viewers: see new attachment in real-time              │
│                                                                  │
│  Download: GET /attachments/:id/download/:filename               │
│    → Auth via cookie (not Bearer header)                         │
│    → Stream file from disk                                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. Reconnection & Resilience

```
┌──────────────────────────────────────────────────────────────────┐
│                   RECONNECTION HANDLING                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Socket disconnects (network drop, server restart)               │
│    → Client: show offline indicator                              │
│    → Socket.io: auto-reconnect with backoff                      │
│    ↓                                                             │
│  On reconnect:                                                   │
│    → Full data refresh (user, boards, cards, etc.)               │
│    → Rejoin board subscription channel                           │
│    → Process queued requests (sails.io request queue)            │
│    → UI updates to current server state                          │
│                                                                  │
│  Request queuing:                                                │
│    If socket not connected, requests buffered in queue           │
│    When connected, queue drains in order                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Permission Model

| Scope | Role | Can Do |
|-------|------|--------|
| Project | Manager | Create/delete boards, manage members |
| Project | Member | View project, access permitted boards |
| Board | Editor | Full CRUD on lists, cards, tasks, attachments |
| Board | Commenter | Add comments only |
| Board | Viewer | Read-only access |

Permissions are validated server-side on every request. The client hides UI elements based on role but never trusts the client alone.

---

## 10. End-to-End Example: Adding a Comment

```
1. User types comment, clicks Send
2. Redux saga → socket.post('/cards/:cardId/comments', {text})
3. Server validates: user is board member with comment rights
4. Creates Comment record, increments card.commentCount
5. Broadcasts 'commentCreate' → board:{boardId} channel
6. Creates Action record (CARD_COMMENT_CREATE)
7. Finds card subscribers → creates Notification per subscriber
8. Broadcasts 'notificationCreate' → user:{userId} per subscriber
9. Sends email if subscriber has email notifications enabled
10. All board viewers see comment instantly; subscribers get badge + email
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Redux, Redux-Saga, Redux-ORM, Webpack 5 |
| Backend | Sails.js (Node.js MVC), Knex.js |
| Database | PostgreSQL 16 |
| Real-time | Socket.io (via Sails.io bridge) |
| Auth | Passport.js (local + Google/GitHub/Microsoft/OIDC) |
| File Processing | Sharp (thumbnails), Skipper (uploads) |
| DnD | react-beautiful-dnd |
| i18n | i18next (16+ languages) |

---

## Key Architectural Decisions

1. **Optimistic Updates** — UI updates instantly before server confirms; rollback on failure
2. **Gap-Based Positioning** — Cards/lists use large position gaps (65536) for O(1) reorder without shifting all items
3. **REST Over WebSocket** — Sails.io bridge provides HTTP-like API semantics with WebSocket transport
4. **Channel-Based Broadcasting** — Socket.io rooms scope events to relevant users only
5. **Request ID Deduplication** — Prevents duplicate processing on retries
6. **Audit Trail** — Every mutation creates an Action record for activity feeds and history
7. **Server-Side Permission Enforcement** — Never trust the client; validate roles on every request
