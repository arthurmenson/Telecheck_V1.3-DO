#!/bin/bash
# Complete Deployment Script - Telecheck + HCW@Home
# Deploys everything automatically

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

APP_ID="3e163757-94ee-4483-a241-8b59cd451f32"
DB_CLUSTER_ID="007511f2-f6f8-4174-8163-f2d4a8cfd49c"
HCW_DROPLET_IP="165.227.180.202"

# Generated secrets
JWT_SECRET="8f3a2c1b9e4d7a6f5c8b2e9a7d4f1c3b6e9a2d5f8c1b4e7a3d6f9c2b5e8a1d4f7"
SESSION_SECRET="7d2e9a4b1c6f3e8d5b7a2f9c4e1d8b3a6f9c2e5d8b1a4f7e3d6c9b2a5f8e1d4c"
OAUTH_SESSION_SECRET="6c1e8b3a9f4d2e7b5a8c1f9d4e2b7a3f6c9e2b5a8d1f4e7b3a6d9c2f5e8b1a4d"
HCW_API_SECRET="5b9a2d7e4f1c8b3a6e9d2f5c8b1a4e7d3f6c9b2e5a8d1f4b7e3a6c9d2b5f8e1a"

echo "========================================================================"
echo "  Telecheck + HCW@Home Complete Deployment"
echo "========================================================================"
echo ""

# ============================================================================
# STEP 1: Configure Telecheck Environment Variables
# ============================================================================

log_step "1/5: Configuring Telecheck environment variables..."

# Get database password
log_info "Getting database password..."
DB_PASSWORD=$(./doctl.exe databases connection $DB_CLUSTER_ID --format Password --no-header 2>/dev/null | tr -d '\r\n')

if [ -z "$DB_PASSWORD" ]; then
    log_error "Failed to get database password"
    exit 1
fi

log_info "Database password retrieved: ${DB_PASSWORD:0:10}..."

# Construct DATABASE_URL
DATABASE_URL="postgresql://doadmin:${DB_PASSWORD}@telecheck-postgres-cluster-do-user-24735686-0.d.db.ondigitalocean.com:25060/telecheck?sslmode=require"

# Note: doctl doesn't support setting environment variables directly
# We need to update the app spec and redeploy
log_warn "Environment variables must be set via DigitalOcean console or API"
log_info "Creating environment configuration file..."

cat > /tmp/telecheck-secrets.txt << EOF
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET
OAUTH_SESSION_SECRET=$OAUTH_SESSION_SECRET
HCW_API_SECRET=$HCW_API_SECRET
EOF

log_info "✅ Secrets file created at /tmp/telecheck-secrets.txt"
log_info "You can use these values in DigitalOcean console"

# ============================================================================
# STEP 2: Deploy HCW@Home to Droplet
# ============================================================================

log_step "2/5: Deploying HCW@Home stack to droplet..."

# Check if droplet is accessible
log_info "Testing SSH connection to $HCW_DROPLET_IP..."
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new root@$HCW_DROPLET_IP "echo 'SSH OK'" 2>/dev/null; then
    log_info "✅ SSH connection successful"

    # Install Docker
    log_info "Installing Docker on droplet..."
    ssh root@$HCW_DROPLET_IP << 'ENDSSH'
        set -e
        if ! command -v docker &> /dev/null; then
            echo "Installing Docker..."
            apt-get update -qq
            apt-get install -y curl
            curl -fsSL https://get.docker.com | sh
            systemctl enable --now docker

            # Install Docker Compose
            mkdir -p /usr/local/lib/docker/cli-plugins
            curl -SL https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
            chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

            echo "✅ Docker installed"
            docker --version
            docker compose version
        else
            echo "✅ Docker already installed"
        fi
ENDSSH

    # Generate MongoDB password
    MONGO_PASSWORD=$(openssl rand -hex 32)

    # Create environment file
    log_info "Creating environment file..."
    cat > /tmp/hcw.env << EOF
HCW_PUBLIC_URL=http://${HCW_DROPLET_IP}:4200
HCW_DOCTOR_URL=http://${HCW_DROPLET_IP}:4201
TELECHECK_APP_URL=https://whale-app-bs3xa.ondigitalocean.app
HCW_MONGODB_URI=mongodb://hcw:${MONGO_PASSWORD}@hcw-mongodb:27017/hcw-athome?authSource=admin
HCW_MONGO_USER=hcw
HCW_MONGO_PASSWORD=${MONGO_PASSWORD}
HCW_APP_SECRET=5b9a2d7e4f1c8b3a6e9d2f5c8b1a4e7d3f6c9b2e5a8d1f4b7e3a6c9d2b5f8e1a
HCW_REFRESH_TOKEN_SECRET=4a8c1e9b2d7f5c3a6e8d1b9f4c2e7a5b3d6f9c2e8a1d5b7f4e3c6a9d2b8e1f5c
KEYCLOAK_AUTH_SERVER_URL=https://whale-app-bs3xa.ondigitalocean.app/auth
KEYCLOAK_REALM=telecheck
KEYCLOAK_CLIENT_ID=hcw-integration
KEYCLOAK_CLIENT_SECRET=CONFIGURE_LATER
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_SENDER=noreply@telecheck.com
SMTP_USER=apikey
SMTP_PASSWORD=CONFIGURE_LATER
TWILIO_ACCOUNT_SID=CONFIGURE_LATER
TWILIO_AUTH_TOKEN=CONFIGURE_LATER
TWILIO_PHONE_NUMBER=CONFIGURE_LATER
MEDIASOUP_USER=mediasoup-admin
MEDIASOUP_SECRET=3d7a9c2e5f1b8d4a6c9e2b7f5a1d8c3e6b9f2d5a8c1e4b7d3a6f9c2b5e8a1d4f
MEDIASOUP_ANNOUNCED_IP=${HCW_DROPLET_IP}
EOF

    # Upload files to droplet
    log_info "Uploading configuration files..."
    scp /tmp/hcw.env root@$HCW_DROPLET_IP:/root/.env
    scp docker-compose.hcw-production.yml root@$HCW_DROPLET_IP:/root/docker-compose.yml

    # Configure firewall
    log_info "Configuring firewall..."
    ssh root@$HCW_DROPLET_IP << 'ENDSSH'
        apt-get install -y ufw
        ufw --force reset
        ufw default deny incoming
        ufw default allow outgoing
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 1337/tcp
        ufw allow 3005/tcp
        ufw allow 4200/tcp
        ufw allow 4201/tcp
        ufw allow 40000:40100/udp
        ufw allow 40000:40100/tcp
        ufw --force enable
        echo "✅ Firewall configured"
ENDSSH

    # Deploy HCW stack
    log_info "Deploying HCW@Home stack..."
    ssh root@$HCW_DROPLET_IP << 'ENDSSH'
        cd /root
        docker compose pull
        docker compose up -d
        sleep 30
        echo ""
        echo "=== Service Status ==="
        docker compose ps
ENDSSH

    log_info "✅ HCW@Home deployed to droplet"

else
    log_warn "Cannot SSH to droplet - you'll need to deploy HCW manually"
    log_info "See DEPLOYMENT_FINAL_STEPS.md for instructions"
fi

# ============================================================================
# STEP 3: Wait for services to initialize
# ============================================================================

log_step "3/5: Waiting for HCW services to initialize..."
sleep 30

# ============================================================================
# STEP 4: Test HCW@Home services
# ============================================================================

log_step "4/5: Testing HCW@Home services..."

# Test HCW Backend
if curl -f -s "http://${HCW_DROPLET_IP}:1337/api/healthcheck" > /dev/null 2>&1; then
    log_info "✅ HCW Backend API: HEALTHY"
else
    log_warn "❌ HCW Backend API: NOT RESPONDING"
fi

# Test Patient App
if curl -f -s "http://${HCW_DROPLET_IP}:4200" > /dev/null 2>&1; then
    log_info "✅ Patient Interface: HEALTHY"
else
    log_warn "❌ Patient Interface: NOT RESPONDING"
fi

# Test Doctor App
if curl -f -s "http://${HCW_DROPLET_IP}:4201" > /dev/null 2>&1; then
    log_info "✅ Doctor Interface: HEALTHY"
else
    log_warn "❌ Doctor Interface: NOT RESPONDING"
fi

# ============================================================================
# STEP 5: Monitor Telecheck deployment
# ============================================================================

log_step "5/5: Checking Telecheck deployment status..."

LATEST_DEPLOYMENT=$(./doctl.exe apps list-deployments $APP_ID --format ID --no-header | head -1 | tr -d '\r\n')

if [ -n "$LATEST_DEPLOYMENT" ]; then
    log_info "Latest deployment: $LATEST_DEPLOYMENT"

    PHASE=$(./doctl.exe apps get-deployment $APP_ID $LATEST_DEPLOYMENT --format Phase --no-header | tr -d '\r\n')
    log_info "Current phase: $PHASE"

    if [ "$PHASE" = "ACTIVE" ]; then
        log_info "✅ Telecheck deployment is ACTIVE"
    elif [ "$PHASE" = "ERROR" ]; then
        log_warn "❌ Telecheck deployment has ERROR - DATABASE_URL may not be configured"
    else
        log_info "Deployment in progress: $PHASE"
    fi
fi

# ============================================================================
# Summary
# ============================================================================

echo ""
echo "========================================================================"
echo "  Deployment Summary"
echo "========================================================================"
echo ""
echo "HCW@Home Services:"
echo "  Backend API:        http://${HCW_DROPLET_IP}:1337"
echo "  Patient Interface:  http://${HCW_DROPLET_IP}:4200"
echo "  Doctor Interface:   http://${HCW_DROPLET_IP}:4201"
echo "  Mediasoup Video:    http://${HCW_DROPLET_IP}:3005"
echo ""
echo "Telecheck:"
echo "  App URL: https://whale-app-bs3xa.ondigitalocean.app"
echo "  Secrets file: /tmp/telecheck-secrets.txt"
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "  Configure these environment variables in DigitalOcean console:"
echo "  1. Go to: https://cloud.digitalocean.com/apps"
echo "  2. Click: whale-app → Settings → Environment Variables"
echo "  3. Add these SECRETS from /tmp/telecheck-secrets.txt:"
echo "     - DATABASE_URL"
echo "     - JWT_SECRET"
echo "     - SESSION_SECRET"
echo "     - OAUTH_SESSION_SECRET"
echo "     - HCW_API_SECRET"
echo "  4. Save and wait for automatic redeployment"
echo ""
echo "MongoDB Password (save securely): ${MONGO_PASSWORD:0:20}..."
echo ""
echo "Next: Test televisit at https://whale-app-bs3xa.ondigitalocean.app"
echo "========================================================================"
