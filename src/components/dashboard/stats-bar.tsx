import { Bot, Wrench, Lightbulb, TrendingUp, BookOpen } from "lucide-react";
import type { Category } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

const ICONS: Record<Category, React.ElementType> = {
  models_releases: Bot,
  tools_frameworks: Wrench,
  practices_approaches: Lightbulb,
  industry_trends: TrendingUp,
  research_papers: BookOpen,
};

interface StatsBarProps {
  counts: Array<{ category: string; count: number }>;
  totalItems: number;
}

export function StatsBar({ counts, totalItems }: StatsBarProps) {
  if (totalItems === 0) return null;

  return (
    <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-2xl font-bold">{totalItems}</p>
        <p className="text-xs text-muted-foreground">Total Items</p>
      </div>
      {counts.map(({ category, count }) => {
        const cat = category as Category;
        const Icon = ICONS[cat];
        if (!Icon) return null;
        return (
          <div
            key={category}
            className="rounded-lg border border-border bg-card p-3"
          >
            <div className="flex items-center gap-1.5">
              <Icon className="size-3.5 text-muted-foreground" />
              <p className="text-lg font-semibold">{count}</p>
            </div>
            <p className="truncate text-[10px] text-muted-foreground">
              {CATEGORY_LABELS[cat]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
