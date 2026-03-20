## Why

When a major AI event happens (model release, pricing change, tool launch), multiple sources cover it: the official blog, HackerNews discussion, Reddit threads, news sites. Currently these appear as separate items in the feed — 3-5 cards for the same story. In the 20-minute briefing, this wastes slots on redundancy instead of diverse coverage.

The existing dedup catches exact URL matches and very similar titles (Jaccard > 0.6). But different sources write different headlines about the same event, so cross-source duplicates slip through.

## What Changes

- Add a clustering step after dedup that groups items about the same event
- Clusters are formed using title similarity with a lower threshold than dedup (Jaccard > 0.4)
- Each cluster selects a "primary" item (highest significance score) as the display item
- The primary item shows a "N sources" badge indicating the cluster size
- The item detail page for a clustered item shows all source articles in the cluster
- Clustering runs at display time (query-level), not at ingest time — no schema changes needed

## Capabilities

### New Capabilities
- `story-clusters`: Group related items into clusters at display time, show primary item with source count badge, detail page lists all cluster sources

### Modified Capabilities

## Impact

- **Code**: New clustering utility, modified dashboard queries, modified item detail page, badge on item cards
- **No new dependencies**
- **No database changes** — clustering is computed at display time from existing data
