import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Star, MessageSquare, GitFork } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type Category } from "@/lib/types";
import { CATEGORY_BADGE_COLORS } from "./category-tabs";

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
}

function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    "rss:anthropic": "Anthropic",
    "rss:openai": "OpenAI",
    "rss:deepmind": "DeepMind",
    "rss:meta-ai": "Meta AI",
    "rss:microsoft-ai": "Microsoft AI",
    "rss:huggingface": "Hugging Face",
    "rss:mistral": "Mistral AI",
    "rss:vercel": "Vercel",
    "rss:the-decoder": "The Decoder",
    "rss:ai-news": "AI News",
    "rss:marktechpost": "MarkTechPost",
    "rss:venturebeat-ai": "VentureBeat",
    hackernews: "Hacker News",
    "reddit:machinelearning": "r/MachineLearning",
    "reddit:localllama": "r/LocalLLaMA",
    "reddit:artificial": "r/artificial",
    devto: "Dev.to",
    github: "GitHub",
    "github-releases": "Release",
    "arxiv:cs-ai": "ArXiv AI",
    "arxiv:cs-cl": "ArXiv NLP",
  };
  // Handle dynamic github-release:owner/repo sources
  if (source.startsWith("github-release:")) {
    return source.replace("github-release:", "") + " Release";
  }
  if (source.startsWith("reddit:")) {
    return "r/" + source.replace("reddit:", "");
  }
  return labels[source] ?? source;
}

function getSourceColor(sourceType: string): string {
  const colors: Record<string, string> = {
    rss: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    hackernews: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    reddit: "bg-orange-600/10 text-orange-300 border-orange-600/20",
    github: "bg-gray-500/10 text-gray-300 border-gray-500/20",
    arxiv: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return colors[sourceType] ?? "bg-muted text-muted-foreground";
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "...";
}

export function TrackedItemCard({
  id,
  title,
  summary,
  content,
  source,
  sourceType,
  category,
  url,
  publishedAt,
  tags,
  importance,
  metadata,
}: TrackedItemCardProps) {
  const displayText = summary || content || "";
  const timeAgo = formatDistanceToNow(new Date(publishedAt), {
    addSuffix: true,
  });
  const stars = metadata?.stars as number | undefined;
  const numComments = metadata?.numComments as number | undefined;

  return (
    <article className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80 hover:bg-card/80">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Badges row */}
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={`text-[10px] ${CATEGORY_BADGE_COLORS[category]}`}
            >
              {CATEGORY_LABELS[category]}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] ${getSourceColor(sourceType)}`}
            >
              {getSourceLabel(source)}
            </Badge>
            {importance && importance >= 4 && (
              <Badge
                variant="outline"
                className="border-yellow-500/20 bg-yellow-500/10 text-[10px] text-yellow-400"
              >
                High Impact
              </Badge>
            )}
          </div>

          {/* Title */}
          <Link
            href={`/item/${id}`}
            className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary"
          >
            {title}
          </Link>

          {/* Summary */}
          {displayText && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {truncate(displayText.replace(/<[^>]*>/g, ""), 200)}
            </p>
          )}

          {/* Footer */}
          <div className="mt-2.5 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>{timeAgo}</span>
            {stars !== undefined && (
              <span className="flex items-center gap-0.5">
                <Star className="size-3" />
                {stars.toLocaleString()}
              </span>
            )}
            {numComments !== undefined && (
              <span className="flex items-center gap-0.5">
                <MessageSquare className="size-3" />
                {numComments}
              </span>
            )}
            {tags && tags.length > 0 && (
              <span className="hidden truncate sm:inline">
                {tags.slice(0, 3).join(", ")}
              </span>
            )}
          </div>
        </div>

        {/* External link */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
          title="Open original"
        >
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </article>
  );
}
