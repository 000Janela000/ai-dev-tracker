## ADDED Requirements

### Requirement: GitHub OAuth login
The system SHALL support login via GitHub OAuth through Supabase Auth. Login SHALL be triggered by a button on the login page.

#### Scenario: User clicks login
- **WHEN** an unauthenticated user clicks "Sign in with GitHub"
- **THEN** they are redirected to GitHub's OAuth consent screen, and after approval, redirected back to the app via the auth callback route

### Requirement: Auth callback route
The system SHALL provide a GET `/auth/callback` route that exchanges the OAuth code for a session and redirects the user to their intended destination.

#### Scenario: Successful OAuth callback
- **WHEN** GitHub redirects back with an authorization code
- **THEN** the callback route exchanges the code for a session, sets auth cookies, and redirects to the URL specified in the `next` query parameter (or `/dashboard` by default)

### Requirement: Progressive auth redirect
The system SHALL redirect unauthenticated users to the login page only when they attempt an action requiring auth (Save, Read Later). The redirect SHALL include a `next` parameter to return the user to their previous location.

#### Scenario: Unauthenticated user clicks Save
- **WHEN** an unauthenticated user clicks Save on an item
- **THEN** they are redirected to `/login?next=/item/[id]`

#### Scenario: Authenticated user clicks Save
- **WHEN** an authenticated user clicks Save on an item
- **THEN** the save action executes immediately without redirect

### Requirement: Session middleware
The system SHALL run middleware on every request to refresh expired Supabase Auth tokens. The middleware SHALL NOT protect any routes — it only refreshes cookies.

#### Scenario: Token refresh on request
- **WHEN** a request arrives with an expired auth token cookie
- **THEN** the middleware refreshes the token and updates the cookie in the response

### Requirement: Sign out
The system SHALL allow authenticated users to sign out. Sign out SHALL clear the session cookie and redirect to the dashboard.

#### Scenario: User signs out
- **WHEN** an authenticated user clicks "Sign out"
- **THEN** the session is destroyed, cookies are cleared, and the user is redirected to `/dashboard`

### Requirement: User menu in header
The dashboard header SHALL show a user menu when authenticated, displaying the user's GitHub avatar and a sign-out option. When not authenticated, no user menu is shown.

#### Scenario: Authenticated user sees avatar
- **WHEN** an authenticated user views any page with the header
- **THEN** the header shows their GitHub avatar and a sign-out button

#### Scenario: Unauthenticated user sees no menu
- **WHEN** an unauthenticated user views any page
- **THEN** the header shows no user-related UI
