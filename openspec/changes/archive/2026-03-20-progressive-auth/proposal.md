## Why

The roadmap features (read state tracking, Read Later, Save collections) all require user identity. But DevNews should remain fully browsable without login — auth is only needed when a user tries to persist personal state. Progressive auth (prompt login only at the moment of need) keeps friction at zero for casual browsing while enabling persistent features for engaged users.

## What Changes

- Install `@supabase/ssr` for cookie-based auth with Next.js App Router
- Create Supabase client utilities (browser + server)
- Add Next.js middleware to refresh auth tokens on every request
- Add GitHub OAuth as the primary login method (target audience is developers)
- Create login page with GitHub OAuth button
- Add auth callback route to handle OAuth redirect
- Create a `useUser` hook for client components to check auth state
- Create a server-side `getUser` helper for protected API routes
- Add user menu in header (avatar + sign out) when logged in
- Create `user_state` table in DB for read/save tracking (used by future features)

## Capabilities

### New Capabilities
- `auth-flow`: GitHub OAuth login/logout flow with Supabase Auth, cookie-based sessions, token refresh middleware
- `user-state-schema`: Database table for per-user item state (read, read-later, saved) — schema only, no UI yet

### Modified Capabilities

## Impact

- **Dependencies**: New package `@supabase/ssr`
- **Code**: New middleware (`middleware.ts`), new Supabase client utilities (`src/lib/supabase/`), new login page, auth callback route, header modification
- **Database**: New `user_state` table (Drizzle schema + migration)
- **Supabase Dashboard**: GitHub OAuth provider must be enabled in Supabase Auth settings
- **Environment**: Supabase URL and anon key already configured; GitHub OAuth app credentials set in Supabase dashboard (not in env)
