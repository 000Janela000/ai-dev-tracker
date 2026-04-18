/**
 * Data Pipeline Script
 *
 * Orchestrates: fetch → dedup → store for all enabled sources.
 * Run with: npx tsx scripts/pipeline.ts
 */

import { nanoid } from "@/lib/id";
import { fetchAllSources } from "@/lib/sources";
import { logSourceHealthWarnings } from "@/lib/sources/health";
import { deduplicateItems, upsertItems, logFetchRun, getLastFetchTime, updateSignificanceScores, pruneOldItems, getRecentTitles, closeDb } from "@/lib/db";
import { calculateSignificanceScore } from "@/lib/scoring";
import { promoteEligibleCandidates, restorePromotedCandidates } from "@/lib/discovery/candidates";

const DEFAULT_LOOKBACK_HOURS = 24;

async function main() {
  const pipelineRunId = nanoid(12);
  const startedAt = new Date();

  console.log(`\n========================================`);
  console.log(`Pipeline Run: ${pipelineRunId}`);
  console.log(`Started: ${startedAt.toISOString()}`);
  console.log(`========================================\n`);

  // Step 0: Restore previously promoted repo candidates
  try {
    const restored = await restorePromotedCandidates();
    if (restored.length > 0) {
      console.log(`[Pipeline] Restored ${restored.length} promoted repos: ${restored.join(", ")}`);
    }
  } catch {
    console.warn("[Pipeline] Could not restore promoted candidates (non-critical)");
  }

  // Step 1: Determine since date
  let since: Date;
  try {
    const lastFetch = await getLastFetchTime();
    if (lastFetch) {
      since = lastFetch;
      console.log(`[Pipeline] Last fetch: ${since.toISOString()}`);
    } else {
      since = new Date(Date.now() - DEFAULT_LOOKBACK_HOURS * 60 * 60 * 1000);
      console.log(
        `[Pipeline] No previous fetch found, looking back ${DEFAULT_LOOKBACK_HOURS}h`
      );
    }
  } catch {
    // Database might not be set up yet — use default lookback
    since = new Date(Date.now() - DEFAULT_LOOKBACK_HOURS * 60 * 60 * 1000);
    console.log(
      `[Pipeline] Could not query last fetch time, looking back ${DEFAULT_LOOKBACK_HOURS}h`
    );
  }

  // Step 2: Fetch all sources
  const fetchResult = await fetchAllSources(since);

  if (fetchResult.totalFetched === 0 && fetchResult.failedSources === fetchResult.totalSources) {
    console.error("\n[Pipeline] ALL sources failed. Exiting with error.");
    process.exit(1);
  }

  // Step 3: Deduplicate (within batch + against last 72h of DB items)
  console.log(`\n[Pipeline] Deduplicating ${fetchResult.totalFetched} items...`);
  let recentTitles: Awaited<ReturnType<typeof getRecentTitles>> = [];
  try {
    recentTitles = await getRecentTitles(72);
    console.log(`[Pipeline] Loaded ${recentTitles.length} recent DB titles for cross-cycle dedup`);
  } catch {
    console.warn("[Pipeline] Could not load recent titles — falling back to in-batch dedup only");
  }
  const { unique, duplicatesRemoved, crossCycleDuplicatesRemoved } =
    deduplicateItems(fetchResult.items, recentTitles);
  console.log(
    `[Pipeline] Dedup: ${duplicatesRemoved} in-batch + ${crossCycleDuplicatesRemoved} cross-cycle removed, ${unique.length} unique items`
  );

  // Step 4: Store in database
  let itemsStored = 0;
  try {
    if (unique.length > 0) {
      const { inserted } = await upsertItems(unique);
      itemsStored = inserted;
      console.log(`[Pipeline] Stored ${itemsStored} items in database`);
    } else {
      console.log("[Pipeline] No new items to store");
    }

    // Step 5: Log fetch results
    await logFetchRun(pipelineRunId, fetchResult.results);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`\n[Pipeline] Database error: ${msg}`);
    console.error(
      "[Pipeline] Items were fetched but could not be stored. Check DATABASE_URL."
    );
    process.exit(1);
  }

  // Step 6: Recalculate significance scores for recent items
  try {
    const scored = await updateSignificanceScores((item) =>
      calculateSignificanceScore({
        source: item.source,
        publishedAt: item.publishedAt,
        importance: item.importance,
        metadata: item.metadata as Record<string, unknown> | null,
      })
    );
    console.log(`[Pipeline] Updated significance scores for ${scored} items`);
  } catch {
    console.warn("[Pipeline] Scoring failed (non-critical)");
  }

  // Step 7: Auto-discover new repos for release watchlist
  try {
    const promoted = await promoteEligibleCandidates();
    if (promoted.length > 0) {
      console.log(`[Pipeline] Auto-discovered ${promoted.length} new repos: ${promoted.join(", ")}`);
    }
  } catch {
    console.warn("[Pipeline] Auto-discovery failed (non-critical)");
  }

  // Step 8: Prune old data (keep Supabase under 500MB)
  try {
    const pruned = await pruneOldItems(90);
    if (pruned > 0) {
      console.log(`[Pipeline] Pruned ${pruned} items older than 90 days`);
    }
  } catch {
    console.warn("[Pipeline] Pruning failed (non-critical)");
  }

  // Step 9: Source health check — warn on silent-dying feeds
  await logSourceHealthWarnings();

  // Summary
  const completedAt = new Date();
  const durationMs = completedAt.getTime() - startedAt.getTime();

  console.log(`\n========================================`);
  console.log(`Pipeline Complete: ${pipelineRunId}`);
  console.log(`Duration: ${(durationMs / 1000).toFixed(1)}s`);
  console.log(`Sources: ${fetchResult.totalSources} total, ${fetchResult.failedSources} failed`);
  console.log(`Fetched: ${fetchResult.totalFetched} items`);
  console.log(`Duplicates removed: ${duplicatesRemoved} in-batch, ${crossCycleDuplicatesRemoved} cross-cycle`);
  console.log(`Stored: ${itemsStored} items`);
  console.log(`========================================\n`);
}

main()
  .catch((error) => {
    console.error("[Pipeline] Fatal error:", error);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
