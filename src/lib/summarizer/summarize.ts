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
  // Added after observing real output — these pass when the LLM has
  // nothing concrete to describe in a changelog/release.
  /\bvarious (updates|changes|fixes|improvements)\b/i,
  /\bupdated dependencies\b/i,
  /\breview the changelog\b/i,
  /\bpatch changes?\b/i,
  /\bminor (updates|improvements|changes)\b/i,
  /\bbug fixes and improvements\b/i,
  /\b(several|multiple) (updates|improvements|fixes|changes)\b/i,
  /\bmay (require|need) (attention|review)\b/i,
  /\bdetermine if any changes? affect\b/i,
];

function isFluffy(summary: string): boolean {
  if (!summary) return false;
  return FLUFF_PATTERNS.some((p) => p.test(summary));
}

// Model family names that should tip an item into `models_releases`.
const MODEL_NAME_RE =
  /\b(claude|gpt|gemini|gemma|llama|qwen|deepseek|mistral|grok|phi|sonnet|opus|haiku|mythos|muse|qwen3)[ \-]?\d+(\.\d+)?[a-z]?\b/i;

// Verbs that signal this is an actual release/launch, not a tangential mention.
const RELEASE_VERB_RE =
  /\b(released?|releasing|launch(?:es|ed|ing)?|ships?|shipped|unveil(?:s|ed|ing)?|introduc(?:es|ed|ing)|announc(?:es|ed|ing)|deb(?:u|ou)ts?|drops?|rolls?\s+out|open-weight)\b/i;

/**
 * Returns true when the item looks like a model launch rather than (e.g.)
 * an SDK bump that happens to mention a model name. Requires BOTH a model
 * name and a release verb — in the title, or both in the summary.
 */
function looksLikeModelRelease(title: string, summary: string): boolean {
  const titleHit = MODEL_NAME_RE.test(title) && RELEASE_VERB_RE.test(title);
  const summaryHit =
    MODEL_NAME_RE.test(summary) && RELEASE_VERB_RE.test(summary);
  return titleHit || summaryHit;
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

      // Category rescue: the LLM consistently under-uses `models_releases`.
      // If title/summary clearly name a model AND use a release verb, force
      // the category regardless of what the LLM picked.
      if (
        resp.isRelevant &&
        resp.category !== "models_releases" &&
        looksLikeModelRelease(title, resp.summary)
      ) {
        return {
          response: { ...resp, category: "models_releases" },
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

    lastDelayMs = provider === "fallback" ? 0 : { groq: 4_000, cerebras: 6_500, gemini: 6_500 }[provider];

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
