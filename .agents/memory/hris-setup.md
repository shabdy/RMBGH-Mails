---
name: HRIS Project Setup
description: RMBGH Mailing System scope, architecture, startup quirks, backend-context wiring, and the announcement-feed (posts) subsystem.
---

## Scope
RMBGH Mailing System only — an internal hospital mailing/HR system. Two workflows: `Backend API` (`node server/index.js`, port 3001) and `Start application` (Vite, port 5000). Frontend calls backend via `apiClient` using relative `/api` paths proxied by Vite.

## Auth
JWT-based (`SESSION_SECRET`). `authenticate` middleware attaches `req.authUser = {id, role}`; `isAdmin()` checks `admin`/`superadmin`. Client-supplied `userId`/`role` in body/query is never trusted for authorization — only `req.authUser` is.

## Data storage
Flat JSON files under `server/data/` (`users.json`, `mails.json`, `drafts.json`, `forwarded.json`, `posts.json`, `auditLog.json`), read/written via `readJSON`/`writeJSON` helpers. Seed data only written if the file doesn't exist yet — seeded user statuses (e.g. `user@rmbgh.com`) can drift Active/Inactive across sessions from prior testing; check current status before assuming seed defaults still hold.

## Announcement feed ("posts") — separate from mail
A lightweight social feed distinct from the existing mail/announcement (`mails.json`) system. Any employee (any role) can post; posts support view-tracking (who's seen it), threaded comments, and a Facebook-style 5-emoji reaction set (like/love/haha/wow/sad, one reaction per user, click-to-toggle-off).
- Backend: `/api/posts` CRUD + `/:id/view`, `/:id/comments`, `/:id/react` in `server/index.js`; `PostsProvider`/`usePosts()` in `src/context/PostsContext.jsx` on the frontend.
- Regular users see this feed *in place of* their old stats dashboard at `/dashboard`. Admin/superadmin keep their existing role dashboards at `/dashboard` and get the same feed component at a separate `/announcements` route (reachable via a new sidebar item), since it was a deliberate decision to not replace the admin dashboards.
- "Share via Mail" on a post does not call a dedicated share endpoint — it just calls the existing mail `sendMail()` with the post content embedded, reusing `RecipientPicker`.

## Nav quirk (pre-existing, intentionally not fixed)
The sidebar's "Administration" section only renders for `isSuperAdmin`, not plain `admin` — this predates the announcement-feed work and was left alone per explicit scope decision.

## Convention: no loading spinners
This app deliberately shows content instantly rather than gating it behind spinners/"Loading…" text — data loads silently in the background and the UI renders with default/empty state until it arrives (see `AnnouncementContext.loadAll`, `authContext`'s synchronous `localStorage` read). Apply this convention to new pages; don't add `loading` state that blocks rendering. Action-in-progress spinners (e.g. a save/delete button showing a spinner while a request is in flight) are fine and were kept — the distinction is *page-load* gating vs *user-triggered-action* feedback.
