import { z } from "zod/v4";
import { generateWithFallback, type ProviderName } from "./providers";
import { SYSTEM_PROMPT, buildSummarizationPrompt } from "./prompt";
import { CategoryEnum } from "@/lib/types";

const SummaryResponseSchema = z.object({
  summary: z.string().default(""),
  category: CategoryEnum,
  relevance: z.number().int().min(0).max(5),
  tags: z.array(z.string()).default([]),
  isRelevant: z.boolean().default(true),
});

export type SummaryResponse = z.infer<typeof SummaryResponseSchema>;

// Phrases the LLM produces when it has nothing concrete to say.
// A summary matching any of these is treated as low-signal and dropped.
const FLUFF_PATTERNS: RegExp[] = [
  /\bvaluable (resource|insights?)\b/i,
  /\b(great|helpful|useful) resource\b/i,
  /\bhandy (tool|resource|guide)\b/i,
  /\b(can|could) be useful\b/i,
  /\buseful (for|to have)\b/i,
  /\bno (immediate )?action (is )?required\b/i,
  /\bworth exploring\b/i,
  /\bpractical guide\b/i,
  /\bfor (your )?future (projects?|reference)\b/i,
  /\bgood to know\b/i,
];

function isFluffy(summary: string): boolean {
  if (!summary) return false;
  return FLUFF_PATTERNS.some((p) => p.test(summary));
}

export interface SummarizeItemResult {
  response: SummaryResponse;
  provider: ProviderName;
}

/** Fallback response: empty summary + isRelevant:false so downstream marks it off-topic and briefing skips it. */
function fallbackResponse(): SummaryResponse {
  return {
    summary: "",
    category: "industry_trends",
    relevance: 1,
    tags: [],
    isRelevant: false,
  };
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

    const parsed = SummaryResponseSchema.safeParse(JSON.parse(result.text));
    if (parsed.success) {
      const resp = parsed.data;

      if (resp.isRelevant && isFluffy(resp.summary)) {
        console.log(
          `[Summarizer] Fluff filter dropped: "${title.slice(0, 60)}" :: ${resp.summary.slice(0, 80)}`
        );
        return {
          response: {
            summary: "",
            category: resp.category,
            relevance: 1,
            tags: resp.tags,
            isRelevant: false,
          },
          provider: result.provider,
        };
      }

      return { response: resp, provider: result.provider };
    }

    console.warn(
      `[Summarizer] Invalid response from ${result.provider} for "${title}":`,
      parsed.error.message
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Summarizer] All providers failed for "${title}": ${msg}`);
  }

  return { response: fallbackResponse(), provider: "fallback" };
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

    lastDelayMs = provider === "fallback" ? 0 : { groq: 4_000, cerebras: 2_500, gemini: 6_500 }[provider];

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
