# Status check — Advancia Healthcare

**Last check:** Repo pulled from GitHub. Local branch up to date with `origin/main`.

---

## Repo status

| Item | Status |
|------|--------|
| Git | Clean working tree, up to date with origin/main |
| Latest pull | 2 commits: payment-flows test + stripe.routes.ts updates |
| Frontend Vercel config | `frontend/vercel.json` present (build, SPA rewrite, security headers) |
| Vercel deploy doc | `docs/VERCEL_DEPLOY.md` present |
| Setup docs | SETUP_ALL_NEEDED.md, NEXT_ACTIONS.md, WHATS_NEEDED.md present |
| DB migration script | `npm run setup:db` / `scripts/run-all-migrations-pg.ts` present |
| Supabase project (docs) | luxvhnshmmowjpiazrnk |

---

## What “added already” usually means — quick check

Use this to confirm you’ve done the right steps (we can’t see your dashboards or `.env`).

| Added where | What to verify |
|-------------|-----------------|
| **Root `.env`** | SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY set |
| **frontend/.env** | VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PUBLISHABLE_KEY set |
| **Vercel** | Root Directory = `frontend`; env vars above (with VITE_ prefix) + VITE_API_URL for production |
| **Supabase Auth** | [Auth URL config](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/auth/url-configuration): localhost + 127.0.0.1 (+ your Vercel URL if deployed) in Redirect URLs; Site URL set |
| **DB migrations** | Ran `npm run setup:db` once (backend then loads service catalog after restart) |

If all of the above are done, you’re set for local dev and for a Vercel frontend. For production go-live, add custom domain, production API, and Supabase/Google OAuth production URLs (see SETUP_ALL_NEEDED.md §7).
