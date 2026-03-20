import { Activity, Sparkles } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Activity className="size-5 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            DevNews
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/digest"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Sparkles className="size-3.5" />
            <span className="hidden sm:inline">Weekly Digest</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
