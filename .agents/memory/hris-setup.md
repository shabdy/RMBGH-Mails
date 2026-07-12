---
name: HRIS Project Setup
description: RMBGH Mailing System — scope, architecture, and startup quirks
---

# RMBGH Mailing System

## Scope
This is a **Mailing System only**. Do NOT add modules like Employee Directory, Org Chart, Calendar, Messenger, Training, or User Management — they are out of scope.

Allowed modules:
- Login / Register
- Dashboard (mail stats only)
- Mail: Inbox, Sent, Forwarded, Drafts, Attachments

## Architecture
- Frontend: React + Vite on port 5000 (workflow: "Start application", command: `node_modules/.bin/vite --port 5000 --host`)
- Backend: Express.js on port 3001 (workflow: "Backend API", command: `node server/index.js`)
- Vite proxies /api → localhost:3001
- Backend persists to: server/data/users.json, mails.json, forwarded.json, drafts.json
- AnnouncementContext reads from AuthContext internally — no static currentUser.js needed
- RecipientPicker loads users from GET /api/users?status=Active (not static employees.js)
- Mail schema: from{id,name,email,department,departmentId}, recipients[], readBy[], pinnedBy[], importantBy[], deletedBy[], recipientType("all"|"specific")

## Auth model
- Login issues a JWT (signed with SESSION_SECRET, 7d expiry) returned as `token` alongside `user`. Frontend stores it in localStorage and a shared `apiClient` (src/services/apiClient.js) attaches it as `Authorization: Bearer` via an axios interceptor.
- All screens must import the shared `apiClient` instead of creating their own `axios.create()` instance — a separate instance won't get the auth header and silently breaks protected calls.
- Server-side `authenticate` middleware in server/index.js decodes the token into `req.authUser {id, role}`; this is the only trusted source of identity/role for authorization checks. Never trust client-supplied userId/role in body/query for permission decisions — mail list/stats endpoints still take userId as a query param for data scoping (not auth), but department scoping is derived server-side from the user's own record, not from a client-supplied departmentId.
- PATCH /api/users/:id strips id/createdAt/email/password always, and additionally strips role/status unless the requester is admin/superadmin (privilege-escalation guard).

## Vite startup quirk
- Must use `node_modules/.bin/vite --port 5000 --host` — npx fails
- The vite binary needs chmod +x after npm installs (permissions reset to rw-rw-rw-)
- npm installs require --legacy-peer-deps because react-quill@2 conflicts with react@19

**Why:** Vite binary loses execute permission on this Replit environment after installs.
