"use client";

import { Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TrackedItemCard } from "./tracked-item-card";
import type { ItemRow } from "@/lib/db";
import type { Category } from "@/lib/types";
import type { UserAction } from "@/lib/db/user-state";
import { useUserStates } from "@/hooks/use-user-states";
import { useMemo } from "react";

interface BriefingItem extends ItemRow {
  readingTimeMin: number;
}

interface BriefingSectionProps {
  items: BriefingItem[];
  totalMinutes: number;
}

export function BriefingSection({ items, totalMinutes }: BriefingSectionProps) {
  const itemIds = useMemo(() => items.map((i) => i.id), [items]);
  const { states: userStates } = useUserStates(itemIds);

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-yellow-400" />
          <h2 className="text-sm font-semibold tracking-tight">
            Your Briefing
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" />
          <span>~{totalMinutes}m read</span>
          <span className="text-muted-foreground/50">·</span>
          <span>{items.length} items</span>
        </div>
      </div>

      <div className="grid gap-2">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <TrackedItemCard
              id={item.id}
              title={item.title}
              summary={item.summary}
              content={item.content}
              source={item.source}
              sourceType={item.sourceType}
              category={item.category as Category}
              url={item.url}
              publishedAt={item.publishedAt}
              tags={item.tags}
              importance={item.importance}
              metadata={item.metadata as Record<string, unknown> | null}
              userStates={userStates[item.id] as UserAction[] | undefined}
              clusterSize={"clusterSize" in item ? (item.clusterSize as number) : undefined}
            />
            <Badge
              variant="secondary"
              className="absolute bottom-3 right-4 text-[10px] text-muted-foreground/70"
            >
              {item.readingTimeMin}m
            </Badge>
          </div>
        ))}
      </div>
    </section>
  );
}
