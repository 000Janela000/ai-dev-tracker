import type { SourceConfig } from "@/lib/types";

export const SOURCE_REGISTRY: SourceConfig[] = [
  // --- Official AI Company Blogs (highest trust) ---
  {
    id: "rss:anthropic",
    name: "Anthropic Blog",
    type: "rss",
    // No official RSS — use community-maintained feed
    url: "https://raw.githubusercontent.com/conoro/anthropic-engineering-rss-feed/main/anthropic_engineering_rss.xml",
    enabled: true,
    defaultCategory: "models_releases",
  },
  {
    id: "rss:openai",
    name: "OpenAI Blog",
    type: "rss",
    url: "https://openai.com/blog/rss.xml",
    enabled: true,
    defaultCategory: "models_releases",
  },
  {
    id: "rss:deepmind",
    name: "Google DeepMind Blog",
    type: "rss",
    url: "https://deepmind.google/blog/rss.xml",
    enabled: true,
    defaultCategory: "research_papers",
  },
  {
    id: "rss:meta-ai",
    name: "Meta AI Blog",
    type: "rss",
    url: "https://ai.meta.com/blog/rss/",
    enabled: false, // No working RSS feed — returns malformed XML
    defaultCategory: "models_releases",
  },
  {
    id: "rss:microsoft-ai",
    name: "Microsoft AI Blog",
    type: "rss",
    url: "https://blogs.microsoft.com/ai/feed/",
    enabled: true,
    defaultCategory: "models_releases",
  },
  {
    id: "rss:huggingface",
    name: "Hugging Face Blog",
    type: "rss",
    url: "https://huggingface.co/blog/feed.xml",
    enabled: true,
    defaultCategory: "tools_frameworks",
  },
  {
    id: "rss:mistral",
    name: "Mistral AI Blog",
    type: "rss",
    url: "https://mistral.ai/feed/",
    enabled: false, // No working RSS feed
    defaultCategory: "models_releases",
  },
  {
    id: "rss:vercel",
    name: "Vercel Blog",
    type: "rss",
    url: "https://vercel.com/atom",
    enabled: true,
    defaultCategory: "tools_frameworks",
  },

  // --- AI News Sites (good reporting, fast) ---
  {
    id: "rss:the-decoder",
    name: "The Decoder",
    type: "rss",
    url: "https://the-decoder.com/feed/",
    enabled: true,
    defaultCategory: "industry_trends",
  },
  {
    id: "rss:ai-news",
    name: "AI News",
    type: "rss",
    url: "https://www.artificialintelligence-news.com/feed/",
    enabled: true,
    defaultCategory: "industry_trends",
  },
  {
    id: "rss:marktechpost",
    name: "MarkTechPost",
    type: "rss",
    url: "https://www.marktechpost.com/feed/",
    enabled: true,
    defaultCategory: "research_papers",
  },
  {
    id: "rss:venturebeat-ai",
    name: "VentureBeat AI",
    type: "rss",
    url: "https://venturebeat.com/category/ai/feed/",
    enabled: true,
    defaultCategory: "industry_trends",
  },

  // --- Community & Aggregator APIs ---
  {
    id: "hackernews",
    name: "Hacker News (AI filtered)",
    type: "hackernews",
    url: "https://hn.algolia.com/api/v1",
    enabled: true,
    defaultCategory: "industry_trends",
  },
  {
    id: "reddit",
    name: "Reddit AI Communities",
    type: "reddit",
    url: "https://www.reddit.com",
    enabled: true,
    defaultCategory: "industry_trends",
  },

  // --- Code & Research ---
  {
    id: "github",
    name: "GitHub Trending AI Repos",
    type: "github",
    url: "https://api.github.com/search/repositories",
    enabled: true,
    defaultCategory: "tools_frameworks",
  },
  {
    id: "github-releases",
    name: "GitHub Releases (Watchlist)",
    type: "github",
    enabled: true,
    defaultCategory: "tools_frameworks",
  },
  {
    id: "arxiv:cs-ai",
    name: "ArXiv cs.AI",
    type: "arxiv",
    url: "http://export.arxiv.org/api/query",
    enabled: true,
    defaultCategory: "research_papers",
  },
  {
    id: "arxiv:cs-cl",
    name: "ArXiv cs.CL",
    type: "arxiv",
    url: "http://export.arxiv.org/api/query",
    enabled: true,
    defaultCategory: "research_papers",
  },
];

export function getEnabledSources(type?: SourceConfig["type"]): SourceConfig[] {
  return SOURCE_REGISTRY.filter(
    (s) => s.enabled && (type === undefined || s.type === type)
  );
}
