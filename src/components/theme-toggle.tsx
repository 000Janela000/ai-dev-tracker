"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes returns resolvedTheme as undefined on the server; we gate
  // the icon render on mount to avoid a hydration mismatch. One-time.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-4" strokeWidth={1.5} />
        ) : (
          <Moon className="size-4" strokeWidth={1.5} />
        )
      ) : (
        <span className="size-4" />
      )}
    </button>
  );
}
