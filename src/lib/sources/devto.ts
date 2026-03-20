import { nanoid } from "@/lib/id";
import type { DataSource, FetchResult, NewTrackedItem } from "@/lib/types";

const FETCH_TIMEOUT_MS = 10_000;
const MIN_REACTIONS = 10;
const API_URL = "https://dev.to/api/articles";

interface DevToArticle {
  id: number;
  title: string;
  url: string;
  description: string;
  published_at: string;
  positive_reactions_count: number;
  comments_count: number;
  tag_list: string[];
  user: {
    name: string;
    username: string;
  };
  reading_time_minutes: number;
}

export const devtoAdapter: DataSource = {
  name: "devto",
  type: "rss", // Uses API but treated as RSS-like source
  isEnabled: () => true,

  async fetch(since: Date): Promise<NewTrackedItem[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(`${API_URL}?tag=ai&top=1&per_page=25`, {
        signal: controller.signal,
        headers: { "User-Agent": "DevNews/1.0" },
      });
      clearTimeout(timeout);

      if (!res.ok) {
        console.error(`[Dev.to] API failed: ${res.status}`);
        return [];
      }

      const articles = (await res.json()) as DevToArticle[];
      const items: NewTrackedItem[] = [];

      for (const article of articles) {
        if (article.positive_reactions_count < MIN_REACTIONS) continue;
        const pubDate = new Date(article.published_at);
        if (pubDate < since) continue;

        items.push({
          id: nanoid(),
          url: article.url,
          urlNormalized: "",
          title: article.title,
          content: article.description?.slice(0, 10_000) || "",
          source: "devto",
          sourceType: "rss",
          category: "practices_approaches",
          tags: article.tag_list.slice(0, 6),
          metadata: {
            reactions: article.positive_reactions_count,
            comments: article.comments_count,
            author: article.user.name,
            authorUsername: article.user.username,
            readingTime: article.reading_time_minutes,
          },
          publishedAt: pubDate,
        });
      }

      return items;
    } catch (error) {
      clearTimeout(timeout);
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[Dev.to] Error: ${msg}`);
      return [];
    }
  },
};

export async function fetchDevTo(since: Date): Promise<FetchResult> {
  const start = Date.now();
  try {
    const items = await devtoAdapter.fetch(since);
    return { source: "devto", items, durationMs: Date.now() - start };
  } catch (error) {
    return {
      source: "devto",
      items: [],
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
