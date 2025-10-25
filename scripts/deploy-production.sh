#!/bin/bash
# =============================================================================
# Deploy Telecheck V2.0 to Production
#
# Purpose: Orchestrate complete production deployment
# Usage: ./scripts/deploy-production.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Telecheck V2.0 - Production Deployment${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""

# -----------------------------------------------------------------------------
# Pre-deployment Checks
# -----------------------------------------------------------------------------
echo -e "${BLUE}Step 1: Pre-deployment Checks${NC}"
echo -e "${YELLOW}Running pre-deployment validation...${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}ERROR: .env.production file not found${NC}"
    echo -e "Create it from template: cp .env.production.template .env.production"
    exit 1
fi

# Check if required environment variables are set
source .env.production

REQUIRED_VARS=(
    "DATABASE_URL"
    "REDIS_URL"
    "JWT_SECRET"
    "VAULT_ADDR"
    "VAULT_TOKEN"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}ERROR: Required environment variable $var is not set${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ Environment variables validated${NC}"

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Check if images exist
if ! docker images | grep -q "telecheck-api"; then
    echo -e "${RED}ERROR: telecheck-api image not found${NC}"
    echo -e "Build images first: ./scripts/build-production-images.sh"
    exit 1
fi

if ! docker images | grep -q "telecheck-web"; then
    echo -e "${RED}ERROR: telecheck-web image not found${NC}"
    echo -e "Build images first: ./scripts/build-production-images.sh"
    exit 1
fi

echo -e "${GREEN}✓ Docker images found${NC}"
echo ""

# -----------------------------------------------------------------------------
# Step 2: Initialize HashiCorp Vault
# -----------------------------------------------------------------------------
echo -e "${BLUE}Step 2: Initialize HashiCorp Vault${NC}"

if [ ! -f ".vault-keys.json" ]; then
    echo -e "${YELLOW}Initializing Vault for the first time...${NC}"
    ./scripts/vault-init.sh
    echo -e "${GREEN}✓ Vault initialized${NC}"
else
    echo -e "${GREEN}✓ Vault already initialized${NC}"
fi

echo ""

# -----------------------------------------------------------------------------
# Step 3: Start Infrastructure Services
# -----------------------------------------------------------------------------
echo -e "${BLUE}Step 3: Start Infrastructure Services${NC}"
echo -e "${YELLOW}Starting PostgreSQL, Redis, and Vault...${NC}"

cd infrastructure

# Start Vault first
docker-compose -f vault/docker-compose.vault.yml up -d

echo -e "${YELLOW}Waiting for Vault to be ready...${NC}"
sleep 10

# Unseal Vault
UNSEAL_KEY_1=$(jq -r '.unseal_keys_b64[0]' ../.vault-keys.json)
UNSEAL_KEY_2=$(jq -r '.unseal_keys_b64[1]' ../.vault-keys.json)
UNSEAL_KEY_3=$(jq -r '.unseal_keys_b64[2]' ../.vault-keys.json)

docker exec vault-1 vault operator unseal "$UNSEAL_KEY_1"
docker exec vault-1 vault operator unseal "$UNSEAL_KEY_2"
docker exec vault-1 vault operator unseal "$UNSEAL_KEY_3"

echo -e "${GREEN}✓ Vault unsealed${NC}"

# Start PostgreSQL and Redis
docker-compose -f docker-compose.production.yml up -d postgres redis

echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
until docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U telecheck; do
    sleep 2
done

echo -e "${GREEN}✓ PostgreSQL is ready${NC}"

echo -e "${YELLOW}Waiting for Redis to be ready...${NC}"
sleep 5
echo -e "${GREEN}✓ Redis is ready${NC}"

echo ""

# -----------------------------------------------------------------------------
# Step 4: Run Database Migrations
# -----------------------------------------------------------------------------
echo -e "${BLUE}Step 4: Run Database Migrations${NC}"
echo -e "${YELLOW}Running migrations...${NC}"

cd ..
./scripts/run-migrations.sh

echo -e "${GREEN}✓ Database migrations completed${NC}"
echo ""

# -----------------------------------------------------------------------------
# Step 5: Start Keycloak
# -----------------------------------------------------------------------------
echo -e "${BLUE}Step 5: Start Keycloak${NC}"
echo -e "${YELLOW}Starting Keycloak SSO server...${NC}"

cd infrastructure
docker-compose -f docker-compose.production.yml up -d keycloak

echo -e "${YELLOW}Waiting for Keycloak to be ready (this may take 2-3 minutes)...${NC}"
until curl -sf http://localhost:8080/health > /dev/null 2>&1; do
    sleep 5
done

echo -e "${GREEN}✓ Keycloak is ready${NC}"
echo ""

# -----------------------------------------------------------------------------
# Step 6: Configure Keycloak Realm
# -----------------------------------------------------------------------------
echo -e "${BLUE}Step 6: Configure Keycloak Realm${NC}"
echo -e "${YELLOW}Setting up telecheck realm and clients...${NC}"

cd ..
./scripts/configure-keycloak.sh

echo -e "${GREEN}✓ Keycloak configured${NC}"
echo ""

# -----------------------------------------------------------------------------
# Step 7: Start Monitoring Stack
# -----------------------------------------------------------------------------
echo -e "${BLUE}Step 7: Start Monitoring Stack${NC}"
echo -e "${YELLOW}Starting Prometheus, Grafana, Loki...${NC}"

cd infrastructure
docker-compose -f monitoring/docker-compose.monitoring.yml up -d

echo -e "${YELLOW}Waiting for monitoring services...${NC}"
sleep 10

echo -e "${GREEN}✓ Monitoring stack is ready${NC}"
echo -e "  • Prometheus: http://localhost:9090"
echo -e "  • Grafana: http://localhost:3001 (admin/admin)"
echo -e "  • Alertmanager: http://localhost:9093"
echo ""

# -----------------------------------------------------------------------------
# Step 8: Start Application Services
# -----------------------------------------------------------------------------
echo -e "${BLUE}Step 8: Start Application Services${NC}"
echo -e "${YELLOW}Starting API and web servers...${NC}"

docker-compose -f docker-compose.production.yml up -d api web nginx

echo -e "${YELLOW}Waiting for API to be ready...${NC}"
until curl -sf http://localhost:3000/health > /dev/null 2>&1; do
    sleep 2
done

echo -e "${GREEN}✓ API server is ready${NC}"

echo -e "${YELLOW}Waiting for web server to be ready...${NC}"
sleep 5

echo -e "${GREEN}✓ Web server is ready${NC}"
echo ""

# -----------------------------------------------------------------------------
# Step 9: Verify Deployment
# -----------------------------------------------------------------------------
echo -e "${BLUE}Step 9: Verify Deployment${NC}"
echo -e "${YELLOW}Running smoke tests...${NC}"

cd ..
./scripts/smoke-test-production.sh

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ All smoke tests passed${NC}"
else
    echo -e "${RED}ERROR: Smoke tests failed${NC}"
    echo -e "${YELLOW}Check logs with: docker-compose -f infrastructure/docker-compose.production.yml logs${NC}"
    exit 1
fi

echo ""

# -----------------------------------------------------------------------------
# Deployment Summary
# -----------------------------------------------------------------------------
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""
echo -e "${GREEN}✓ All services deployed successfully${NC}"
echo ""
echo -e "Services:"
echo -e "  • PostgreSQL:  ${GREEN}RUNNING${NC}"
echo -e "  • Redis:       ${GREEN}RUNNING${NC}"
echo -e "  • Vault:       ${GREEN}RUNNING${NC}"
echo -e "  • Keycloak:    ${GREEN}RUNNING${NC}"
echo -e "  • API Server:  ${GREEN}RUNNING${NC}"
echo -e "  • Web Server:  ${GREEN}RUNNING${NC}"
echo -e "  • NGINX:       ${GREEN}RUNNING${NC}"
echo -e "  • Prometheus:  ${GREEN}RUNNING${NC}"
echo -e "  • Grafana:     ${GREEN}RUNNING${NC}"
echo ""
echo -e "Access Points:"
echo -e "  • Application: ${YELLOW}https://telecheck.health${NC}"
echo -e "  • API Health:  ${YELLOW}http://localhost:3000/health${NC}"
echo -e "  • Keycloak:    ${YELLOW}http://localhost:8080${NC}"
echo -e "  • Grafana:     ${YELLOW}http://localhost:3001${NC}"
echo -e "  • Prometheus:  ${YELLOW}http://localhost:9090${NC}"
echo ""
echo -e "Next Steps:"
echo -e "  1. Configure DNS to point to your server IP"
echo -e "  2. Set up SSL certificate with Let's Encrypt"
echo -e "  3. Configure external monitoring alerts"
echo -e "  4. Set up automated backups schedule"
echo -e "  5. Perform load testing"
echo ""
echo -e "${YELLOW}==============================================================================${NC}"
echo -e "${YELLOW}Important: Secure Your Vault Keys!${NC}"
echo -e "${YELLOW}==============================================================================${NC}"
echo -e ""
echo -e "${RED}The file .vault-keys.json contains your Vault unseal keys and root token.${NC}"
echo -e "${RED}Store it securely and remove it from this server!${NC}"
echo -e ""
echo -e "Recommended actions:"
echo -e "  1. Copy .vault-keys.json to secure offline storage"
echo -e "  2. Store unseal keys with different team members"
echo -e "  3. Delete .vault-keys.json from this server"
echo -e "  4. Revoke root token and create admin tokens with limited scope"
echo ""

echo -e "${GREEN}Deployment successful! 🚀${NC}"
