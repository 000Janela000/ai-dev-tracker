import { generateGroq, GROQ_RATE_DELAY_MS } from "./groq";
import { generateCerebras, CEREBRAS_RATE_DELAY_MS } from "./cerebras";
import { generateGemini, GEMINI_RATE_DELAY_MS } from "./gemini";

export type ProviderName = "groq" | "cerebras" | "gemini" | "fallback";

export interface GenerateResult {
  text: string;
  provider: ProviderName;
  rateDelayMs: number;
}

/**
 * Try Groq → Cerebras → Gemini → throw.
 *
 * Groq and Cerebras both run Llama 3.3 70B on purpose-built inference HW
 * with independent failure domains; either can carry the primary load.
 * Gemini is a last-resort fallback on a tight 250 RPD budget.
 */
export async function generateWithFallback(
  prompt: string,
  systemPrompt: string
): Promise<GenerateResult> {
  try {
    const text = await generateGroq(prompt, systemPrompt);
    return { text, provider: "groq", rateDelayMs: GROQ_RATE_DELAY_MS };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "GROQ_API_KEY not configured") {
      console.log("[Provider] Groq not configured, trying Cerebras...");
    } else {
      console.warn(`[Provider] Groq failed: ${msg}, trying Cerebras...`);
    }
  }

  try {
    const text = await generateCerebras(prompt, systemPrompt);
    return { text, provider: "cerebras", rateDelayMs: CEREBRAS_RATE_DELAY_MS };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "CEREBRAS_API_KEY not configured") {
      console.log("[Provider] Cerebras not configured, trying Gemini...");
    } else {
      console.warn(`[Provider] Cerebras failed: ${msg}, falling back to Gemini...`);
    }
  }

  try {
    const text = await generateGemini(prompt, systemPrompt);
    return { text, provider: "gemini", rateDelayMs: GEMINI_RATE_DELAY_MS };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "GEMINI_API_KEY not configured") {
      console.log("[Provider] Gemini not configured either.");
    } else {
      console.warn(`[Provider] Gemini failed: ${msg}`);
    }
  }

  throw new Error("All providers failed");
}
