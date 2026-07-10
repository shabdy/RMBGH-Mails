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

## Vite startup quirk
- Must use `node_modules/.bin/vite --port 5000 --host` — npx fails
- The vite binary needs chmod +x after npm installs (permissions reset to rw-rw-rw-)
- npm installs require --legacy-peer-deps because react-quill@2 conflicts with react@19

**Why:** Vite binary loses execute permission on this Replit environment after installs.
