# What’s needed — Advancia Healthcare

Short checklist for **local/dev** and **production**.  
**Full one-place checklist (all steps + links):** [SETUP_ALL_NEEDED.md](SETUP_ALL_NEEDED.md)

---

## Local / dev (right now)

| # | What | Notes |
|---|------|--------|
| 1 | **Supabase Redirect URLs** | Supabase → Authentication → URL Configuration → add `http://localhost:5174`, `http://127.0.0.1:5174` (and `http://127.0.0.1:5176` if you use that port). Needed so login/signup redirects work. |
| 2 | **Database migrations** | Backend logs “permission denied for table services” because the `services` table (and likely others) don’t exist yet. Run migrations so your Supabase DB has the schema. See below. |
| 3 | **Stripe webhook (optional)** | For payment events: Stripe → Webhooks → add endpoint `https://your-api/api/v1/stripe/webhook` → put signing secret in `.env` as `STRIPE_WEBHOOK_SECRET`. |

### Run migrations (fix “permission denied for table services”)

From **Advancia-Healthcare-main1** root (with `.env` loaded):

```powershell
.\scripts\setup-supabase.ps1
```

Runs all migrations and prints Auth Redirect URLs to add in Dashboard. See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). Single file: `npx tsx scripts/run-migration-pg.ts 024_additional_tables.sql`.

---

## Production (when you go live)

| # | What | Where |
|---|------|--------|
| 1 | **Custom domain** | **Cloudflare Pages** (or Vercel) → add **advancia-healthcare.com** (and www) to the project that serves this frontend. |
| 2 | **Supabase URLs** | **Supabase** → Authentication → URL Configuration → add **https://advancia-healthcare.com** and **https://www.advancia-healthcare.com** to Redirect URLs and Site URL. |
| 3 | **Google OAuth** | **Google Cloud Console** → your OAuth client → add **https://advancia-healthcare.com** (and www) to Authorized JavaScript origins and redirect URIs. |
| 4 | **Support email** | Configure **support@advancia-healthcare.com** (e.g. Cloudflare Email Routing or your DNS/email provider). |
| 5 | **Backend / API** | Deploy this repo’s backend (e.g. Hostinger, Render). Set `FRONTEND_URL=https://advancia-healthcare.com`, Supabase, Stripe, and `CORS_ORIGINS` including the healthcare domain. |
| 6 | **Frontend env** | On Cloudflare/Vercel set `VITE_API_URL` to your API base (e.g. `https://api.advanciapayledger.com/api/v1`), plus `VITE_SUPABASE_*` and `VITE_STRIPE_PUBLISHABLE_KEY`. |

---

## Optional / later

- **Payroll redirect:** 301 redirect **advanciapayroll.com** → advanciapayledger.com (Hostinger).
- **Staging:** Separate Supabase project and env (see main repo’s STAGING_COMPLETION_RUNBOOK.md).
- **Extra emails:** enterprise@, privacy@, etc. (see main repo’s EXTRA_EMAILS_SETUP.md).

---

**Full production checklist (main repo):** `docs/WHATS_NEEDED.md` and `docs/MANUAL_STEPS_CHECKLIST.md` in **modullar-advancia**.
