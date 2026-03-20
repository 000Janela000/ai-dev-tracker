## 1. User State API

- [x] 1.1 Create `src/lib/db/user-state.ts` — DB operations: addUserState, removeUserState, getUserStatesForItems, getUserItemsByAction
- [x] 1.2 Create `src/app/api/user-state/route.ts` — POST (add), DELETE (remove), GET (batch load) with auth checks

## 2. Action Buttons Component

- [x] 2.1 Create `src/components/dashboard/item-actions.tsx` — client component with Save, Read Later, Mark Read buttons. Uses `useRequireAuth` for auth gate. Optimistic UI updates.
- [x] 2.2 Create `src/hooks/use-user-states.ts` — hook to batch-load user states for a list of item IDs and provide lookup

## 3. Integrate Actions into Item Cards

- [x] 3.1 Update `src/components/dashboard/tracked-item-card.tsx` — add compact icon action buttons (bookmark, clock, check)
- [x] 3.2 Update `src/components/dashboard/item-list.tsx` — load user states for visible items, pass to cards
- [x] 3.3 Update `src/app/item/[id]/page.tsx` — add labeled action buttons on detail page

## 4. Dashboard Read Filtering

- [x] 4.1 Add `getRecentItemsExcludingRead(userId, limit)` query to `src/lib/db/queries.ts` — joins against user_state to exclude read items
- [x] 4.2 Update `src/app/dashboard/page.tsx` — check auth, use filtered query for authenticated users, unfiltered for anonymous

## 5. Collection Pages

- [x] 5.1 Create `src/app/saved/page.tsx` — shows saved items, redirects to login if unauthenticated
- [x] 5.2 Create `src/app/read-later/page.tsx` — shows read later items, redirects to login if unauthenticated
- [x] 5.3 Update `src/components/dashboard/user-menu.tsx` — add links to /saved and /read-later

## 6. Verification

- [x] 6.1 Run `npm run build` to verify no TypeScript errors
