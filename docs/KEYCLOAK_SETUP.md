# Keycloak Setup Guide - TeleCheck Healthcare Platform

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Production Deployment](#production-deployment)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Overview

This guide provides step-by-step instructions for setting up Keycloak authentication for the TeleCheck healthcare platform. The implementation includes:

- **PKCE-based OAuth 2.0 + OpenID Connect** authentication
- **Role-Based Access Control (RBAC)** with 6 healthcare roles
- **MFA enforcement** for healthcare providers (DOCTOR, ADMIN, NURSE)
- **Short-lived access tokens** (15 minutes) with secure refresh rotation
- **HIPAA-compliant audit logging** for all authentication events
- **User synchronization** between Keycloak and local PostgreSQL database

## Prerequisites

### Required Software

- **Node.js**: >= 20.14.0
- **PostgreSQL**: >= 14
- **Keycloak**: >= 21.x (recommended: 23.x)
- **Docker** (optional, for local Keycloak deployment)

### Required Knowledge

- Basic understanding of OAuth 2.0 and OpenID Connect
- PostgreSQL database administration
- Environment variable configuration
- Healthcare compliance requirements (HIPAA basics)

## Local Development Setup

### Step 1: Install Keycloak

#### Option A: Docker (Recommended for Development)

```bash
# Pull Keycloak image
docker pull quay.io/keycloak/keycloak:23.0

# Run Keycloak container
docker run -d \
  --name keycloak-dev \
  -p 8180:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:23.0 \
  start-dev
```

Keycloak will be available at: `http://localhost:8180`

#### Option B: Standalone Installation

1. Download Keycloak from: https://www.keycloak.org/downloads
2. Extract the archive
3. Navigate to the `bin` directory
4. Run Keycloak:

```bash
# Linux/Mac
./kc.sh start-dev

# Windows
kc.bat start-dev
```

### Step 2: Configure Keycloak Realm

Run the automated configuration script:

```bash
# Make script executable
chmod +x scripts/configure-keycloak.sh

# Run configuration script
KEYCLOAK_URL=http://localhost:8180 \
KEYCLOAK_ADMIN=admin \
KEYCLOAK_ADMIN_PASSWORD=admin \
./scripts/configure-keycloak.sh
```

This script creates:

- **Realm**: `telecheck`
- **Clients**:
  - `telecheck-web` (public client with PKCE)
  - `telecheck-api` (service account for admin operations)
- **Roles**: PATIENT, FIELD_NURSE, PROVIDER, ADMIN, BILLING_STAFF, PHARMACIST
- **Test Users**: With different roles and MFA requirements
- **Security Policies**: Password policies, brute force protection, MFA flows

**IMPORTANT**: Save the API client secret displayed at the end of the script!

### Step 3: Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update the Keycloak configuration in `.env`:

```bash
# Keycloak Configuration
KEYCLOAK_REALM=telecheck
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8180
KEYCLOAK_CLIENT_ID=telecheck-web
KEYCLOAK_CLIENT_SECRET=<secret-from-setup-script>
KEYCLOAK_ADMIN_CLIENT_ID=telecheck-api
KEYCLOAK_ADMIN_CLIENT_SECRET=<api-secret-from-setup-script>

# Token Configuration
KEYCLOAK_TOKEN_LIFESPAN=900            # 15 minutes
KEYCLOAK_REFRESH_TOKEN_LIFESPAN=1800   # 30 minutes

# Security
KEYCLOAK_VALIDATE_ISSUER=true
KEYCLOAK_VALIDATE_AUDIENCE=true
KEYCLOAK_REQUIRE_HTTPS=false           # Set true in production

# Frontend
FRONTEND_URL=http://localhost:8080
```

### Step 4: Install Dependencies

```bash
# Install backend dependencies
npm install

# Additional packages for Keycloak integration
npm install jwk-to-pem @types/jwk-to-pem
```

### Step 5: Run Database Migrations

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run migrate
```

### Step 6: Start the Application

```bash
# Development mode
npm run dev

# Or build and start production mode
npm run build:prod
npm run start:prod
```

### Step 7: Verify Setup

1. **Check Keycloak Health**:

   ```bash
   curl http://localhost:8180/realms/telecheck
   ```

2. **Test Authentication**:
   Navigate to `http://localhost:8080/login` and try logging in with test credentials:
   - **Patient**: test.patient@example.com / TestPatient123!
   - **Doctor**: test.provider@example.com / TestProvider123! (requires MFA setup)
   - **Admin**: test.admin@example.com / TestAdmin123! (requires MFA setup)

3. **Check API Health**:
   ```bash
   curl http://localhost:8080/api/health
   ```

## Production Deployment

### Prerequisites

- **Dedicated Keycloak Server** (recommended: separate from application)
- **PostgreSQL Database** for Keycloak (separate from application DB)
- **SSL/TLS Certificates** for HTTPS
- **Load Balancer** (optional, for high availability)

### Step 1: Deploy Keycloak Server

#### Recommended: Managed Keycloak Service

- **Red Hat Single Sign-On** (commercial support)
- **Cloud IAM Services** (AWS Cognito, Azure AD B2C)
- **Self-hosted with PostgreSQL backend**

#### Self-Hosted Production Setup

1. **Install PostgreSQL for Keycloak**:

```bash
# Create Keycloak database
createdb keycloak_production
```

2. **Deploy Keycloak with PostgreSQL**:

```bash
docker run -d \
  --name keycloak-prod \
  -p 8443:8443 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=<strong-password> \
  -e KC_DB=postgres \
  -e KC_DB_URL=jdbc:postgresql://db-host:5432/keycloak_production \
  -e KC_DB_USERNAME=keycloak \
  -e KC_DB_PASSWORD=<db-password> \
  -e KC_HOSTNAME=keycloak.telecheck.health \
  -e KC_HTTPS_CERTIFICATE_FILE=/opt/keycloak/cert/fullchain.pem \
  -e KC_HTTPS_CERTIFICATE_KEY_FILE=/opt/keycloak/cert/privkey.pem \
  -v /path/to/certs:/opt/keycloak/cert:ro \
  quay.io/keycloak/keycloak:23.0 \
  start --optimized
```

### Step 2: Configure Production Realm

Update the configuration script for production:

```bash
# Production environment variables
export KEYCLOAK_URL=https://keycloak.telecheck.health
export KEYCLOAK_ADMIN=admin
export KEYCLOAK_ADMIN_PASSWORD=<production-admin-password>

# Run configuration
./scripts/configure-keycloak.sh
```

**Production Modifications**:

- Update redirect URIs to production URLs
- Enable HTTPS requirement
- Configure email server for password resets
- Set up backup and monitoring

### Step 3: Update Application Configuration

Production `.env` configuration:

```bash
# Keycloak Production Configuration
KEYCLOAK_REALM=telecheck
KEYCLOAK_AUTH_SERVER_URL=https://keycloak.telecheck.health
KEYCLOAK_CLIENT_ID=telecheck-web
KEYCLOAK_CLIENT_SECRET=<production-secret>
KEYCLOAK_ADMIN_CLIENT_ID=telecheck-api
KEYCLOAK_ADMIN_CLIENT_SECRET=<production-api-secret>

# Security - PRODUCTION SETTINGS
NODE_ENV=production
KEYCLOAK_VALIDATE_ISSUER=true
KEYCLOAK_VALIDATE_AUDIENCE=true
KEYCLOAK_REQUIRE_HTTPS=true

# Frontend
FRONTEND_URL=https://telecheck.health
```

### Step 4: Enable HTTPS

Ensure all communication uses HTTPS:

1. **Configure SSL/TLS certificates** on your load balancer or reverse proxy
2. **Force HTTPS redirects** in your web server configuration
3. **Set Secure cookie flags** (handled automatically in production mode)
4. **Configure HSTS headers** (handled by security middleware)

### Step 5: Configure Monitoring

Set up monitoring for:

- Keycloak uptime and performance
- Failed authentication attempts
- Token validation errors
- MFA bypass attempts
- Audit log aggregation

Recommended tools:

- **Prometheus + Grafana** for metrics
- **ELK Stack** for log aggregation
- **Datadog/New Relic** for APM

### Step 6: Backup Configuration

**Critical Data to Backup**:

1. Keycloak database (PostgreSQL)
2. Client secrets and configuration
3. User data and roles
4. Realm configuration export

```bash
# Export Keycloak realm configuration
docker exec keycloak-prod /opt/keycloak/bin/kc.sh export \
  --dir /tmp/export \
  --realm telecheck
```

## Configuration

### Password Policies

Default password policy (configured in realm):

- Minimum 12 characters
- At least 1 digit
- At least 1 lowercase letter
- At least 1 uppercase letter
- At least 1 special character
- Cannot be same as username

### MFA Configuration

MFA is **required** for the following roles:

- DOCTOR / PROVIDER
- ADMIN
- NURSE / FIELD_NURSE

**MFA Method**: TOTP (Time-based One-Time Password)

- Compatible with Google Authenticator, Authy, Microsoft Authenticator
- 6-digit code with 30-second window
- Backup codes available

### Session Management

**Access Token Lifespan**: 15 minutes (configurable)
**Refresh Token Lifespan**: 30 minutes (configurable)
**SSO Session Idle Timeout**: 30 minutes
**SSO Session Max Lifespan**: 10 hours

### Role Mapping

| Keycloak Role | Application Role | Permissions                            |
| ------------- | ---------------- | -------------------------------------- |
| PATIENT       | patient          | View own records, appointments, labs   |
| FIELD_NURSE   | nurse            | Patient care, vital monitoring         |
| PROVIDER      | doctor           | Full patient access, prescribing       |
| ADMIN         | admin            | System administration, user management |
| BILLING_STAFF | admin            | Billing, insurance verification        |
| PHARMACIST    | pharmacist       | Prescription dispensing, inventory     |

## Testing

### Manual Testing

1. **Test Login Flow**:

   ```bash
   # Navigate to login page
   open http://localhost:8080/login

   # Login with test patient
   # Email: test.patient@example.com
   # Password: TestPatient123!
   ```

2. **Test MFA Flow**:

   ```bash
   # Login with doctor account
   # Email: test.provider@example.com
   # Password: TestProvider123!
   # Scan QR code with authenticator app
   # Enter 6-digit code
   ```

3. **Test Token Refresh**:
   ```bash
   # Wait 15 minutes for token expiration
   # Application should automatically refresh token
   # Check browser console for refresh events
   ```

### Automated Testing

```bash
# Run authentication tests
npm run test:auth

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Security Testing

1. **PKCE Validation**: Ensure authorization code cannot be intercepted
2. **Token Expiration**: Verify short-lived tokens expire correctly
3. **MFA Bypass**: Attempt to bypass MFA for provider roles (should fail)
4. **Role Escalation**: Attempt to access admin endpoints as patient (should fail)
5. **Token Replay**: Attempt to reuse revoked tokens (should fail)

## Troubleshooting

### Common Issues

#### 1. "Failed to fetch JWKS"

**Cause**: Cannot reach Keycloak server or invalid URL

**Solution**:

```bash
# Verify Keycloak is running
curl http://localhost:8180/realms/telecheck

# Check KEYCLOAK_AUTH_SERVER_URL in .env
# Ensure no trailing /auth if using Keycloak 17+
```

#### 2. "Token verification failed"

**Cause**: Token signature validation failed

**Solution**:

- Verify KEYCLOAK_CLIENT_ID matches realm configuration
- Check clock synchronization between servers
- Ensure JWKS cache is not stale

#### 3. "MFA required but not configured"

**Cause**: Provider role without MFA setup

**Solution**:

- Complete MFA setup at `/api/auth/keycloak/mfa-setup`
- Scan QR code with authenticator app
- Enter verification code

#### 4. "CORS error on login"

**Cause**: Frontend URL not in allowed origins

**Solution**:

- Add frontend URL to Keycloak client web origins
- Update FRONTEND_URL in .env
- Restart application

#### 5. "User sync failed"

**Cause**: Database connection or schema mismatch

**Solution**:

```bash
# Run database migrations
npm run migrate

# Check database connectivity
psql $DATABASE_URL -c "SELECT 1"
```

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
DEBUG=keycloak:*

# Or in .env
DEBUG=telecheck:*,keycloak:*
```

### Getting Help

1. **Check Logs**:

   ```bash
   # Application logs
   tail -f logs/application.log

   # Keycloak logs
   docker logs keycloak-dev -f
   ```

2. **Keycloak Admin Console**:
   - Navigate to: http://localhost:8180/admin
   - Login with admin credentials
   - Check realm events, user sessions, client configuration

3. **Database Queries**:

   ```sql
   -- Check synced users
   SELECT id, email, role FROM users WHERE role IS NOT NULL;

   -- Check audit logs
   SELECT * FROM audit_logs WHERE action LIKE 'AUTH_%' ORDER BY created_at DESC LIMIT 10;
   ```

## Next Steps

- [Security Configuration Guide](./KEYCLOAK_SECURITY.md)
- [User Management Guide](./KEYCLOAK_USER_MANAGEMENT.md)
- [API Documentation](./API.md)
- [HIPAA Compliance Guide](./HIPAA_COMPLIANCE.md)

## Support

For issues or questions:

- **Email**: support@telecheck.health
- **Documentation**: https://docs.telecheck.health
- **GitHub Issues**: https://github.com/telecheck/platform/issues
