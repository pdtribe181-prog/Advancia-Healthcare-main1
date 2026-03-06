# Supabase credentials — full list

**Project ref (this app):** `luxvhnshmmowjpiazrnk`  
**Dashboard:** https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk

Use this list to set `.env` (backend), `frontend/.env` (frontend), and Vercel env vars. Never commit real values to git.

---

## Backend (root `.env`)

| Variable | Where to get it | Notes |
|----------|-----------------|--------|
| **SUPABASE_URL** | Project URL | `https://luxvhnshmmowjpiazrnk.supabase.co` |
| **SUPABASE_ANON_KEY** | [Settings → API](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/settings/api) → **Project API keys** → `anon` `public` | JWT, safe for client |
| **SUPABASE_SERVICE_ROLE_KEY** | Same page → `service_role` (secret) | Server only, bypasses RLS |
| **SUPABASE_WEBHOOK_SECRET** | Optional. For DB webhooks: create webhook, copy signing secret | |
| **DATABASE_URL** | [Settings → Database](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/settings/database) → **Connection string** → URI | Format: `postgresql://postgres:[YOUR-PASSWORD]@db.luxvhnshmmowjpiazrnk.supabase.co:5432/postgres` |
| **SUPABASE_ACCESS_TOKEN** | [Account → Access Tokens](https://supabase.com/dashboard/account/tokens) | Optional; for Management API / migrations via API |

---

## Frontend (`frontend/.env` and Vercel)

| Variable | Value / where | Notes |
|----------|----------------|--------|
| **VITE_SUPABASE_URL** | Same as backend `SUPABASE_URL` | `https://luxvhnshmmowjpiazrnk.supabase.co` |
| **VITE_SUPABASE_ANON_KEY** | Same as backend `SUPABASE_ANON_KEY` | Anon key only (never service_role in frontend) |

---

## Quick links (project luxvhnshmmowjpiazrnk)

- [Project overview](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk)
- [API keys (anon + service_role)](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/settings/api)
- [Database connection string (password)](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/settings/database)
- [Auth URL config (redirect URLs)](https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/auth/url-configuration)
- [Account access tokens](https://supabase.com/dashboard/account/tokens) (optional)

---

## Summary table

| Credential | Backend .env | Frontend .env | Vercel |
|------------|--------------|---------------|--------|
| Project URL | SUPABASE_URL | VITE_SUPABASE_URL | VITE_SUPABASE_URL |
| Anon key | SUPABASE_ANON_KEY | VITE_SUPABASE_ANON_KEY | VITE_SUPABASE_ANON_KEY |
| Service role key | SUPABASE_SERVICE_ROLE_KEY | — (never in frontend) | — |
| DB connection | DATABASE_URL | — | — |
| Webhook secret | SUPABASE_WEBHOOK_SECRET | — | — |
| Access token | SUPABASE_ACCESS_TOKEN (optional) | — | — |
