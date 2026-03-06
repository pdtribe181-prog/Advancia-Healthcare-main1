# Do it all — one place

Run these in order. Steps 2–3 are one-time dashboard setup.

---

## On your machine (PowerShell)

### Option A — One script (migrations + instructions, then starts backend)

```powershell
cd c:\Users\mucha.DESKTOP-H7T9NPM\modullar-advancia\Advancia-Healthcare-main1
.\scripts\do-it-all.ps1
```

Then in a **second terminal**: `cd frontend` → `npm run dev` → open the URL Vite prints.

### Option B — Step by step

```powershell
cd c:\Users\mucha.DESKTOP-H7T9NPM\modullar-advancia\Advancia-Healthcare-main1

# 1) DB migrations (requires DATABASE_URL in .env)
npm run setup:db

# 2) Terminal 1 — backend
npm run dev

# 3) Terminal 2 — frontend
cd frontend
npm run dev
```

Open the frontend URL (e.g. http://127.0.0.1:5174).

---

## In Supabase (once)

1. Open: https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/auth/url-configuration  
2. **Redirect URLs:** Add `http://localhost:5174`, `http://127.0.0.1:5174`, and your Vercel URL if deployed.  
3. **Site URL:** e.g. `http://localhost:5174` or your production URL.

---

## In Vercel (if you deploy frontend)

1. Root Directory: **frontend**  
2. Environment variables: **VITE_SUPABASE_URL**, **VITE_SUPABASE_ANON_KEY**, **VITE_STRIPE_PUBLISHABLE_KEY**, **VITE_API_URL**  
3. Redeploy after adding vars.

---

## Production (when you go live)

Custom domain, backend deploy, production URLs in Supabase + Google OAuth — see **SETUP_ALL_NEEDED.md** §7.
