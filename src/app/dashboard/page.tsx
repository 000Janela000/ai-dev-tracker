import { Header } from "@/components/dashboard/header";
import { HeroSection } from "@/components/dashboard/hero-section";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { DashboardContent } from "./content";
import {
  getRecentItems,
  getRecentItemsExcludingRead,
  getItemCounts,
} from "@/lib/db/queries";
import { getUser } from "@/lib/supabase/user";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let items: Awaited<ReturnType<typeof getRecentItems>> = [];
  let counts: Awaited<ReturnType<typeof getItemCounts>> = [];
  let dbError = false;

  try {
    const user = await getUser();
    const itemsQuery = user
      ? getRecentItemsExcludingRead(user.id, 200)
      : getRecentItems(200);

    [items, counts] = await Promise.all([itemsQuery, getItemCounts()]);
  } catch {
    dbError = true;
  }

  const totalItems = counts.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {dbError && (
          <div className="mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-sm text-yellow-400">
            Database not connected. Set <code>DATABASE_URL</code> in{" "}
            <code>.env.local</code> and run{" "}
            <code>npm run db:push</code> to create tables.
          </div>
        )}
        <StatsBar counts={counts} totalItems={totalItems} />
        <HeroSection items={items} />
        <DashboardContent items={items} />
      </main>
    </div>
  );
}
