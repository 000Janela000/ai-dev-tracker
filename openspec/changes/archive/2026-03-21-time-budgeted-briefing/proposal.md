## Why

The dashboard currently shows all 200 recent items in a flat list. Users must scroll, filter, and decide what's worth reading. This creates decision fatigue — the opposite of what DevNews promises. The core product vision is a **time-budgeted briefing**: open the site, see ~20 minutes of curated content, nothing wasted. The scoring system, summarization, and read state tracking are all in place — the briefing view is the missing piece that ties them together.

## What Changes

- Add reading time estimation per item (based on summary + content word count)
- Add a briefing section at the top of the dashboard that selects the highest-scored unread items fitting within ~20 minutes
- Show estimated total reading time for the briefing ("Today's briefing: ~18 min")
- Show a visual separator between the briefing section and the "more items" section below
- Items in the briefing are ordered by significance score (best first)
- Briefing only shows items with summaries (unsummarized items go to "more items")
- The existing full item list remains below the briefing as "More Items" for users who want to keep scrolling

## Capabilities

### New Capabilities
- `briefing-view`: Time-budgeted briefing section on the dashboard that selects top-scored items within a reading time budget, with per-item and total reading time estimates

### Modified Capabilities

## Impact

- **Code**: New briefing component, modified dashboard page layout, reading time utility
- **No new dependencies**
- **No database changes** — uses existing scoring and read state
