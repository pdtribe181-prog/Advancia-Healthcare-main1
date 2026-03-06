# What’s next — Advancia Healthcare

**Supabase project:** `luxvhnshmmowjpiazrnk` · **Backend:** port 3001 · **Frontend:** http://127.0.0.1:5174

**Full checklist (everything needed):** [SETUP_ALL_NEEDED.md](SETUP_ALL_NEEDED.md)

---

## 1. Add Supabase keys (required for backend + login)

Stripe and Supabase URL/DB are already set. The backend will not start until these are set.

**Supabase Dashboard** → your project **luxvhnshmmowjpiazrnk** → **Settings** → **API**:

| Copy from Dashboard | Put in |
|---------------------|--------|
| **anon** (public) key | Root `.env` → `SUPABASE_ANON_KEY` and `frontend/.env` → `VITE_SUPABASE_ANON_KEY` |
| **service_role** (secret) key | Root `.env` → `SUPABASE_SERVICE_ROLE_KEY` |

Then restart backend and frontend. Open http://127.0.0.1:5174 and test login/signup.

**Optional later:** `STRIPE_WEBHOOK_SECRET` (Stripe → Webhooks → add endpoint → signing secret) for payment events.

---

## 2. Run the app

- **Terminal 1:** `npm run dev` (backend → http://localhost:3001)
- **Terminal 2:** `cd frontend && npm run dev` (frontend → http://127.0.0.1:5174)

Open http://127.0.0.1:5174 and test login/signup.

---

## 3. Push to GitHub (optional)

```powershell
cd c:\Users\mucha.DESKTOP-H7T9NPM\modullar-advancia\Advancia-Healthcare-main1
git push -u origin main
```

(Repo already has one commit and remote `origin` → pdtribe181-prog/Advancia-Healthcare-main1.)

---

## 4. Database migrations (if your Supabase DB is empty)

If you need tables/schema from this repo:

```powershell
# From repo root, with .env loaded
node scripts/check-db-tables.mjs   # see what’s there
# Then run migrations from /migrations as needed (see scripts/run-migration-pg.ts)
```

---

## 5. Production (when ready)

- **Frontend:** Connect this repo to Cloudflare Pages or Vercel; set `VITE_API_URL`, `VITE_SUPABASE_*`, `VITE_STRIPE_PUBLISHABLE_KEY`; add domain **advancia-healthcare.com**.
- **Supabase:** Authentication → URL configuration → add **https://advancia-healthcare.com** and **http://localhost:5174** to Redirect URLs.
- **Google OAuth:** Add the same URLs to Authorized JavaScript origins.
- **Backend:** Deploy API (e.g. Hostinger/Render); set `FRONTEND_URL`, CORS, Supabase, Stripe.

Full checklist: `docs/WHATS_NEEDED.md` and `docs/MANUAL_STEPS_CHECKLIST.md` in the main modullar-advancia repo.
