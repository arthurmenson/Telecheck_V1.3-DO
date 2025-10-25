# DigitalOcean Database Setup for whale-app

**Date**: 2025-10-25
**Status**: Required for deployment
**Priority**: High

---

## Issue Resolution

The app.yaml spec was trying to create/modify database clusters, which DigitalOcean doesn't allow in a single update operation. The solution is to:

1. **Remove database definitions from app.yaml** ✅ (Done)
2. **Configure databases manually in DigitalOcean console** (Required)
3. **Connect via environment variables** (DATABASE_URL, REDIS_URL)

---

## Required Database Setup

### Option 1: Use Existing Databases (Recommended if available)

If whale-app already has databases attached:

1. **Go to DigitalOcean Console**
   - Navigate to: Apps → whale-app
   - Click on "Settings" tab
   - Scroll to "App-Level Environment Variables"

2. **Verify Database Connection Strings**
   - Check if `DATABASE_URL` is set (PostgreSQL connection string)
   - Check if `REDIS_URL` is set (Redis connection string)
   - If missing, add them from existing database clusters

3. **Format Example**:
   ```
   DATABASE_URL: postgresql://user:password@host:25060/dbname?sslmode=require
   REDIS_URL: rediss://default:password@host:25061
   ```

### Option 2: Create New Managed Databases

If no databases exist:

#### PostgreSQL Database

1. **Create PostgreSQL Cluster**
   - Go to: Databases → Create → PostgreSQL
   - Version: 15
   - Plan: Basic ($15/month for dev) or Production ($55/month)
   - Region: Same as whale-app (nyc)
   - Name: `telecheck-postgres-cluster`

2. **Configure Security**
   - Enable "Trusted Sources" → Add whale-app
   - Enable SSL/TLS (required for HIPAA)
   - Set up automated backups

3. **Get Connection String**
   - Copy the connection string from database overview
   - Format: `postgresql://doadmin:PASSWORD@HOST:25060/defaultdb?sslmode=require`

#### Redis Database

1. **Create Redis Cluster**
   - Go to: Databases → Create → Redis
   - Version: 7
   - Plan: Basic ($15/month for dev)
   - Region: Same as whale-app (nyc)
   - Name: `telecheck-redis-cluster`

2. **Configure Security**
   - Enable "Trusted Sources" → Add whale-app
   - Enable TLS (required)
   - Enable persistence (AOF)

3. **Get Connection String**
   - Copy the connection string from database overview
   - Format: `rediss://default:PASSWORD@HOST:25061`

---

## Configure Environment Variables in whale-app

### Step 1: Navigate to App Settings

```
DigitalOcean Console → Apps → whale-app → Settings → App-Level Environment Variables
```

### Step 2: Add Required Variables

Click "Edit" and add the following environment variables:

#### Database Connection

```
DATABASE_URL (encrypted)
Value: postgresql://doadmin:PASSWORD@HOST:25060/telecheck?sslmode=require
```

#### Redis Connection

```
REDIS_URL (encrypted)
Value: rediss://default:PASSWORD@HOST:25061
```

#### JWT Secret

```
JWT_SECRET (encrypted)
Value: <generate random 64-character string>
```

Generate with:

```bash
openssl rand -hex 32
```

#### Encryption Keys (PHI Data)

Generate 4 separate keys:

```bash
# Generate all 4 keys
openssl rand -base64 32  # PHI_PATIENT_KEY
openssl rand -base64 32  # PHI_MEDICAL_KEY
openssl rand -base64 32  # PHI_FINANCIAL_KEY
openssl rand -base64 32  # PHI_COMMUNICATION_KEY
```

Add to environment variables:

```
PHI_PATIENT_KEY (encrypted)
PHI_MEDICAL_KEY (encrypted)
PHI_FINANCIAL_KEY (encrypted)
PHI_COMMUNICATION_KEY (encrypted)
```

#### Keycloak Configuration (Optional for MVP)

If using Keycloak SSO:

```
KEYCLOAK_URL (encrypted)
KEYCLOAK_REALM=telecheck
KEYCLOAK_CLIENT_ID (encrypted)
KEYCLOAK_CLIENT_SECRET (encrypted)
```

#### Vault Configuration (Optional for MVP)

If using HashiCorp Vault:

```
VAULT_ADDR (encrypted)
VAULT_TOKEN (encrypted)
```

---

## Database Schema Migration

After environment variables are configured and app is deployed:

### Option 1: Manual Migration (Recommended First Time)

1. **Connect to PostgreSQL**:

   ```bash
   # From DigitalOcean console, get connection string
   psql "postgresql://doadmin:PASSWORD@HOST:25060/defaultdb?sslmode=require"
   ```

2. **Create Telecheck Database**:

   ```sql
   CREATE DATABASE telecheck;
   \c telecheck
   ```

3. **Run Migrations**:
   - You can use the whale-app console to run migrations
   - Or connect locally with DO database credentials

### Option 2: Automated Migration (Future Deployments)

Once database is set up, you can add back the migration job to `.do/app.yaml`:

```yaml
jobs:
  - name: db-migrate
    github:
      repo: arthurmenson/Telecheck_V1.3-DO
      branch: ETM_telecheck
    dockerfile_path: Dockerfile.server
    kind: PRE_DEPLOY
    run_command: npm run migrate
    envs:
      - key: DATABASE_URL
        scope: RUN_TIME
        type: SECRET
```

---

## Verification Steps

After setup, verify the deployment:

### 1. Check App Deployment Status

```bash
doctl apps list
doctl apps get <APP_ID>
```

### 2. Check Health Endpoint

```bash
# Get app URL from DigitalOcean console
curl https://whale-app-xxxxx.ondigitalocean.app/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-10-25T...",
  "database": "connected",
  "redis": "connected"
}
```

### 3. Check Database Connectivity

From whale-app console or logs:

```bash
# View runtime logs
doctl apps logs <APP_ID> --type=run --component telecheck-api

# Look for:
✓ Database connected: PostgreSQL 15
✓ Redis connected: 7.x
```

### 4. Test API Endpoints

```bash
# Health check
curl https://whale-app-xxxxx.ondigitalocean.app/health

# API status
curl https://whale-app-xxxxx.ondigitalocean.app/api/status
```

---

## Cost Estimate

### Development Environment

| Resource      | Plan              | Cost/Month |
| ------------- | ----------------- | ---------- |
| PostgreSQL    | Basic (1GB RAM)   | $15        |
| Redis         | Basic (1GB RAM)   | $15        |
| telecheck-api | Professional XS×2 | $24        |
| telecheck-web | Basic XXS×1       | $5         |
| **Total**     |                   | **$59**    |

### Production Environment

| Resource      | Plan                 | Cost/Month |
| ------------- | -------------------- | ---------- |
| PostgreSQL    | Production (4GB RAM) | $55        |
| Redis         | Production (4GB RAM) | $55        |
| telecheck-api | Professional S×2     | $72        |
| telecheck-web | Basic XS×1           | $10        |
| **Total**     |                      | **$192**   |

---

## Security Checklist

Before going live:

- [ ] Enable SSL/TLS on PostgreSQL (required)
- [ ] Enable TLS on Redis (required)
- [ ] Set "Trusted Sources" for databases (restrict to whale-app only)
- [ ] Enable automated backups (PostgreSQL)
- [ ] Enable AOF persistence (Redis)
- [ ] Rotate all secrets (JWT_SECRET, PHI keys)
- [ ] Use encrypted environment variables
- [ ] Enable 2FA on DigitalOcean account
- [ ] Set up monitoring alerts
- [ ] Configure firewall rules

---

## Troubleshooting

### Error: "Connection refused"

**Cause**: Database not in "Trusted Sources"
**Fix**: Add whale-app to database trusted sources

### Error: "Authentication failed"

**Cause**: Incorrect DATABASE_URL or REDIS_URL
**Fix**: Verify connection strings in DigitalOcean database overview

### Error: "SSL required"

**Cause**: Missing `?sslmode=require` in DATABASE_URL
**Fix**: Append `?sslmode=require` to PostgreSQL connection string

### Error: "Database does not exist"

**Cause**: Database 'telecheck' not created
**Fix**: Run `CREATE DATABASE telecheck;` in PostgreSQL

---

## Next Steps

1. ✅ **App Spec Updated** - Removed database definitions
2. ⏳ **CI/CD Deploying** - GitHub Actions running
3. ⏳ **Configure Databases** - Set up in DigitalOcean console
4. ⏳ **Add Environment Variables** - Configure DATABASE_URL, REDIS_URL, secrets
5. ⏳ **Run Migrations** - Initialize database schema
6. ⏳ **Verify Deployment** - Test health endpoints

---

## Quick Start Commands

### Generate All Required Secrets

```bash
# JWT Secret
echo "JWT_SECRET=$(openssl rand -hex 32)"

# PHI Encryption Keys
echo "PHI_PATIENT_KEY=$(openssl rand -base64 32)"
echo "PHI_MEDICAL_KEY=$(openssl rand -base64 32)"
echo "PHI_FINANCIAL_KEY=$(openssl rand -base64 32)"
echo "PHI_COMMUNICATION_KEY=$(openssl rand -base64 32)"
```

### Test Deployment

```bash
# Get app ID
APP_ID=$(doctl apps list --format ID,Spec.Name --no-header | grep "whale-app" | awk '{print $1}')

# Get app URL
doctl apps get $APP_ID --format DefaultIngress --no-header

# Test health
curl https://$(doctl apps get $APP_ID --format DefaultIngress --no-header)/health
```

---

**Status**: Waiting for CI/CD pipeline to complete
**Action Required**: Configure databases in DigitalOcean console
**Documentation**: This file
**Support**: Check GitHub Actions logs for deployment status
