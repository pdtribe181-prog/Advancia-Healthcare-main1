# Do it all — Advancia Healthcare (run on YOUR machine)
# 1) Run DB migrations
# 2) Print exact steps for Supabase Auth + Vercel
# 3) Start backend (you start frontend in a second terminal)
#
# Usage (PowerShell, from repo root):
#   .\scripts\do-it-all.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

Write-Host "`n=== 1. DB migrations ===" -ForegroundColor Cyan
npm run setup:db
$migrationsOk = $LASTEXITCODE -eq 0
if (-not $migrationsOk) {
    Write-Host "Migrations failed (check DATABASE_URL in .env). Continuing..." -ForegroundColor Yellow
}

Write-Host "`n=== 2. Supabase Auth (do this once) ===" -ForegroundColor Cyan
Write-Host "Open: https://supabase.com/dashboard/project/luxvhnshmmowjpiazrnk/auth/url-configuration"
Write-Host "Add Redirect URLs: http://localhost:5174, http://127.0.0.1:5174, and your Vercel URL if deployed."
Write-Host "Set Site URL: http://localhost:5174 (or your production URL)."

Write-Host "`n=== 3. Vercel (if you deploy frontend) ===" -ForegroundColor Cyan
Write-Host "Root Directory: frontend"
Write-Host "Env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PUBLISHABLE_KEY, VITE_API_URL"

Write-Host "`n=== 4. Start the app ===" -ForegroundColor Cyan
Write-Host "This script will start the BACKEND. In a SECOND terminal run:"
Write-Host "  cd frontend"
Write-Host "  npm run dev"
Write-Host "Then open the URL Vite prints (e.g. http://127.0.0.1:5174)"
Write-Host "`nStarting backend now... (Ctrl+C to stop)`n" -ForegroundColor Green
npm run dev
