import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { Masthead } from "@/components/masthead";
import { DashboardContent } from "./content";
import {
  getRecentItems,
  getRecentItemsExcludingRead,
} from "@/lib/db/queries";
import { getUser } from "@/lib/supabase/user";
import { selectBriefingItems } from "@/lib/briefing";
import { clusterItems } from "@/lib/clustering";

export const dynamic = "force-dynamic";

const DEFAULT_WINDOW_HOURS = 48;
const EXTENDED_WINDOW_HOURS = 168;

interface DashboardPageProps {
  searchParams: Promise<{ window?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { window } = await searchParams;
  const isExtended = window === "extended";
  const windowHours = isExtended ? EXTENDED_WINDOW_HOURS : DEFAULT_WINDOW_HOURS;

  let items: Awaited<ReturnType<typeof getRecentItems>> = [];
  let dbError = false;

  try {
    let user = null;
    try {
      user = await getUser();
    } catch {
      // Auth not configured — continue without user
    }

    items = user
      ? await getRecentItemsExcludingRead(user.id, 200, windowHours)
      : await getRecentItems(200, windowHours);
  } catch {
    dbError = true;
  }

  const clustered = clusterItems(items);
  const { briefingItems, remainingItems, totalMinutes } =
    selectBriefingItems(clustered);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Masthead section="briefing" />
      <main className="pb-24">
        {dbError ? (
          <div className="mx-auto max-w-3xl px-4">
            <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-4 font-serif text-sm italic text-destructive">
              Database not connected. Set <code className="font-mono">DATABASE_URL</code> and
              run <code className="font-mono">npm run db:push</code>.
            </div>
          </div>
        ) : (
          <>
            <DashboardContent
              briefingItems={briefingItems}
              remainingItems={remainingItems}
              totalMinutes={totalMinutes}
            />
            <div className="mx-auto mt-16 flex max-w-3xl justify-center px-4 text-center">
              {isExtended ? (
                <Link
                  href="/dashboard"
                  className="smallcaps text-muted-foreground transition-colors hover:text-foreground"
                >
                  ← Show only last 48 hours
                </Link>
              ) : (
                <Link
                  href="/dashboard?window=extended"
                  className="smallcaps text-muted-foreground transition-colors hover:text-foreground"
                >
                  Show last 7 days →
                </Link>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
