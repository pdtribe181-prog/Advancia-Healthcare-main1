# Everything needed — Advancia Healthcare

**One-place checklist.** Current Supabase project: **luxvhnshmmowjpiazrnk**.

---

## 1. Environment (.env)

**Repo root `.env`** — ensure these are set:

| Variable | Where to get it |
|----------|------------------|
| `SUPABASE_URL` | https://luxvhnshmmowjpiazrnk.supabase.co (already set) |
| `SUPABASE_ANON_KEY` | Supabase → [Settings → API](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/settings/api) → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page → service_role (secret) |
| `DATABASE_URL` | `postgresql://postgres:YOUR_DB_PASSWORD@db.luxvhnshmmowjpiazrnk.supabase.co:5432/postgres` — password from [Settings → Database](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/settings/database) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_PUBLISHABLE_KEY` | Same |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → add endpoint → signing secret (optional until you need payment events) |

**Frontend `frontend/.env`** — set:

| Variable | Value |
|----------|--------|
| `VITE_SUPABASE_URL` | https://luxvhnshmmowjpiazrnk.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | Same as root `SUPABASE_ANON_KEY` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Same as root `STRIPE_PUBLISHABLE_KEY` |

---

## 2. Supabase — database schema (migrations)

From repo root (with `DATABASE_URL` in `.env`). **One command:**

```powershell
cd c:\Users\mucha.DESKTOP-H7T9NPM\modullar-advancia\Advancia-Healthcare-main1
npm run setup:db
```

Or use the wrapper (also prints Auth URL reminder):

```powershell
.\scripts\setup-supabase.ps1
```

**Automatic connection:** The backend retries connecting to the service catalog up to 5 times on startup (every 3s). If you run `npm run setup:db` and then start the server, it will connect once the DB is ready.

---

## 3. Supabase — Auth redirect URLs (manual)

**Open:** [Auth URL Configuration](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/auth/url-configuration)

**Redirect URLs** — add each you use:

- `http://localhost:5174`
- `http://127.0.0.1:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5176`
- `http://127.0.0.1:5177`
- `http://127.0.0.1:5178`
- `http://127.0.0.1:5180`
- `http://127.0.0.1:5181`
- `http://127.0.0.1:5182`
- `http://127.0.0.1:5183`
- `http://127.0.0.1:5184`
- For production: `https://advancia-healthcare.com`, `https://www.advancia-healthcare.com`

**Site URL:** e.g. `http://localhost:5174`

---

## 4. Run the app

**Terminal 1 — backend:**

```powershell
cd c:\Users\mucha.DESKTOP-H7T9NPM\modullar-advancia\Advancia-Healthcare-main1
npm run dev
```

**Terminal 2 — frontend:**

```powershell
cd c:\Users\mucha.DESKTOP-H7T9NPM\modullar-advancia\Advancia-Healthcare-main1\frontend
npm run dev
```

Open the URL Vite prints (e.g. http://127.0.0.1:5174 or next free port). API: http://localhost:3001

---

## 5. Optional — push to GitHub

```powershell
cd c:\Users\mucha.DESKTOP-H7T9NPM\modullar-advancia\Advancia-Healthcare-main1
git push -u origin main
```

---

## 6. Optional — Stripe webhook (for payment events)

1. Stripe Dashboard → Developers → Webhooks → Add endpoint.
2. URL: `https://your-api-domain/api/v1/stripe/webhook`
3. Copy signing secret → set in root `.env` as `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 7. Production (when you go live)

| # | What | Where |
|---|------|--------|
| 1 | Custom domain | Cloudflare Pages / Vercel → add **advancia-healthcare.com** (and www) |
| 2 | Supabase URLs | [Auth URL config](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/auth/url-configuration) → add https://advancia-healthcare.com, https://www.advancia-healthcare.com |
| 3 | Google OAuth | Google Cloud Console → OAuth client → add those domains to origins and redirect URIs |
| 4 | support@ | Configure support@advancia-healthcare.com (e.g. Cloudflare Email Routing) |
| 5 | Backend deploy | Hostinger/Render; set FRONTEND_URL, CORS_ORIGINS, Supabase, Stripe |
| 6 | Frontend env | VITE_API_URL, VITE_SUPABASE_*, VITE_STRIPE_PUBLISHABLE_KEY on host |

---

## Quick links (project luxvhnshmmowjpiazrnk)

- [Supabase project](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk)
- [API settings](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/settings/api)
- [Database settings](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/settings/database)
- [Auth URL config](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/auth/url-configuration)
