# Quick Start: Complete Deployment to DigitalOcean

**One-command database setup and deployment automation**

---

## Prerequisites

1. **DigitalOcean CLI (`doctl`) installed**

   ```powershell
   # Windows (using Scoop)
   scoop install doctl

   # Or download from:
   # https://docs.digitalocean.com/reference/doctl/how-to/install/
   ```

2. **Authenticate doctl**

   ```bash
   doctl auth init
   # Paste your DigitalOcean API token when prompted
   ```

3. **Verify authentication**
   ```bash
   doctl auth list
   doctl apps list  # Should show whale-app
   ```

---

## One-Command Setup (Recommended)

### For Development Environment

```powershell
# Windows PowerShell
cd C:\Users\menso\Downloads\Telecheck_V1.3-DO
.\scripts\setup-digitalocean-databases.ps1 -Environment dev
```

```bash
# Git Bash / Linux / macOS
cd /c/Users/menso/Downloads/Telecheck_V1.3-DO
bash scripts/setup-digitalocean-databases.sh dev
```

**This will**:

- ✅ Create PostgreSQL 15 cluster (1GB RAM, $15/month)
- ✅ Create Redis 7 cluster (1GB RAM, $15/month)
- ✅ Create `telecheck` database
- ✅ Generate all required secrets (JWT, PHI encryption keys)
- ✅ Create `.env.whale-app-dev` file with all configuration

**Time**: ~10-15 minutes (mostly waiting for database clusters)

### For Production Environment

```powershell
# Windows PowerShell
.\scripts\setup-digitalocean-databases.ps1 -Environment prod
```

```bash
# Git Bash / Linux / macOS
bash scripts/setup-digitalocean-databases.sh prod
```

**This will**:

- ✅ Create PostgreSQL 15 cluster (8GB RAM, $120/month)
- ✅ Create Redis 7 cluster (2GB RAM, $60/month)
- ✅ Higher availability (2 nodes each)
- ✅ Production-grade resources

---

## What the Script Does

### Step-by-Step Automation

1. **Checks doctl authentication** ✓
2. **Finds whale-app** (your existing app)
3. **Creates PostgreSQL cluster** (if doesn't exist)
   - Engine: PostgreSQL 15
   - Region: NYC3
   - SSL/TLS enabled
   - Automated backups
4. **Creates Redis cluster** (if doesn't exist)
   - Engine: Redis 7
   - Region: NYC3
   - TLS enabled
   - AOF persistence
5. **Creates `telecheck` database** in PostgreSQL
6. **Retrieves connection strings** (DATABASE_URL, REDIS_URL)
7. **Generates secrets**:
   - `JWT_SECRET` (64-char hex)
   - `PHI_PATIENT_KEY` (32-byte base64)
   - `PHI_MEDICAL_KEY` (32-byte base64)
   - `PHI_FINANCIAL_KEY` (32-byte base64)
   - `PHI_COMMUNICATION_KEY` (32-byte base64)
8. **Creates environment file** `.env.whale-app-{dev|prod}`
9. **Displays instructions** for setting variables

---

## After Script Completes

### Step 1: Review Generated Environment File

```powershell
# View the file
cat .env.whale-app-dev

# Or open in editor
code .env.whale-app-dev
```

### Step 2: Set Environment Variables in DigitalOcean

**Option A: Using DigitalOcean Web Console (Recommended)**

1. Go to: https://cloud.digitalocean.com/apps
2. Click on **whale-app**
3. Go to **Settings** tab
4. Scroll to **"App-Level Environment Variables"**
5. Click **"Edit"**
6. For each variable in `.env.whale-app-dev`:
   - Click **"Add Variable"**
   - Enter **Key** (e.g., `DATABASE_URL`)
   - Enter **Value** (copy from file)
   - **Check "Encrypt"** for sensitive values:
     - ✅ DATABASE_URL
     - ✅ REDIS_URL
     - ✅ JWT_SECRET
     - ✅ PHI_PATIENT_KEY
     - ✅ PHI_MEDICAL_KEY
     - ✅ PHI_FINANCIAL_KEY
     - ✅ PHI_COMMUNICATION_KEY
   - Leave unchecked for non-sensitive:
     - ❌ NODE_ENV
     - ❌ PORT
     - ❌ LOG_LEVEL
7. Click **"Save"**
8. DigitalOcean will automatically redeploy whale-app

**Option B: Using doctl + API (Advanced)**

```bash
# Coming soon - manual console setup recommended for now
```

### Step 3: Wait for Redeployment

After saving environment variables:

1. DigitalOcean triggers automatic redeployment (~5-10 min)
2. Monitor at: https://cloud.digitalocean.com/apps → whale-app → **Activity**
3. Wait for **"Deployment Live"** status

### Step 4: Verify Deployment

```bash
# Get app URL
APP_ID=$(doctl apps list --format ID,Spec.Name --no-header | grep "whale-app" | awk '{print $1}')
APP_URL=$(doctl apps get $APP_ID --format DefaultIngress --no-header)

# Test health endpoint
curl https://$APP_URL/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-10-25T...",
  "database": "connected",
  "redis": "connected"
}
```

---

## Troubleshooting

### doctl: command not found

**Windows**:

```powershell
# Install using Scoop
scoop install doctl

# Or download installer
# https://github.com/digitalocean/doctl/releases
```

**Linux/macOS**:

```bash
# Using Homebrew
brew install doctl

# Or snap
snap install doctl
```

### doctl not authenticated

```bash
doctl auth init
# Paste your DigitalOcean API token

# Get token from:
# https://cloud.digitalocean.com/account/api/tokens
```

### Database cluster creation timeout

Database clusters can take 10-15 minutes to provision. The script waits up to 10 minutes. If it times out:

```bash
# Check status manually
doctl databases list

# Wait until status is "online"
# Then re-run the script (it will detect existing clusters)
```

### App not found: whale-app

```bash
# List all apps
doctl apps list

# If whale-app doesn't exist, create it first
doctl apps create --spec .do/app.yaml
```

### Environment variables not applied

After setting env vars in console:

1. Check they're saved: Apps → whale-app → Settings → scroll to env vars
2. Manually trigger redeploy: Apps → whale-app → Actions → "Force Rebuild and Deploy"
3. Check deployment logs: Apps → whale-app → Runtime Logs

---

## Cost Summary

### Development Environment

| Resource      | Spec          | Cost/Month |
| ------------- | ------------- | ---------- |
| PostgreSQL    | 1GB RAM       | $15        |
| Redis         | 1GB RAM       | $15        |
| telecheck-api | Prof XS × 2   | $24        |
| telecheck-web | Basic XXS × 1 | $5         |
| **Total**     |               | **$59**    |

### Production Environment

| Resource      | Spec         | Cost/Month |
| ------------- | ------------ | ---------- |
| PostgreSQL    | 8GB RAM, 2N  | $120       |
| Redis         | 2GB RAM, 2N  | $60        |
| telecheck-api | Prof S × 2   | $72        |
| telecheck-web | Basic XS × 1 | $10        |
| **Total**     |              | **$262**   |

---

## What's Included

### Database Security ✅

- ✅ **TLS 1.3** encryption in transit
- ✅ **SSL/TLS** required for PostgreSQL
- ✅ **Private networking** (databases on VPC)
- ✅ **Automated backups** (PostgreSQL)
- ✅ **AOF persistence** (Redis)
- ✅ **Access controls** (trusted sources)

### Application Security ✅

- ✅ **JWT authentication** with 256-bit secret
- ✅ **PHI encryption** (4 separate AES-256-GCM keys)
- ✅ **Environment secrets** encrypted at rest
- ✅ **HTTPS enforced** (Let's Encrypt auto-provisioned)
- ✅ **Security headers** (CSP, HSTS, X-Frame-Options)

### Monitoring ✅

- ✅ **DigitalOcean App Metrics** (CPU, Memory, Requests)
- ✅ **Database Metrics** (Connections, CPU, Memory)
- ✅ **Health Checks** (API /health endpoint)
- ✅ **Deployment Alerts** (Email notifications)

---

## Next Steps After Deployment

### 1. Run Database Migrations

```bash
# Option A: Via whale-app console
# Go to: Apps → whale-app → Console
# Run: npm run migrate

# Option B: Connect directly to database
doctl databases connection telecheck-postgres-cluster
# Then run migrations
```

### 2. Create Initial Admin User

```bash
# Via whale-app console
node scripts/create-admin-user.js
```

### 3. Configure Custom Domain (Optional)

```bash
# Add domain to whale-app
doctl apps update <APP_ID> --spec .do/app.yaml

# Add DNS records
# CNAME: telecheck.yourdomain.com → whale-app-xxxxx.ondigitalocean.app
```

### 4. Set Up Monitoring

- Configure alert emails in DigitalOcean
- Set up Uptime monitoring
- Enable log forwarding (optional)

### 5. Complete Week 10 Day 3: Security & Compliance

- Run OWASP ZAP security scan
- Complete HIPAA compliance checklist
- SSL Labs A+ verification
- Penetration testing

---

## Full Deployment Status

### ✅ Completed (Week 10 Day 1-2)

- ✅ Docker production images (API + Web)
- ✅ Infrastructure as Code (docker-compose, Terraform)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ DigitalOcean app.yaml configuration
- ✅ Security hardening (98% complete)
- ✅ Automated deployment scripts

### ⏳ In Progress (Current)

- ⏳ Database cluster creation
- ⏳ Environment variable configuration
- ⏳ whale-app deployment

### 📋 Pending (After Deployment)

- 📋 Database schema migrations
- 📋 Initial data seeding
- 📋 Admin user creation
- 📋 Custom domain configuration
- 📋 Week 10 Day 3: Security validation
- 📋 Week 10 Day 4: Testing & monitoring
- 📋 Week 10 Day 5: Go-live

---

## Support & Documentation

- **Setup Script**: `scripts/setup-digitalocean-databases.ps1` (Windows) or `.sh` (Linux/macOS)
- **Database Guide**: [DIGITALOCEAN_DATABASE_SETUP.md](DIGITALOCEAN_DATABASE_SETUP.md)
- **Deployment Guide**: [WEEK10_DAY2_DEPLOYMENT_COMPLETE.md](WEEK10_DAY2_DEPLOYMENT_COMPLETE.md)
- **CI/CD Setup**: [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)

### Get Help

- **DigitalOcean Docs**: https://docs.digitalocean.com/products/app-platform/
- **doctl Reference**: https://docs.digitalocean.com/reference/doctl/
- **GitHub Issues**: https://github.com/arthurmenson/Telecheck_V1.3-DO/issues

---

**Ready to deploy!** Run the setup script and you'll have a fully configured production environment in ~15 minutes.
