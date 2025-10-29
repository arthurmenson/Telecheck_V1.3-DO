#!/bin/bash

# Get admin token
TOKEN=$(curl -s -X POST 'http://localhost:8080/realms/master/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=admin' \
  -d 'password=AdminPassword123!SecureChangeMe' \
  -d 'grant_type=password' \
  -d 'client_id=admin-cli' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# Get telecheck-web client and check redirect URIs
curl -s -X GET "http://localhost:8080/admin/realms/telecheck/clients" \
  -H "Authorization: Bearer $TOKEN" | grep -A 50 '"clientId":"telecheck-web"' | head -60
