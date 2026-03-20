## Why

The entire pipeline is built for "generic AI-interested developer" but the user is a web developer who orchestrates AI for software development. This misalignment cascades through every layer: wrong sources (43% ArXiv noise), wrong AI labeling (broad "AI tools" instead of "software dev AI tools"), dead scoring (all NULL), no quality gate on briefing, and backwards summarization priority. Result: 75% of the briefing is waste.

## What Changes

- Layer 1: Disable ArXiv, tighten HN queries to software-dev-specific terms
- Layer 2: Rewrite summarization prompt with hyper-specific persona and examples
- Layer 3: Fix scoring — run after summarization, recalculate on existing items
- Layer 4: Add quality gate to briefing — minimum importance 2, exclude off-topic
- Layer 5: Prioritize summarization by source value (RSS first, HN second, ArXiv last)

## Capabilities

### New Capabilities

### Modified Capabilities

## Impact

All layers of the pipeline. No new dependencies. No schema changes.
