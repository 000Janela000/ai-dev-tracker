export { getDb, closeDb } from "./client";
export { items, fetchLogs } from "./schema";
export type { ItemRow, NewItemRow, FetchLogRow } from "./schema";
export { normalizeItemUrl, isTitleDuplicate, deduplicateItems } from "./dedup";
export { upsertItems, logFetchRun, getLastFetchTime, updateItemSummary, updateSignificanceScores, pruneOldItems } from "./mutations";
export {
  getItemsByDateRange,
  getItemsBySource,
  searchItems,
  getUnsummarizedItems,
  getRecentItems,
  getItemById,
  getItemCounts,
  getRecentTitles,
} from "./queries";
