#!/bin/bash
set -e

OLD_SERVER="143.244.152.52"
NEW_SERVER="198.211.110.151"
NEW_SERVER_URL="https://auth.telecheck.health"
REALM="telecheck"
ADMIN_USER="admin"
ADMIN_PASSWORD="TeleCheckAdmin2025!"

echo "============================================"
echo "Migrating Keycloak Configuration"
echo "From: $OLD_SERVER to $NEW_SERVER"
echo "============================================"
echo ""

# Step 1: Configure the new server with the same realm setup
echo "Step 1: Setting up realm on new server..."

# We'll recreate the configuration rather than export/import since we have all the details

echo "Creating realm configuration script..."
cat > /tmp/setup-new-keycloak.sh << 'SCRIPT_END'
#!/bin/bash

KEYCLOAK_URL="http://localhost:8080"
REALM="telecheck"
ADMIN_USER="admin"
ADMIN_PASSWORD="AdminPassword123!SecureChangeMe"

# Get admin token
echo "Obtaining admin token..."
ADMIN_TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASSWORD" \
  -d 'grant_type=password' \
  -d 'client_id=admin-cli' | jq -r '.access_token')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo "❌ Failed to obtain admin token"
  exit 1
fi

echo "✅ Admin token obtained"

# Check if realm exists
REALM_EXISTS=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -w "%{http_code}" -o /dev/null)

if [ "$REALM_EXISTS" = "200" ]; then
  echo "⚠️  Realm '$REALM' already exists. Deleting and recreating..."
  curl -s -X DELETE "$KEYCLOAK_URL/admin/realms/$REALM" \
    -H "Authorization: Bearer $ADMIN_TOKEN"
  echo "✅ Old realm deleted"
fi

# Create realm
echo "Creating realm '$REALM'..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "telecheck",
    "enabled": true,
    "displayName": "Telecheck Healthcare Platform",
    "accessTokenLifespan": 900,
    "ssoSessionIdleTimeout": 1800,
    "ssoSessionMaxLifespan": 36000,
    "passwordPolicy": "length(12) and upperCase(1) and lowerCase(1) and digits(1) and specialChars(1) and notUsername and passwordHistory(10)",
    "bruteForceProtected": true,
    "failureFactor": 5,
    "permanentLockout": false,
    "maxFailureWaitSeconds": 900,
    "minimumQuickLoginWaitSeconds": 60,
    "waitIncrementSeconds": 60,
    "quickLoginCheckMilliSeconds": 1000,
    "maxDeltaTimeSeconds": 43200
  }'

echo "✅ Realm created"

# Get new admin token for the telecheck realm
ADMIN_TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASSWORD" \
  -d 'grant_type=password' \
  -d 'client_id=admin-cli' | jq -r '.access_token')

# Create roles
echo "Creating roles..."
for role in PATIENT DOCTOR PROVIDER NURSE FIELD_NURSE PHARMACIST CAREGIVER ADMIN; do
  curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/roles" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$role\"}"
  echo "  ✓ Created role: $role"
done

# Create telecheck-web client (public)
echo "Creating telecheck-web client..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "telecheck-web",
    "enabled": true,
    "publicClient": true,
    "protocol": "openid-connect",
    "redirectUris": [
      "https://whale-app-bs3xa.ondigitalocean.app/*",
      "http://localhost:5173/*",
      "http://localhost:3000/*"
    ],
    "webOrigins": [
      "https://whale-app-bs3xa.ondigitalocean.app",
      "http://localhost:5173",
      "http://localhost:3000"
    ],
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false,
    "directAccessGrantsEnabled": true,
    "attributes": {
      "pkce.code.challenge.method": "S256"
    }
  }'

echo "✅ telecheck-web client created"

# Create telecheck-api client (confidential with service account)
echo "Creating telecheck-api client..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "telecheck-api",
    "enabled": true,
    "publicClient": false,
    "protocol": "openid-connect",
    "secret": "telecheck-api-secret-production-2025",
    "serviceAccountsEnabled": true,
    "directAccessGrantsEnabled": true,
    "standardFlowEnabled": true,
    "redirectUris": ["*"],
    "webOrigins": ["*"]
  }'

echo "✅ telecheck-api client created"

# Get service account and assign permissions
echo "Setting up service account permissions..."
sleep 2

# Get client ID
TELECHECK_CLIENT=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[] | select(.clientId=="telecheck-api") | .id')

# Get service account user
SERVICE_ACCOUNT_ID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/clients/$TELECHECK_CLIENT/service-account-user" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.id')

# Get realm-management client
REALM_MGMT_CLIENT=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[] | select(.clientId=="realm-management") | .id')

# Get roles and assign
MANAGE_USERS=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/clients/$REALM_MGMT_CLIENT/roles/manage-users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
VIEW_USERS=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/clients/$REALM_MGMT_CLIENT/roles/view-users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
QUERY_USERS=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/clients/$REALM_MGMT_CLIENT/roles/query-users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users/$SERVICE_ACCOUNT_ID/role-mappings/clients/$REALM_MGMT_CLIENT" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "[$MANAGE_USERS,$VIEW_USERS,$QUERY_USERS]"

echo "✅ Service account permissions granted"

# Create test users
echo "Creating test users..."

# Test Patient
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test.patient@telecheck.com",
    "email": "test.patient@telecheck.com",
    "firstName": "Test",
    "lastName": "Patient",
    "enabled": true,
    "emailVerified": true,
    "credentials": [{"type": "password", "value": "TestPatient123!", "temporary": false}]
  }'

PATIENT_ID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/users?email=test.patient@telecheck.com" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[0].id')
PATIENT_ROLE=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/roles/PATIENT" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users/$PATIENT_ID/role-mappings/realm" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "[$PATIENT_ROLE]"

echo "  ✓ Created test.patient@telecheck.com"

# Test Doctor
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test.doctor@telecheck.com",
    "email": "test.doctor@telecheck.com",
    "firstName": "Test",
    "lastName": "Doctor",
    "enabled": true,
    "emailVerified": true,
    "credentials": [{"type": "password", "value": "TestDoctor123!", "temporary": false}]
  }'

DOCTOR_ID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/users?email=test.doctor@telecheck.com" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[0].id')
DOCTOR_ROLE=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/roles/DOCTOR" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users/$DOCTOR_ID/role-mappings/realm" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "[$DOCTOR_ROLE]"

echo "  ✓ Created test.doctor@telecheck.com"

# Test Admin
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test.admin@telecheck.com",
    "email": "test.admin@telecheck.com",
    "firstName": "Test",
    "lastName": "Admin",
    "enabled": true,
    "emailVerified": true,
    "credentials": [{"type": "password", "value": "TestAdmin123!", "temporary": false}]
  }'

ADMIN_ID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/users?email=test.admin@telecheck.com" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[0].id')
ADMIN_ROLE=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/roles/ADMIN" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users/$ADMIN_ID/role-mappings/realm" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "[$ADMIN_ROLE]"

echo "  ✓ Created test.admin@telecheck.com"

echo ""
echo "============================================"
echo "✅ Realm configuration complete!"
echo "============================================"
SCRIPT_END

chmod +x /tmp/setup-new-keycloak.sh

echo "Uploading configuration script to new server..."
scp /tmp/setup-new-keycloak.sh root@$NEW_SERVER:/tmp/

echo "Executing configuration on new server..."
ssh root@$NEW_SERVER "bash /tmp/setup-new-keycloak.sh"

echo ""
echo "============================================"
echo "✅ Migration Complete!"
echo "============================================"
echo ""
echo "New Keycloak URL: $NEW_SERVER_URL"
echo "Admin Console: $NEW_SERVER_URL/admin"
echo "Realm: $REALM"
echo ""
