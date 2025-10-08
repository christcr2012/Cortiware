# Cortiware - Set Vercel Environment Variables (PowerShell)
# Epic #30 Phase 1 Deployment
# Generated: October 8, 2025

$ErrorActionPreference = "Stop"

Write-Host "🔐 Setting Vercel Environment Variables for Cortiware" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Load secrets
$AUTH_TICKET_HMAC_SECRET = "5f8bd6c4c819aa626b389cbf1e0c95c178b30e0fa27aedc016baaf22d6fa5a20"
$TENANT_COOKIE_SECRET = "5f8b02b1c2523185a667082a2cdfce3bb633b0bc478b26c424d3bded47e72744"
$PROVIDER_ADMIN_PASSWORD_HASH = '$2b$12$XYWtnQK8Z4GhYEKIGwvo5e5vhS6MkmVOPzUAWBlxLXlKDYMjqCsye'
$DEVELOPER_ADMIN_PASSWORD_HASH = '$2b$12$GTar80xmtoOUYxVCjVUN8OXgOzEDIuOZmq1CHUyjpfLPM667kT5bDu'

# Team and project info
$TEAM_ID = "team_PUafLQmqT7LYBaBs8lEOPYMG"
$PROVIDER_PORTAL_PROJECT = "cortiware-provider-portal"
$TENANT_APP_PROJECT = "cortiware-tenant-app"

Write-Host "Team: Robinson AI Systems"
Write-Host "Team ID: $TEAM_ID"
Write-Host ""

# Check if vercel CLI is installed
try {
    $null = Get-Command vercel -ErrorAction Stop
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found" -ForegroundColor Red
    Write-Host "Install with: npm install -g vercel"
    exit 1
}

Write-Host ""

# Check if logged in
try {
    $whoami = vercel whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Not logged in to Vercel" -ForegroundColor Yellow
        Write-Host "Running: vercel login"
        vercel login
        $whoami = vercel whoami
    }
    Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not logged in to Vercel" -ForegroundColor Yellow
    Write-Host "Running: vercel login"
    vercel login
}

Write-Host ""
Write-Host "📤 Setting environment variables..." -ForegroundColor Cyan
Write-Host ""

# Function to set environment variable
function Set-VercelEnv {
    param(
        [string]$Project,
        [string]$Key,
        [string]$Value,
        [string]$EnvType = "production"
    )
    
    Write-Host "Setting $Key for $Project ($EnvType)..." -ForegroundColor Gray
    
    try {
        # Try to add the variable
        $Value | vercel env add $Key $EnvType --yes 2>$null
        if ($LASTEXITCODE -ne 0) {
            # Variable might exist, try to remove and re-add
            Write-Host "  ⚠️  Variable may already exist, updating..." -ForegroundColor Yellow
            vercel env rm $Key $EnvType --yes 2>$null | Out-Null
            $Value | vercel env add $Key $EnvType --yes
        }
    } catch {
        Write-Host "  ❌ Failed to set $Key" -ForegroundColor Red
    }
}

# Set environment variables for provider-portal
Write-Host "🔧 Configuring provider-portal..." -ForegroundColor Cyan
Push-Location apps\provider-portal

Set-VercelEnv -Project $PROVIDER_PORTAL_PROJECT -Key "AUTH_TICKET_HMAC_SECRET" -Value $AUTH_TICKET_HMAC_SECRET -EnvType "production"
Set-VercelEnv -Project $PROVIDER_PORTAL_PROJECT -Key "AUTH_TICKET_HMAC_SECRET" -Value $AUTH_TICKET_HMAC_SECRET -EnvType "preview"
Set-VercelEnv -Project $PROVIDER_PORTAL_PROJECT -Key "AUTH_TICKET_HMAC_SECRET" -Value $AUTH_TICKET_HMAC_SECRET -EnvType "development"

Pop-Location
Write-Host "✅ provider-portal configured" -ForegroundColor Green
Write-Host ""

# Set environment variables for tenant-app
Write-Host "🔧 Configuring tenant-app..." -ForegroundColor Cyan
Push-Location apps\tenant-app

Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "AUTH_TICKET_HMAC_SECRET" -Value $AUTH_TICKET_HMAC_SECRET -EnvType "production"
Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "AUTH_TICKET_HMAC_SECRET" -Value $AUTH_TICKET_HMAC_SECRET -EnvType "preview"
Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "AUTH_TICKET_HMAC_SECRET" -Value $AUTH_TICKET_HMAC_SECRET -EnvType "development"

Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "TENANT_COOKIE_SECRET" -Value $TENANT_COOKIE_SECRET -EnvType "production"
Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "TENANT_COOKIE_SECRET" -Value $TENANT_COOKIE_SECRET -EnvType "preview"
Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "TENANT_COOKIE_SECRET" -Value $TENANT_COOKIE_SECRET -EnvType "development"

Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "PROVIDER_ADMIN_PASSWORD_HASH" -Value $PROVIDER_ADMIN_PASSWORD_HASH -EnvType "production"
Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "PROVIDER_ADMIN_PASSWORD_HASH" -Value $PROVIDER_ADMIN_PASSWORD_HASH -EnvType "preview"
Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "PROVIDER_ADMIN_PASSWORD_HASH" -Value $PROVIDER_ADMIN_PASSWORD_HASH -EnvType "development"

Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "DEVELOPER_ADMIN_PASSWORD_HASH" -Value $DEVELOPER_ADMIN_PASSWORD_HASH -EnvType "production"
Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "DEVELOPER_ADMIN_PASSWORD_HASH" -Value $DEVELOPER_ADMIN_PASSWORD_HASH -EnvType "preview"
Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "DEVELOPER_ADMIN_PASSWORD_HASH" -Value $DEVELOPER_ADMIN_PASSWORD_HASH -EnvType "development"

Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "EMERGENCY_LOGIN_ENABLED" -Value "false" -EnvType "production"
Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "EMERGENCY_LOGIN_ENABLED" -Value "false" -EnvType "preview"
Set-VercelEnv -Project $TENANT_APP_PROJECT -Key "EMERGENCY_LOGIN_ENABLED" -Value "false" -EnvType "development"

Pop-Location
Write-Host "✅ tenant-app configured" -ForegroundColor Green
Write-Host ""

Write-Host "✅ All environment variables set successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  - provider-portal: 1 variable (AUTH_TICKET_HMAC_SECRET)"
Write-Host "  - tenant-app: 5 variables"
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Trigger redeployment in Vercel dashboard"
Write-Host "  2. Or run: vercel --prod in each app directory"
Write-Host "  3. Verify deployments are successful"
Write-Host "  4. Test authentication flows"
Write-Host ""

Write-Host "Environment configuration complete!" -ForegroundColor Green

