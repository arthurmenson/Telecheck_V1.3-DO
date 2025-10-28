#!/bin/bash

# Get admin token
TOKEN=$(curl -s -X POST 'http://localhost:8080/realms/master/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=admin' \
  -d 'password=AdminPassword123!SecureChangeMe' \
  -d 'grant_type=password' \
  -d 'client_id=admin-cli' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# Get telecheck-web client
curl -s -X GET "http://localhost:8080/admin/realms/telecheck/clients" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys, json
clients = json.load(sys.stdin)
for client in clients:
    if client.get('clientId') == 'telecheck-web':
        print('Client ID:', client.get('id'))
        print('Client Name:', client.get('clientId'))
        print('Redirect URIs:', json.dumps(client.get('redirectUris'), indent=2))
        print('Web Origins:', json.dumps(client.get('webOrigins'), indent=2))
        print('Public Client:', client.get('publicClient'))
        break
"
