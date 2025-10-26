#!/bin/bash
# Monitor deployment 28223351-3bf9-4e4f-b9fa-313b7c1f07dd

APP_ID="3e163757-94ee-4483-a241-8b59cd451f32"
DEPLOYMENT_ID="28223351-3bf9-4e4f-b9fa-313b7c1f07dd"

for i in {1..30}; do
    echo "=== Check $i/30 at $(date +%H:%M:%S) ==="

    PHASE=$(./doctl.exe apps get-deployment $APP_ID $DEPLOYMENT_ID --format Phase --no-header)
    PROGRESS=$(./doctl.exe apps get-deployment $APP_ID $DEPLOYMENT_ID --format Progress --no-header)

    echo "Phase: $PHASE"
    echo "Progress: $PROGRESS"
    echo ""

    if echo "$PHASE" | grep -q "ACTIVE"; then
        echo "✅ ✅ ✅ DEPLOYMENT SUCCESSFUL! ✅ ✅ ✅"
        echo ""
        echo "App URL: https://whale-app-bs3xa.ondigitalocean.app"
        echo "Health: https://whale-app-bs3xa.ondigitalocean.app/health"
        echo "Login: https://whale-app-bs3xa.ondigitalocean.app/login"
        exit 0
    fi

    if echo "$PHASE" | grep -q "ERROR"; then
        echo "❌ ❌ ❌ DEPLOYMENT FAILED! ❌ ❌ ❌"
        echo ""
        echo "Build logs:"
        ./doctl.exe apps logs $APP_ID --type build --tail 30
        exit 1
    fi

    sleep 15
done

echo "⚠️ Deployment still in progress after 7.5 minutes"
