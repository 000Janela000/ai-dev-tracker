"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";
import { ItemActions } from "./item-actions";
import type { UserAction } from "@/lib/db/user-state";

/**
 * Category dot colors — small inline indicator in the meta row. Tuned
 * to sit next to warm-paper background without clashing.
 */
const CATEGORY_COLOR: Record<Category, string> = {
  models_releases: "bg-[var(--cat-models)]",
  tools_frameworks: "bg-[var(--cat-tools)]",
  practices_approaches: "bg-[var(--cat-practices)]",
  industry_trends: "bg-[var(--cat-industry)]",
  research_papers: "bg-[var(--cat-research)]",
};

function getSourceLabel(source: string): string {
  if (source.startsWith("github-release:"))
    return source.replace("github-release:", "");
  if (source.startsWith("reddit:"))
    return "r/" + source.replace("reddit:", "");
  const labels: Record<string, string> = {
    "rss:anthropic": "Anthropic",
    "rss:anthropic-engineering": "Anthropic Eng",
    "rss:openai": "OpenAI",
    "rss:deepmind": "DeepMind",
    "rss:huggingface": "HuggingFace",
    "rss:vercel": "Vercel",
    "rss:cursor": "Cursor",
    "rss:the-decoder": "The Decoder",
    "rss:ai-news": "AI News",
    "rss:marktechpost": "MarkTechPost",
    "rss:venturebeat-ai": "VentureBeat",
    "rss:microsoft-research": "MSR",
    hackernews: "Hacker News",
    github: "GitHub",
    devto: "Dev.to",
  };
  return labels[source] ?? source.replace("rss:", "");
}

interface TrackedItemCardProps {
  id: string;
  title: string;
  summary?: string | null;
  source: string;
  category: Category;
  url: string;
  publishedAt: Date;
  importance?: number | null;
  readingTimeMin?: number;
  clusterSize?: number;
  userStates?: UserAction[];
}

export function TrackedItemCard({
  id,
  title,
  summary,
  source,
  category,
  url,
  publishedAt,
  importance,
  readingTimeMin,
  clusterSize,
  userStates,
}: TrackedItemCardProps) {
  return (
    <article className="group relative py-6 first:pt-0 last:pb-0">
      <Link
        href={`/item/${id}`}
        className="block rounded-sm transition-colors"
        aria-label={title}
      >
        {/* Meta row — small-caps, mono, breadcrumb-style */}
        <div className="smallcaps flex flex-wrap items-center gap-x-2.5 gap-y-1 text-muted-foreground">
          <span
            aria-hidden
            className={cn("inline-block size-[7px] rounded-full", CATEGORY_COLOR[category])}
          />
          <span>{getSourceLabel(source)}</span>
          <span aria-hidden>·</span>
          <time
            dateTime={new Date(publishedAt).toISOString()}
            className="font-mono tabular"
          >
            {formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}
          </time>
          {readingTimeMin ? (
            <>
              <span aria-hidden>·</span>
              <span className="font-mono tabular">{readingTimeMin}m read</span>
            </>
          ) : null}
          {clusterSize && clusterSize > 1 ? (
            <>
              <span aria-hidden>·</span>
              <span>{clusterSize} sources</span>
            </>
          ) : null}
          {importance && importance >= 4 ? (
            <>
              <span aria-hidden>·</span>
              <span className="text-accent">high impact</span>
            </>
          ) : null}
        </div>

        {/* Title — serif display, balanced, slightly tight */}
        <h2 className="mt-2 font-serif text-[21px] font-medium leading-[1.2] tracking-tight text-foreground">
          {title}
        </h2>

        {/* Summary — editorial italic lead-in style */}
        {summary ? (
          <p className="prose-body mt-2 text-[15px] text-muted-foreground">
            {summary}
          </p>
        ) : null}
      </Link>

      {/* Action bar — always visible, no hover-hide so touch works */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <ItemActions itemId={id} initialStates={userStates} compact />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="smallcaps inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={`Open original: ${title}`}
        >
          Original
          <ExternalLink className="size-3" strokeWidth={1.5} />
        </a>
      </div>
    </article>
  );
}
