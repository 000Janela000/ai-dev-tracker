import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ItemActions } from "@/components/dashboard/item-actions";
import { Header } from "@/components/dashboard/header";
import { CATEGORY_LABELS, type Category } from "@/lib/types";
import { getItemById, getItemsByDateRange } from "@/lib/db/queries";
import { clusterItems } from "@/lib/clustering";
import { stripHtml, isContentTruncated } from "@/lib/html";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;

  let item: Awaited<ReturnType<typeof getItemById>>;
  let clusterSources: Awaited<ReturnType<typeof getItemById>>[] = [];

  try {
    item = await getItemById(id);
    if (!item) notFound();

    const dayBefore = new Date(
      new Date(item.publishedAt).getTime() - 24 * 60 * 60 * 1000
    );
    const dayAfter = new Date(
      new Date(item.publishedAt).getTime() + 24 * 60 * 60 * 1000
    );
    const nearby = await getItemsByDateRange(dayBefore, dayAfter);
    const clustered = clusterItems(nearby);
    const myCluster = clustered.find((c) => c.clusterItemIds.includes(id));
    if (myCluster && myCluster.clusterSize > 1) {
      const otherIds = myCluster.clusterItemIds.filter((cid) => cid !== id);
      const others = await Promise.all(otherIds.map((cid) => getItemById(cid)));
      clusterSources = others.filter(Boolean) as NonNullable<typeof item>[];
    }
  } catch {
    notFound();
  }

  const metadata = (item.metadata ?? {}) as Record<string, unknown>;
  const hnUrl = metadata.hnUrl as string | undefined;
  const pdfUrl = metadata.pdfUrl as string | undefined;
  const sourceLabel = item.source.replace("rss:", "").replace("github-release:", "");
  const contentText = item.content ? stripHtml(item.content, 10000) : "";
  const truncated = item.content ? isContentTruncated(item.content) : false;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 pt-10 pb-32 sm:pt-16">
        {/* Back link — quiet, top-left */}
        <Link
          href="/dashboard"
          className="smallcaps inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3" strokeWidth={1.5} />
          Back to briefing
        </Link>

        <article className="mt-10 sm:mt-12">
          {/* Editorial meta strip */}
          <div className="smallcaps flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
            <span>{CATEGORY_LABELS[item.category as Category]}</span>
            <span aria-hidden>·</span>
            <span>{sourceLabel}</span>
            <span aria-hidden>·</span>
            <time
              dateTime={new Date(item.publishedAt).toISOString()}
              className="font-mono tabular"
            >
              {format(new Date(item.publishedAt), "MMM d, yyyy")}
            </time>
            {item.importance && item.importance >= 4 ? (
              <>
                <span aria-hidden>·</span>
                <span className="text-accent">High impact</span>
              </>
            ) : null}
          </div>

          {/* Title — serif display, big, balanced */}
          <h1 className="display mt-4 font-serif text-3xl font-medium text-foreground sm:text-[42px]">
            {item.title}
          </h1>

          {/* Summary — editorial "dek" style, oversized italic lead */}
          {item.summary ? (
            <p className="prose-body mt-6 font-serif text-lg italic leading-[1.5] text-muted-foreground">
              {item.summary}
            </p>
          ) : null}

          {/* Action bar — full buttons, not compact */}
          <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-border py-4">
            <ItemActions itemId={item.id} compact={false} />
            <div className="ml-auto flex items-center gap-4">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="smallcaps inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                Original
                <ExternalLink className="size-3" strokeWidth={1.5} />
              </a>
              {hnUrl ? (
                <a
                  href={hnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="smallcaps text-muted-foreground transition-colors hover:text-accent"
                >
                  HN
                </a>
              ) : null}
              {pdfUrl ? (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="smallcaps text-muted-foreground transition-colors hover:text-accent"
                >
                  PDF
                </a>
              ) : null}
            </div>
          </div>

          {/* Body — Stratechery-style single column serif reading */}
          {contentText ? (
            <div className="prose-body mt-10 whitespace-pre-wrap font-serif text-base leading-[1.65] text-foreground/90 first-letter:float-left first-letter:pr-2 first-letter:font-serif first-letter:text-5xl first-letter:font-medium first-letter:leading-[0.85] first-letter:text-foreground">
              {contentText}
            </div>
          ) : null}

          {truncated ? (
            <p className="mt-6 font-serif text-sm italic text-muted-foreground">
              Article truncated — open the original above for the full piece.
            </p>
          ) : null}

          {/* Tags — editorial footer */}
          {item.tags && item.tags.length > 0 ? (
            <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-6">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="smallcaps rounded-sm border border-border px-2 py-1 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {/* Cluster sources — "also covered by" footer */}
          {clusterSources.length > 0 ? (
            <aside className="mt-12 border-t border-border pt-6">
              <div className="smallcaps text-accent">
                Also covered by {clusterSources.length} other source
                {clusterSources.length > 1 ? "s" : ""}
              </div>
              <ul className="mt-4 space-y-3">
                {clusterSources.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 rounded-sm py-2 transition-colors hover:text-accent"
                    >
                      <div className="min-w-0">
                        <p className="font-serif text-base leading-snug">
                          {s.title}
                        </p>
                        <p className="smallcaps mt-1 text-muted-foreground">
                          {s.source.replace("rss:", "").replace("github-release:", "")}{" "}
                          ·{" "}
                          <span className="font-mono tabular">
                            {formatDistanceToNow(new Date(s.publishedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </p>
                      </div>
                      <ExternalLink
                        className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-accent"
                        strokeWidth={1.5}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </article>
      </main>
    </div>
  );
}
