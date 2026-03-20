## Context

The `user_state` table already exists with columns: id, userId, itemId, action ('read' | 'read_later' | 'saved'), createdAt. Unique index on (userId, itemId, action). Auth is available via `useRequireAuth` hook (client) and `getUser()` helper (server).

The dashboard currently loads 200 items via `getRecentItems(200)` and filters client-side. Item cards are rendered by `TrackedItemCard` in `item-list.tsx`.

## Goals / Non-Goals

**Goals:**
- CRUD API for user state actions
- Action buttons on item cards (compact) and item detail page (full)
- Read items filtered from dashboard feed for authenticated users
- Dedicated pages for Saved and Read Later collections
- Visual indicators on items the user has acted on

**Non-Goals:**
- Bulk actions (select all, mark all read)
- Export or share collections
- Sorting/filtering within collections (just chronological for now)

## Decisions

### 1. Single API route with action parameter

`POST /api/user-state` handles all actions: `{ itemId, action }` to add, `DELETE /api/user-state` with `{ itemId, action }` to remove. Simpler than separate routes per action type.

### 2. Dashboard filtering: server-side for authenticated users

When a user is authenticated, the dashboard query joins against `user_state` to exclude items marked as 'read'. This is more efficient than loading all items and filtering client-side. Falls back to the existing unfiltered query for unauthenticated users.

### 3. Optimistic UI for action buttons

When a user clicks Save/Read Later/Mark Read, the UI updates immediately (optimistic) and the API call happens in the background. If the API fails, the UI reverts. This makes the experience feel instant.

### 4. Action buttons: icon-only on cards, labeled on detail page

Item cards in the feed show small icon buttons (bookmark, clock, check) to keep the cards compact. The item detail page shows full labeled buttons.

## Risks / Trade-offs

**[N+1 query for user state on cards]** → Loading user state for 200 items individually would be slow. Mitigation: batch-load all user states for visible items in one query, pass as a Set to the card list.

**[Read state hides items permanently]** → Once marked read, an item disappears from the feed. User might regret this. Mitigation: items are never deleted — they're just filtered. User can find them in their read history or by searching.
