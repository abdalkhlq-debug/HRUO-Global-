# HRUO — Enterprise HCM SaaS

Multi-tenant Human Capital Management system built for complex, enterprise workforces. Covers the full employee lifecycle across 20+ modules.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API server on port 8080
- `pnpm --filter @workspace/hruo run dev` — Frontend on port 5173
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + TanStack Query, shadcn/ui, Tailwind, Framer Motion, Recharts
- API: Express 5 (port 8080, path prefix `/api`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/hruo/` — React + Vite frontend SPA
- `artifacts/api-server/` — Express 5 REST API
- `lib/db/src/schema/` — Drizzle ORM schema (source of truth for DB)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks & Zod schemas
- `artifacts/hruo/public/hruo-logo.png` — HRUO logo

## Architecture decisions

- **Multi-tenant isolation**: Every table has `tenant_id`. Super admins (by email allowlist) have `tenant_id = null` and see all tenants.
- **Token auth**: JWT-like tokens stored in `localStorage` as `hruo_token`. API verifies via middleware in `api-server/src/middlewares/auth.ts`.
- **Password hashing**: SHA-256 of `password + "hruo_salt"`. Upgrade to bcrypt before production.
- **API-first**: OpenAPI spec gates codegen; frontend consumes generated React Query hooks only — no raw `fetch` calls in components.
- **Port routing**: Replit shared proxy routes `/api` → port 8080, `/` → port 5173.

## Product

20+ HCM modules:
- **Core HR**: Employees, Departments, Branches, Org Chart, Job Levels
- **Workforce**: Attendance, Leave Management, Timesheets
- **Compensation**: Payroll, Expenses, Tax Calculator
- **Talent**: Recruitment (Kanban), Performance, Training
- **Collaboration**: Chat, Announcements, Documents
- **Analytics**: HR dashboards, Recharts visualisations
- **Admin**: Super Admin panel (multi-tenant management), Audit Logs, AI Assistant
- **Public**: Landing page, Quote Request form

## Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | info@hruo.net | Hg.8@6U!@mZLShV |
| Super Admin | admin@hruo.net | Hg.8@6U!@mZLShV |
| Super Admin | abd.elkhaleq@outlook.com | Hg.8@6U!@mZLShV |
| Demo Tenant Admin | admin@democorp.com | Demo@1234 |

Demo tenant: **HRUO Demo Corp** (slug: `demo-corp`) — 15 seeded employees across 7 departments and 3 branches.

## User preferences

- Brand: Blue (#2563EB) + white, corporate enterprise feel
- Super admin emails: info@hruo.net, admin@hruo.net, abd.elkhaleq@outlook.com

## Gotchas

- Do NOT run `pnpm dev` at workspace root — no root dev script by design.
- Port 5173 is required for hruo workflow (Replit only monitors specific ports).
- Password hashing uses SHA-256 + `hruo_salt` (not bcrypt) — change before production.
- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`.
- Super admin auth is checked by email allowlist in `api-server/src/middlewares/auth.ts` — users with those emails are always treated as super admins regardless of DB `isSuperAdmin` flag.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
