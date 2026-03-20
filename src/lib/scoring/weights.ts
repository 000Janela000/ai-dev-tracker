/** Source trust weights — higher = more trusted/authoritative */
export const SOURCE_TRUST_WEIGHTS: Record<string, number> = {
  // Official AI company blogs (highest trust — primary sources)
  "rss:openai": 10,
  "rss:anthropic": 10,
  "rss:deepmind": 10,
  "rss:meta-ai": 10,
  "rss:microsoft-ai": 10,
  "rss:mistral": 9,
  "rss:huggingface": 9,
  "rss:vercel-ai": 8,

  // GitHub releases from watched repos (confirmed, versioned)
  "github-releases": 9,

  // AI news sites (good reporting, fast)
  "rss:the-decoder": 7,
  "rss:ai-news": 6,
  "rss:venturebeat-ai": 6,
  "rss:marktechpost": 5,

  // Community sources (fast signal but noisy)
  hackernews: 7,
  reddit: 6,
  devto: 4,

  // Research (high quality but specialized)
  arxiv: 7,

  // GitHub search (discovery, low trust — unproven repos)
  github: 3,
};

/** Get trust weight for a source, with fallback for dynamic source IDs */
export function getSourceTrustWeight(source: string): number {
  // Direct match
  if (source in SOURCE_TRUST_WEIGHTS) {
    return SOURCE_TRUST_WEIGHTS[source];
  }

  // Match by prefix for dynamic sources like github-release:owner/repo
  if (source.startsWith("github-release:")) return 9;
  if (source.startsWith("reddit:")) return 6;
  if (source.startsWith("arxiv:")) return 7;
  if (source.startsWith("rss:")) return 5;

  return 3; // Unknown source
}
