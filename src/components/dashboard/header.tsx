import Link from "next/link";
import { HealthIndicator } from "./health-indicator";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Global header. Intentionally minimal — the "brand" moment lives in the
 * Masthead on the dashboard. This is just chrome: identity breadcrumb,
 * health pulse, theme, account.
 *
 * Search was removed (it was non-functional) — the command palette
 * (Phase 4, ⌘K) will be the search surface.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-11 max-w-3xl items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="font-serif text-[15px] font-medium tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          DevNews
        </Link>

        <div className="flex items-center gap-1">
          <HealthIndicator />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
