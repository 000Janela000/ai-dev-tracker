## ADDED Requirements

### Requirement: User state table
The system SHALL have a `user_state` table to track per-user item actions (read, read_later, saved). The table SHALL have a unique constraint on (userId, itemId, action).

#### Scenario: Schema definition
- **WHEN** the database schema is pushed
- **THEN** the `user_state` table exists with columns: id (text PK), userId (text), itemId (text), action (text: 'read' | 'read_later' | 'saved'), createdAt (timestamp)

#### Scenario: Unique constraint prevents duplicates
- **WHEN** a user saves the same item twice with the same action
- **THEN** the second insert is rejected or handled as a no-op via upsert
