import { z } from "zod/v4";
import { generateWithFallback, type ProviderName } from "./providers";
import { SYSTEM_PROMPT, buildSummarizationPrompt } from "./prompt";
import { CategoryEnum } from "@/lib/types";

const SummaryResponseSchema = z.object({
  summary: z.string().min(10),
  category: CategoryEnum,
  relevance: z.number().int().min(0).max(5),
  tags: z.array(z.string()).default([]),
  keyTakeaway: z.string().optional(),
  isRelevant: z.boolean().default(true),
});

export type SummaryResponse = z.infer<typeof SummaryResponseSchema>;

/** Extract first 2 sentences as fallback summary */
function fallbackSummary(content: string): string {
  const clean = content.replace(/<[^>]*>/g, "").trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length >= 2) {
    return sentences.slice(0, 2).join(" ").trim();
  }
  return clean.slice(0, 200).trim() + "...";
}

export interface SummarizeItemResult {
  response: SummaryResponse;
  provider: ProviderName;
}

export async function summarizeItem(
  title: string,
  content: string,
  source: string,
  sourceType: string
): Promise<SummarizeItemResult> {
  const prompt = buildSummarizationPrompt(title, content, source, sourceType);

  try {
    const result = await generateWithFallback(prompt, SYSTEM_PROMPT);

    // Parse and validate with Zod
    const parsed = SummaryResponseSchema.safeParse(JSON.parse(result.text));
    if (parsed.success) {
      return { response: parsed.data, provider: result.provider };
    }

    console.warn(
      `[Summarizer] Invalid response from ${result.provider} for "${title}":`,
      parsed.error.message
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Summarizer] All providers failed for "${title}": ${msg}`);
  }

  // Fallback: generate basic summary without AI
  return {
    response: {
      summary: fallbackSummary(content || title),
      category: "industry_trends",
      relevance: 1,
      tags: [],
      keyTakeaway: undefined,
      isRelevant: false,
    },
    provider: "fallback",
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface SummarizeBatchResult {
  processed: number;
  succeeded: number;
  failed: number;
  usedFallback: number;
}

export async function summarizeBatch(
  items: Array<{
    id: string;
    title: string;
    content: string | null;
    source: string;
    sourceType: string;
  }>,
  onResult: (
    itemId: string,
    result: SummaryResponse
  ) => Promise<void>
): Promise<SummarizeBatchResult> {
  const stats: SummarizeBatchResult = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    usedFallback: 0,
  };

  let lastDelayMs = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (i > 0 && lastDelayMs > 0) {
      await delay(lastDelayMs);
    }

    console.log(
      `[Summarizer] (${i + 1}/${items.length}) "${item.title.slice(0, 60)}..."`
    );

    const { response, provider } = await summarizeItem(
      item.title,
      item.content ?? item.title,
      item.source,
      item.sourceType
    );

    // Use the rate delay from whichever provider succeeded
    lastDelayMs = provider === "fallback" ? 0 : { groq: 4_000, gemini: 6_500 }[provider];

    const providerTag = provider === "fallback" ? " [local fallback]" : ` [${provider}]`;
    console.log(`  -> ${providerTag}`);

    if (provider === "fallback") {
      stats.usedFallback++;
    }

    try {
      await onResult(item.id, response);
      stats.succeeded++;
    } catch (error) {
      console.error(
        `[Summarizer] Failed to save summary for ${item.id}:`,
        error
      );
      stats.failed++;
    }

    stats.processed++;
  }

  return stats;
}
