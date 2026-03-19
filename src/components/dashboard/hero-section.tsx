import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_BADGE_COLORS } from "./category-tabs";
import { CATEGORY_LABELS, type Category } from "@/lib/types";
import type { ItemRow } from "@/lib/db";

interface HeroSectionProps {
  items: ItemRow[];
}

export function HeroSection({ items }: HeroSectionProps) {
  // Get top 5 items by importance (or most recent if no importance set)
  const topItems = [...items]
    .sort((a, b) => {
      const impDiff = (b.importance ?? 0) - (a.importance ?? 0);
      if (impDiff !== 0) return impDiff;
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    })
    .slice(0, 5);

  if (topItems.length === 0) return null;

  const [featured, ...rest] = topItems;

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-yellow-400" />
        <h2 className="text-sm font-semibold">Top Stories</h2>
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        {/* Featured item */}
        <Link
          href={`/item/${featured.id}`}
          className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-card/80 lg:row-span-2"
        >
          <Badge
            variant="outline"
            className={`mb-2 text-[10px] ${CATEGORY_BADGE_COLORS[featured.category as Category]}`}
          >
            {CATEGORY_LABELS[featured.category as Category]}
          </Badge>
          <h3 className="text-base font-semibold leading-snug transition-colors group-hover:text-primary">
            {featured.title}
          </h3>
          {featured.summary && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {featured.summary}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {featured.source} &middot;{" "}
            {formatDistanceToNow(new Date(featured.publishedAt), {
              addSuffix: true,
            })}
          </p>
        </Link>

        {/* Secondary items */}
        {rest.map((item) => (
          <Link
            key={item.id}
            href={`/item/${item.id}`}
            className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-card/80"
          >
            <div className="min-w-0 flex-1">
              <Badge
                variant="outline"
                className={`mb-1 text-[10px] ${CATEGORY_BADGE_COLORS[item.category as Category]}`}
              >
                {CATEGORY_LABELS[item.category as Category]}
              </Badge>
              <h3 className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-primary">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.source} &middot;{" "}
                {formatDistanceToNow(new Date(item.publishedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
