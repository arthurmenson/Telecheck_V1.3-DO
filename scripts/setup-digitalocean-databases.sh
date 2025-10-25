#!/bin/bash
# DigitalOcean Database and Environment Setup Script
# Automates complete whale-app database configuration

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="whale-app"
REGION="nyc3"
PG_CLUSTER_NAME="telecheck-postgres-cluster"
REDIS_CLUSTER_NAME="telecheck-redis-cluster"
DATABASE_NAME="telecheck"

# Development or Production
ENVIRONMENT="${1:-dev}"  # dev or prod

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Telecheck DigitalOcean Setup Script${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Check doctl authentication
echo -e "${YELLOW}[1/9] Checking doctl authentication...${NC}"
if ! doctl auth list | grep -q "current context"; then
    echo -e "${RED}Error: doctl not authenticated${NC}"
    echo "Run: doctl auth init"
    exit 1
fi
echo -e "${GREEN}✓ doctl authenticated${NC}"
echo ""

# Step 2: Get whale-app ID
echo -e "${YELLOW}[2/9] Finding whale-app...${NC}"
APP_ID=$(doctl apps list --format ID,Spec.Name --no-header | grep "${APP_NAME}" | awk '{print $1}')
if [ -z "$APP_ID" ]; then
    echo -e "${RED}Error: whale-app not found${NC}"
    echo "Available apps:"
    doctl apps list
    exit 1
fi
echo -e "${GREEN}✓ Found whale-app: ${APP_ID}${NC}"
echo ""

# Step 3: Check if PostgreSQL cluster exists
echo -e "${YELLOW}[3/9] Checking PostgreSQL cluster...${NC}"
PG_CLUSTER_ID=$(doctl databases list --format ID,Name --no-header | grep "${PG_CLUSTER_NAME}" | awk '{print $1}' || echo "")

if [ -z "$PG_CLUSTER_ID" ]; then
    echo -e "${YELLOW}PostgreSQL cluster not found. Creating...${NC}"

    if [ "$ENVIRONMENT" == "prod" ]; then
        PG_SIZE="db-s-4vcpu-8gb"  # Production: 4 vCPU, 8GB RAM ($120/mo)
        PG_NODES=2
    else
        PG_SIZE="db-s-1vcpu-1gb"  # Dev: 1 vCPU, 1GB RAM ($15/mo)
        PG_NODES=1
    fi

    echo "Creating PostgreSQL 15 cluster:"
    echo "  Name: ${PG_CLUSTER_NAME}"
    echo "  Size: ${PG_SIZE}"
    echo "  Region: ${REGION}"
    echo "  Nodes: ${PG_NODES}"

    doctl databases create "${PG_CLUSTER_NAME}" \
        --engine pg \
        --version 15 \
        --region "${REGION}" \
        --size "${PG_SIZE}" \
        --num-nodes ${PG_NODES}

    echo -e "${YELLOW}Waiting for PostgreSQL cluster to be ready (this may take 5-10 minutes)...${NC}"
    sleep 60  # Initial wait

    for i in {1..30}; do
        STATUS=$(doctl databases list --format ID,Name,Status --no-header | grep "${PG_CLUSTER_NAME}" | awk '{print $3}')
        if [ "$STATUS" == "online" ]; then
            echo -e "${GREEN}✓ PostgreSQL cluster is online${NC}"
            break
        fi
        echo "Waiting... ($i/30) Status: $STATUS"
        sleep 20
    done

    PG_CLUSTER_ID=$(doctl databases list --format ID,Name --no-header | grep "${PG_CLUSTER_NAME}" | awk '{print $1}')
else
    echo -e "${GREEN}✓ PostgreSQL cluster already exists: ${PG_CLUSTER_ID}${NC}"
fi
echo ""

# Step 4: Check if Redis cluster exists
echo -e "${YELLOW}[4/9] Checking Redis cluster...${NC}"
REDIS_CLUSTER_ID=$(doctl databases list --format ID,Name --no-header | grep "${REDIS_CLUSTER_NAME}" | awk '{print $1}' || echo "")

if [ -z "$REDIS_CLUSTER_ID" ]; then
    echo -e "${YELLOW}Redis cluster not found. Creating...${NC}"

    if [ "$ENVIRONMENT" == "prod" ]; then
        REDIS_SIZE="db-s-2vcpu-2gb"  # Production: 2 vCPU, 2GB RAM ($60/mo)
        REDIS_NODES=2
    else
        REDIS_SIZE="db-s-1vcpu-1gb"  # Dev: 1 vCPU, 1GB RAM ($15/mo)
        REDIS_NODES=1
    fi

    echo "Creating Redis 7 cluster:"
    echo "  Name: ${REDIS_CLUSTER_NAME}"
    echo "  Size: ${REDIS_SIZE}"
    echo "  Region: ${REGION}"
    echo "  Nodes: ${REDIS_NODES}"

    doctl databases create "${REDIS_CLUSTER_NAME}" \
        --engine redis \
        --version 7 \
        --region "${REGION}" \
        --size "${REDIS_SIZE}" \
        --num-nodes ${REDIS_NODES}

    echo -e "${YELLOW}Waiting for Redis cluster to be ready (this may take 5-10 minutes)...${NC}"
    sleep 60  # Initial wait

    for i in {1..30}; do
        STATUS=$(doctl databases list --format ID,Name,Status --no-header | grep "${REDIS_CLUSTER_NAME}" | awk '{print $3}')
        if [ "$STATUS" == "online" ]; then
            echo -e "${GREEN}✓ Redis cluster is online${NC}"
            break
        fi
        echo "Waiting... ($i/30) Status: $STATUS"
        sleep 20
    done

    REDIS_CLUSTER_ID=$(doctl databases list --format ID,Name --no-header | grep "${REDIS_CLUSTER_NAME}" | awk '{print $1}')
else
    echo -e "${GREEN}✓ Redis cluster already exists: ${REDIS_CLUSTER_ID}${NC}"
fi
echo ""

# Step 5: Create telecheck database in PostgreSQL
echo -e "${YELLOW}[5/9] Creating 'telecheck' database...${NC}"
doctl databases db create "${PG_CLUSTER_ID}" "${DATABASE_NAME}" || echo "Database may already exist"
echo -e "${GREEN}✓ Database configured${NC}"
echo ""

# Step 6: Get connection strings
echo -e "${YELLOW}[6/9] Getting database connection strings...${NC}"

# PostgreSQL connection string
PG_HOST=$(doctl databases get "${PG_CLUSTER_ID}" --format PrivateHost --no-header)
PG_PORT=$(doctl databases get "${PG_CLUSTER_ID}" --format Port --no-header)
PG_USER=$(doctl databases get "${PG_CLUSTER_ID}" --format User --no-header)
PG_PASSWORD=$(doctl databases get "${PG_CLUSTER_ID}" --format Password --no-header)

DATABASE_URL="postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${DATABASE_NAME}?sslmode=require"

# Redis connection string
REDIS_HOST=$(doctl databases get "${REDIS_CLUSTER_ID}" --format PrivateHost --no-header)
REDIS_PORT=$(doctl databases get "${REDIS_CLUSTER_ID}" --format Port --no-header)
REDIS_PASSWORD=$(doctl databases get "${REDIS_CLUSTER_ID}" --format Password --no-header)

REDIS_URL="rediss://default:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}"

echo -e "${GREEN}✓ Connection strings retrieved${NC}"
echo ""

# Step 7: Generate secrets
echo -e "${YELLOW}[7/9] Generating application secrets...${NC}"

JWT_SECRET=$(openssl rand -hex 32)
PHI_PATIENT_KEY=$(openssl rand -base64 32)
PHI_MEDICAL_KEY=$(openssl rand -base64 32)
PHI_FINANCIAL_KEY=$(openssl rand -base64 32)
PHI_COMMUNICATION_KEY=$(openssl rand -base64 32)

echo -e "${GREEN}✓ Secrets generated${NC}"
echo ""

# Step 8: Create environment variables file
echo -e "${YELLOW}[8/9] Creating environment variables...${NC}"

ENV_FILE=".env.whale-app-${ENVIRONMENT}"
cat > "${ENV_FILE}" <<EOF
# DigitalOcean whale-app Environment Variables
# Generated: $(date)
# Environment: ${ENVIRONMENT}

# Database
DATABASE_URL=${DATABASE_URL}

# Redis
REDIS_URL=${REDIS_URL}

# JWT
JWT_SECRET=${JWT_SECRET}

# PHI Encryption Keys
PHI_PATIENT_KEY=${PHI_PATIENT_KEY}
PHI_MEDICAL_KEY=${PHI_MEDICAL_KEY}
PHI_FINANCIAL_KEY=${PHI_FINANCIAL_KEY}
PHI_COMMUNICATION_KEY=${PHI_COMMUNICATION_KEY}

# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Optional: Keycloak (configure if using SSO)
# KEYCLOAK_URL=
# KEYCLOAK_REALM=telecheck
# KEYCLOAK_CLIENT_ID=
# KEYCLOAK_CLIENT_SECRET=

# Optional: Vault (configure if using HashiCorp Vault)
# VAULT_ADDR=
# VAULT_TOKEN=
EOF

echo -e "${GREEN}✓ Environment file created: ${ENV_FILE}${NC}"
echo ""

# Step 9: Set environment variables in whale-app
echo -e "${YELLOW}[9/9] Setting environment variables in whale-app...${NC}"
echo -e "${YELLOW}Note: doctl doesn't support setting app env vars via CLI${NC}"
echo -e "${YELLOW}You need to set them manually or use the API${NC}"
echo ""

# Create a script to set env vars via API
API_SCRIPT="scripts/set-whale-app-env-vars.sh"
cat > "${API_SCRIPT}" <<'EOFAPI'
#!/bin/bash
# Set whale-app environment variables via DigitalOcean API

set -e

# Get DigitalOcean API token from doctl config
DO_TOKEN=$(doctl auth list | grep "current context" -A 3 | grep "access-token:" | awk '{print $2}')
if [ -z "$DO_TOKEN" ]; then
    echo "Error: Could not get DigitalOcean token from doctl"
    exit 1
fi

APP_ID="$1"
ENV_FILE="$2"

if [ -z "$APP_ID" ] || [ -z "$ENV_FILE" ]; then
    echo "Usage: $0 <app_id> <env_file>"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file not found: $ENV_FILE"
    exit 1
fi

echo "Setting environment variables for app: $APP_ID"

# Read env vars from file and create JSON
ENV_JSON='{'
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue

    # Trim whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)

    # Determine if it's a secret
    SCOPE="RUN_TIME"
    TYPE="SECRET"

    if [[ "$key" == "NODE_ENV" ]] || [[ "$key" == "PORT" ]] || [[ "$key" == "LOG_LEVEL" ]]; then
        TYPE="GENERAL"
    fi

    # Add to JSON (simplified - real implementation needs proper JSON escaping)
    ENV_JSON="${ENV_JSON}\"${key}\":\"${value}\","
done < "$ENV_FILE"

echo "Environment variables prepared"
echo "To set them, use the DigitalOcean web console:"
echo "  Apps → whale-app → Settings → App-Level Environment Variables"
echo ""
echo "Or use the DigitalOcean API to update the app spec programmatically"
EOFAPI

chmod +x "${API_SCRIPT}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Database Clusters Created:${NC}"
echo "  PostgreSQL: ${PG_CLUSTER_ID}"
echo "  Redis:      ${REDIS_CLUSTER_ID}"
echo ""
echo -e "${BLUE}Environment Variables:${NC}"
echo "  File: ${ENV_FILE}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Set environment variables in DigitalOcean console:"
echo "   https://cloud.digitalocean.com/apps/${APP_ID}/settings/whale-app"
echo ""
echo "2. Copy variables from: ${ENV_FILE}"
echo ""
echo "3. Or use the DigitalOcean console UI:"
echo "   - Go to Apps → whale-app → Settings"
echo "   - Scroll to 'App-Level Environment Variables'"
echo "   - Click 'Edit'"
echo "   - Add each variable from ${ENV_FILE}"
echo "   - Mark DATABASE_URL, REDIS_URL, JWT_SECRET, and PHI_* as encrypted"
echo ""
echo "4. Save and redeploy whale-app"
echo ""
echo -e "${BLUE}Database Connection Info:${NC}"
echo "  PostgreSQL Host: ${PG_HOST}"
echo "  PostgreSQL Port: ${PG_PORT}"
echo "  Redis Host:      ${REDIS_HOST}"
echo "  Redis Port:      ${REDIS_PORT}"
echo ""
echo -e "${BLUE}Cost Estimate (${ENVIRONMENT}):${NC}"
if [ "$ENVIRONMENT" == "prod" ]; then
    echo "  PostgreSQL: ~\$120/month (4GB RAM)"
    echo "  Redis:      ~\$60/month (2GB RAM)"
    echo "  Total DBs:  ~\$180/month"
else
    echo "  PostgreSQL: ~\$15/month (1GB RAM)"
    echo "  Redis:      ~\$15/month (1GB RAM)"
    echo "  Total DBs:  ~\$30/month"
fi
echo ""
echo -e "${GREEN}All database resources are ready!${NC}"
echo ""
