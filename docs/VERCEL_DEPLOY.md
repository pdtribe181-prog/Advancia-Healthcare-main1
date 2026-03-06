# Deploy frontend to Vercel — Advancia Healthcare

**Recommended** for the React + Vite frontend. The repo has a monorepo layout (backend at root, frontend in `frontend/`), so you set the **Root Directory** in Vercel.

---

## 1. Connect the repo

1. Go to [vercel.com](https://vercel.com) → Add New → Project.
2. Import **pdtribe181-prog/Advancia-Healthcare-main1** (or your fork).
3. **Root Directory:** set to **`frontend`** (click Edit, enter `frontend`). This makes Vercel build only the frontend.

---

## 2. Build settings (optional)

Vercel usually detects Vite. The repo’s `frontend/vercel.json` already sets:

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework:** Vite
- SPA rewrite: all routes → `/index.html`
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`

You can leave these as default.

---

## 3. Environment variables

In Vercel → Project → Settings → Environment Variables, add (for Production and Preview if you want):

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | https://luxvhnshmmowjpiazrnk.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key |
| `VITE_API_URL` | Your API base URL (e.g. https://api.advanciapayledger.com/api/v1) |

Redeploy after adding or changing variables.

---

## 4. Custom domain (production)

After the first deploy, go to Project → Settings → Domains and add **advancia-healthcare.com** (and **www** if you use it). Point your DNS to Vercel (they’ll show the CNAME or A record).

Then add the production URL to Supabase Auth redirect URLs and Google OAuth.

---

## Summary

- **Root Directory:** `frontend`
- **Env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_API_URL`
- **Config:** `frontend/vercel.json` is already set for Vite SPA.
