# Prepare a full Advancia Healthcare app for https://github.com/pdtribe181-prog/Advancia-Healthcare-main1
# One landing, router (wallet, booking, sessions, features, FAQ, policies, subscriptions, admin), login, loaders.
# Ports: frontend 5174, backend 3001 (no conflict with modullar-advancia 5173/3000).
#
# Usage (from repo root):
#   .\scripts\prepare-advancia-healthcare-main1.ps1 -TargetDir "..\Advancia-Healthcare-main1"
# Then: cd ..\Advancia-Healthcare-main1, npm install, cd frontend, npm install, cd .., copy .env.example to .env, npm run dev (backend), npm run dev (frontend)

param(
    [Parameter(Mandatory = $false)]
    [string]$TargetDir = "..\Advancia-Healthcare-main1"
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path (Join-Path $root "package.json"))) {
    Write-Error "Repo root not found. Run from modullar-advancia root: .\scripts\prepare-advancia-healthcare-main1.ps1"
}

$dest = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $TargetDir))
if (Test-Path $dest) {
    Write-Host "Removing existing $dest ..."
    Remove-Item -Recurse -Force $dest
}

Write-Host "Copying repo to $dest (excluding node_modules, .git, dist) ..."
$exclude = @("node_modules", ".git", "dist", "frontend/node_modules", "frontend/dist", ".husky/_", "coverage", "e2e/playwright-report", "e2e/test-results")
New-Item -ItemType Directory -Path $dest -Force | Out-Null
$items = Get-ChildItem -Path $root -Force | Where-Object { $_.Name -notin $exclude -and $_.Name -ne "Advancia-Healthcare-main1" }
foreach ($item in $items) {
    Copy-Item -Path $item.FullName -Destination (Join-Path $dest $item.Name) -Recurse -Force -ErrorAction SilentlyContinue
}
# Remove node_modules if any were copied
foreach ($dir in @("node_modules", "frontend\node_modules")) {
    $d = Join-Path $dest $dir
    if (Test-Path $d) { Remove-Item -Recurse -Force $d }
}

Write-Host "Applying healthcare-only config and ports (5174 / 3001) ..."

# 1) Frontend: healthcare-only domains (single landing, always healthcare branding)
$domainsPath = Join-Path $dest "frontend\src\config\domains.ts"
$domainsContent = @'
/**
 * Advancia Healthcare — single brand (this repo).
 * One landing, one support email. Localhost and advancia-healthcare.com both use healthcare branding.
 */
export const HEALTHCARE_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  'advancia-healthcare.com',
  'www.advancia-healthcare.com',
] as const;

const HEALTHCARE_PREVIEW_PATTERN = /advancia-healthcare.*\.vercel\.app$/i;

export function isHealthcareHost(hostname: string): boolean {
  if (HEALTHCARE_HOSTNAMES.includes(hostname as any)) return true;
  return HEALTHCARE_PREVIEW_PATTERN.test(hostname);
}

export function getSupportEmail(_hostname: string): string {
  return 'support@advancia-healthcare.com';
}

export const SIGNUP_ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'https://advancia-healthcare.com';
'@
Set-Content -Path $domainsPath -Value $domainsContent -Encoding UTF8

# 2) Frontend: Vite port 5174, proxy to 3001
$vitePath = Join-Path $dest "frontend\vite.config.ts"
$vite = Get-Content -Path $vitePath -Raw
$vite = $vite -replace "port: 5173", "port: 5174"
$vite = $vite -replace "'http://localhost:3000'", "'http://localhost:3001'"
Set-Content -Path $vitePath -Value $vite -Encoding UTF8 -NoNewline

# 3) Frontend package.json dev port 5174
$fp = Join-Path $dest "frontend\package.json"
$fj = Get-Content -Path $fp -Raw | ConvertFrom-Json
$fj.name = "advancia-healthcare-frontend"
$fj.scripts.dev = "vite --host 127.0.0.1 --port 5174"
$fj | ConvertTo-Json -Depth 10 | Set-Content -Path $fp -Encoding UTF8

# 4) Root .env.example for backend PORT=3001
$envExample = Join-Path $dest ".env.example"
if (Test-Path $envExample) {
    $c = Get-Content -Path $envExample -Raw
    if ($c -notmatch "PORT=3001") {
        $c = $c + "`n# Advancia-Healthcare-main1 local: use 3001 to avoid conflict with modullar-advancia`nPORT=3001`n"
        Set-Content -Path $envExample -Value $c -Encoding UTF8
    }
}

# 5) README for Advancia-Healthcare-main1
$readme = @"
# Advancia Healthcare

Single app: one landing, wallet connect, booking & sessions, features, FAQ, policies, subscriptions, admin. Login, loaders, and redirects included.

**Repo:** [pdtribe181-prog/Advancia-Healthcare-main1](https://github.com/pdtribe181-prog/Advancia-Healthcare-main1)

## Stack

- **Frontend:** React + Vite (port **5174**)
- **Backend:** Node + Express (port **3001**)
- **Auth/DB:** Supabase
- **Payments:** Stripe

## Run locally (no port conflict)

1. \`npm install\`
2. \`cd frontend && npm install && cd ..\`
3. Copy \`.env.example\` to \`.env\` and set Supabase, Stripe, etc. Set \`PORT=3001\`.
4. **Backend:** \`npm run dev\` (API at http://localhost:3001)
5. **Frontend:** \`cd frontend && npm run dev\` (app at http://127.0.0.1:5174)

Frontend proxies \`/api\` to http://localhost:3001. Login and redirect work; use the same Supabase project as PayLedger if you share auth.

## Routes (all in one)

Landing, features, FAQ, contact, policy, subscriptions, login/signup, dashboard, wallet, wallet-balance, wallet-tools, convert, withdraw, medbed, appointments, provider, notifications, invoices, disputes, kyc, security, admin, terms, verify-email, welcome.

## Deploy

- **Frontend:** Cloudflare Pages or Vercel → set \`VITE_API_URL\` to your API.
- **Backend:** Hostinger VPS or Render → set \`PORT\`, \`FRONTEND_URL\` (e.g. https://advancia-healthcare.com), CORS, Supabase, Stripe.
- **Domain:** advancia-healthcare.com → add to Supabase Redirect URLs and Google OAuth origins.
"@
Set-Content -Path (Join-Path $dest "README.md") -Value $readme -Encoding UTF8

Write-Host "Done."
Write-Host "Next: cd $TargetDir, npm install, cd frontend, npm install, copy .env.example to .env (set PORT=3001), npm run dev (backend), in another terminal cd frontend && npm run dev (frontend)."
Write-Host "Push to repo: git init && git add -A && git commit -m 'Advancia Healthcare full app' && git remote add origin https://github.com/pdtribe181-prog/Advancia-Healthcare-main1.git && git branch -M main && git push -u origin main"