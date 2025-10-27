#!/usr/bin/env python3
"""
Automated Keycloak Realm Configuration Script
Configures the Telecheck realm with all necessary settings
"""

import requests
import json
import time
import sys
import os

# Configuration
KEYCLOAK_URL = os.getenv('KEYCLOAK_URL', 'http://143.244.152.52:8080')
ADMIN_USER = os.getenv('KEYCLOAK_ADMIN', 'admin')
ADMIN_PASSWORD = os.getenv('KEYCLOAK_ADMIN_PASSWORD', 'TeleCheckAdmin2025!')
REALM_NAME = 'telecheck'

print("=" * 60)
print("Keycloak Realm Configuration")
print("=" * 60)
print(f"Server: {KEYCLOAK_URL}")
print(f"Realm: {REALM_NAME}")
print()

# Wait for Keycloak to be ready
print("⏳ Waiting for Keycloak to be ready...")
max_retries = 30
for i in range(max_retries):
    try:
        response = requests.get(f"{KEYCLOAK_URL}/health/ready", timeout=5)
        if response.status_code == 200:
            print("✅ Keycloak is ready!")
            break
    except:
        pass
    if i < max_retries - 1:
        print(f"   Waiting... ({i+1}/{max_retries})")
        time.sleep(5)
else:
    print("❌ Keycloak failed to start")
    sys.exit(1)

print()

# Get admin token
print("🔐 Authenticating as admin...")
try:
    response = requests.post(
        f"{KEYCLOAK_URL}/realms/master/protocol/openid-connect/token",
        data={
            'username': ADMIN_USER,
            'password': ADMIN_PASSWORD,
            'grant_type': 'password',
            'client_id': 'admin-cli'
        },
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    response.raise_for_status()
    token = response.json()['access_token']
    print("✅ Authenticated successfully!")
except Exception as e:
    print(f"❌ Authentication failed: {e}")
    sys.exit(1)

print()

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Create Telecheck realm
print("🏗️  Creating Telecheck realm...")
realm_config = {
    "realm": REALM_NAME,
    "enabled": True,
    "displayName": "Telecheck Healthcare",
    "registrationAllowed": True,
    "loginWithEmailAllowed": True,
    "duplicateEmailsAllowed": False,
    "resetPasswordAllowed": True,
    "editUsernameAllowed": False,
    "bruteForceProtected": True,
    "permanentLockout": False,
    "maxFailureWaitSeconds": 900,
    "failureFactor": 5,
    "passwordPolicy": "length(12) and upperCase(1) and lowerCase(1) and digits(1) and specialChars(1) and notUsername and passwordHistory(10)",
    "sslRequired": "external",
    "accessTokenLifespan": 900,
    "ssoSessionIdleTimeout": 1800,
    "ssoSessionMaxLifespan": 36000
}

try:
    response = requests.post(
        f"{KEYCLOAK_URL}/admin/realms",
        headers=headers,
        json=realm_config
    )
    if response.status_code in [201, 409]:  # Created or already exists
        print("✅ Realm created/verified!")
    else:
        print(f"⚠️  Unexpected response: {response.status_code}")
except Exception as e:
    print(f"⚠️  Realm creation: {e}")

print()

# Create roles
print("👥 Creating roles...")
roles = ['PATIENT', 'DOCTOR', 'PROVIDER', 'NURSE', 'FIELD_NURSE', 'PHARMACIST', 'CAREGIVER', 'ADMIN']
for role in roles:
    print(f"   Creating role: {role}")
    try:
        response = requests.post(
            f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles",
            headers=headers,
            json={
                "name": role,
                "description": f"Role for {role}"
            }
        )
        if response.status_code in [201, 409]:
            pass  # Success or already exists
    except Exception as e:
        print(f"   ⚠️  {role}: {e}")

print("✅ Roles created!")
print()

# Create telecheck-web client
print("🌐 Creating telecheck-web client...")
web_client = {
    "clientId": "telecheck-web",
    "name": "Telecheck Web Application",
    "enabled": True,
    "publicClient": True,
    "standardFlowEnabled": True,
    "directAccessGrantsEnabled": True,
    "serviceAccountsEnabled": False,
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
}

try:
    response = requests.post(
        f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/clients",
        headers=headers,
        json=web_client
    )
    if response.status_code in [201, 409]:
        print("✅ telecheck-web client created!")
except Exception as e:
    print(f"⚠️  Client creation: {e}")

print()

# Create telecheck-api client
print("🔒 Creating telecheck-api client...")
import secrets
api_secret = f"telecheck-api-secret-{secrets.token_urlsafe(16)}"

api_client = {
    "clientId": "telecheck-api",
    "name": "Telecheck API Service",
    "enabled": True,
    "publicClient": False,
    "standardFlowEnabled": False,
    "directAccessGrantsEnabled": False,
    "serviceAccountsEnabled": True,
    "protocol": "openid-connect",
    "secret": api_secret,
    "attributes": {
        "access.token.lifespan": "900"
    }
}

try:
    response = requests.post(
        f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/clients",
        headers=headers,
        json=api_client
    )
    if response.status_code in [201, 409]:
        print("✅ telecheck-api client created!")

        # Get the actual secret from Keycloak
        response = requests.get(
            f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/clients?clientId=telecheck-api",
            headers=headers
        )
        if response.status_code == 200:
            clients = response.json()
            if clients:
                client_id = clients[0]['id']
                response = requests.get(
                    f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/clients/{client_id}/client-secret",
                    headers=headers
                )
                if response.status_code == 200:
                    actual_secret = response.json()['value']
                    print()
                    print("📋 IMPORTANT - Save this client secret:")
                    print(f"   KEYCLOAK_ADMIN_CLIENT_SECRET={actual_secret}")
                    print()
except Exception as e:
    print(f"⚠️  Client creation: {e}")

print()

# Create test users
print("👤 Creating test users...")

test_users = [
    {
        "username": "test.patient@telecheck.com",
        "email": "test.patient@telecheck.com",
        "firstName": "Test",
        "lastName": "Patient",
        "password": "TestPatient123!",
        "role": "PATIENT"
    },
    {
        "username": "test.doctor@telecheck.com",
        "email": "test.doctor@telecheck.com",
        "firstName": "Test",
        "lastName": "Doctor",
        "password": "TestDoctor123!",
        "role": "DOCTOR"
    },
    {
        "username": "test.admin@telecheck.com",
        "email": "test.admin@telecheck.com",
        "firstName": "Test",
        "lastName": "Admin",
        "password": "TestAdmin123!",
        "role": "ADMIN"
    }
]

for user_data in test_users:
    username = user_data['username']
    role_name = user_data['role']

    # Create user
    user_config = {
        "username": username,
        "email": user_data['email'],
        "firstName": user_data['firstName'],
        "lastName": user_data['lastName'],
        "enabled": True,
        "emailVerified": True,
        "credentials": [{
            "type": "password",
            "value": user_data['password'],
            "temporary": False
        }]
    }

    try:
        response = requests.post(
            f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users",
            headers=headers,
            json=user_config
        )

        if response.status_code in [201, 409]:
            # Get user ID
            response = requests.get(
                f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users?username={username}",
                headers=headers
            )
            if response.status_code == 200:
                users = response.json()
                if users:
                    user_id = users[0]['id']

                    # Get role ID
                    response = requests.get(
                        f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles/{role_name}",
                        headers=headers
                    )
                    if response.status_code == 200:
                        role_data = response.json()
                        role_id = role_data['id']

                        # Assign role
                        requests.post(
                            f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}/role-mappings/realm",
                            headers=headers,
                            json=[{
                                "id": role_id,
                                "name": role_name
                            }]
                        )

            print(f"✅ Test {role_name.lower()} created: {username} / {user_data['password']}")
    except Exception as e:
        print(f"⚠️  {username}: {e}")

print()
print("=" * 60)
print("✅ Keycloak Configuration Complete!")
print("=" * 60)
print()
print("📋 Configuration Summary:")
print(f"   Realm: {REALM_NAME}")
print("   Clients: telecheck-web, telecheck-api")
print("   Roles: PATIENT, DOCTOR, PROVIDER, NURSE, FIELD_NURSE, PHARMACIST, CAREGIVER, ADMIN")
print("   Test Users: 3 users created")
print()
print("🌐 Access URLs:")
print(f"   Admin Console: {KEYCLOAK_URL}/admin")
print(f"   User Account: {KEYCLOAK_URL}/realms/{REALM_NAME}/account")
print()
print("🔑 Test Credentials:")
print("   Patient: test.patient@telecheck.com / TestPatient123!")
print("   Doctor:  test.doctor@telecheck.com / TestDoctor123!")
print("   Admin:   test.admin@telecheck.com / TestAdmin123!")
print()
print("✅ Ready for application integration!")
