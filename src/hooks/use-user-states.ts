"use client";

import { useState, useEffect } from "react";
import type { UserAction } from "@/lib/db/user-state";

type UserStatesMap = Record<string, UserAction[]>;

export function useUserStates(itemIds: string[]) {
  const [states, setStates] = useState<UserStatesMap>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (itemIds.length === 0) return;

    const idsParam = itemIds.join(",");

    setLoading(true);
    fetch(`/api/user-state?itemIds=${encodeURIComponent(idsParam)}`)
      .then((res) => {
        if (res.ok) return res.json();
        // 401 = not logged in, return empty
        return { states: {} };
      })
      .then((data) => setStates(data.states ?? {}))
      .catch(() => setStates({}))
      .finally(() => setLoading(false));
  }, [itemIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return { states, loading };
}
