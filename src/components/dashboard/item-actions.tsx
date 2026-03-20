"use client";

import { useState } from "react";
import { Bookmark, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRequireAuth } from "@/components/auth/auth-guard";
import type { UserAction } from "@/lib/db/user-state";

interface ItemActionsProps {
  itemId: string;
  initialStates?: UserAction[];
  compact?: boolean;
}

export function ItemActions({
  itemId,
  initialStates = [],
  compact = true,
}: ItemActionsProps) {
  const [states, setStates] = useState<Set<UserAction>>(
    new Set(initialStates)
  );
  const requireAuth = useRequireAuth();

  const toggleAction = (action: UserAction) => {
    requireAuth(async () => {
      const isActive = states.has(action);
      // Optimistic update
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
      } catch {
        // Revert on failure
        setStates((prev) => {
          const next = new Set(prev);
          if (isActive) next.add(action);
          else next.delete(action);
          return next;
        });
      }
    });
  };

  const buttons: Array<{
    action: UserAction;
    icon: typeof Bookmark;
    label: string;
    activeClass: string;
  }> = [
    {
      action: "saved",
      icon: Bookmark,
      label: "Save",
      activeClass: "text-blue-400",
    },
    {
      action: "read_later",
      icon: Clock,
      label: "Read Later",
      activeClass: "text-yellow-400",
    },
    {
      action: "read",
      icon: Check,
      label: "Mark Read",
      activeClass: "text-green-400",
    },
  ];

  return (
    <div className={cn("flex items-center", compact ? "gap-0.5" : "gap-2")}>
      {buttons.map(({ action, icon: Icon, label, activeClass }) => {
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
              "rounded p-1 transition-colors hover:bg-muted",
              isActive ? activeClass : "text-muted-foreground/50"
            )}
            title={isActive ? `Remove ${label}` : label}
          >
            <Icon
              className="size-3.5"
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
              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? `border-current/20 ${activeClass}`
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon
              className="size-3.5"
              fill={isActive ? "currentColor" : "none"}
            />
            {isActive
              ? action === "saved"
                ? "Saved"
                : action === "read_later"
                  ? "In Read Later"
                  : "Read"
              : label}
          </button>
        );
      })}
    </div>
  );
}
