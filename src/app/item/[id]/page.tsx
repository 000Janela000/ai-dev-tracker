import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft,
  ExternalLink,
  Star,
  MessageSquare,
  Calendar,
  Tag,
} from "lucide-react";
import { ItemActions } from "@/components/dashboard/item-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/dashboard/header";
import { CATEGORY_BADGE_COLORS } from "@/components/dashboard/category-tabs";
import { CATEGORY_LABELS, type Category } from "@/lib/types";
import { getItemById, getItemsByCategory } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;

  let item: Awaited<ReturnType<typeof getItemById>>;
  let related: Awaited<ReturnType<typeof getItemsByCategory>> = [];

  try {
    item = await getItemById(id);
    if (!item) notFound();
    related = await getItemsByCategory(item.category as Category, 5);
    related = related.filter((r) => r.id !== item!.id).slice(0, 4);
  } catch {
    notFound();
  }

  const metadata = (item.metadata ?? {}) as Record<string, unknown>;
  const stars = metadata.stars as number | undefined;
  const numComments = metadata.numComments as number | undefined;
  const hnUrl = metadata.hnUrl as string | undefined;
  const pdfUrl = metadata.pdfUrl as string | undefined;
  const language = metadata.language as string | undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Back nav */}
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to dashboard
        </Link>

        <article className="space-y-6">
          {/* Header */}
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={
                  CATEGORY_BADGE_COLORS[item.category as Category] ?? ""
                }
              >
                {CATEGORY_LABELS[item.category as Category] ?? item.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {item.source}
              </Badge>
              {item.importance && item.importance >= 4 && (
                <Badge
                  variant="outline"
                  className="border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                >
                  High Impact
                </Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold leading-tight tracking-tight">
              {item.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {format(new Date(item.publishedAt), "MMM d, yyyy")}
                <span className="text-muted-foreground/60">
                  ({formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })})
                </span>
              </span>
              {stars !== undefined && (
                <span className="flex items-center gap-1">
                  <Star className="size-3.5" />
                  {stars.toLocaleString()} stars
                </span>
              )}
              {numComments !== undefined && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="size-3.5" />
                  {numComments} comments
                </span>
              )}
              {language && (
                <span className="text-xs">{language}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <ItemActions itemId={item.id} compact={false} />
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="size-3.5" />
                Open Original
              </Button>
            </a>
            {hnUrl && (
              <a href={hnUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  HN Discussion
                </Button>
              </a>
            )}
            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  PDF
                </Button>
              </a>
            )}
          </div>

          {/* Summary */}
          {item.summary && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                AI Summary
              </p>
              <p className="text-sm leading-relaxed">{item.summary}</p>
            </div>
          )}

          {/* Content */}
          {item.content && (
            <div className="prose prose-sm prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {item.content.replace(/<[^>]*>/g, "")}
              </p>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="size-3.5 text-muted-foreground" />
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Related items */}
          {related.length > 0 && (
            <div className="border-t border-border pt-6">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                Related in {CATEGORY_LABELS[item.category as Category]}
              </h2>
              <div className="grid gap-2">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/item/${r.id}`}
                    className="rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                  >
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {r.source} &middot;{" "}
                      {formatDistanceToNow(new Date(r.publishedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
