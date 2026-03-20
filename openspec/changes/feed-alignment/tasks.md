## 1. Layer 1 — Sources

- [x] 1.1 Disable ArXiv sources (all 3 categories) in source config
- [x] 1.2 Rewrite HN search queries to be software-dev-AI specific
- [x] 1.3 Raise HN min points from 20 to 30 (tighter noise filter)

## 2. Layer 2 — AI Prompt

- [x] 2.1 Rewrite SYSTEM_PROMPT with hyper-specific persona: web developer building software with AI
- [x] 2.2 Rewrite buildSummarizationPrompt with explicit examples of relevant/irrelevant content, persona-anchored importance scale
- [x] 2.3 Replace devRelevance + isAIRelated with single `relevance` score (0-5) that encodes both dimensions

## 3. Layer 3 — Scoring Fix

- [x] 3.1 Add scoring recalculation to the summarize script (not just pipeline)
- [ ] 3.2 Run scoring on all existing items to backfill NULL scores
- [x] 3.3 Recalibrate source trust weights: RSS official blogs highest, ArXiv lowest

## 4. Layer 4 — Briefing Quality Gate

- [x] 4.1 Update briefing selection to exclude importance <= 1 and off-topic items
- [x] 4.2 Sort briefing by importance first, then significance score, then recency

## 5. Layer 5 — Summarization Priority

- [x] 5.1 Update getUnsummarizedItems to prioritize by source type (rss > hackernews > github > reddit > devto > arxiv)

## 6. Verification

- [ ] 6.1 Build check
- [ ] 6.2 Run scoring on existing items
- [ ] 6.3 Re-summarize items with new prompt (at least a sample)
