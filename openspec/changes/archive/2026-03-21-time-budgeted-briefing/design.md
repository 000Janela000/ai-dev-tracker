## Context

The dashboard loads up to 200 items ordered by significance score. For authenticated users, read items are already excluded. The hero section shows the top 5 items. Items have `summary` (2-3 sentences from AI), `content` (raw text, up to 10KB), and `significanceScore` (0-30).

## Goals / Non-Goals

**Goals:**
- Calculate reading time per item
- Select items for a ~20-minute briefing budget from the highest-scored items
- Clear visual distinction between "your briefing" and "more items"
- Show total and per-item reading time

**Non-Goals:**
- Personalized reading speed settings (use fixed 200 WPM)
- Reading time tracking (how long user actually spent)
- Progressive loading or infinite scroll

## Decisions

### 1. Reading time estimation: summary-based for briefing, content for detail

In the briefing view, users read summaries (2-3 sentences) not full articles. So reading time for briefing selection uses **summary word count**. The detail page can show full content reading time separately.

Formula: `Math.max(1, Math.ceil(wordCount / 200))` minutes. Minimum 1 minute per item.

### 2. Briefing selection: greedy by score until budget exhausted

Items are already sorted by significance score (desc). Walk the list, accumulating reading time until the 20-minute budget is reached. Simple, deterministic, no complex knapsack optimization needed.

Only items with summaries are eligible for the briefing. Unsummarized items go to "more items."

### 3. Briefing replaces hero section

The current hero section (top 5 items) is replaced by the briefing section. The briefing IS the hero — showing 10-20 items depending on summary lengths, with total reading time prominently displayed. This avoids redundancy (hero + briefing showing the same top items).

### 4. "More Items" section below

Below the briefing, the existing item list continues with remaining items. A visual separator ("More items below" or a divider) marks the transition. This lets power users keep scrolling past the briefing.

### 5. Reading time budget: 20 minutes, configurable in code

The 20-minute budget is a constant (`BRIEFING_BUDGET_MINUTES = 20`). No UI to change it — fits the "global curation, code-level" decision from the audit.

## Risks / Trade-offs

**[Briefing too short on slow news days]** → If there are only 5 items worth showing, the briefing might be 5 minutes. That's fine — short briefing = not much happened. Better than padding with low-quality items.

**[Briefing too long if summaries are verbose]** → The 200 WPM estimate is conservative. If summaries average 50 words (15 seconds each), 20 items = 5 minutes actual read. The estimate includes time for the user to process, click through, and decide. Erring on the generous side is fine.
