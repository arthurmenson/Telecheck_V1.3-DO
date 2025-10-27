#!/bin/bash
set -e

KEYCLOAK_URL="http://localhost:8080"
REALM="telecheck"
ADMIN_USER="admin"
ADMIN_PASSWORD="TeleCheckAdmin2025!"

echo "============================================"
echo "Keycloak Service Account Permission Setup"
echo "============================================"
echo ""

# Step 1: Get admin token
echo "Step 1: Obtaining admin access token..."
ADMIN_TOKEN_RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASSWORD" \
  -d 'grant_type=password' \
  -d 'client_id=admin-cli')

ADMIN_TOKEN=$(echo $ADMIN_TOKEN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Failed to obtain admin token"
  echo "Response: $ADMIN_TOKEN_RESPONSE"
  exit 1
fi

echo "✅ Admin token obtained"
echo ""

# Step 2: Get telecheck-api client
echo "Step 2: Finding telecheck-api client..."
CLIENTS_RESPONSE=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

TELECHECK_CLIENT=$(echo $CLIENTS_RESPONSE | grep -o '"id":"[^"]*","clientId":"telecheck-api"' | head -1 | cut -d'"' -f4)

if [ -z "$TELECHECK_CLIENT" ]; then
  echo "❌ Failed to find telecheck-api client"
  echo "Trying alternative method..."
  # Alternative: parse JSON properly
  TELECHECK_CLIENT=$(echo "$CLIENTS_RESPONSE" | python3 -c "import sys, json; clients = json.load(sys.stdin); print([c['id'] for c in clients if c['clientId'] == 'telecheck-api'][0])" 2>/dev/null || echo "")
fi

if [ -z "$TELECHECK_CLIENT" ]; then
  echo "❌ Still failed. Let me list all clients:"
  echo "$CLIENTS_RESPONSE" | python3 -m json.tool 2>/dev/null | grep -A2 '"clientId"'
  exit 1
fi

echo "✅ Found telecheck-api client: $TELECHECK_CLIENT"
echo ""

# Step 3: Get service account user
echo "Step 3: Getting service account user ID..."
SERVICE_ACCOUNT=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/clients/$TELECHECK_CLIENT/service-account-user" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

SERVICE_ACCOUNT_ID=$(echo $SERVICE_ACCOUNT | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$SERVICE_ACCOUNT_ID" ]; then
  echo "❌ Failed to get service account user"
  echo "Response: $SERVICE_ACCOUNT"
  exit 1
fi

echo "✅ Service account user ID: $SERVICE_ACCOUNT_ID"
echo ""

# Step 4: Get realm-management client
echo "Step 4: Finding realm-management client..."
REALM_MGMT_CLIENT=$(echo $CLIENTS_RESPONSE | python3 -c "import sys, json; clients = json.loads('''$CLIENTS_RESPONSE'''); print([c['id'] for c in clients if c['clientId'] == 'realm-management'][0])" 2>/dev/null || echo "")

if [ -z "$REALM_MGMT_CLIENT" ]; then
  echo "⚠️  Python parsing failed, trying grep method..."
  REALM_MGMT_CLIENT=$(echo "$CLIENTS_RESPONSE" | grep -B5 '"clientId":"realm-management"' | grep '"id"' | head -1 | cut -d'"' -f4)
fi

if [ -z "$REALM_MGMT_CLIENT" ]; then
  echo "❌ Failed to find realm-management client"
  exit 1
fi

echo "✅ Found realm-management client: $REALM_MGMT_CLIENT"
echo ""

# Step 5: Get roles
echo "Step 5: Getting realm-management roles..."
ROLES_RESPONSE=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/clients/$REALM_MGMT_CLIENT/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

# Parse roles
MANAGE_USERS_ROLE=$(echo "$ROLES_RESPONSE" | python3 -c "import sys, json; roles = json.load(sys.stdin); role = [r for r in roles if r['name'] == 'manage-users'][0]; print(json.dumps(role))" 2>/dev/null || echo "")
VIEW_USERS_ROLE=$(echo "$ROLES_RESPONSE" | python3 -c "import sys, json; roles = json.load(sys.stdin); role = [r for r in roles if r['name'] == 'view-users'][0]; print(json.dumps(role))" 2>/dev/null || echo "")
QUERY_USERS_ROLE=$(echo "$ROLES_RESPONSE" | python3 -c "import sys, json; roles = json.load(sys.stdin); role = [r for r in roles if r['name'] == 'query-users'][0]; print(json.dumps(role))" 2>/dev/null || echo "")

if [ -z "$MANAGE_USERS_ROLE" ] || [ -z "$VIEW_USERS_ROLE" ]; then
  echo "❌ Failed to get required roles"
  exit 1
fi

echo "✅ Retrieved required roles"
echo ""

# Step 6: Assign roles
echo "Step 6: Assigning roles to service account..."
ROLES_PAYLOAD="[$MANAGE_USERS_ROLE"
[ ! -z "$VIEW_USERS_ROLE" ] && ROLES_PAYLOAD="$ROLES_PAYLOAD,$VIEW_USERS_ROLE"
[ ! -z "$QUERY_USERS_ROLE" ] && ROLES_PAYLOAD="$ROLES_PAYLOAD,$QUERY_USERS_ROLE"
ROLES_PAYLOAD="$ROLES_PAYLOAD]"

ASSIGN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  "$KEYCLOAK_URL/admin/realms/$REALM/users/$SERVICE_ACCOUNT_ID/role-mappings/clients/$REALM_MGMT_CLIENT" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ROLES_PAYLOAD")

HTTP_STATUS=$(echo "$ASSIGN_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

if [ "$HTTP_STATUS" = "204" ] || [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Roles assigned successfully!"
else
  echo "⚠️  Assignment response: $ASSIGN_RESPONSE"
  echo "Continuing anyway..."
fi

echo ""

# Step 7: Verify roles
echo "Step 7: Verifying assigned roles..."
VERIFY_RESPONSE=$(curl -s -X GET \
  "$KEYCLOAK_URL/admin/realms/$REALM/users/$SERVICE_ACCOUNT_ID/role-mappings/clients/$REALM_MGMT_CLIENT" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Assigned roles:"
echo "$VERIFY_RESPONSE" | python3 -c "import sys, json; roles = json.load(sys.stdin); [print(f\"  - {r['name']}\") for r in roles]" 2>/dev/null || echo "$VERIFY_RESPONSE"

echo ""
echo "============================================"
echo "Running User Migration"
echo "============================================"
echo ""

# Change to migration directory
cd /root/telecheck-migration

# Pull latest changes
echo "Updating repository..."
git pull

# Set environment variables and run migration
echo ""
echo "Starting migration..."
DATABASE_URL="postgresql://doadmin:AVNS_n0t8AkJ6dOrPVyh2Lnd@telecheck-postgres-cluster-do-user-24735686-0.d.db.ondigitalocean.com:25060/telecheck?sslmode=require" \
ENABLE_KEYCLOAK_NATIVE_AUTH=true \
KEYCLOAK_REALM=telecheck \
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080 \
KEYCLOAK_ADMIN_CLIENT_ID=telecheck-api \
KEYCLOAK_ADMIN_CLIENT_SECRET=telecheck-api-secret-production-2025 \
NODE_ENV=production \
npx tsx scripts/migrate-users-to-keycloak.ts

echo ""
echo "============================================"
echo "✅ COMPLETE!"
echo "============================================"
