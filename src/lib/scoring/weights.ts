/**
 * Source trust weights for web developer AI orchestration feed.
 * Higher = more likely to contain content relevant to a web dev building with AI.
 */
export const SOURCE_TRUST_WEIGHTS: Record<string, number> = {
  // Official AI tool blogs (highest — primary sources for tool updates)
  "rss:openai": 10,
  "rss:anthropic": 10,
  "rss:deepmind": 8,
  "rss:meta-ai": 8,
  "rss:microsoft-ai": 9,
  "rss:mistral": 8,
  "rss:huggingface": 9,
  "rss:vercel-ai": 10,

  // GitHub releases from watched repos (confirmed, versioned, actionable)
  "github-releases": 10,

  // AI dev news sites (fast reporting, dev-focused)
  "rss:the-decoder": 7,
  "rss:ai-news": 5,
  "rss:venturebeat-ai": 5,
  "rss:marktechpost": 4,

  // Community (signal but noisy — needs AI filtering)
  hackernews: 5,
  reddit: 4,
  devto: 4,

  // Research (mostly irrelevant to web dev — disabled but keep low weight)
  arxiv: 1,

  // GitHub search (discovery, unproven)
  github: 3,
};

/** Get trust weight for a source */
export function getSourceTrustWeight(source: string): number {
  if (source in SOURCE_TRUST_WEIGHTS) {
    return SOURCE_TRUST_WEIGHTS[source];
  }

  if (source.startsWith("github-release:")) return 10;
  if (source.startsWith("reddit:")) return 4;
  if (source.startsWith("arxiv:")) return 1;
  if (source.startsWith("rss:")) return 5;

  return 2;
}
