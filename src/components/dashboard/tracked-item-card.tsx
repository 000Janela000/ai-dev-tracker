"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Star, MessageSquare, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type Category } from "@/lib/types";
import { CATEGORY_BADGE_COLORS } from "./category-tabs";
import { ItemActions } from "./item-actions";
import type { UserAction } from "@/lib/db/user-state";

interface TrackedItemCardProps {
  id: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  source: string;
  sourceType: string;
  category: Category;
  url: string;
  publishedAt: Date;
  tags?: string[] | null;
  importance?: number | null;
  metadata?: Record<string, unknown> | null;
  userStates?: UserAction[];
}

function getSourceLabel(source: string): string {
  if (source.startsWith("github-release:")) return source.replace("github-release:", "") + " Release";
  if (source.startsWith("reddit:")) return "r/" + source.replace("reddit:", "");
  const labels: Record<string, string> = {
    "rss:anthropic": "Anthropic", "rss:openai": "OpenAI", "rss:deepmind": "DeepMind",
    "rss:meta-ai": "Meta AI", "rss:microsoft-ai": "Microsoft AI", "rss:huggingface": "HF",
    "rss:mistral": "Mistral", "rss:vercel": "Vercel", "rss:the-decoder": "The Decoder",
    "rss:ai-news": "AI News", "rss:marktechpost": "MarkTechPost", "rss:venturebeat-ai": "VentureBeat",
    hackernews: "HN", github: "GitHub", "github-releases": "Release", devto: "Dev.to",
    "arxiv:cs-ai": "arXiv AI", "arxiv:cs-cl": "arXiv NLP",
  };
  return labels[source] ?? source.replace("rss:", "");
}

function getSourceColor(sourceType: string): string {
  const colors: Record<string, string> = {
    rss: "bg-blue-500/10 text-blue-400",
    hackernews: "bg-orange-500/10 text-orange-400",
    reddit: "bg-orange-600/10 text-orange-300",
    github: "bg-gray-500/10 text-gray-300",
    arxiv: "bg-red-500/10 text-red-400",
  };
  return colors[sourceType] ?? "bg-muted text-muted-foreground";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").slice(0, 200);
}

export function TrackedItemCard({
  id,
  title,
  summary,
  content,
  source,
  sourceType,
  category,
  publishedAt,
  tags,
  importance,
  metadata,
  userStates,
}: TrackedItemCardProps) {
  const displayText = summary || content || "";
  const stars = metadata?.stars as number | undefined;
  const numComments = metadata?.numComments as number | undefined;

  return (
    <Link
      href={`/item/${id}`}
      className="group relative block rounded-lg border border-border bg-card p-4 transition-colors hover:border-muted-foreground/40"
    >
      {/* Badges */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Badge
          className={`rounded-full border-0 px-2 py-0.5 text-[10px] ${CATEGORY_BADGE_COLORS[category]}`}
        >
          {CATEGORY_LABELS[category].split(" ")[0]}
        </Badge>
        <Badge
          className={`rounded-full border-0 px-2 py-0.5 text-[10px] ${getSourceColor(sourceType)}`}
        >
          {getSourceLabel(source)}
        </Badge>
        {importance && importance >= 4 && (
          <Badge className="rounded-full border-0 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">
            High Impact
          </Badge>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-1.5 line-clamp-2 pr-8 text-sm font-medium leading-snug tracking-tight">
        {title}
      </h3>

      {/* Summary */}
      {displayText && (
        <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {stripHtml(displayText)}
        </p>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground/70">
        <span>
          {formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}
        </span>
        {stars !== undefined && (
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {stars.toLocaleString()}
          </span>
        )}
        {numComments !== undefined && (
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {numComments}
          </span>
        )}
        {tags && tags.length > 0 && tags.slice(0, 3).map((tag) => (
          <span key={tag} className="flex items-center gap-0.5 text-muted-foreground/50">
            <Tag className="h-2.5 w-2.5" />
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="absolute right-4 top-4 flex items-center gap-1">
        <ItemActions itemId={id} initialStates={userStates} compact />
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  );
}
