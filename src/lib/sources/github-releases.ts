import Parser from "rss-parser";
import { nanoid } from "@/lib/id";
import type { DataSource, FetchResult, NewTrackedItem } from "@/lib/types";

const FETCH_TIMEOUT_MS = 10_000;
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0 (compatible; DevNewsBot/1.1; +https://github.com/000Janela000/DevNews)";
const parser = new Parser({ maxRedirects: 3 });

/** Repos to watch for releases — auto-discovery can add more */
export const RELEASE_WATCHLIST = [
  "openai/openai-python",
  "anthropics/anthropic-sdk-python",
  "anthropics/claude-code",
  "anthropics/claude-agent-sdk-typescript",
  "anthropics/claude-agent-sdk-python",
  "langchain-ai/langchain",
  "langchain-ai/langgraph",
  "huggingface/transformers",
  "ollama/ollama",
  "vercel/ai",
  "vllm-project/vllm",
  "run-llama/llama_index",
  "microsoft/autogen",
  "crewAIInc/crewAI",
  "mastra-ai/mastra",
];

const MONOREPO_COLLAPSE_WINDOW_MS = 10 * 60 * 1000; // 10 min

/**
 * Monorepos like vercel/ai and langchain-ai/langchain cut 10-20 sub-package
 * releases within a single minute (each with a distinct URL). Collapse any
 * cluster of releases from one repo inside a 10-minute window into a single
 * representative item so the feed isn't drowned by the wave.
 */
function collapseMonorepoWaves(
  repo: string,
  items: NewTrackedItem[]
): NewTrackedItem[] {
  if (items.length <= 1) return items;

  // Sort most-recent first — the newest is the representative.
  const sorted = [...items].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );

  const collapsed: NewTrackedItem[] = [];
  const used = new Set<string>();

  for (const item of sorted) {
    if (used.has(item.id)) continue;

    const windowStart = item.publishedAt.getTime() - MONOREPO_COLLAPSE_WINDOW_MS;
    const wave = sorted.filter(
      (o) =>
        !used.has(o.id) &&
        o.publishedAt.getTime() <= item.publishedAt.getTime() &&
        o.publishedAt.getTime() >= windowStart
    );

    for (const w of wave) used.add(w.id);

    if (wave.length === 1) {
      collapsed.push(item);
      continue;
    }

    // Prefer a wave member whose title has no "@" prefix (the root package).
    const root = wave.find((w) => !/:\s*@/.test(w.title));
    const primary = root ?? wave[0];
    const otherPkgs = wave
      .filter((w) => w !== primary)
      .map((w) => w.title.split(":").slice(1).join(":").trim())
      .filter(Boolean);

    const mainTag = primary.title.split(":").slice(1).join(":").trim();
    collapsed.push({
      ...primary,
      title: `${repo}: ${wave.length} package releases (${mainTag}, +${otherPkgs.length} more)`,
      content:
        `${repo} published ${wave.length} releases in one wave:\n` +
        wave.map((w) => `- ${w.title.split(":").slice(1).join(":").trim()}`).join("\n") +
        (primary.content ? `\n\nPrimary release notes:\n${primary.content}` : ""),
      metadata: {
        ...(primary.metadata as object),
        waveSize: wave.length,
        wavePackages: wave.map((w) =>
          w.title.split(":").slice(1).join(":").trim()
        ),
      },
    });
  }

  return collapsed;
}

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
      headers: { "User-Agent": USER_AGENT },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[GH-Releases] ${repo} feed failed: ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const feed = await parser.parseString(xml);
    const raw: NewTrackedItem[] = [];

    for (const entry of feed.items) {
      if (!entry.title || !entry.link) continue;
      const pubDate = entry.isoDate ? new Date(entry.isoDate) : new Date();
      if (pubDate < since) continue;

      raw.push({
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

    return collapseMonorepoWaves(repo, raw);
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
