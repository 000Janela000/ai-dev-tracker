import Groq from "groq-sdk";

// Pool of Groq clients — rotates through keys when one hits rate limit
const _clients: Groq[] = [];
let _currentIndex = 0;
let _initialized = false;

function initClients(): void {
  if (_initialized) return;
  _initialized = true;

  const keys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
  ].filter(Boolean) as string[];

  for (const apiKey of keys) {
    _clients.push(new Groq({ apiKey }));
  }
}

export const GROQ_RATE_DELAY_MS = 4_000;

export async function generateGroq(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  initClients();

  if (_clients.length === 0) {
    throw new Error("GROQ_API_KEY not configured");
  }

  // Try each key in rotation, starting from where we left off
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < _clients.length; attempt++) {
    const idx = (_currentIndex + attempt) % _clients.length;
    const client = _clients[idx];

    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new Error("Groq returned empty response");
      }

      // Success — advance rotation for next call
      _currentIndex = (idx + 1) % _clients.length;
      return text;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const is429 = lastError.message.includes("429") || lastError.message.includes("rate_limit");

      if (is429) {
        // This key is exhausted — try next key
        console.warn(`[Groq] Key ${idx + 1}/${_clients.length} rate limited, trying next...`);
        continue;
      }

      // Non-rate-limit error — don't try other keys
      throw lastError;
    }
  }

  // All keys exhausted
  throw lastError ?? new Error("All Groq keys exhausted");
}
