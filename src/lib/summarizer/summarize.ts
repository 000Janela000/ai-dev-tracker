import { z } from "zod/v4";
import { getGeminiClient, RATE_LIMIT } from "./client";
import { SYSTEM_PROMPT, buildSummarizationPrompt } from "./prompt";
import { CategoryEnum } from "@/lib/types";

export const DevRelevanceEnum = z.enum(["direct", "indirect", "general"]);
export type DevRelevance = z.infer<typeof DevRelevanceEnum>;

const SummaryResponseSchema = z.object({
  summary: z.string().min(10),
  category: CategoryEnum,
  importance: z.number().int().min(1).max(5),
  tags: z.array(z.string()).default([]),
  keyTakeaway: z.string().optional(),
  devRelevance: DevRelevanceEnum.default("general"),
  isAIRelated: z.boolean().default(true),
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

export async function summarizeItem(
  title: string,
  content: string,
  source: string,
  sourceType: string
): Promise<SummaryResponse> {
  const client = getGeminiClient();
  const prompt = buildSummarizationPrompt(title, content, source, sourceType);

  try {
    const response = await client.models.generateContent({
      model: RATE_LIMIT.model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "{}";

    // Parse and validate with Zod
    const parsed = SummaryResponseSchema.safeParse(JSON.parse(text));
    if (parsed.success) {
      return parsed.data;
    }

    console.warn(
      `[Summarizer] Invalid response structure for "${title}":`,
      parsed.error.message
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Summarizer] API error for "${title}": ${msg}`);
  }

  // Fallback: generate basic summary without AI
  return {
    summary: fallbackSummary(content || title),
    category: "industry_trends",
    importance: 2,
    tags: [],
    keyTakeaway: undefined,
    devRelevance: "general" as const,
    isAIRelated: true,
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

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (i > 0) {
      await delay(RATE_LIMIT.delayBetweenRequestsMs);
    }

    console.log(
      `[Summarizer] (${i + 1}/${items.length}) "${item.title.slice(0, 60)}..."`
    );

    const result = await summarizeItem(
      item.title,
      item.content ?? item.title,
      item.source,
      item.sourceType
    );

    try {
      await onResult(item.id, result);
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
