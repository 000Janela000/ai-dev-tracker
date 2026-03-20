import Link from "next/link";
import { formatDistanceToNow, format, startOfWeek, endOfWeek } from "date-fns";
import {
  ArrowLeft,
  ExternalLink,
  Bot,
  Wrench,
  Lightbulb,
  TrendingUp,
  BookOpen,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/dashboard/header";
import { CATEGORY_BADGE_COLORS } from "@/components/dashboard/category-tabs";
import { CATEGORY_LABELS, type Category } from "@/lib/types";
import {
  getWeeklyTopItems,
  getWeeklyCountsByCategory,
} from "@/lib/db/queries";
import type { ItemRow } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Weekly Digest",
  description: "This week's most important AI developments for developers",
};

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  models_releases: Bot,
  tools_frameworks: Wrench,
  practices_approaches: Lightbulb,
  industry_trends: TrendingUp,
  research_papers: BookOpen,
};

function groupByCategory(items: ItemRow[]): Record<string, ItemRow[]> {
  const grouped: Record<string, ItemRow[]> = {};
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }
  return grouped;
}

export default async function DigestPage() {
  let items: ItemRow[] = [];
  let counts: Array<{ category: string; count: number }> = [];
  let dbError = false;

  try {
    [items, counts] = await Promise.all([
      getWeeklyTopItems(30),
      getWeeklyCountsByCategory(),
    ]);
  } catch {
    dbError = true;
  }

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const grouped = groupByCategory(items);
  const totalItems = counts.reduce((s, c) => s + c.count, 0);

  const categoryOrder: Category[] = [
    "models_releases",
    "tools_frameworks",
    "practices_approaches",
    "industry_trends",
    "research_papers",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to dashboard
        </Link>

        {/* Digest header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-5 text-yellow-400" />
            <h1 className="text-2xl font-bold tracking-tight">
              Weekly Digest
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>
              {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
            </span>
            <span className="text-muted-foreground/50">·</span>
            <span>{totalItems} items tracked this week</span>
          </div>
        </div>

        {dbError && (
          <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-sm text-yellow-400">
            Database not connected.
          </div>
        )}

        {/* Quick stats */}
        {counts.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {categoryOrder.map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              const count =
                counts.find((c) => c.category === cat)?.count ?? 0;
              return (
                <div
                  key={cat}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-3.5 text-muted-foreground" />
                    <span className="text-lg font-semibold">{count}</span>
                  </div>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {CATEGORY_LABELS[cat]}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Items by category */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No items this week yet. Check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {categoryOrder.map((cat) => {
              const catItems = grouped[cat];
              if (!catItems || catItems.length === 0) return null;
              const Icon = CATEGORY_ICONS[cat];

              return (
                <section key={cat}>
                  <div className="mb-3 flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {CATEGORY_LABELS[cat]}
                    </h2>
                    <Badge variant="secondary" className="text-[10px]">
                      {catItems.length}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {catItems.map((item) => (
                      <div
                        key={item.id}
                        className="group rounded-lg border border-border bg-card p-3 transition-colors hover:border-border/80"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${CATEGORY_BADGE_COLORS[cat]}`}
                              >
                                {item.source}
                              </Badge>
                              {item.importance && item.importance >= 4 && (
                                <Badge
                                  variant="outline"
                                  className="border-yellow-500/20 bg-yellow-500/10 text-[10px] text-yellow-400"
                                >
                                  High Impact
                                </Badge>
                              )}
                            </div>
                            <Link
                              href={`/item/${item.id}`}
                              className="text-sm font-medium leading-snug hover:text-primary"
                            >
                              {item.title}
                            </Link>
                            {item.summary && (
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {item.summary}
                              </p>
                            )}
                            <p className="mt-1.5 text-[11px] text-muted-foreground/70">
                              {formatDistanceToNow(
                                new Date(item.publishedAt),
                                { addSuffix: true }
                              )}
                            </p>
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 hover:bg-muted group-hover:opacity-100"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
