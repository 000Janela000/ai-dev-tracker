import type { ItemRow } from "@/lib/db";

const CLUSTER_SIMILARITY_THRESHOLD = 0.4;
const CLUSTER_TIME_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface ClusteredItem extends ItemRow {
  clusterSize: number;
  clusterItemIds: string[];
}

/** Tokenize a string into lowercase words (3+ chars) */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

/** Jaccard similarity between two token sets */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersectionSize = 0;
  for (const item of a) {
    if (b.has(item)) intersectionSize++;
  }
  const unionSize = a.size + b.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

interface Cluster {
  primary: ItemRow;
  primaryTokens: Set<string>;
  memberIds: string[];
}

/**
 * Group items by title similarity into clusters.
 * Items must be within 24h of each other to cluster.
 * Returns one ClusteredItem per cluster (the highest-scored item as primary).
 * Items are assumed to be pre-sorted by significance score (desc).
 */
export function clusterItems(items: ItemRow[]): ClusteredItem[] {
  const clusters: Cluster[] = [];

  for (const item of items) {
    const tokens = tokenize(item.title);
    let matched = false;

    for (const cluster of clusters) {
      // Check time window
      const timeDiff = Math.abs(
        new Date(item.publishedAt).getTime() -
          new Date(cluster.primary.publishedAt).getTime()
      );
      if (timeDiff > CLUSTER_TIME_WINDOW_MS) continue;

      // Check title similarity
      if (jaccardSimilarity(tokens, cluster.primaryTokens) > CLUSTER_SIMILARITY_THRESHOLD) {
        cluster.memberIds.push(item.id);
        matched = true;
        break;
      }
    }

    if (!matched) {
      clusters.push({
        primary: item,
        primaryTokens: tokens,
        memberIds: [item.id],
      });
    }
  }

  return clusters.map((c) => ({
    ...c.primary,
    clusterSize: c.memberIds.length,
    clusterItemIds: c.memberIds,
  }));
}
