## 1. Clustering Utility

- [x] 1.1 Create `src/lib/clustering.ts` — `clusterItems(items)` function that groups items by Jaccard title similarity > 0.4 within 24h window, returns array of `ClusteredItem` (primary item + clusterSize + clusterItemIds)

## 2. Dashboard Integration

- [x] 2.1 Update `src/app/dashboard/page.tsx` — apply clustering before briefing selection
- [x] 2.2 Update `src/lib/briefing.ts` — no changes needed, ClusteredItem extends ItemRow (structural typing)

## 3. Source Count Badge

- [x] 3.1 Update `src/components/dashboard/tracked-item-card.tsx` — accept optional `clusterSize` prop, show "N sources" badge when > 1

## 4. Detail Page Cluster Sources

- [x] 4.1 Update `src/app/item/[id]/page.tsx` — accept `clusterItemIds` from query param or lookup, show "Also covered by" section with other cluster member titles and links

## 5. Verification

- [x] 5.1 Run `npm run build` to verify no TypeScript errors
