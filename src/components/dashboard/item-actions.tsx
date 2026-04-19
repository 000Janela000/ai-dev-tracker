"use client";

import { useState } from "react";
import { Bookmark, Clock, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRequireAuth } from "@/components/auth/auth-guard";
import type { UserAction } from "@/lib/db/user-state";

interface ItemActionsProps {
  itemId: string;
  initialStates?: UserAction[];
  compact?: boolean;
}

const ACTION_META: Record<
  UserAction,
  { icon: typeof Bookmark; label: string; onAdd: string; onRemove: string }
> = {
  saved: {
    icon: Bookmark,
    label: "Save",
    onAdd: "Saved",
    onRemove: "Unsaved",
  },
  read_later: {
    icon: Clock,
    label: "Read later",
    onAdd: "Added to read later",
    onRemove: "Removed from read later",
  },
  read: {
    icon: Check,
    label: "Mark read",
    onAdd: "Marked read",
    onRemove: "Marked unread",
  },
};

const ACTION_ORDER: UserAction[] = ["saved", "read_later", "read"];

export function ItemActions({
  itemId,
  initialStates = [],
  compact = true,
}: ItemActionsProps) {
  const [states, setStates] = useState<Set<UserAction>>(new Set(initialStates));
  const requireAuth = useRequireAuth();

  const toggleAction = (action: UserAction) => {
    requireAuth(async () => {
      const isActive = states.has(action);
      const meta = ACTION_META[action];

      setStates((prev) => {
        const next = new Set(prev);
        if (isActive) next.delete(action);
        else next.add(action);
        return next;
      });

      try {
        const res = await fetch("/api/user-state", {
          method: isActive ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, action }),
        });
        if (!res.ok) throw new Error();
        toast(isActive ? meta.onRemove : meta.onAdd, { duration: 1800 });
      } catch {
        setStates((prev) => {
          const next = new Set(prev);
          if (isActive) next.add(action);
          else next.delete(action);
          return next;
        });
        toast.error("Couldn't save that action. Try again?");
      }
    });
  };

  return (
    <div className={cn("flex items-center", compact ? "gap-0.5" : "gap-2")}>
      {ACTION_ORDER.map((action) => {
        const { icon: Icon, label } = ACTION_META[action];
        const isActive = states.has(action);

        return compact ? (
          <button
            key={action}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleAction(action);
            }}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-sm transition-colors",
              isActive
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={isActive ? `Undo ${label}` : label}
            aria-pressed={isActive}
          >
            <Icon
              className="size-4"
              strokeWidth={1.5}
              fill={isActive ? "currentColor" : "none"}
            />
          </button>
        ) : (
          <button
            key={action}
            onClick={(e) => {
              e.preventDefault();
              toggleAction(action);
            }}
            className={cn(
              "smallcaps inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 transition-colors",
              isActive
                ? "border-accent text-accent"
                : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
            )}
            aria-pressed={isActive}
          >
            <Icon
              className="size-3.5"
              strokeWidth={1.5}
              fill={isActive ? "currentColor" : "none"}
            />
            {isActive
              ? action === "saved"
                ? "Saved"
                : action === "read_later"
                  ? "In read later"
                  : "Read"
              : label}
          </button>
        );
      })}
    </div>
  );
}
