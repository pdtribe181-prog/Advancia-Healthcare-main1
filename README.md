# Advancia Healthcare

> Canonical production repo: [pdtribe181-prog/modullar-advancia](https://github.com/pdtribe181-prog/modullar-advancia). This repository is a healthcare-only bundle derived from the canonical app and should not become a separate live deploy source for the main Advancia domains without an explicit cutover plan.

Single app: one landing, wallet connect, booking & sessions, features, FAQ, policies, subscriptions, admin. Login, loaders, and redirects included.

**Repo:** [pdtribe181-prog/Advancia-Healthcare-main1](https://github.com/pdtribe181-prog/Advancia-Healthcare-main1)

**Quick start:** `npm install` â†’ `cd frontend && npm install` â†’ copy `.env.example` to `.env` (set Supabase + Stripe) â†’ `npm run dev` (backend) â†’ `cd frontend && npm run dev` (frontend). App: http://127.0.0.1:5174

**Everything needed (env, Supabase, migrations, Auth URLs, production):** [SETUP_ALL_NEEDED.md](SETUP_ALL_NEEDED.md)

## Full stack: frontend to backend

- **Frontend** (React + Vite) calls the API via VITE_API_URL or, when unset, relative /api/v1 (dev proxy).
- **Local:** Vite proxies /api to http://localhost:3001. Run backend with PORT=3001 and frontend with npm run dev in frontend/ (full stack on 5174 + 3001).
- **Production:** Set VITE_API_URL to your API base (e.g. https://api.advanciapayledger.com/api/v1). Backend can be the same Hostinger VPS or a separate deploy of this repo.

## Where is the backend / VPS

- **Production API (shared):** Hostinger VPS at api.advanciapayledger.com (Nginx to Node on port 3000). Same API can serve PayLedger and Healthcare; ensure CORS allows https://advancia-healthcare.com.
- **This repo:** Full backend in src/. Run locally on 3001 or deploy to Hostinger/Render and point the healthcare frontend at that URL.

## Stack

- **Frontend:** React + Vite (port 5174)
- **Backend:** Node + Express (port 3001 local)
- **Auth/DB:** Supabase
- **Payments:** Stripe

## Repository structure

| Path | Purpose |
|------|---------|
| frontend/ | React + Vite app: src/pages/, src/components/, src/config/domains.ts (healthcare-only) |
| src/ | Backend: server.ts, routes/, middleware/, services/, lib/, openapi.yaml |
| config/ | TypeScript, esbuild, PM2; frontend/vite.config.ts (port 5174, proxy 3001) |
| scripts/ | Deploy, health checks; optional for local dev |
| .env.example | Copy to .env; set PORT=3001, Supabase, Stripe |

## Run locally (no port conflict)

1. npm install
2. cd frontend && npm install && cd ..
3. Copy .env.example to .env; set Supabase, Stripe, etc. Set PORT=3001.
4. **Backend:** npm run dev (API at http://localhost:3001)
5. **Frontend:** cd frontend && npm run dev (app at http://127.0.0.1:5174)

Frontend proxies /api to http://localhost:3001. Use same Supabase project as PayLedger if you share auth.

## Routes (all in one)

Landing, features, FAQ, contact, policy, subscriptions, login/signup, dashboard, wallet, wallet-balance, wallet-tools, convert, withdraw, medbed, appointments, provider, notifications, invoices, disputes, kyc, security, admin, terms, verify-email, welcome.

## Deploy

- **Frontend:** Cloudflare Pages or Vercel; set VITE_API_URL to your API. On Vercel set Root Directory to frontend so only the frontend is built.
- **Backend:** Hostinger VPS or Render; set PORT, FRONTEND_URL (e.g. https://advancia-healthcare.com), CORS, Supabase, Stripe.
- **Domain:** advancia-healthcare.com in Supabase Redirect URLs and Google OAuth origins.