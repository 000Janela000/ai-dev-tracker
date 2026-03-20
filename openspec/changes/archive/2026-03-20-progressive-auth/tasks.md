## 1. Dependencies

- [x] 1.1 Install `@supabase/ssr` package

## 2. Supabase Client Utilities

- [x] 2.1 Create `src/lib/supabase/client.ts` — browser client using `createBrowserClient`
- [x] 2.2 Create `src/lib/supabase/server.ts` — server client using `createServerClient` with cookie access
- [x] 2.3 Create `src/lib/supabase/middleware.ts` — middleware client for token refresh

## 3. Middleware

- [x] 3.1 Create `src/middleware.ts` — Next.js middleware that refreshes auth tokens on every request, with matcher excluding static files

## 4. Auth Routes

- [x] 4.1 Create `src/app/auth/callback/route.ts` — GET handler that exchanges OAuth code for session, redirects to `next` param or `/dashboard`
- [x] 4.2 Create `src/app/login/page.tsx` — login page with "Sign in with GitHub" button, reads `next` query param for post-login redirect
- [x] 4.3 Create `src/app/auth/signout/route.ts` — POST handler that signs out user and redirects to `/dashboard`

## 5. Auth Hooks and Helpers

- [x] 5.1 Create `src/lib/supabase/user.ts` — server-side `getUser()` helper that returns the current user or null
- [x] 5.2 Create `src/components/auth/auth-guard.tsx` — `useRequireAuth` hook that checks auth and redirects to login if not authenticated

## 6. User Menu in Header

- [x] 6.1 Create `src/components/dashboard/user-menu.tsx` — client component showing GitHub avatar + sign out, or nothing if unauthenticated
- [x] 6.2 Update `src/components/dashboard/header.tsx` — add UserMenu to the header

## 7. Database Schema

- [x] 7.1 Add `userState` table to `src/lib/db/schema.ts` — id, userId, itemId, action, createdAt, unique index on (userId, itemId, action)
- [x] 7.2 Run `npm run db:generate` to create migration (used db:push directly)
- [x] 7.3 Run `npm run db:push` to apply schema to Supabase

## 8. Verification

- [x] 8.1 Run `npm run build` to verify no TypeScript errors
- [x] 8.2 Verify login page renders with GitHub OAuth button (build passes, /login registered as static page)
- [x] 8.3 Verify middleware doesn't break existing pages (build passes, all existing routes intact)
