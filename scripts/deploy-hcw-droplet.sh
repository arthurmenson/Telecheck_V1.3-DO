#!/bin/bash
# HCW@Home Droplet Deployment Script
# Automated setup for DigitalOcean droplet with HCW@Home stack

set -e  # Exit on error
set -u  # Exit on undefined variable

# ============================================================================
# Configuration
# ============================================================================

DROPLET_IP="165.227.180.202"
DROPLET_NAME="hcw-telecheck-video"
SSH_USER="root"

# HCW@Home URLs
HCW_PUBLIC_URL="http://${DROPLET_IP}:4200"
HCW_DOCTOR_URL="http://${DROPLET_IP}:4201"
HCW_API_URL="http://${DROPLET_IP}:1337"
TELECHECK_APP_URL="https://whale-app-bs3xa.ondigitalocean.app"

# Generated Secrets
HCW_APP_SECRET="5b9a2d7e4f1c8b3a6e9d2f5c8b1a4e7d3f6c9b2e5a8d1f4b7e3a6c9d2b5f8e1a"
HCW_REFRESH_TOKEN_SECRET="4a8c1e9b2d7f5c3a6e8d1b9f4c2e7a5b3d6f9c2e8a1d5b7f4e3c6a9d2b8e1f5c"
MEDIASOUP_SECRET="3d7a9c2e5f1b8d4a6c9e2b7f5a1d8c3e6b9f2d5a8c1e4b7d3a6f9c2b5e8a1d4f"
MEDIASOUP_USER="mediasoup-admin"
HCW_MONGO_USER="hcw"
HCW_MONGO_PASSWORD="$(openssl rand -hex 32)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================================
# Step 1: Wait for droplet to be fully ready
# ============================================================================

log_info "Waiting for droplet to be fully initialized..."
sleep 30

# ============================================================================
# Step 2: Install Docker on droplet
# ============================================================================

log_info "Installing Docker on droplet..."

ssh ${SSH_USER}@${DROPLET_IP} << 'ENDSSH'
# Update system
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable --now docker

# Install Docker Compose V2
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Verify installation
docker --version
docker compose version

echo "✅ Docker installed successfully"
ENDSSH

log_info "Docker installation complete"

# ============================================================================
# Step 3: Configure firewall
# ============================================================================

log_info "Configuring UFW firewall..."

ssh ${SSH_USER}@${DROPLET_IP} << 'ENDSSH'
# Install UFW if not present
apt-get install -y ufw

# Configure firewall rules
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Allow essential services
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# HCW@Home services
ufw allow 1337/tcp comment 'HCW Backend API'
ufw allow 3005/tcp comment 'Mediasoup signaling'
ufw allow 4200/tcp comment 'Patient interface'
ufw allow 4201/tcp comment 'Doctor interface'
ufw allow 27017/tcp comment 'MongoDB'

# WebRTC RTP ports
ufw allow 40000:40100/udp comment 'RTP UDP for WebRTC'
ufw allow 40000:40100/tcp comment 'RTP TCP for WebRTC'

# Enable firewall
ufw --force enable

echo "✅ Firewall configured"
ENDSSH

log_info "Firewall configuration complete"

# ============================================================================
# Step 4: Create .env file
# ============================================================================

log_info "Creating HCW@Home environment configuration..."

cat > /tmp/hcw-env << EOF
# === HCW@Home URLs ===
HCW_PUBLIC_URL=${HCW_PUBLIC_URL}
HCW_DOCTOR_URL=${HCW_DOCTOR_URL}
TELECHECK_APP_URL=${TELECHECK_APP_URL}

# === MongoDB ===
HCW_MONGODB_URI=mongodb://${HCW_MONGO_USER}:${HCW_MONGO_PASSWORD}@hcw-mongodb:27017/hcw-athome?authSource=admin
HCW_MONGO_USER=${HCW_MONGO_USER}
HCW_MONGO_PASSWORD=${HCW_MONGO_PASSWORD}

# === JWT Secrets ===
HCW_APP_SECRET=${HCW_APP_SECRET}
HCW_REFRESH_TOKEN_SECRET=${HCW_REFRESH_TOKEN_SECRET}

# === Keycloak Integration (PLACEHOLDER) ===
KEYCLOAK_AUTH_SERVER_URL=https://whale-app-bs3xa.ondigitalocean.app/auth
KEYCLOAK_REALM=telecheck
KEYCLOAK_CLIENT_ID=hcw-integration
KEYCLOAK_CLIENT_SECRET=CONFIGURE_IN_KEYCLOAK_ADMIN

# === Email (PLACEHOLDER - Configure SendGrid) ===
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_SENDER=noreply@telecheck.com
SMTP_USER=apikey
SMTP_PASSWORD=CONFIGURE_SENDGRID_API_KEY

# === Twilio SMS (PLACEHOLDER - Optional) ===
TWILIO_ACCOUNT_SID=CONFIGURE_TWILIO_SID
TWILIO_AUTH_TOKEN=CONFIGURE_TWILIO_TOKEN
TWILIO_PHONE_NUMBER=CONFIGURE_TWILIO_NUMBER

# === Mediasoup Video Server ===
MEDIASOUP_USER=${MEDIASOUP_USER}
MEDIASOUP_SECRET=${MEDIASOUP_SECRET}
MEDIASOUP_ANNOUNCED_IP=${DROPLET_IP}
EOF

scp /tmp/hcw-env ${SSH_USER}@${DROPLET_IP}:/root/.env

log_info "Environment file uploaded"

# ============================================================================
# Step 5: Upload docker-compose file
# ============================================================================

log_info "Uploading docker-compose configuration..."

scp docker-compose.hcw-production.yml ${SSH_USER}@${DROPLET_IP}:/root/docker-compose.yml

log_info "Docker compose file uploaded"

# ============================================================================
# Step 6: Deploy HCW@Home stack
# ============================================================================

log_info "Deploying HCW@Home stack..."

ssh ${SSH_USER}@${DROPLET_IP} << 'ENDSSH'
cd /root

# Pull images
docker compose pull

# Start stack in background
docker compose up -d

# Wait for services to start
echo "Waiting for services to initialize..."
sleep 60

# Check service status
echo ""
echo "=== Service Status ==="
docker compose ps

# Check logs
echo ""
echo "=== Recent Logs ==="
docker compose logs --tail=20

echo ""
echo "✅ HCW@Home stack deployed"
ENDSSH

log_info "Stack deployment complete"

# ============================================================================
# Step 7: Health checks
# ============================================================================

log_info "Running health checks..."

sleep 30

echo ""
echo "=== Health Check Results ==="

# Check HCW Backend
if curl -f -s "http://${DROPLET_IP}:1337/api/healthcheck" > /dev/null 2>&1; then
    log_info "✅ HCW Backend API: HEALTHY"
else
    log_warn "❌ HCW Backend API: NOT RESPONDING"
fi

# Check Mediasoup
if curl -f -s "http://${DROPLET_IP}:3005/health" > /dev/null 2>&1; then
    log_info "✅ Mediasoup Video Server: HEALTHY"
else
    log_warn "❌ Mediasoup Video Server: NOT RESPONDING"
fi

# Check Patient App
if curl -f -s "http://${DROPLET_IP}:4200" > /dev/null 2>&1; then
    log_info "✅ Patient Interface: HEALTHY"
else
    log_warn "❌ Patient Interface: NOT RESPONDING"
fi

# Check Doctor App
if curl -f -s "http://${DROPLET_IP}:4201" > /dev/null 2>&1; then
    log_info "✅ Doctor Interface: HEALTHY"
else
    log_warn "❌ Doctor Interface: NOT RESPONDING"
fi

# ============================================================================
# Deployment Summary
# ============================================================================

echo ""
echo "========================================================================"
echo "  HCW@Home Deployment Complete!"
echo "========================================================================"
echo ""
echo "Droplet Information:"
echo "  Name: ${DROPLET_NAME}"
echo "  IP Address: ${DROPLET_IP}"
echo "  Region: nyc3"
echo "  Size: 8GB RAM / 4 vCPUs"
echo ""
echo "HCW@Home Services:"
echo "  Patient Interface:  http://${DROPLET_IP}:4200"
echo "  Doctor Interface:   http://${DROPLET_IP}:4201"
echo "  Backend API:        http://${DROPLET_IP}:1337"
echo "  Mediasoup Video:    http://${DROPLET_IP}:3005"
echo "  API Health Check:   http://${DROPLET_IP}:1337/api/healthcheck"
echo ""
echo "MongoDB:"
echo "  Host: ${DROPLET_IP}:27017"
echo "  Database: hcw-athome"
echo "  User: ${HCW_MONGO_USER}"
echo "  Password: ${HCW_MONGO_PASSWORD}"
echo ""
echo "Next Steps:"
echo "  1. Configure Keycloak realm 'telecheck' with client 'hcw-integration'"
echo "  2. Update KEYCLOAK_CLIENT_SECRET in droplet .env file"
echo "  3. Configure SendGrid SMTP_PASSWORD (optional)"
echo "  4. Update Telecheck to integrate with HCW API: ${HCW_API_URL}"
echo "  5. Test video consultation at: http://${DROPLET_IP}:4200"
echo ""
echo "SSH Access:"
echo "  ssh root@${DROPLET_IP}"
echo ""
echo "Useful Commands:"
echo "  docker compose ps               # Check service status"
echo "  docker compose logs -f          # View logs"
echo "  docker compose restart          # Restart all services"
echo "  docker compose down             # Stop all services"
echo ""
echo "Security:"
echo "  - MongoDB password: ${HCW_MONGO_PASSWORD}"
echo "  - Mediasoup secret: ${MEDIASOUP_SECRET}"
echo "  - Store these securely!"
echo ""
echo "========================================================================"
