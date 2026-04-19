"use client";

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

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif italic text-muted-foreground">
          Nothing new this hour — the internet took a breath.
        </p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4">
      {/* Section label — editorial kicker */}
      <div className="smallcaps mb-1 flex items-baseline justify-between text-muted-foreground">
        <span>The briefing</span>
        <span className="font-mono tabular">
          {items.length} items · ~{totalMinutes} min
        </span>
      </div>

      <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground">
        What shipped, what changed, and why you care.
      </h2>

      <div className="mt-2 h-px w-full bg-border" />

      <div className="divide-y divide-border">
        {items.map((item) => (
          <TrackedItemCard
            key={item.id}
            id={item.id}
            title={item.title}
            summary={item.summary}
            source={item.source}
            category={item.category as Category}
            url={item.url}
            publishedAt={item.publishedAt}
            importance={item.importance}
            readingTimeMin={item.readingTimeMin}
            clusterSize={
              "clusterSize" in item ? (item.clusterSize as number) : undefined
            }
            userStates={userStates[item.id] as UserAction[] | undefined}
          />
        ))}
      </div>
    </section>
  );
}
