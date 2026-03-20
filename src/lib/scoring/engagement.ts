/** Normalize engagement signals into a 0-10 score */
export function getEngagementScore(
  metadata: Record<string, unknown> | null
): number {
  if (!metadata) return 0;

  let score = 0;

  // HN points
  const hnPoints = metadata.points as number | undefined;
  if (hnPoints !== undefined) {
    if (hnPoints >= 500) score += 10;
    else if (hnPoints >= 200) score += 8;
    else if (hnPoints >= 100) score += 6;
    else if (hnPoints >= 50) score += 4;
    else if (hnPoints >= 20) score += 2;
  }

  // Reddit score
  const redditScore = metadata.score as number | undefined;
  if (redditScore !== undefined) {
    if (redditScore >= 1000) score += 10;
    else if (redditScore >= 500) score += 8;
    else if (redditScore >= 200) score += 6;
    else if (redditScore >= 100) score += 4;
    else if (redditScore >= 50) score += 2;
  }

  // GitHub stars
  const stars = metadata.stars as number | undefined;
  if (stars !== undefined) {
    if (stars >= 10000) score += 10;
    else if (stars >= 5000) score += 8;
    else if (stars >= 1000) score += 6;
    else if (stars >= 500) score += 4;
    else if (stars >= 100) score += 2;
  }

  // HN comments (high discussion = interesting)
  const numComments = metadata.numComments as number | undefined;
  if (numComments !== undefined && numComments >= 50) {
    score += 2;
  }

  return Math.min(score, 10); // Cap at 10
}
