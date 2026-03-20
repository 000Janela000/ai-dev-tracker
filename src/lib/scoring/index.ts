import { getSourceTrustWeight } from "./weights";
import { getFreshnessMultiplier } from "./freshness";
import { getEngagementScore } from "./engagement";

export interface ScoreInput {
  source: string;
  publishedAt: Date;
  importance: number | null;
  metadata: Record<string, unknown> | null;
}

/**
 * Calculate composite significance score for an item.
 * Higher score = more important, fresher, more engaged.
 *
 * Components:
 * - Source trust (0-10): How authoritative is the source?
 * - Engagement (0-10): Community signals (HN points, Reddit score, GitHub stars)
 * - AI importance (0-5): Gemini-assigned importance score
 * - Freshness multiplier (0.1-1.0): Time decay
 *
 * Formula: (trust + engagement + importance*2) × freshness
 * Max theoretical score: (10 + 10 + 10) × 1.0 = 30
 */
export function calculateSignificanceScore(input: ScoreInput): number {
  const trust = getSourceTrustWeight(input.source);
  const engagement = getEngagementScore(input.metadata);
  const importance = (input.importance ?? 2) * 2; // Scale 1-5 to 2-10
  const freshness = getFreshnessMultiplier(input.publishedAt);

  const raw = (trust + engagement + importance) * freshness;
  return Math.round(raw * 10) / 10; // One decimal place
}

export { getSourceTrustWeight } from "./weights";
export { getFreshnessMultiplier } from "./freshness";
export { getEngagementScore } from "./engagement";
