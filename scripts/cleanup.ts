/**
 * Retention Cleanup Script
 *
 * Deletes items (and related fetch logs) older than N days to keep the
 * dashboard fresh and stay inside the Supabase 500MB free-tier budget.
 *
 * Run with: npx tsx --tsconfig tsconfig.json scripts/cleanup.ts
 * Optional env: CLEANUP_RETENTION_DAYS (default 14)
 */

import { pruneOldItems, closeDb } from "@/lib/db";

const RETENTION_DAYS = Number(process.env.CLEANUP_RETENTION_DAYS ?? 14);

async function main() {
  if (!Number.isFinite(RETENTION_DAYS) || RETENTION_DAYS < 1) {
    throw new Error(
      `Invalid CLEANUP_RETENTION_DAYS: ${process.env.CLEANUP_RETENTION_DAYS}. Must be a positive integer.`
    );
  }

  console.log(
    `[Cleanup] Pruning items older than ${RETENTION_DAYS} days...`
  );

  const deleted = await pruneOldItems(RETENTION_DAYS);

  console.log(`[Cleanup] Deleted ${deleted} items.`);
}

main()
  .catch((error) => {
    console.error("[Cleanup] Fatal error:", error);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
