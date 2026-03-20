## ADDED Requirements

### Requirement: Cluster items by title similarity
The system SHALL group items with Jaccard title similarity > 0.4 into clusters. Only items published within 24 hours of each other SHALL be eligible for the same cluster.

#### Scenario: Cross-source coverage
- **WHEN** three items from different sources have titles with > 0.4 Jaccard similarity and are within 24 hours of each other
- **THEN** they are grouped into one cluster

#### Scenario: Similar titles but different events
- **WHEN** two items have > 0.4 title similarity but are published 3 days apart
- **THEN** they are NOT clustered (outside 24-hour window)

#### Scenario: Unique story
- **WHEN** an item has no title match above 0.4 with any other item
- **THEN** it forms a cluster of size 1 (displayed normally without badge)

### Requirement: Primary item selection
Each cluster SHALL select the item with the highest significance score as the primary display item.

#### Scenario: Multiple sources, one primary
- **WHEN** a cluster has 3 items with scores 22, 18, and 15
- **THEN** the item with score 22 is the primary and appears in the feed

### Requirement: Source count badge on clustered items
Items that belong to a cluster of size > 1 SHALL display a badge showing the number of sources.

#### Scenario: Clustered item in feed
- **WHEN** an item is the primary of a 3-item cluster
- **THEN** it shows a "3 sources" badge

#### Scenario: Single-source item
- **WHEN** an item is not clustered (cluster size 1)
- **THEN** no source count badge is shown

### Requirement: Cluster sources on detail page
The item detail page for a clustered item SHALL show all other items in the cluster as alternative source links.

#### Scenario: Detail page with cluster sources
- **WHEN** a user views the detail page of a clustered item with 3 sources
- **THEN** the page shows a "Also covered by" section listing the other 2 source articles with titles and links
