#!/bin/bash
# Automated Keycloak Realm Configuration Script
# This script configures the Telecheck realm with all necessary settings

set -e

# Configuration
KEYCLOAK_URL=${KEYCLOAK_URL:-"http://143.244.152.52:8080"}
ADMIN_USER=${KEYCLOAK_ADMIN:-"admin"}
ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD:-"TeleCheckAdmin2025!"}
REALM_NAME="telecheck"

echo "=================================="
echo "Keycloak Realm Configuration"
echo "=================================="
echo "Server: $KEYCLOAK_URL"
echo "Realm: $REALM_NAME"
echo ""

# Wait for Keycloak to be ready
echo "⏳ Waiting for Keycloak to be ready..."
until curl -sf "$KEYCLOAK_URL/health/ready" > /dev/null 2>&1; do
  echo "   Waiting for Keycloak..."
  sleep 5
done
echo "✅ Keycloak is ready!"
echo ""

# Get admin token
echo "🔐 Authenticating as admin..."
TOKEN=$(curl -sf -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASSWORD" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Failed to authenticate. Check your credentials."
  exit 1
fi
echo "✅ Authenticated successfully!"
echo ""

# Create Telecheck realm
echo "🏗️  Creating Telecheck realm..."
curl -sf -X POST "$KEYCLOAK_URL/admin/realms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "'$REALM_NAME'",
    "enabled": true,
    "displayName": "Telecheck Healthcare",
    "registrationAllowed": true,
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "resetPasswordAllowed": true,
    "editUsernameAllowed": false,
    "bruteForceProtected": true,
    "permanentLockout": false,
    "maxFailureWaitSeconds": 900,
    "failureFactor": 5,
    "passwordPolicy": "length(12) and upperCase(1) and lowerCase(1) and digits(1) and specialChars(1) and notUsername and passwordHistory(10)",
    "sslRequired": "external",
    "accessTokenLifespan": 900,
    "ssoSessionIdleTimeout": 1800,
    "ssoSessionMaxLifespan": 36000
  }' 2>/dev/null || echo "   Realm may already exist"
echo "✅ Realm created/verified!"
echo ""

# Create roles
echo "👥 Creating roles..."
for ROLE in PATIENT DOCTOR PROVIDER NURSE FIELD_NURSE PHARMACIST CAREGIVER ADMIN; do
  echo "   Creating role: $ROLE"
  curl -sf -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "'$ROLE'",
      "description": "Role for '$ROLE'"
    }' 2>/dev/null || echo "   Role $ROLE may already exist"
done
echo "✅ Roles created!"
echo ""

# Create telecheck-web client (Public client)
echo "🌐 Creating telecheck-web client..."
curl -sf -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "telecheck-web",
    "name": "Telecheck Web Application",
    "enabled": true,
    "publicClient": true,
    "standardFlowEnabled": true,
    "directAccessGrantsEnabled": true,
    "serviceAccountsEnabled": false,
    "protocol": "openid-connect",
    "redirectUris": [
      "https://whale-app-bs3xa.ondigitalocean.app/*",
      "http://localhost:8080/*",
      "http://localhost:5173/*"
    ],
    "webOrigins": ["+"],
    "attributes": {
      "pkce.code.challenge.method": "S256"
    }
  }' 2>/dev/null || echo "   Client may already exist"
echo "✅ telecheck-web client created!"
echo ""

# Create telecheck-api client (Confidential client)
echo "🔒 Creating telecheck-api client..."
API_CLIENT_RESPONSE=$(curl -sf -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "telecheck-api",
    "name": "Telecheck API Service",
    "enabled": true,
    "publicClient": false,
    "standardFlowEnabled": false,
    "directAccessGrantsEnabled": false,
    "serviceAccountsEnabled": true,
    "protocol": "openid-connect",
    "secret": "telecheck-api-secret-'$(date +%s)'",
    "attributes": {
      "access.token.lifespan": "900"
    }
  }' 2>/dev/null)

# Get the API client secret
echo "🔑 Retrieving telecheck-api client secret..."
API_CLIENT_ID=$(curl -sf "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients?clientId=telecheck-api" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

if [ ! -z "$API_CLIENT_ID" ] && [ "$API_CLIENT_ID" != "null" ]; then
  API_SECRET=$(curl -sf "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients/$API_CLIENT_ID/client-secret" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.value')

  echo "✅ telecheck-api client created!"
  echo ""
  echo "📋 IMPORTANT - Save this client secret:"
  echo "   KEYCLOAK_ADMIN_CLIENT_SECRET=$API_SECRET"
  echo ""
fi

# Create test users
echo "👤 Creating test users..."

# Test Patient
curl -sf -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test.patient@telecheck.com",
    "email": "test.patient@telecheck.com",
    "firstName": "Test",
    "lastName": "Patient",
    "enabled": true,
    "emailVerified": true,
    "credentials": [{
      "type": "password",
      "value": "TestPatient123!",
      "temporary": false
    }]
  }' 2>/dev/null || echo "   test.patient may already exist"

# Get patient user ID and assign role
PATIENT_ID=$(curl -sf "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users?username=test.patient@telecheck.com" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

if [ ! -z "$PATIENT_ID" ] && [ "$PATIENT_ID" != "null" ]; then
  PATIENT_ROLE_ID=$(curl -sf "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles/PATIENT" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.id')

  curl -sf -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users/$PATIENT_ID/role-mappings/realm" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '[{
      "id": "'$PATIENT_ROLE_ID'",
      "name": "PATIENT"
    }]' 2>/dev/null

  echo "✅ Test patient created: test.patient@telecheck.com / TestPatient123!"
fi

# Test Doctor
curl -sf -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test.doctor@telecheck.com",
    "email": "test.doctor@telecheck.com",
    "firstName": "Test",
    "lastName": "Doctor",
    "enabled": true,
    "emailVerified": true,
    "credentials": [{
      "type": "password",
      "value": "TestDoctor123!",
      "temporary": false
    }]
  }' 2>/dev/null || echo "   test.doctor may already exist"

# Get doctor user ID and assign role
DOCTOR_ID=$(curl -sf "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users?username=test.doctor@telecheck.com" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

if [ ! -z "$DOCTOR_ID" ] && [ "$DOCTOR_ID" != "null" ]; then
  DOCTOR_ROLE_ID=$(curl -sf "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles/DOCTOR" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.id')

  curl -sf -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users/$DOCTOR_ID/role-mappings/realm" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '[{
      "id": "'$DOCTOR_ROLE_ID'",
      "name": "DOCTOR"
    }]' 2>/dev/null

  echo "✅ Test doctor created: test.doctor@telecheck.com / TestDoctor123!"
fi

# Test Admin
curl -sf -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test.admin@telecheck.com",
    "email": "test.admin@telecheck.com",
    "firstName": "Test",
    "lastName": "Admin",
    "enabled": true,
    "emailVerified": true,
    "credentials": [{
      "type": "password",
      "value": "TestAdmin123!",
      "temporary": false
    }]
  }' 2>/dev/null || echo "   test.admin may already exist"

# Get admin user ID and assign role
ADMIN_ID=$(curl -sf "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users?username=test.admin@telecheck.com" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

if [ ! -z "$ADMIN_ID" ] && [ "$ADMIN_ID" != "null" ]; then
  ADMIN_ROLE_ID=$(curl -sf "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles/ADMIN" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.id')

  curl -sf -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users/$ADMIN_ID/role-mappings/realm" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '[{
      "id": "'$ADMIN_ROLE_ID'",
      "name": "ADMIN"
    }]' 2>/dev/null

  echo "✅ Test admin created: test.admin@telecheck.com / TestAdmin123!"
fi

echo ""
echo "=================================="
echo "✅ Keycloak Configuration Complete!"
echo "=================================="
echo ""
echo "📋 Configuration Summary:"
echo "   Realm: $REALM_NAME"
echo "   Clients: telecheck-web, telecheck-api"
echo "   Roles: PATIENT, DOCTOR, PROVIDER, NURSE, FIELD_NURSE, PHARMACIST, CAREGIVER, ADMIN"
echo "   Test Users: 3 users created"
echo ""
echo "🌐 Access URLs:"
echo "   Admin Console: $KEYCLOAK_URL/admin"
echo "   User Account: $KEYCLOAK_URL/realms/$REALM_NAME/account"
echo ""
echo "🔑 Test Credentials:"
echo "   Patient: test.patient@telecheck.com / TestPatient123!"
echo "   Doctor:  test.doctor@telecheck.com / TestDoctor123!"
echo "   Admin:   test.admin@telecheck.com / TestAdmin123!"
echo ""
if [ ! -z "$API_SECRET" ]; then
  echo "⚠️  SAVE THIS SECRET:"
  echo "   KEYCLOAK_ADMIN_CLIENT_SECRET=$API_SECRET"
  echo ""
fi
echo "✅ Ready for application integration!"
