/**
 * Summarization Script
 *
 * Fetches unsummarized items from the database and generates AI summaries.
 * Run with: npx tsx --tsconfig tsconfig.json scripts/summarize.ts
 */

import { getUnsummarizedItems, updateItemSummary, updateSignificanceScores } from "@/lib/db";
import { summarizeBatch } from "@/lib/summarizer";
import { calculateSignificanceScore } from "@/lib/scoring";

// Multi-provider: Groq (~500K tokens/day) + Gemini fallback (250 RPD)
const MAX_ITEMS = 200;

async function main() {
  console.log(`\n[Summarizer] Fetching up to ${MAX_ITEMS} unsummarized items...`);

  const items = await getUnsummarizedItems(MAX_ITEMS);
  if (items.length === 0) {
    console.log("[Summarizer] No unsummarized items found. Done.");
    return;
  }

  console.log(`[Summarizer] Found ${items.length} items to summarize.\n`);

  const stats = await summarizeBatch(
    items.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      source: item.source,
      sourceType: item.sourceType,
    })),
    async (itemId, result) => {
      // Use relevance as importance. Items with relevance 0-1 get marked off-topic.
      const importance = result.isRelevant ? result.relevance : 0;
      const summary = result.isRelevant
        ? result.summary
        : "[Off-topic] " + result.summary;

      // Map relevance to devRelevance for backward compat
      const devRelevance =
        result.relevance >= 3 ? "direct" : result.relevance >= 2 ? "indirect" : "general";

      await updateItemSummary(
        itemId,
        summary,
        result.category,
        importance,
        result.tags,
        devRelevance
      );

      if (!result.isRelevant) {
        console.log(
          `  [Noise] Filtered: "${items.find((i) => i.id === itemId)?.title?.slice(0, 60)}"`
        );
      }
    }
  );

  console.log(`\n[Summarizer] Complete:`);
  console.log(`  Processed: ${stats.processed}`);
  console.log(`  Succeeded: ${stats.succeeded}`);
  console.log(`  Failed: ${stats.failed}`);
  console.log(`  Used local fallback: ${stats.usedFallback}`);

  // Layer 3 fix: Run scoring AFTER summarization so importance is set
  console.log(`\n[Scoring] Recalculating significance scores...`);
  try {
    const scored = await updateSignificanceScores((item) =>
      calculateSignificanceScore({
        source: item.source,
        publishedAt: item.publishedAt,
        importance: item.importance,
        metadata: item.metadata as Record<string, unknown> | null,
      })
    );
    console.log(`[Scoring] Updated ${scored} items`);
  } catch (error) {
    console.warn("[Scoring] Failed (non-critical):", error);
  }
}

main().catch((error) => {
  console.error("[Summarizer] Fatal error:", error);
  process.exit(1);
});
