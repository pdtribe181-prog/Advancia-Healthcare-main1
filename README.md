# Advancia Healthcare

Single app: one landing, wallet connect, booking & sessions, features, FAQ, policies, subscriptions, admin. Login, loaders, and redirects included.

**Repo:** [pdtribe181-prog/Advancia-Healthcare-main1](https://github.com/pdtribe181-prog/Advancia-Healthcare-main1)

## Stack

- **Frontend:** React + Vite (port **5174**)
- **Backend:** Node + Express (port **3001**)
- **Auth/DB:** Supabase
- **Payments:** Stripe

## Run locally (no port conflict)

1. `npm install`
2. `cd frontend && npm install && cd ..`
3. Copy `.env.example` to `.env` and set Supabase, Stripe, etc. Set `PORT=3001`.
4. **Backend:** `npm run dev` (API at http://localhost:3001)
5. **Frontend:** `cd frontend && npm run dev` (app at http://127.0.0.1:5174)

Frontend proxies `/api` to http://localhost:3001. Login and redirect work; use the same Supabase project as PayLedger if you share auth.

## Routes (all in one)

Landing, features, FAQ, contact, policy, subscriptions, login/signup, dashboard, wallet, wallet-balance, wallet-tools, convert, withdraw, medbed, appointments, provider, notifications, invoices, disputes, kyc, security, admin, terms, verify-email, welcome.

## Deploy

- **Frontend:** Cloudflare Pages or Vercel â†’ set `VITE_API_URL` to your API.
- **Backend:** Hostinger VPS or Render â†’ set `PORT`, `FRONTEND_URL` (e.g. https://advancia-healthcare.com), CORS, Supabase, Stripe.
- **Domain:** advancia-healthcare.com â†’ add to Supabase Redirect URLs and Google OAuth origins.
