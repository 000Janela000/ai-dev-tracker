## Why

The daily briefing model requires knowing what the user has already seen. Without read state tracking, the same items reappear on every visit. Save and Read Later collections give users permanent storage for valuable content. These features are the foundation for the 20-minute curated briefing — without them, DevNews is just another feed.

## What Changes

- Add API routes for user state actions: mark read, read later, save, remove
- Add action buttons (Mark Read, Read Later, Save) to item cards and detail pages
- Buttons trigger auth check via `useRequireAuth` — redirect to login if not authenticated
- Add `/saved` page showing saved items collection
- Add `/read-later` page showing read later queue
- Filter out read items from the main dashboard feed for authenticated users
- Show read/saved/read-later badges on items the user has already acted on

## Capabilities

### New Capabilities
- `item-actions`: API routes and UI buttons for Mark Read, Read Later, Save actions on items
- `collections-pages`: Dedicated pages for Saved and Read Later collections with item listings

### Modified Capabilities

## Impact

- **Code**: New API route (`/api/user-state`), new pages (`/saved`, `/read-later`), modified item cards, modified dashboard query
- **Database**: Uses existing `user_state` table (shipped with progressive-auth)
- **Auth**: Uses `useRequireAuth` hook for progressive auth gate on action buttons
