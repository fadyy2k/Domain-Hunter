#!/bin/bash
#
# DomainHunter Production Deployment Script
# Usage: ./deploy.sh
#

set -euo pipefail

# Configuration
APP_NAME="domainhunter"

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting deployment for $APP_NAME...${NC}"

# 1. Update Code
echo "📦 Pulling latest code..."
git fetch origin
git reset --hard origin/main

# 2. Install Dependencies
echo "📚 Installing dependencies..."
npm ci

# 3. Database Migration
echo "🗄️  Running database migrations..."
npx prisma generate
npx prisma migrate deploy

# 4. Build Application
echo "🏗️  Building application..."
npm run build

# 5. Restart Process
echo "🔄 Restarting PM2 process..."
pm2 restart $APP_NAME || pm2 start ecosystem.config.js

echo -e "${GREEN}✅ Deployment complete!${NC}"
