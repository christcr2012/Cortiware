#!/bin/bash

# Cortiware - Set Vercel Environment Variables
# Epic #30 Phase 1 Deployment
# Generated: October 8, 2025

set -e

echo "🔐 Setting Vercel Environment Variables for Cortiware"
echo "====================================================="
echo ""

# Load secrets from GENERATED_SECRETS.md
AUTH_TICKET_HMAC_SECRET="5f8bd6c4c819aa626b389cbf1e0c95c178b30e0fa27aedc016baaf22d6fa5a20"
TENANT_COOKIE_SECRET="5f8b02b1c2523185a667082a2cdfce3bb633b0bc478b26c424d3bded47e72744"
PROVIDER_ADMIN_PASSWORD_HASH='$2b$12$XYWtnQK8Z4GhYEKIGwvo5e5vhS6MkmVOPzUAWBlxLXlKDYMjqCsye'
DEVELOPER_ADMIN_PASSWORD_HASH='$2b$12$GTar80xmtoOUYxVCjVUN8OXgOzEDIuOZmq1CHUyjpfLPM667kT5bDu'

# Team and project info
TEAM_ID="team_PUafLQmqT7LYBaBs8lEOPYMG"
PROVIDER_PORTAL_PROJECT="cortiware-provider-portal"
TENANT_APP_PROJECT="cortiware-tenant-app"

echo "Team: Robinson AI Systems"
echo "Team ID: $TEAM_ID"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo "Install with: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel"
    echo "Running: vercel login"
    vercel login
fi

echo "✅ Logged in as: $(vercel whoami)"
echo ""

echo "📤 Setting environment variables..."
echo ""

# Function to set environment variable
set_env() {
    local project=$1
    local key=$2
    local value=$3
    local env_type=${4:-production}
    
    echo "Setting $key for $project ($env_type)..."
    
    # Use vercel env add with proper escaping
    echo "$value" | vercel env add "$key" "$env_type" --yes 2>/dev/null || {
        echo "  ⚠️  Variable may already exist, updating..."
        vercel env rm "$key" "$env_type" --yes 2>/dev/null || true
        echo "$value" | vercel env add "$key" "$env_type" --yes
    }
}

# Set environment variables for provider-portal
echo "🔧 Configuring provider-portal..."
cd apps/provider-portal || exit 1

set_env "$PROVIDER_PORTAL_PROJECT" "AUTH_TICKET_HMAC_SECRET" "$AUTH_TICKET_HMAC_SECRET" "production"
set_env "$PROVIDER_PORTAL_PROJECT" "AUTH_TICKET_HMAC_SECRET" "$AUTH_TICKET_HMAC_SECRET" "preview"
set_env "$PROVIDER_PORTAL_PROJECT" "AUTH_TICKET_HMAC_SECRET" "$AUTH_TICKET_HMAC_SECRET" "development"

cd ../..
echo "✅ provider-portal configured"
echo ""

# Set environment variables for tenant-app
echo "🔧 Configuring tenant-app..."
cd apps/tenant-app || exit 1

set_env "$TENANT_APP_PROJECT" "AUTH_TICKET_HMAC_SECRET" "$AUTH_TICKET_HMAC_SECRET" "production"
set_env "$TENANT_APP_PROJECT" "AUTH_TICKET_HMAC_SECRET" "$AUTH_TICKET_HMAC_SECRET" "preview"
set_env "$TENANT_APP_PROJECT" "AUTH_TICKET_HMAC_SECRET" "$AUTH_TICKET_HMAC_SECRET" "development"

set_env "$TENANT_APP_PROJECT" "TENANT_COOKIE_SECRET" "$TENANT_COOKIE_SECRET" "production"
set_env "$TENANT_APP_PROJECT" "TENANT_COOKIE_SECRET" "$TENANT_COOKIE_SECRET" "preview"
set_env "$TENANT_APP_PROJECT" "TENANT_COOKIE_SECRET" "$TENANT_COOKIE_SECRET" "development"

set_env "$TENANT_APP_PROJECT" "PROVIDER_ADMIN_PASSWORD_HASH" "$PROVIDER_ADMIN_PASSWORD_HASH" "production"
set_env "$TENANT_APP_PROJECT" "PROVIDER_ADMIN_PASSWORD_HASH" "$PROVIDER_ADMIN_PASSWORD_HASH" "preview"
set_env "$TENANT_APP_PROJECT" "PROVIDER_ADMIN_PASSWORD_HASH" "$PROVIDER_ADMIN_PASSWORD_HASH" "development"

set_env "$TENANT_APP_PROJECT" "DEVELOPER_ADMIN_PASSWORD_HASH" "$DEVELOPER_ADMIN_PASSWORD_HASH" "production"
set_env "$TENANT_APP_PROJECT" "DEVELOPER_ADMIN_PASSWORD_HASH" "$DEVELOPER_ADMIN_PASSWORD_HASH" "preview"
set_env "$TENANT_APP_PROJECT" "DEVELOPER_ADMIN_PASSWORD_HASH" "$DEVELOPER_ADMIN_PASSWORD_HASH" "development"

set_env "$TENANT_APP_PROJECT" "EMERGENCY_LOGIN_ENABLED" "false" "production"
set_env "$TENANT_APP_PROJECT" "EMERGENCY_LOGIN_ENABLED" "false" "preview"
set_env "$TENANT_APP_PROJECT" "EMERGENCY_LOGIN_ENABLED" "false" "development"

cd ../..
echo "✅ tenant-app configured"
echo ""

echo "✅ All environment variables set successfully!"
echo ""

echo "📋 Summary:"
echo "  - provider-portal: 1 variable (AUTH_TICKET_HMAC_SECRET)"
echo "  - tenant-app: 5 variables (AUTH_TICKET_HMAC_SECRET, TENANT_COOKIE_SECRET, PROVIDER_ADMIN_PASSWORD_HASH, DEVELOPER_ADMIN_PASSWORD_HASH, EMERGENCY_LOGIN_ENABLED)"
echo ""

echo "🚀 Next steps:"
echo "  1. Trigger redeployment in Vercel dashboard"
echo "  2. Or run: vercel --prod in each app directory"
echo "  3. Verify deployments are successful"
echo "  4. Test authentication flows"
echo ""

echo "🎉 Environment configuration complete!"

