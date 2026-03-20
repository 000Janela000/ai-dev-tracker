/** Freshness multiplier — recent items score higher */
export function getFreshnessMultiplier(publishedAt: Date, now?: Date): number {
  const current = now ?? new Date();
  const hoursAgo =
    (current.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);

  if (hoursAgo < 2) return 1.0;    // Just published
  if (hoursAgo < 6) return 0.9;    // Very fresh
  if (hoursAgo < 24) return 0.7;   // Today
  if (hoursAgo < 72) return 0.5;   // This week
  if (hoursAgo < 168) return 0.3;  // This week (7 days)
  return 0.1;                       // Old news
}
