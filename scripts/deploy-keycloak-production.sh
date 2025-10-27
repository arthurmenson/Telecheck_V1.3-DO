#!/bin/bash
# =============================================================================
# Deploy Keycloak to Digital Ocean Droplet for TeleCheck
#
# Purpose: Production-ready Keycloak deployment with PostgreSQL
# Usage: ./scripts/deploy-keycloak-production.sh
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}TeleCheck Keycloak Production Deployment${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""

# Configuration
DROPLET_NAME="telecheck-keycloak"
DROPLET_REGION="nyc1"
DROPLET_SIZE="s-2vcpu-4gb"  # 2 vCPUs, 4GB RAM - good for production Keycloak
KEYCLOAK_VERSION="23.0.0"
DOMAIN="${KEYCLOAK_DOMAIN:-keycloak.telecheck.health}"

echo -e "${YELLOW}Configuration:${NC}"
echo -e "  Droplet: ${DROPLET_NAME}"
echo -e "  Region: ${DROPLET_REGION}"
echo -e "  Size: ${DROPLET_SIZE}"
echo -e "  Keycloak Version: ${KEYCLOAK_VERSION}"
echo -e "  Domain: ${DOMAIN}"
echo ""

# Check if doctl is authenticated
if ! ./doctl.exe auth list &> /dev/null; then
    echo -e "${RED}ERROR: doctl not authenticated${NC}"
    echo "Run: ./doctl.exe auth init"
    exit 1
fi

# Create droplet
echo -e "${YELLOW}Creating Digital Ocean droplet...${NC}"
DROPLET_ID=$(./doctl.exe compute droplet create ${DROPLET_NAME} \
    --region ${DROPLET_REGION} \
    --size ${DROPLET_SIZE} \
    --image ubuntu-22-04-x64 \
    --ssh-keys $(./doctl.exe compute ssh-key list --format ID --no-header | head -n 1) \
    --wait \
    --format ID \
    --no-header)

if [ -z "$DROPLET_ID" ]; then
    echo -e "${RED}ERROR: Failed to create droplet${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Droplet created: ${DROPLET_ID}${NC}"

# Get droplet IP
echo -e "${YELLOW}Getting droplet IP address...${NC}"
DROPLET_IP=$(./doctl.exe compute droplet get ${DROPLET_ID} --format PublicIPv4 --no-header)

echo -e "${GREEN}✓ Droplet IP: ${DROPLET_IP}${NC}"
echo ""

# Wait for droplet to be ready
echo -e "${YELLOW}Waiting for droplet to be ready (60 seconds)...${NC}"
sleep 60

# Create deployment script
echo -e "${YELLOW}Creating deployment script...${NC}"

cat > /tmp/keycloak-setup.sh << 'DEPLOY_SCRIPT'
#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create Keycloak directory
mkdir -p /opt/keycloak
cd /opt/keycloak

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: keycloak-postgres
    restart: always
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-keycloak_secure_password_change_me}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - keycloak-network

  keycloak:
    image: quay.io/keycloak/keycloak:23.0.0
    container_name: keycloak
    restart: always
    command: start
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: ${POSTGRES_PASSWORD:-keycloak_secure_password_change_me}

      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD:-admin_change_me_now}

      KC_HOSTNAME: ${KEYCLOAK_HOSTNAME:-localhost}
      KC_HOSTNAME_STRICT: false
      KC_HOSTNAME_STRICT_HTTPS: false
      KC_HTTP_ENABLED: true
      KC_PROXY: edge

      KC_HEALTH_ENABLED: true
      KC_METRICS_ENABLED: true

    ports:
      - "8080:8080"
    depends_on:
      - postgres
    networks:
      - keycloak-network

volumes:
  postgres_data:

networks:
  keycloak-network:
    driver: bridge
EOF

# Create .env file
cat > .env << 'ENV'
POSTGRES_PASSWORD=ChangeThisSecurePassword123!
KEYCLOAK_ADMIN_PASSWORD=AdminPassword123!SecureChangeMe
KEYCLOAK_HOSTNAME=__DROPLET_IP__
ENV

# Start services
docker-compose up -d

echo "Waiting for Keycloak to start..."
sleep 45

echo "Keycloak deployment complete!"
docker-compose ps

DEPLOY_SCRIPT

# Replace placeholder IP
sed -i "s/__DROPLET_IP__/${DROPLET_IP}/g" /tmp/keycloak-setup.sh

# Copy and execute deployment script
echo -e "${YELLOW}Deploying Keycloak to droplet...${NC}"
scp -o StrictHostKeyChecking=no /tmp/keycloak-setup.sh root@${DROPLET_IP}:/tmp/
ssh -o StrictHostKeyChecking=no root@${DROPLET_IP} "bash /tmp/keycloak-setup.sh"

echo -e "${GREEN}✓ Keycloak deployed${NC}"
echo ""

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
ssh root@${DROPLET_IP} << 'FIREWALL'
ufw allow 22/tcp
ufw allow 8080/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
FIREWALL

echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""

# Run Keycloak configuration
echo -e "${YELLOW}Configuring Keycloak realm...${NC}"
sleep 30  # Wait for Keycloak to fully start

export KEYCLOAK_URL="http://${DROPLET_IP}:8080"
./scripts/configure-keycloak.sh

echo ""
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Keycloak Production Deployment Complete!${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""
echo -e "${YELLOW}Access Information:${NC}"
echo -e "  Admin Console: http://${DROPLET_IP}:8080/admin"
echo -e "  User Account: http://${DROPLET_IP}:8080/realms/telecheck/account"
echo -e "  Admin Username: admin"
echo -e "  Admin Password: AdminPassword123!SecureChangeMe"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Change the admin password immediately!"
echo -e "  2. Set up SSL with Let's Encrypt (see docs/KEYCLOAK_SETUP.md)"
echo -e "  3. Point your domain to: ${DROPLET_IP}"
echo -e "  4. Update .env.production with:"
echo -e "     KEYCLOAK_AUTH_SERVER_URL=http://${DROPLET_IP}:8080"
echo ""
echo -e "${YELLOW}Test Users Created:${NC}"
echo -e "  test.patient@example.com / TestPatient123!"
echo -e "  test.provider@example.com / TestProvider123!"
echo -e "  test.admin@example.com / TestAdmin123!"
echo ""
echo -e "${RED}IMPORTANT SECURITY:${NC}"
echo -e "  - Change admin password NOW"
echo -e "  - Set up SSL/HTTPS before going to production"
echo -e "  - Update database password in /opt/keycloak/.env on droplet"
echo ""

# Save deployment info
cat > KEYCLOAK_DEPLOYMENT_INFO.txt << INFO
Keycloak Production Deployment
===============================

Droplet ID: ${DROPLET_ID}
Droplet IP: ${DROPLET_IP}
Region: ${DROPLET_REGION}
Size: ${DROPLET_SIZE}

Admin Console: http://${DROPLET_IP}:8080/admin
User Account: http://${DROPLET_IP}:8080/realms/telecheck/account

Admin Credentials:
  Username: admin
  Password: AdminPassword123!SecureChangeMe (CHANGE THIS!)

SSH Access:
  ssh root@${DROPLET_IP}

Docker Compose Location:
  /opt/keycloak/docker-compose.yml

Logs:
  ssh root@${DROPLET_IP}
  cd /opt/keycloak
  docker-compose logs -f keycloak

Generated: $(date)
INFO

echo -e "${GREEN}Deployment info saved to: KEYCLOAK_DEPLOYMENT_INFO.txt${NC}"
echo ""
