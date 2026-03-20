## ADDED Requirements

### Requirement: User state API — add action
The system SHALL expose a POST `/api/user-state` endpoint that adds a user state entry (read, read_later, saved) for an item.

#### Scenario: Authenticated user saves an item
- **WHEN** an authenticated user sends POST with `{ itemId, action: "saved" }`
- **THEN** a user_state row is created and the endpoint returns `{ success: true }`

#### Scenario: Duplicate action is idempotent
- **WHEN** a user saves the same item twice
- **THEN** the second request succeeds without error (upsert)

#### Scenario: Unauthenticated request
- **WHEN** a request is sent without a valid session
- **THEN** the endpoint returns 401

### Requirement: User state API — remove action
The system SHALL expose a DELETE `/api/user-state` endpoint that removes a user state entry.

#### Scenario: User unsaves an item
- **WHEN** an authenticated user sends DELETE with `{ itemId, action: "saved" }`
- **THEN** the user_state row is removed and the endpoint returns `{ success: true }`

### Requirement: User state API — get user states for items
The system SHALL expose a GET `/api/user-state?itemIds=id1,id2,...` endpoint that returns all user states for the given items.

#### Scenario: Batch load user states
- **WHEN** an authenticated user requests states for 20 item IDs
- **THEN** the endpoint returns a map of itemId → actions array

### Requirement: Action buttons on item cards
Each item card SHALL display action buttons for Mark Read, Read Later, and Save. Buttons SHALL be icon-only to keep cards compact.

#### Scenario: Unauthenticated user clicks Save
- **WHEN** an unauthenticated user clicks the Save button
- **THEN** they are redirected to `/login?next=<current-page>`

#### Scenario: Authenticated user clicks Save
- **WHEN** an authenticated user clicks Save on an unsaved item
- **THEN** the item is saved optimistically (button shows filled state) and the API call executes in the background

#### Scenario: Item already has a user action
- **WHEN** an authenticated user views an item they have saved
- **THEN** the Save button shows a filled/active state

### Requirement: Action buttons on item detail page
The item detail page SHALL display labeled action buttons for Read Later and Save.

#### Scenario: Detail page shows action state
- **WHEN** an authenticated user views an item they have saved
- **THEN** the Save button shows "Saved" with active styling

### Requirement: Read items filtered from dashboard
The dashboard feed SHALL exclude items marked as 'read' for authenticated users.

#### Scenario: Read item disappears from feed
- **WHEN** an authenticated user marks an item as read
- **THEN** the item no longer appears in their dashboard feed on next load

#### Scenario: Unauthenticated user sees all items
- **WHEN** an unauthenticated user views the dashboard
- **THEN** all items are shown (no read filtering)
