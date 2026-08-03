# AV Dashboard

Multi-tenant team dashboard: projects, tasks (list + kanban), time tracking, knowledge base
(materials), and per-company member management with role-based access.

## Stack

- **[Nuxt 4](https://nuxt.com)** + **[Nuxt UI 4](https://ui.nuxt.com)** — app framework and UI kit
- **[Pinia](https://pinia.vuejs.org)** — client state
- **[Prisma 6](https://www.prisma.io)** + **MongoDB** — data layer
- **[nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils)** — sessions (email + Google OAuth)
- **[nuxt-csurf](https://github.com/Morgbn/nuxt-csurf)** + **[nuxt-security](https://nuxt-security.vercel.app)** — CSRF & hardening
- **ESLint + Prettier + Husky** — linting, formatting, pre-commit hook

## Requirements

- Node.js 20+
- A MongoDB connection string (Atlas or a local replica set — Prisma requires a replica set for MongoDB)

## Setup

```bash
npm install
```

`postinstall` runs `nuxt prepare` (generates types and the ESLint flat config), and `prepare`
installs the Husky git hooks.

### Environment

Copy `.env.example` to `.env` and fill in the values:

| Variable                                                    | Purpose                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------- |
| `DATABASE_URL`                                              | MongoDB connection string                               |
| `NUXT_SESSION_PASSWORD`                                     | Session encryption key (32+ chars)                      |
| `SITE_URL`                                                  | Public base URL (used for links, sitemap)               |
| `NUXT_OAUTH_GOOGLE_CLIENT_ID` / `_SECRET` / `_REDIRECT_URL` | Google OAuth (optional)                                 |
| `SMTP_*`, `MAIL_FROM`                                       | Email for invitations — **currently mocked**, see below |

### Database

Push the Prisma schema to the database and generate the client:

```bash
npm run db-push          # prisma db push
npm run prisma:generate  # prisma generate
```

## Development

```bash
npm run dev              # http://localhost:3000
```

## Scripts

| Script                            | Description              |
| --------------------------------- | ------------------------ |
| `npm run dev`                     | Dev server               |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run db-push` / `db-pull`     | Sync Prisma schema       |
| `npm run prisma-studio`           | Prisma Studio            |
| `npm run prettier`                | Format the whole repo    |

Committing runs `lint-staged` (ESLint `--fix` + Prettier) on staged files via a Husky pre-commit hook.

## Project structure

```
app/            # Nuxt app: pages, components, stores, composables
  components/   # grouped by domain: tasks/, project/, materials/, company/, times/, common/
  pages/        # routed pages (dashboard, projects, tasks, times, materials, company, login)
server/
  api/          # REST endpoints (grouped by resource)
  middleware/   # auth: validates the session user on every /api/ request
  utils/        # access.ts (RBAC + tenant scoping), events.ts, mailer.ts, logger.ts
shared/         # types shared between client and server
prisma/         # schema.prisma + generated client
```

## Access model (RBAC + tenancy)

Every user belongs to a company; all data is scoped to it. Roles: **OWNER**, **MANAGER**,
**EMPLOYEE**. Access rules live in one place — `server/utils/access.ts`:

- `requireRole` / `hasRole` — role gates
- `projectScope` — OWNER sees the whole company; MANAGER/EMPLOYEE only projects they belong to
- `requireProjectMembership` / `requireTodoInScope` — object-level checks (return 404, not 403,
  so foreign objects aren't revealed)

Client mutations go through `$csrfFetch` (CSRF token attached automatically).

## Notes

- **Email is mocked.** `server/utils/mailer.ts` logs invitation emails to the server console.
  To enable real delivery, fill in `SMTP_*` in `.env` and uncomment the `nodemailer` transport in
  that file.
- Task attachments and project/material images are stored as base64 in the database.
