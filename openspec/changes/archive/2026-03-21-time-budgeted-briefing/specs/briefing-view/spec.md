## ADDED Requirements

### Requirement: Reading time estimation
The system SHALL estimate reading time per item based on summary word count at 200 words per minute, with a minimum of 1 minute per item.

#### Scenario: Short summary
- **WHEN** an item has a 40-word summary
- **THEN** the estimated reading time is 1 minute (minimum)

#### Scenario: Long summary
- **WHEN** an item has a 300-word summary
- **THEN** the estimated reading time is 2 minutes (ceil(300/200))

#### Scenario: No summary
- **WHEN** an item has no summary
- **THEN** the item is not eligible for the briefing section

### Requirement: Briefing item selection
The system SHALL select items for the briefing by walking the significance-score-sorted list and accumulating reading time until the 20-minute budget is reached. Only items with summaries are eligible.

#### Scenario: Normal day with many items
- **WHEN** 50 summarized items are available
- **THEN** the briefing includes the top-scored items whose cumulative reading time fits within 20 minutes

#### Scenario: Slow news day
- **WHEN** only 5 summarized items exist totaling 4 minutes
- **THEN** the briefing shows all 5 items with a 4-minute total (does not pad with low-quality items)

#### Scenario: All items are unsummarized
- **WHEN** no items have summaries
- **THEN** the briefing section is hidden and the full item list is shown

### Requirement: Briefing section on dashboard
The dashboard SHALL display a briefing section at the top showing the selected items with total estimated reading time. The briefing section replaces the current hero section.

#### Scenario: Briefing header
- **WHEN** the briefing section is displayed
- **THEN** it shows a header like "Your Briefing" with total reading time (e.g., "~18 min read")

#### Scenario: Per-item reading time
- **WHEN** an item is shown in the briefing
- **THEN** it displays its estimated reading time alongside other metadata

### Requirement: More Items section
Below the briefing, the dashboard SHALL show remaining items under a "More Items" heading with a visual separator.

#### Scenario: Items beyond the briefing
- **WHEN** the briefing uses 15 of 50 available items
- **THEN** the remaining 35 items appear in the "More Items" section below a divider

#### Scenario: No items beyond briefing
- **WHEN** all available items fit within the briefing budget
- **THEN** the "More Items" section is hidden
