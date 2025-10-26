#!/bin/bash
# Deploy Production Environment Variables to DigitalOcean
# Usage: ./scripts/deploy-production-env.sh

set -e

APP_ID="3e163757-94ee-4483-a241-8b59cd451f32"
APP_NAME="whale-app"

echo "======================================"
echo "Telecheck HCW@Home Production Deployment"
echo "======================================"
echo ""
echo "App ID: $APP_ID"
echo "App Name: $APP_NAME"
echo ""

# Check if doctl is available
if ! command -v ./doctl.exe &> /dev/null; then
    echo "❌ doctl.exe not found in current directory"
    exit 1
fi

echo "✅ doctl.exe found"
echo ""

# Confirm before proceeding
read -p "This will update environment variables and trigger a deployment. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "📝 Setting environment variables..."
echo ""

# Critical Variables
echo "1. DATABASE_URL (SECRET)..."
./doctl.exe apps update $APP_ID \
  --env "DATABASE_URL=postgresql://doadmin:YOUR_DATABASE_PASSWORD@telecheck-postgres-cluster-do-user-24735686-0.d.db.ondigitalocean.com:25060/telecheck?sslmode=require" \
  --scope RUN_TIME \
  --type SECRET

echo "2. JWT_SECRET (SECRET)..."
./doctl.exe apps update $APP_ID \
  --env "JWT_SECRET=telecheck-production-jwt-secret-2025-minimum-32-characters-long-secure-key" \
  --scope RUN_TIME \
  --type SECRET

echo "3. SESSION_SECRET (SECRET)..."
./doctl.exe apps update $APP_ID \
  --env "SESSION_SECRET=telecheck-session-secret-2025-minimum-32-characters-long-secure-key" \
  --scope RUN_TIME \
  --type SECRET

echo "4. OAUTH_ENABLED..."
./doctl.exe apps update $APP_ID \
  --env "OAUTH_ENABLED=true" \
  --scope RUN_TIME \
  --type REGULAR

echo "5. NODE_ENV..."
./doctl.exe apps update $APP_ID \
  --env "NODE_ENV=production" \
  --scope RUN_TIME \
  --type REGULAR

echo "6. PORT..."
./doctl.exe apps update $APP_ID \
  --env "PORT=3000" \
  --scope RUN_TIME \
  --type REGULAR

echo "7. LOG_LEVEL..."
./doctl.exe apps update $APP_ID \
  --env "LOG_LEVEL=info" \
  --scope RUN_TIME \
  --type REGULAR

echo "8. ALLOW_DB_FAILURE..."
./doctl.exe apps update $APP_ID \
  --env "ALLOW_DB_FAILURE=true" \
  --scope RUN_TIME \
  --type REGULAR

echo ""
echo "✅ Environment variables set!"
echo ""
echo "🚀 Triggering deployment..."
echo ""

# Create new deployment
DEPLOYMENT_ID=$(./doctl.exe apps create-deployment $APP_ID --format ID --no-header)

echo "Deployment ID: $DEPLOYMENT_ID"
echo ""
echo "📊 Monitoring deployment status..."
echo ""

# Monitor deployment
for i in {1..40}; do
    echo "=== Check $i/40 at $(date +%H:%M:%S) ==="

    PHASE=$(./doctl.exe apps get-deployment $APP_ID $DEPLOYMENT_ID --format Phase --no-header)
    PROGRESS=$(./doctl.exe apps get-deployment $APP_ID $DEPLOYMENT_ID --format Progress --no-header)

    echo "Phase: $PHASE"
    echo "Progress: $PROGRESS"
    echo ""

    if echo "$PHASE" | grep -q "ACTIVE"; then
        echo "✅ ✅ ✅ DEPLOYMENT SUCCESSFUL! ✅ ✅ ✅"
        echo ""
        echo "App URL: https://whale-app-bs3xa.ondigitalocean.app"
        echo "Health Check: https://whale-app-bs3xa.ondigitalocean.app/health"
        echo "Login: https://whale-app-bs3xa.ondigitalocean.app/login"
        echo ""
        exit 0
    fi

    if echo "$PHASE" | grep -q "ERROR"; then
        echo "❌ ❌ ❌ DEPLOYMENT FAILED! ❌ ❌ ❌"
        echo ""
        echo "Check logs:"
        echo "./doctl.exe apps logs $APP_ID --type build"
        echo "./doctl.exe apps logs $APP_ID --type run"
        echo ""
        exit 1
    fi

    sleep 15
done

echo "⚠️ Deployment still in progress after 10 minutes"
echo "Check status manually:"
echo "./doctl.exe apps list-deployments $APP_ID"
