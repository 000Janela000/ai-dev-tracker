import type { FetchResult, NewTrackedItem } from "@/lib/types";
import { fetchAllRssFeeds } from "./rss";
import { fetchHackerNews } from "./hackernews";
import { fetchGitHub } from "./github";
import { fetchArxiv } from "./arxiv";
import { fetchReddit } from "./reddit";
import { fetchGitHubReleases } from "./github-releases";
import { fetchDevTo } from "./devto";

export interface FetchAllResult {
  items: NewTrackedItem[];
  results: FetchResult[];
  totalFetched: number;
  totalSources: number;
  failedSources: number;
}

/** Full pipeline — all sources including slow ones (GitHub search, ArXiv) */
export async function fetchAllSources(since: Date): Promise<FetchAllResult> {
  console.log(
    `[Pipeline] Fetching ALL sources since ${since.toISOString()}...`
  );

  const settled = await Promise.allSettled([
    fetchAllRssFeeds(since),
    fetchHackerNews(since),
    fetchGitHub(since),
    fetchArxiv(since),
    fetchReddit(since),
    fetchGitHubReleases(since),
    fetchDevTo(since),
  ]);

  return collectResults(settled);
}

/** Light pipeline — fast sources only for frequent checks */
export async function fetchLightSources(since: Date): Promise<FetchAllResult> {
  console.log(
    `[Pipeline-Light] Fetching fast sources since ${since.toISOString()}...`
  );

  const settled = await Promise.allSettled([
    fetchAllRssFeeds(since),
    fetchReddit(since),
    fetchGitHubReleases(since),
    fetchDevTo(since),
  ]);

  return collectResults(settled);
}

function collectResults(
  settled: PromiseSettledResult<FetchResult | FetchResult[]>[]
): FetchAllResult {
  const results: FetchResult[] = [];

  for (const result of settled) {
    if (result.status === "fulfilled") {
      const value = result.value;
      if (Array.isArray(value)) {
        results.push(...value);
      } else {
        results.push(value);
      }
    } else {
      results.push({
        source: "unknown",
        items: [],
        durationMs: 0,
        error: result.reason?.message ?? "Fetch failed",
      });
    }
  }

  const allItems = results.flatMap((r) => r.items);
  const failedSources = results.filter((r) => r.error).length;

  for (const r of results) {
    const status = r.error ? `ERROR: ${r.error}` : `${r.items.length} items`;
    console.log(`  [${r.source}] ${status} (${r.durationMs}ms)`);
  }
  console.log(
    `[Pipeline] Total: ${allItems.length} items from ${results.length} sources (${failedSources} failed)`
  );

  return {
    items: allItems,
    results,
    totalFetched: allItems.length,
    totalSources: results.length,
    failedSources,
  };
}

export { fetchAllRssFeeds } from "./rss";
export { fetchHackerNews } from "./hackernews";
export { fetchGitHub } from "./github";
export { fetchArxiv } from "./arxiv";
export { fetchReddit } from "./reddit";
export { fetchGitHubReleases } from "./github-releases";
export { fetchDevTo } from "./devto";
