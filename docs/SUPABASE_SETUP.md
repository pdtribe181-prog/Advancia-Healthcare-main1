# Supabase setup — automatic

One-command setup for **database schema** and instructions for **Auth redirect URLs** (must be added in the Dashboard).

---

## 1. Run all migrations (database)

From **Advancia-Healthcare-main1** root, with `.env` containing `DATABASE_URL`:

```powershell
.\scripts\setup-supabase.ps1
```

This runs **all** migrations in `migrations/` in order (tables, RLS, indexes, etc.). If you prefer to run only the migration script without the URL reminder:

```powershell
npx tsx scripts/run-all-migrations-pg.ts
```

**Requires:** `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres` in `.env` (get the password from Supabase → Settings → Database).

---

## 2. Auth redirect URLs (manual in Dashboard)

Supabase does not allow setting redirect URLs via API; add them in the Dashboard.

1. Open **Supabase** → your project → **Authentication** → **URL Configuration**  
   Or: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF/auth/url-configuration`

2. **Redirect URLs** — add each you use:
   - `http://localhost:5174`
   - `http://127.0.0.1:5174`
   - `http://127.0.0.1:5176`
   - `http://127.0.0.1:5177`
   - `http://127.0.0.1:5178`
   - `http://127.0.0.1:5180`
   - (and any other port Vite uses locally)
   - For production: `https://advancia-healthcare.com`, `https://www.advancia-healthcare.com`

3. **Site URL** — e.g. `http://localhost:5174` for local dev, or your production URL.

After saving, login/signup redirects will work for those origins.

---

## 3. Optional: run setup without migrations

To only print the Auth URL instructions (e.g. after migrations are already applied):

```powershell
.\scripts\setup-supabase.ps1 -SkipMigrations
```

---

## Summary

| Step | Action |
|------|--------|
| 1 | Set `DATABASE_URL` in `.env` (Supabase → Settings → Database → connection string). |
| 2 | Run `.\scripts\setup-supabase.ps1` from repo root. |
| 3 | In Supabase Dashboard → Auth → URL Configuration, add the redirect URLs and Site URL above. |
| 4 | Restart backend; open the app and test login. |
