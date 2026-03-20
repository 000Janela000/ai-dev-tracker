import type { ItemRow } from "@/lib/db";
import { estimateReadingTime, BRIEFING_BUDGET_MINUTES } from "./reading-time";

const MIN_IMPORTANCE = 2; // Items must have importance >= 2 to enter the briefing

export interface BriefingResult {
  briefingItems: (ItemRow & { readingTimeMin: number })[];
  remainingItems: ItemRow[];
  totalMinutes: number;
}

/**
 * Select items for the briefing with quality gate.
 * - Must have a summary
 * - Must have importance >= MIN_IMPORTANCE
 * - Must not be off-topic (summary doesn't start with "[Off-topic]")
 * - Sorted by importance DESC, then significance score DESC, then recency
 * - Fills up to the reading time budget
 */
export function selectBriefingItems(items: ItemRow[]): BriefingResult {
  // Sort by quality: importance first, then score, then recency
  const sorted = [...items].sort((a, b) => {
    const impDiff = (b.importance ?? 0) - (a.importance ?? 0);
    if (impDiff !== 0) return impDiff;
    const scoreDiff = (b.significanceScore ?? 0) - (a.significanceScore ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const briefingItems: (ItemRow & { readingTimeMin: number })[] = [];
  const remainingItems: ItemRow[] = [];
  let totalMinutes = 0;
  let budgetFilled = false;

  for (const item of sorted) {
    // Quality gate: must have summary, sufficient importance, not off-topic
    const passesGate =
      item.summary &&
      !item.summary.startsWith("[Off-topic]") &&
      (item.importance ?? 0) >= MIN_IMPORTANCE;

    if (budgetFilled || !passesGate) {
      remainingItems.push(item);
      continue;
    }

    const readingTimeMin = estimateReadingTime(item.summary);

    if (totalMinutes + readingTimeMin <= BRIEFING_BUDGET_MINUTES) {
      briefingItems.push({ ...item, readingTimeMin });
      totalMinutes += readingTimeMin;
    } else {
      budgetFilled = true;
      remainingItems.push(item);
    }
  }

  return { briefingItems, remainingItems, totalMinutes };
}
