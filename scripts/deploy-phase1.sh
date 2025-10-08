#!/bin/bash

# Cortiware Phase 1 Deployment Script
# Epic #30 - Option C Authentication Deployment
# Generated: October 8, 2025

set -e  # Exit on error

echo "🚀 Cortiware Phase 1 Deployment - Option C Authentication"
echo "=========================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if secrets file exists
if [ ! -f "docs/deployment/GENERATED_SECRETS.md" ]; then
    echo -e "${RED}❌ Error: GENERATED_SECRETS.md not found${NC}"
    echo "Please generate secrets first using: node scripts/generate-secrets.js"
    exit 1
fi

echo -e "${YELLOW}📋 Pre-Deployment Checklist${NC}"
echo "----------------------------"
echo ""

# Extract secrets from file
AUTH_TICKET_HMAC_SECRET=$(grep -A 1 "### AUTH_TICKET_HMAC_SECRET" docs/deployment/GENERATED_SECRETS.md | tail -n 1)
TENANT_COOKIE_SECRET=$(grep -A 1 "### TENANT_COOKIE_SECRET" docs/deployment/GENERATED_SECRETS.md | tail -n 1)

echo "✅ Secrets loaded from GENERATED_SECRETS.md"
echo ""

# Verify Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install with: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo "Please run: vercel login"
    exit 1
fi

echo "✅ Logged in to Vercel as: $(vercel whoami)"
echo ""

echo -e "${YELLOW}🔐 Setting Environment Variables${NC}"
echo "-----------------------------------"
echo ""

# Function to set environment variable
set_env_var() {
    local app=$1
    local key=$2
    local value=$3
    local scope=${4:-production}
    
    echo "Setting $key for $app ($scope)..."
    echo "$value" | vercel env add "$key" "$scope" --scope "$app" --yes || true
}

# Prompt for emergency password hashes
echo -e "${YELLOW}⚠️  Emergency Access Configuration${NC}"
echo ""
echo "You need to provide bcrypt hashes for emergency access passwords."
echo "Generate them using:"
echo "  node -e \"const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YOUR_PASSWORD', 12));\""
echo ""

read -p "Enter PROVIDER_ADMIN_PASSWORD_HASH (or press Enter to skip): " PROVIDER_HASH
read -p "Enter DEVELOPER_ADMIN_PASSWORD_HASH (or press Enter to skip): " DEVELOPER_HASH

echo ""
echo -e "${GREEN}📤 Deploying to Vercel...${NC}"
echo ""

# Set environment variables for provider-portal
echo "Setting variables for provider-portal..."
set_env_var "provider-portal" "AUTH_TICKET_HMAC_SECRET" "$AUTH_TICKET_HMAC_SECRET"

# Set environment variables for tenant-app
echo "Setting variables for tenant-app..."
set_env_var "tenant-app" "AUTH_TICKET_HMAC_SECRET" "$AUTH_TICKET_HMAC_SECRET"
set_env_var "tenant-app" "TENANT_COOKIE_SECRET" "$TENANT_COOKIE_SECRET"
set_env_var "tenant-app" "EMERGENCY_LOGIN_ENABLED" "false"

if [ -n "$PROVIDER_HASH" ]; then
    set_env_var "tenant-app" "PROVIDER_ADMIN_PASSWORD_HASH" "$PROVIDER_HASH"
fi

if [ -n "$DEVELOPER_HASH" ]; then
    set_env_var "tenant-app" "DEVELOPER_ADMIN_PASSWORD_HASH" "$DEVELOPER_HASH"
fi

echo ""
echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Deploy apps
echo -e "${YELLOW}🚀 Deploying Applications${NC}"
echo "-------------------------"
echo ""

echo "Deploying provider-portal..."
cd apps/provider-portal
vercel --prod
cd ../..

echo ""
echo "Deploying tenant-app..."
cd apps/tenant-app
vercel --prod
cd ../..

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""

echo -e "${YELLOW}📋 Post-Deployment Checklist${NC}"
echo "----------------------------"
echo ""
echo "1. ✅ Verify deployments in Vercel dashboard"
echo "2. ⏳ Test SSO ticket flow between apps"
echo "3. ⏳ Test emergency access endpoints (staging only)"
echo "4. ⏳ Review deployment logs for errors"
echo "5. ⏳ Update DNS if needed"
echo ""

echo -e "${GREEN}🎉 Phase 1 Deployment Script Complete!${NC}"
echo ""
echo "Next steps:"
echo "  - Test authentication flows end-to-end"
echo "  - Review audit logs"
echo "  - Proceed with Phase 2 infrastructure improvements"
echo ""

