# Next actions — run these

**Checked:** Backend and frontend were started. DB migrations could not be run from this environment (DNS).

---

## Done automatically

- Backend started (API at http://localhost:3001)
- Frontend started (check terminal for URL, e.g. http://127.0.0.1:5174)

---

## You need to do (in order)

### 1. Run DB migrations (on your machine)

From PowerShell:

```powershell
cd c:\Users\mucha.DESKTOP-H7T9NPM\modullar-advancia\Advancia-Healthcare-main1
npm run setup:db
```

Requires `DATABASE_URL` in `.env`. This creates all tables (including `services`); then restart the backend so the service catalog loads.

---

### 2. Add Auth redirect URLs (if not done)

Open: https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/auth/url-configuration

Add Redirect URLs: `http://localhost:5174`, `http://127.0.0.1:5174`, and any port Vite shows (e.g. 5185, 5186). Set Site URL to `http://localhost:5174`.

---

### 3. Optional later

- **Stripe webhook:** When you need payment events, add webhook in Stripe and set `STRIPE_WEBHOOK_SECRET` in `.env`.
- **Production:** See SETUP_ALL_NEEDED.md §7 (domain, Supabase prod URLs, Google OAuth, deploy).

---

**Full checklist:** SETUP_ALL_NEEDED.md
