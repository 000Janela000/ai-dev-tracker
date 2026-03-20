import { nanoid } from "@/lib/id";
import type { DataSource, FetchResult, NewTrackedItem } from "@/lib/types";

const FETCH_TIMEOUT_MS = 10_000;
const MIN_SCORE = 20; // Higher than HN — Reddit has more noise

const SUBREDDITS = [
  { name: "MachineLearning", defaultCategory: "research_papers" as const },
  { name: "LocalLLaMA", defaultCategory: "tools_frameworks" as const },
  { name: "artificial", defaultCategory: "industry_trends" as const },
];

interface RedditPost {
  data: {
    id: string;
    title: string;
    url: string;
    permalink: string;
    score: number;
    num_comments: number;
    created_utc: number;
    author: string;
    selftext: string;
    domain: string;
    is_self: boolean;
    link_flair_text: string | null;
    subreddit: string;
  };
}

interface RedditListing {
  data: {
    children: RedditPost[];
  };
}

async function fetchSubreddit(
  subreddit: string,
  sort: "hot" | "new" = "hot",
  limit = 25
): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&raw_json=1`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "DevNews/1.0 (AI development tracker)" },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[Reddit] r/${subreddit} failed: ${res.status}`);
      return [];
    }

    const data = (await res.json()) as RedditListing;
    return data.data.children;
  } catch (error) {
    clearTimeout(timeout);
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Reddit] r/${subreddit} error: ${msg}`);
    return [];
  }
}

function postToTrackedItem(
  post: RedditPost,
  defaultCategory: NewTrackedItem["category"]
): NewTrackedItem | null {
  const { data } = post;
  if (data.score < MIN_SCORE) return null;
  if (!data.title) return null;

  const itemUrl = data.is_self
    ? `https://www.reddit.com${data.permalink}`
    : data.url;

  return {
    id: nanoid(),
    url: itemUrl,
    urlNormalized: "",
    title: data.title,
    content: data.selftext?.slice(0, 10_000) || "",
    source: `reddit:${data.subreddit.toLowerCase()}`,
    sourceType: "reddit" as NewTrackedItem["sourceType"],
    category: defaultCategory,
    tags: data.link_flair_text ? [data.link_flair_text.toLowerCase()] : [],
    metadata: {
      redditId: data.id,
      score: data.score,
      numComments: data.num_comments,
      author: data.author,
      domain: data.domain,
      subreddit: data.subreddit,
      redditUrl: `https://www.reddit.com${data.permalink}`,
    },
    publishedAt: new Date(data.created_utc * 1000),
  };
}

export const redditAdapter: DataSource = {
  name: "reddit",
  type: "reddit" as DataSource["type"],
  isEnabled: () => true,

  async fetch(since: Date): Promise<NewTrackedItem[]> {
    const items: NewTrackedItem[] = [];
    const seenIds = new Set<string>();

    for (const sub of SUBREDDITS) {
      const posts = await fetchSubreddit(sub.name, "hot", 25);
      for (const post of posts) {
        const publishedAt = new Date(post.data.created_utc * 1000);
        if (publishedAt < since) continue;
        if (seenIds.has(post.data.id)) continue;
        seenIds.add(post.data.id);

        const item = postToTrackedItem(post, sub.defaultCategory);
        if (item) items.push(item);
      }
    }

    return items;
  },
};

export async function fetchReddit(since: Date): Promise<FetchResult> {
  const start = Date.now();
  try {
    const items = await redditAdapter.fetch(since);
    return { source: "reddit", items, durationMs: Date.now() - start };
  } catch (error) {
    return {
      source: "reddit",
      items: [],
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
