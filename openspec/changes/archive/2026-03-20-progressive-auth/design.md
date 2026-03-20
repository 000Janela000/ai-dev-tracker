## Context

Supabase JS SDK (`@supabase/supabase-js`) is already installed and env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are configured. The project uses Next.js 16 App Router with Server Components by default.

Supabase Auth with `@supabase/ssr` uses cookie-based sessions. This requires:
1. A browser client (for client components)
2. A server client (for server components, API routes)
3. Middleware to refresh expired tokens on every request

## Goals / Non-Goals

**Goals:**
- GitHub OAuth login (one-click for developers)
- Cookie-based session management via `@supabase/ssr`
- Progressive auth: login prompt only when user tries Save/Read Later
- User state table ready for future features (read tracking, bookmarks)
- Sign out capability

**Non-Goals:**
- Email/password auth (adds complexity, not needed for MVP)
- Protected pages (no page requires login — only specific actions do)
- User profile page or settings
- Admin roles or permissions

## Decisions

### 1. GitHub OAuth only

Target audience is developers — GitHub login is one click, no password to remember, high trust. Adding email/password later is trivial via Supabase but not worth the UX complexity now.

### 2. Supabase client structure: `src/lib/supabase/`

Three files following Supabase's official pattern:
- `client.ts` — browser client using `createBrowserClient`
- `server.ts` — server client using `createServerClient` with cookie access
- `middleware.ts` — token refresh client for Next.js middleware

### 3. Progressive auth via redirect with return URL

When an unauthenticated user clicks Save or Read Later, they are redirected to `/login?next=/item/[id]`. After OAuth completes, they return to where they were. No modal — a full page redirect is simpler and works with OAuth flows.

### 4. User state table: single table, action enum

```
user_state (
  id: text PK,
  userId: text NOT NULL,
  itemId: text NOT NULL REFERENCES items(id),
  action: text NOT NULL, -- 'read' | 'read_later' | 'saved'
  createdAt: timestamp
)
UNIQUE(userId, itemId, action)
```

Single table with action type, not separate tables per action. This is simpler and allows adding new action types without schema changes.

### 5. Middleware at root level

`middleware.ts` at project root (or `src/middleware.ts`) runs on every request to refresh auth cookies. It does NOT protect any routes — purely for token refresh. The matcher excludes static files and API routes that don't need auth.

## Risks / Trade-offs

**[Supabase Auth dependency]** → Ties auth to Supabase. Mitigation: already using Supabase for DB. If migrating away from Supabase, auth would be part of that larger migration.

**[GitHub OAuth requires GitHub account]** → Some developers may not use GitHub. Mitigation: vast majority of target audience has GitHub. Add Google OAuth later if needed.

**[Cookie-based sessions on Vercel]** → CDN caching could serve stale auth cookies. Mitigation: all auth-dependent pages are already `force-dynamic`. Middleware sets proper cache headers.
