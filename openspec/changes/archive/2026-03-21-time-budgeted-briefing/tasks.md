## 1. Reading Time Utility

- [x] 1.1 Create `src/lib/reading-time.ts` — `estimateReadingTime(text)` returns minutes (word count / 200 WPM, min 1), `BRIEFING_BUDGET_MINUTES = 20` constant

## 2. Briefing Selection Logic

- [x] 2.1 Create `src/lib/briefing.ts` — `selectBriefingItems(items)` walks scored items with summaries, accumulates reading time up to budget, returns `{ briefingItems, remainingItems, totalMinutes }`

## 3. Briefing Component

- [x] 3.1 Create `src/components/dashboard/briefing-section.tsx` — displays briefing header ("Your Briefing · ~Xm read"), list of briefing items with per-item reading time badge, uses TrackedItemCard
- [x] 3.2 Create `src/components/dashboard/more-items-section.tsx` — visual separator + "More Items" heading + remaining item list

## 4. Dashboard Integration

- [x] 4.1 Update `src/app/dashboard/page.tsx` — pass items to briefing selection, pass results to new components
- [x] 4.2 Update `src/app/dashboard/content.tsx` — accept briefingItems and remainingItems, render BriefingSection + MoreItemsSection instead of flat ItemList
- [x] 4.3 Remove hero section import from dashboard (briefing replaces it)

## 5. Verification

- [x] 5.1 Run `npm run build` to verify no TypeScript errors
