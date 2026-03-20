## ADDED Requirements

### Requirement: Saved items page
The system SHALL provide a `/saved` page that displays all items the authenticated user has saved, ordered by save date (newest first).

#### Scenario: Authenticated user views saved items
- **WHEN** an authenticated user navigates to `/saved`
- **THEN** they see a list of all their saved items with title, summary, source, and date saved

#### Scenario: Unauthenticated user visits saved page
- **WHEN** an unauthenticated user navigates to `/saved`
- **THEN** they are redirected to `/login?next=/saved`

#### Scenario: Empty saved collection
- **WHEN** an authenticated user has no saved items
- **THEN** they see an empty state with guidance on how to save items

### Requirement: Read Later page
The system SHALL provide a `/read-later` page that displays all items the user has marked as Read Later, ordered by date added (newest first).

#### Scenario: Authenticated user views read later queue
- **WHEN** an authenticated user navigates to `/read-later`
- **THEN** they see a list of all their Read Later items with title, summary, source, and date added

#### Scenario: Empty read later queue
- **WHEN** an authenticated user has no Read Later items
- **THEN** they see an empty state with guidance

### Requirement: Navigation to collections
The header SHALL include links to Saved and Read Later pages when the user is authenticated.

#### Scenario: Authenticated user sees collection links
- **WHEN** an authenticated user views any page
- **THEN** the header or user menu includes links to /saved and /read-later
