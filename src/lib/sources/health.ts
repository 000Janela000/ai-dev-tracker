import { sql } from "drizzle-orm";
import { getDb, fetchLogs } from "@/lib/db";

const STREAK_THRESHOLD = 3;

export interface SourceHealthIssue {
  source: string;
  consecutiveZeroRuns: number;
  lastFetchedAt: Date | null;
}

/**
 * Look at recent fetch_logs rows grouped by source. Any source whose last
 * STREAK_THRESHOLD runs all returned 0 items is silently dying — log a loud
 * warning so the operator notices before it rots for weeks.
 *
 * Example failure mode this catches: an official blog RSS URL changes,
 * starts returning HTTP 200 with empty feed, and the pipeline happily
 * records "0 items, no error" for months without anyone noticing.
 */
export async function checkSourceHealth(): Promise<SourceHealthIssue[]> {
  const db = getDb();

  // Recent runs, most recent first, per source. We only need the last
  // STREAK_THRESHOLD rows per source, but a plain LIMIT won't get that —
  // use ROW_NUMBER().
  const rows = await db.execute(
    sql`
      SELECT source, fetched_at, item_count
      FROM (
        SELECT source, fetched_at, item_count,
               ROW_NUMBER() OVER (PARTITION BY source ORDER BY fetched_at DESC) AS rn
        FROM ${fetchLogs}
      ) t
      WHERE rn <= ${STREAK_THRESHOLD}
      ORDER BY source, fetched_at DESC
    `
  );

  const bySource = new Map<
    string,
    Array<{ fetchedAt: Date; itemCount: number }>
  >();

  for (const r of rows as unknown as Array<{
    source: string;
    fetched_at: string;
    item_count: number;
  }>) {
    if (!bySource.has(r.source)) bySource.set(r.source, []);
    bySource.get(r.source)!.push({
      fetchedAt: new Date(r.fetched_at),
      itemCount: Number(r.item_count),
    });
  }

  const issues: SourceHealthIssue[] = [];
  for (const [source, runs] of bySource) {
    if (runs.length < STREAK_THRESHOLD) continue;
    if (runs.every((r) => r.itemCount === 0)) {
      issues.push({
        source,
        consecutiveZeroRuns: runs.length,
        lastFetchedAt: runs[0]?.fetchedAt ?? null,
      });
    }
  }

  return issues;
}

/** Print a loud block to the pipeline log if any sources look dead. */
export async function logSourceHealthWarnings(): Promise<void> {
  try {
    const issues = await checkSourceHealth();
    if (issues.length === 0) {
      console.log("[Health] All sources producing items in recent runs.");
      return;
    }

    console.warn("");
    console.warn("========================================");
    console.warn(
      `[Health] ⚠  ${issues.length} source(s) have returned 0 items in the last ${STREAK_THRESHOLD} runs:`
    );
    for (const issue of issues) {
      const lastSeen = issue.lastFetchedAt?.toISOString() ?? "unknown";
      console.warn(
        `  - ${issue.source}  (last run: ${lastSeen})  — verify the feed URL or adapter`
      );
    }
    console.warn("========================================");
    console.warn("");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`[Health] Could not run health check: ${msg}`);
  }
}
