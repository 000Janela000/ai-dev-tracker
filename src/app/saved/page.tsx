import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Bookmark, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/dashboard/header";
import { CATEGORY_LABELS, type Category } from "@/lib/types";
import { CATEGORY_BADGE_COLORS } from "@/components/dashboard/category-tabs";
import { getUser } from "@/lib/supabase/user";
import { getUserItemsByAction } from "@/lib/db/user-state";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/saved");

  const items = await getUserItemsByAction(user.id, "saved");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to dashboard
        </Link>

        <div className="mb-6 flex items-center gap-2">
          <Bookmark className="size-5 text-blue-400" />
          <h1 className="text-xl font-bold tracking-tight">Saved Items</h1>
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Bookmark className="size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No saved items yet</p>
            <p className="text-xs text-muted-foreground/70">
              Click the bookmark icon on any item to save it here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="group rounded-lg border border-border bg-card p-3 transition-colors hover:border-border/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${CATEGORY_BADGE_COLORS[item.category as Category]}`}
                      >
                        {CATEGORY_LABELS[item.category as Category]?.split(" ")[0] ?? item.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {item.source}
                      </Badge>
                    </div>
                    <Link
                      href={`/item/${item.id}`}
                      className="text-sm font-medium leading-snug hover:text-primary"
                    >
                      {item.title}
                    </Link>
                    {item.summary && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {item.summary}
                      </p>
                    )}
                    <p className="mt-1.5 text-[11px] text-muted-foreground/70">
                      Saved{" "}
                      {formatDistanceToNow(new Date(item.actionDate), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 hover:bg-muted group-hover:opacity-100"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
