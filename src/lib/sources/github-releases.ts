import Parser from "rss-parser";
import { nanoid } from "@/lib/id";
import type { DataSource, FetchResult, NewTrackedItem } from "@/lib/types";

const FETCH_TIMEOUT_MS = 10_000;
const parser = new Parser({ maxRedirects: 3 });

/** Repos to watch for releases — auto-discovery can add more */
export const RELEASE_WATCHLIST = [
  "openai/openai-python",
  "anthropics/anthropic-sdk-python",
  "langchain-ai/langchain",
  "huggingface/transformers",
  "ollama/ollama",
  "vercel/ai",
  "vllm-project/vllm",
  "run-llama/llama_index",
  "microsoft/autogen",
  "crewAIInc/crewAI",
];

async function fetchReleaseFeed(
  repo: string,
  since: Date
): Promise<NewTrackedItem[]> {
  const url = `https://github.com/${repo}/releases.atom`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "DevNews/1.0" },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[GH-Releases] ${repo} feed failed: ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const feed = await parser.parseString(xml);
    const items: NewTrackedItem[] = [];

    for (const entry of feed.items) {
      if (!entry.title || !entry.link) continue;
      const pubDate = entry.isoDate ? new Date(entry.isoDate) : new Date();
      if (pubDate < since) continue;

      items.push({
        id: nanoid(),
        url: entry.link,
        urlNormalized: "",
        title: `${repo}: ${entry.title}`,
        content: (entry.contentSnippet || entry.content || "").slice(0, 10_000),
        source: `github-release:${repo}`,
        sourceType: "github",
        category: "tools_frameworks",
        tags: [repo.split("/")[0], "release"],
        metadata: {
          repo,
          tagName: entry.title,
          releaseUrl: entry.link,
          repoUrl: `https://github.com/${repo}`,
        },
        publishedAt: pubDate,
      });
    }

    return items;
  } catch (error) {
    clearTimeout(timeout);
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[GH-Releases] ${repo} error: ${msg}`);
    return [];
  }
}

export const githubReleasesAdapter: DataSource = {
  name: "github-releases",
  type: "github",
  isEnabled: () => true,

  async fetch(since: Date): Promise<NewTrackedItem[]> {
    const allItems: NewTrackedItem[] = [];

    // Fetch all release feeds concurrently
    const results = await Promise.allSettled(
      RELEASE_WATCHLIST.map((repo) => fetchReleaseFeed(repo, since))
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        allItems.push(...result.value);
      }
    }

    return allItems;
  },
};

export async function fetchGitHubReleases(since: Date): Promise<FetchResult> {
  const start = Date.now();
  try {
    const items = await githubReleasesAdapter.fetch(since);
    return { source: "github-releases", items, durationMs: Date.now() - start };
  } catch (error) {
    return {
      source: "github-releases",
      items: [],
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
