# One-command Supabase setup for Advancia Healthcare
# 1) Runs all DB migrations (tables, RLS, etc.)
# 2) Prints the exact Auth Redirect URLs to add in Supabase Dashboard
#
# Usage (from repo root):
#   .\scripts\setup-supabase.ps1
# Requires: .env with DATABASE_URL set (Supabase project DB connection string)

param(
    [switch]$SkipMigrations
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path (Join-Path $root ".env"))) {
    Write-Error "No .env in repo root. Copy .env.example to .env and set DATABASE_URL."
}

if (-not $SkipMigrations) {
    Write-Host "Running all migrations (this may take a minute)..." -ForegroundColor Cyan
    Push-Location $root
    try {
        npx tsx scripts/run-all-migrations-pg.ts
        if ($LASTEXITCODE -ne 0) {
            Write-Host "`nSome migrations failed. You can fix and re-run, or add redirect URLs below and restart the app." -ForegroundColor Yellow
        } else {
            Write-Host "`nMigrations completed." -ForegroundColor Green
        }
    } finally {
        Pop-Location
    }
} else {
    Write-Host "Skipping migrations ( -SkipMigrations )." -ForegroundColor Gray
}

# Read project ref from .env for the dashboard link
$envContent = Get-Content (Join-Path $root ".env") -Raw
$projectRef = "luxvhnshmmowjpiazrnk"
if ($envContent -match 'SUPABASE_URL=https://([a-z0-9]+)\.supabase\.co') {
    $projectRef = $Matches[1]
}

$authUrl = "https://supabase.com/dashboard/project/$projectRef/auth/url-configuration"
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Add these in Supabase (Auth URLs)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Open: $authUrl"
Write-Host ""
Write-Host " Redirect URLs (add each):"
Write-Host "   http://localhost:5174"
Write-Host "   http://127.0.0.1:5174"
Write-Host "   http://localhost:5173"
Write-Host "   http://127.0.0.1:5173"
Write-Host "   http://127.0.0.1:5180"
Write-Host "   http://127.0.0.1:5176"
Write-Host "   http://127.0.0.1:5177"
Write-Host "   http://127.0.0.1:5178"
Write-Host "   http://127.0.0.1:5179"
Write-Host "   http://127.0.0.1:5180"
Write-Host ""
Write-Host " Site URL (e.g.): http://localhost:5174"
Write-Host " For production add: https://advancia-healthcare.com and https://www.advancia-healthcare.com"
Write-Host ""
