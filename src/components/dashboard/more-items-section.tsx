"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TrackedItemCard } from "./tracked-item-card";
import { useUserStates } from "@/hooks/use-user-states";
import type { ItemRow } from "@/lib/db";
import type { Category } from "@/lib/types";
import type { UserAction } from "@/lib/db/user-state";

interface MoreItemsSectionProps {
  items: ItemRow[];
}

export function MoreItemsSection({ items }: MoreItemsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const itemIds = useMemo(() => items.map((i) => i.id), [items]);
  const { states: userStates } = useUserStates(expanded ? itemIds : []);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto mt-16 max-w-3xl px-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="smallcaps flex w-full items-center justify-between border-t border-border py-4 text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={expanded}
      >
        <span>
          Also today · {items.length} more item{items.length !== 1 ? "s" : ""}
        </span>
        {expanded ? (
          <ChevronUp className="size-4" strokeWidth={1.5} />
        ) : (
          <ChevronDown className="size-4" strokeWidth={1.5} />
        )}
      </button>

      {expanded && (
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
              clusterSize={
                "clusterSize" in item
                  ? (item.clusterSize as number)
                  : undefined
              }
              userStates={userStates[item.id] as UserAction[] | undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
