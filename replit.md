# RMBGH HRIS

Human Resource Information System for RMBGH (hospital).

## Stack
- **Frontend:** React 19 + Vite + Tailwind CSS v4 + shadcn/ui (port 5000 → exposed on port 80)
- **Backend:** Express 5 REST API with JSON file storage (port 3001)
- **Project root:** `./rmbgh/` subdirectory

## How to run
The "Project" workflow starts both services in parallel:
- `Backend API` — `cd rmbgh && node server/index.js` (port 3001)
- `Frontend` — `cd rmbgh && node_modules/.bin/vite --port 5000 --host` (port 5000)

Vite proxies `/api/*` requests to `http://localhost:3001`, so all frontend API calls use relative `/api` URLs.

## Mailing flow (recipientType)
- `"department"` — only employees in the sender's own department see the mail
- `"specific"` — only the individually named recipients see the mail
- `"all"` — every active employee sees the mail

## Default accounts
| Email | Password | Role |
|-------|----------|------|
| superadmin@rmbgh.com | admin123 | admin |
| user@rmbgh.com | user123 | user |
| staff@rmbgh.com | staff123 | staff |

## User preferences
- Keep project structure inside `./rmbgh/` subdirectory
