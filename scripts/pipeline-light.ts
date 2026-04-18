/**
 * Light Pipeline Script
 *
 * Fast sources only: RSS + Reddit + GitHub Releases + Dev.to
 * Skips slow/rate-limited sources (GitHub search, ArXiv, HN deep scan)
 * Skips summarization.
 * Runs every 2 hours for fresher data.
 *
 * Run with: npx tsx --tsconfig tsconfig.json scripts/pipeline-light.ts
 */

import { nanoid } from "@/lib/id";
import { fetchLightSources } from "@/lib/sources";
import { deduplicateItems, upsertItems, logFetchRun, getLastFetchTime, updateSignificanceScores, getRecentTitles, closeDb } from "@/lib/db";
import { calculateSignificanceScore } from "@/lib/scoring";

const DEFAULT_LOOKBACK_HOURS = 4; // Shorter lookback for frequent runs

async function main() {
  const pipelineRunId = nanoid(12);
  const startedAt = new Date();

  console.log(`\n[Light Pipeline] Run: ${pipelineRunId}`);
  console.log(`[Light Pipeline] Started: ${startedAt.toISOString()}\n`);

  let since: Date;
  try {
    const lastFetch = await getLastFetchTime();
    if (lastFetch) {
      since = lastFetch;
    } else {
      since = new Date(Date.now() - DEFAULT_LOOKBACK_HOURS * 60 * 60 * 1000);
    }
  } catch {
    since = new Date(Date.now() - DEFAULT_LOOKBACK_HOURS * 60 * 60 * 1000);
  }

  const fetchResult = await fetchLightSources(since);

  if (fetchResult.totalFetched === 0) {
    console.log("[Light Pipeline] No new items. Done.");
    return;
  }

  let recentTitles: Awaited<ReturnType<typeof getRecentTitles>> = [];
  try {
    recentTitles = await getRecentTitles(72);
  } catch { /* fall back to in-batch dedup only */ }
  const { unique, duplicatesRemoved, crossCycleDuplicatesRemoved } =
    deduplicateItems(fetchResult.items, recentTitles);
  console.log(
    `[Light Pipeline] Dedup: ${duplicatesRemoved} in-batch + ${crossCycleDuplicatesRemoved} cross-cycle removed, ${unique.length} unique`
  );

  try {
    if (unique.length > 0) {
      const { inserted } = await upsertItems(unique);
      console.log(`[Light Pipeline] Stored ${inserted} items`);
    }
    await logFetchRun(pipelineRunId, fetchResult.results);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Light Pipeline] DB error: ${msg}`);
    process.exit(1);
  }

  // Recalculate scores for recent items
  try {
    await updateSignificanceScores((item) =>
      calculateSignificanceScore({
        source: item.source,
        publishedAt: item.publishedAt,
        importance: item.importance,
        metadata: item.metadata as Record<string, unknown> | null,
      })
    );
  } catch { /* non-critical */ }

  const durationMs = Date.now() - startedAt.getTime();
  console.log(
    `\n[Light Pipeline] Done in ${(durationMs / 1000).toFixed(1)}s — ${unique.length} items stored\n`
  );
}

main()
  .catch((error) => {
    console.error("[Light Pipeline] Fatal:", error);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
