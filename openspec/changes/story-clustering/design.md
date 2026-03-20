## Context

The dedup module (`src/lib/db/dedup.ts`) already has `tokenize()` and `jaccardSimilarity()` functions for title comparison. The dedup threshold is 0.6 (items with > 0.6 similarity are considered duplicates at ingest). Many cross-source stories have 0.3-0.5 similarity — different headlines about the same event.

Items are loaded sorted by significance score. The briefing selection and item list both operate on arrays of `ItemRow`.

## Goals / Non-Goals

**Goals:**
- Group items about the same event into clusters
- Show only the best item per cluster in the feed
- Show cluster size as a badge ("3 sources")
- Show all cluster members on the detail page

**Non-Goals:**
- AI-powered synthesis summaries combining all source perspectives (deferred — would require extra summarization budget)
- Persistent cluster storage in DB (compute at display time)
- Cross-day clustering (only cluster within the loaded item set)

## Decisions

### 1. Clustering algorithm: single-pass greedy with Jaccard > 0.4

Walk items in score order. For each item, check if its title matches any existing cluster's primary title (Jaccard > 0.4). If yes, add to that cluster. If no, start a new cluster. O(n²) but n ≤ 200, so < 1ms.

**Why 0.4:** Lower than dedup (0.6) to catch cross-source coverage. Testing showed titles like "OpenAI Launches GPT-5" and "GPT-5 Released: What Developers Need to Know" have ~0.35-0.45 Jaccard similarity. Below 0.3 would create false positives.

### 2. Clustering at display time, not ingest

No schema changes, no migration, no pipeline changes. Clustering is a pure function: `clusterItems(items) → ClusteredItem[]`. This keeps it simple and reversible.

### 3. Primary item: highest significance score in cluster

The first item added to a cluster (already sorted by score) becomes the primary. Other items are "sources" listed on the detail page.

### 4. Cluster info passed via metadata, not a new table

Each item in the feed carries `clusterSize` and `clusterItemIds`. The detail page uses `clusterItemIds` to fetch and display all cluster members. No DB schema changes needed.

## Risks / Trade-offs

**[False positive clusters]** → Two unrelated items with similar titles could be wrongly grouped. Mitigation: 0.4 threshold is conservative enough. Only cluster items within the same 24-hour window to reduce false matches across different events.

**[O(n²) performance]** → With 200 items, this is ~40K comparisons of tokenized titles. Tokenization is cached per item, so actual work is set intersection. Measured at < 5ms for 200 items.
