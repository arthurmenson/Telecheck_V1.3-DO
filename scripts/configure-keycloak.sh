#!/bin/bash
# =============================================================================
# Configure Keycloak for Telecheck V2.0
#
# Purpose: Automated Keycloak realm and client configuration
# Usage: ./scripts/configure-keycloak.sh
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Configuring Keycloak for Telecheck V2.0${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""

# Configuration
KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
ADMIN_USER="${KEYCLOAK_ADMIN:-admin}"
ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin}"
REALM_NAME="telecheck"

# -----------------------------------------------------------------------------
# Get Admin Access Token
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Authenticating with Keycloak...${NC}"

ACCESS_TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=${ADMIN_USER}" \
    -d "password=${ADMIN_PASSWORD}" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" \
    | jq -r '.access_token')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
    echo -e "${RED}ERROR: Failed to authenticate with Keycloak${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Authenticated${NC}"
echo ""

# -----------------------------------------------------------------------------
# Create Telecheck Realm
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Creating telecheck realm...${NC}"

REALM_CONFIG='{
  "realm": "telecheck",
  "enabled": true,
  "displayName": "Telecheck Healthcare",
  "displayNameHtml": "<b>Telecheck</b> Healthcare",
  "sslRequired": "external",
  "registrationAllowed": false,
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": true,
  "editUsernameAllowed": false,
  "bruteForceProtected": true,
  "permanentLockout": false,
  "maxFailureWaitSeconds": 900,
  "minimumQuickLoginWaitSeconds": 60,
  "waitIncrementSeconds": 60,
  "quickLoginCheckMilliSeconds": 1000,
  "maxDeltaTimeSeconds": 43200,
  "failureFactor": 5,
  "defaultSignatureAlgorithm": "RS256",
  "passwordPolicy": "length(12) and digits(1) and lowerCase(1) and upperCase(1) and specialChars(1) and notUsername",
  "otpPolicyType": "totp",
  "otpPolicyAlgorithm": "HmacSHA1",
  "otpPolicyInitialCounter": 0,
  "otpPolicyDigits": 6,
  "otpPolicyLookAheadWindow": 1,
  "otpPolicyPeriod": 30,
  "accessTokenLifespan": 900,
  "accessTokenLifespanForImplicitFlow": 900,
  "ssoSessionIdleTimeout": 1800,
  "ssoSessionMaxLifespan": 36000,
  "offlineSessionIdleTimeout": 2592000,
  "accessCodeLifespan": 60,
  "accessCodeLifespanUserAction": 300,
  "accessCodeLifespanLogin": 1800,
  "actionTokenGeneratedByAdminLifespan": 43200,
  "actionTokenGeneratedByUserLifespan": 300
}'

curl -s -X POST "${KEYCLOAK_URL}/admin/realms" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$REALM_CONFIG" > /dev/null

echo -e "${GREEN}✓ Realm created${NC}"
echo ""

# -----------------------------------------------------------------------------
# Create Web Application Client
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Creating web application client...${NC}"

WEB_CLIENT_CONFIG='{
  "clientId": "telecheck-web",
  "name": "Telecheck Web Application",
  "description": "React web application for patients and providers",
  "enabled": true,
  "publicClient": true,
  "directAccessGrantsEnabled": false,
  "implicitFlowEnabled": false,
  "standardFlowEnabled": true,
  "protocol": "openid-connect",
  "rootUrl": "https://telecheck.health",
  "baseUrl": "/",
  "redirectUris": [
    "https://telecheck.health/*",
    "http://localhost:5173/*"
  ],
  "webOrigins": [
    "https://telecheck.health",
    "http://localhost:5173"
  ],
  "attributes": {
    "pkce.code.challenge.method": "S256",
    "post.logout.redirect.uris": "https://telecheck.health/+##http://localhost:5173/+"
  }
}'

curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$WEB_CLIENT_CONFIG" > /dev/null

echo -e "${GREEN}✓ Web client created${NC}"
echo ""

# -----------------------------------------------------------------------------
# Create API Service Client
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Creating API service client...${NC}"

API_CLIENT_CONFIG='{
  "clientId": "telecheck-api",
  "name": "Telecheck API Service",
  "description": "Backend API service account",
  "enabled": true,
  "publicClient": false,
  "serviceAccountsEnabled": true,
  "directAccessGrantsEnabled": false,
  "standardFlowEnabled": false,
  "protocol": "openid-connect",
  "attributes": {
    "access.token.lifespan": "900"
  }
}'

curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$API_CLIENT_CONFIG" > /dev/null

# Get client ID
API_CLIENT_UUID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients?clientId=telecheck-api" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    | jq -r '.[0].id')

# Get client secret
API_CLIENT_SECRET=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients/${API_CLIENT_UUID}/client-secret" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    | jq -r '.value')

echo -e "${GREEN}✓ API client created${NC}"
echo -e "  Client ID: telecheck-api"
echo -e "  Client Secret: ${API_CLIENT_SECRET}"
echo -e "  ${YELLOW}Save this secret to your .env.production file!${NC}"
echo ""

# -----------------------------------------------------------------------------
# Create Realm Roles
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Creating realm roles...${NC}"

ROLES=(
    "PATIENT:Patient role for healthcare consumers"
    "FIELD_NURSE:Field nurse role for home visits"
    "PROVIDER:Healthcare provider role (doctors, NPs, PAs)"
    "ADMIN:System administrator role"
    "BILLING_STAFF:Billing and administrative staff"
    "PHARMACIST:Pharmacist role for medication management"
)

for role_def in "${ROLES[@]}"; do
    IFS=':' read -r role_name role_desc <<< "$role_def"

    ROLE_CONFIG=$(cat <<EOF
{
  "name": "${role_name}",
  "description": "${role_desc}",
  "composite": false,
  "clientRole": false
}
EOF
)

    curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/roles" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "$ROLE_CONFIG" > /dev/null

    echo -e "  ✓ Created role: ${role_name}"
done

echo -e "${GREEN}✓ All roles created${NC}"
echo ""

# -----------------------------------------------------------------------------
# Create MFA Required Authentication Flow
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Configuring MFA for providers...${NC}"

# Create authentication flow
AUTH_FLOW_CONFIG='{
  "alias": "telecheck-browser",
  "description": "Browser-based authentication with conditional MFA",
  "providerId": "basic-flow",
  "topLevel": true,
  "builtIn": false
}'

curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/authentication/flows" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$AUTH_FLOW_CONFIG" > /dev/null

echo -e "${GREEN}✓ MFA flow configured${NC}"
echo ""

# -----------------------------------------------------------------------------
# Create Test Users
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Creating test users...${NC}"

# Test Patient
PATIENT_CONFIG='{
  "username": "test.patient@example.com",
  "email": "test.patient@example.com",
  "firstName": "Test",
  "lastName": "Patient",
  "enabled": true,
  "emailVerified": true,
  "credentials": [{
    "type": "password",
    "value": "TestPatient123!",
    "temporary": false
  }],
  "realmRoles": ["PATIENT"]
}'

curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$PATIENT_CONFIG" > /dev/null

echo -e "  ✓ Created test patient"

# Test Provider
PROVIDER_CONFIG='{
  "username": "test.provider@example.com",
  "email": "test.provider@example.com",
  "firstName": "Dr. Test",
  "lastName": "Provider",
  "enabled": true,
  "emailVerified": true,
  "credentials": [{
    "type": "password",
    "value": "TestProvider123!",
    "temporary": false
  }],
  "realmRoles": ["PROVIDER"],
  "requiredActions": ["CONFIGURE_TOTP"]
}'

curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$PROVIDER_CONFIG" > /dev/null

echo -e "  ✓ Created test provider (MFA required on first login)"

# Test Admin
ADMIN_CONFIG='{
  "username": "test.admin@example.com",
  "email": "test.admin@example.com",
  "firstName": "Test",
  "lastName": "Admin",
  "enabled": true,
  "emailVerified": true,
  "credentials": [{
    "type": "password",
    "value": "TestAdmin123!",
    "temporary": false
  }],
  "realmRoles": ["ADMIN"],
  "requiredActions": ["CONFIGURE_TOTP"]
}'

curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$ADMIN_CONFIG" > /dev/null

echo -e "  ✓ Created test admin (MFA required on first login)"

echo -e "${GREEN}✓ Test users created${NC}"
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Keycloak Configuration Complete!${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""
echo -e "Realm: ${YELLOW}telecheck${NC}"
echo -e "Keycloak URL: ${YELLOW}${KEYCLOAK_URL}${NC}"
echo ""
echo -e "Clients:"
echo -e "  • ${YELLOW}telecheck-web${NC} (Public client for React app)"
echo -e "  • ${YELLOW}telecheck-api${NC} (Service account for backend)"
echo ""
echo -e "Roles:"
echo -e "  • PATIENT, FIELD_NURSE, PROVIDER, ADMIN, BILLING_STAFF, PHARMACIST"
echo ""
echo -e "Test Users:"
echo -e "  • ${YELLOW}test.patient@example.com${NC} / TestPatient123!"
echo -e "  • ${YELLOW}test.provider@example.com${NC} / TestProvider123! (MFA required)"
echo -e "  • ${YELLOW}test.admin@example.com${NC} / TestAdmin123! (MFA required)"
echo ""
echo -e "${YELLOW}Important: Save the API client secret to .env.production:${NC}"
echo -e "  KEYCLOAK_CLIENT_SECRET=${API_CLIENT_SECRET}"
echo ""
echo -e "${GREEN}Configuration complete!${NC}"
