---
name: advancia-conventions
description: When working in the modullar-advancia repo, use docs/ for infra and domains, assume Supabase (no Prisma/Neon), Vite (no webpack), and the three app domains. Use when editing backend, frontend, or docs in this codebase.
---

# Advancia repo conventions

When working in this repository:

## Stack (assume, don't add)
- **Database / Auth:** Supabase only. No Prisma, no Neon.
- **Frontend build:** Vite. No webpack.
- **Backend:** Node + Express; API under `/api/v1`.

## Domains and docs
- **App domains:** advanciapayledger.com (primary), advancia-healthcare.com (personal/patients), advanciapayroll.com (redirects to payledger).
- **API:** api.advanciapayledger.com (VPS). Staging: api-staging.advanciapayledger.com (Render).
- **Docs:** Prefer and cite `docs/` for infrastructure, domains, payments, Docker, CI/CD (e.g. INFRASTRUCTURE_AND_DOMAINS.md, PAYMENTS_CONFIG_AND_FIXES.md, CI_CD_WORKFLOWS.md). Don't invent infra or URLs; check docs first.

## Code and security
- Use validated request data: for GET/list endpoints use `res.locals.validatedQuery` or `res.locals.validatedParams` where validation middleware is applied.
- Withdrawals: use `crypto_withdrawals` (or a dedicated withdrawal endpoint), not `POST /transactions` with withdrawal payloads.

## Paths
- Backend: `src/`. Frontend: `frontend/src/`. Config: `config/` (Dockerfile, nginx, docker-compose). Scripts: `scripts/`.
