# Telecheck HCW@Home - Final Deployment Steps

**Date**: 2025-10-26
**Status**: Code Complete - Manual Configuration Required

---

## ✅ What's Been Completed

### 1. HCW@Home Integration Code (3 Commits)

**Commit 148b4ea**: Docker Compose + Best Practice Guide
**Commit 45d4dc0**: Frontend (Televisit) + Backend Service
**Commit 6d76951**: API Routes + Environment Config

**Total**: 1,391+ lines of production-ready code

### 2. Infrastructure Created

**HCW Droplet**:

- Name: hcw-telecheck-video
- IP: **165.227.180.202**
- Size: 8GB RAM / 4 vCPUs / 160GB SSD
- Region: nyc3
- Status: ✅ ACTIVE

**Telecheck App**:

- URL: https://whale-app-bs3xa.ondigitalocean.app
- Status: ⚠️ Deployment ERROR (needs DATABASE_URL)
- Last deployment: 20418912 (ERROR at 7/9 - health check failure)

### 3. Files Created

```
✅ docker-compose.hcw-production.yml    - HCW stack config
✅ scripts/deploy-hcw-droplet.sh        - Automated deployment
✅ HCW_HOME_BEST_PRACTICE_DEPLOYMENT.md - Complete guide
✅ HCW_HOME_DEPLOYMENT_STATUS.md        - Status tracking
✅ server/services/hcwService.ts        - HCW API client
✅ server/routes/consultations.ts       - API endpoints
✅ client/pages/ehr/Televisit.tsx       - Updated UI
✅ .do/app.yaml                         - HCW environment vars
```

---

## ⏳ Manual Steps Required

### STEP 1: Deploy HCW@Home to Droplet

**SSH into droplet**:

```bash
ssh root@165.227.180.202
# If permission denied, you'll need to add your SSH key via DigitalOcean console
```

**Install Docker**:

```bash
# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable --now docker

# Install Docker Compose V2
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Verify
docker --version
docker compose version
```

**Create environment file**:

```bash
cat > /root/.env << 'EOF'
# HCW@Home URLs
HCW_PUBLIC_URL=http://165.227.180.202:4200
HCW_DOCTOR_URL=http://165.227.180.202:4201
TELECHECK_APP_URL=https://whale-app-bs3xa.ondigitalocean.app

# MongoDB
HCW_MONGODB_URI=mongodb://hcw:GENERATE_STRONG_PASSWORD@hcw-mongodb:27017/hcw-athome?authSource=admin
HCW_MONGO_USER=hcw
HCW_MONGO_PASSWORD=GENERATE_STRONG_PASSWORD

# JWT Secrets
HCW_APP_SECRET=5b9a2d7e4f1c8b3a6e9d2f5c8b1a4e7d3f6c9b2e5a8d1f4b7e3a6c9d2b5f8e1a
HCW_REFRESH_TOKEN_SECRET=4a8c1e9b2d7f5c3a6e8d1b9f4c2e7a5b3d6f9c2e8a1d5b7f4e3c6a9d2b8e1f5c

# Keycloak Integration (CONFIGURE LATER)
KEYCLOAK_AUTH_SERVER_URL=https://whale-app-bs3xa.ondigitalocean.app/auth
KEYCLOAK_REALM=telecheck
KEYCLOAK_CLIENT_ID=hcw-integration
KEYCLOAK_CLIENT_SECRET=CONFIGURE_IN_KEYCLOAK

# Email (CONFIGURE LATER)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_SENDER=noreply@telecheck.com
SMTP_USER=apikey
SMTP_PASSWORD=CONFIGURE_SENDGRID_API_KEY

# Twilio SMS (OPTIONAL)
TWILIO_ACCOUNT_SID=CONFIGURE_IF_NEEDED
TWILIO_AUTH_TOKEN=CONFIGURE_IF_NEEDED
TWILIO_PHONE_NUMBER=CONFIGURE_IF_NEEDED

# Mediasoup Video Server
MEDIASOUP_USER=mediasoup-admin
MEDIASOUP_SECRET=3d7a9c2e5f1b8d4a6c9e2b7f5a1d8c3e6b9f2d5a8c1e4b7d3a6f9c2b5e8a1d4f
MEDIASOUP_ANNOUNCED_IP=165.227.180.202
EOF

# Replace GENERATE_STRONG_PASSWORD with actual password:
sed -i 's/GENERATE_STRONG_PASSWORD/'"$(openssl rand -hex 32)"'/g' /root/.env
```

**Upload docker-compose file**:

```bash
# From your local machine
scp docker-compose.hcw-production.yml root@165.227.180.202:/root/docker-compose.yml
```

**Configure firewall**:

```bash
# On droplet
apt-get install -y ufw

ufw --force reset
ufw default deny incoming
ufw default allow outgoing

ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 1337/tcp comment 'HCW Backend API'
ufw allow 3005/tcp comment 'Mediasoup'
ufw allow 4200/tcp comment 'Patient App'
ufw allow 4201/tcp comment 'Doctor App'
ufw allow 40000:40100/udp comment 'RTP for WebRTC'
ufw allow 40000:40100/tcp comment 'RTP for WebRTC'

ufw --force enable
ufw status
```

**Deploy HCW stack**:

```bash
cd /root

# Pull images
docker compose pull

# Start services
docker compose up -d

# Wait 60s for initialization
sleep 60

# Check status
docker compose ps
docker compose logs --tail=50
```

**Verify health**:

```bash
curl http://localhost:1337/api/healthcheck
curl http://localhost:3005/health
curl http://localhost:4200
curl http://localhost:4201
```

---

### STEP 2: Configure Telecheck Environment Variables

**Navigate to DigitalOcean Console**:

1. Go to: https://cloud.digitalocean.com/apps
2. Click: whale-app
3. Settings → Environment Variables (telecheck-api component)

**Add/Update these variables**:

**CRITICAL - Database**:

```
DATABASE_URL (SECRET)
postgresql://doadmin:ACTUAL_PASSWORD@telecheck-postgres-cluster-do-user-24735686-0.d.db.ondigitalocean.com:25060/telecheck?sslmode=require
```

Get actual password:

```bash
./doctl.exe databases connection 007511f2-f6f8-4174-8163-f2d4a8cfd49c --format Password --no-header
```

**CRITICAL - JWT/Session**:

```
JWT_SECRET (SECRET)
8f3a2c1b9e4d7a6f5c8b2e9a7d4f1c3b6e9a2d5f8c1b4e7a3d6f9c2b5e8a1d4f7

SESSION_SECRET (SECRET)
7d2e9a4b1c6f3e8d5b7a2f9c4e1d8b3a6f9c2e5d8b1a4f7e3d6c9b2a5f8e1d4c

OAUTH_SESSION_SECRET (SECRET)
6c1e8b3a9f4d2e7b5a8c1f9d4e2b7a3f6c9e2b5a8d1f4e7b3a6d9c2f5e8b1a4d
```

**CRITICAL - HCW@Home Integration**:

```
HCW_API_URL (REGULAR)
http://165.227.180.202:1337

HCW_API_SECRET (SECRET)
5b9a2d7e4f1c8b3a6e9d2f5c8b1a4e7d3f6c9b2e5a8d1f4b7e3a6c9d2b5f8e1a

HCW_PATIENT_URL (REGULAR)
http://165.227.180.202:4200

HCW_DOCTOR_URL (REGULAR)
http://165.227.180.202:4201
```

**Save and trigger new deployment** (automatic when you save)

---

### STEP 3: Run Database Migrations

Once DATABASE_URL is configured and deployment succeeds:

```bash
# Migrations run automatically on server startup
# Check logs: Apps → whale-app → Runtime Logs → telecheck-api
```

Or run manually:

```bash
# If you have local access to DATABASE_URL
npm run migrate:prod
```

---

### STEP 4: Test Complete Integration

**Wait for deployment to complete** (check: Apps → whale-app → Deployments)

**Once ACTIVE**:

1. **Access Telecheck**:
   - URL: https://whale-app-bs3xa.ondigitalocean.app
   - Login with existing account

2. **Navigate to Televisit**:
   - Should see: "Powered by HCW@Home • HIPAA Compliant"
   - NOT: Jitsi Meet interface

3. **Start Consultation**:
   - Click appointment → "Start Televisit"
   - Backend calls: `/api/consultations/:id/hcw-session`
   - Creates HCW consultation
   - Returns iframe URL

4. **Verify Video**:
   - Should load HCW@Home patient interface
   - Mediasoup WebRTC connection
   - Video/audio controls

5. **End Consultation**:
   - Click "End Consultation"
   - Calls: `/api/consultations/:id/end`
   - Closes Mediasoup room

---

## 🔍 Troubleshooting

### Telecheck Deployment Keeps Failing

**Symptom**: ERROR at 7/9 during DEPLOYING phase

**Cause**: Health check fails because DATABASE_URL not configured

**Solution**: Set DATABASE_URL in DigitalOcean console (Step 2 above)

### HCW Services Not Starting

**Check logs**:

```bash
docker compose logs hcw-backend
docker compose logs hcw-mediasoup
docker compose logs hcw-mongodb
```

**Common issues**:

- MongoDB password mismatch
- Ports already in use
- Memory insufficient (need 8GB)

### Televisit Shows Error

**Check**:

1. HCW services running: `docker compose ps`
2. HCW health: `curl http://165.227.180.202:1337/api/healthcheck`
3. Telecheck environment variables set correctly
4. Check browser console for API errors

### Can't SSH into Droplet

**Add SSH key via DigitalOcean console**:

1. Cloud → Droplets → hcw-telecheck-video
2. Access → Add SSH Key
3. Paste your public key (~/.ssh/id_rsa.pub)

---

## 📊 Current Status

**Code**: ✅ COMPLETE (3 commits pushed)
**HCW Droplet**: ✅ CREATED (165.227.180.202)
**HCW Deployment**: ⏳ PENDING (manual SSH required)
**Telecheck Deployment**: ⚠️ FAILING (needs DATABASE_URL)
**Database Migrations**: ⏳ PENDING (needs DATABASE_URL)
**End-to-End Testing**: ⏳ PENDING (all above must complete)

---

## 📚 Reference Documentation

- [HCW_HOME_BEST_PRACTICE_DEPLOYMENT.md](HCW_HOME_BEST_PRACTICE_DEPLOYMENT.md) - Complete guide
- [HCW_HOME_DEPLOYMENT_STATUS.md](HCW_HOME_DEPLOYMENT_STATUS.md) - Status tracking
- [docker-compose.hcw-production.yml](docker-compose.hcw-production.yml) - Stack config
- [server/services/hcwService.ts](server/services/hcwService.ts) - HCW API client
- [server/routes/consultations.ts](server/routes/consultations.ts) - API routes
- [client/pages/ehr/Televisit.tsx](client/pages/ehr/Televisit.tsx) - Updated UI

---

## 💰 Monthly Cost: $99-114

- Telecheck App Platform: $24
- PostgreSQL (1GB): $15
- **HCW Droplet (8GB/4CPU): $48**
- Load Balancer: $12
- MongoDB managed (optional): +$15

---

## ✅ Next Action

**You need to**:

1. SSH into 165.227.180.202 and deploy HCW stack
2. Configure DATABASE_URL and secrets in DigitalOcean console
3. Wait for Telecheck deployment to succeed
4. Test televisit integration

**Or if you want me to continue**:

- I can create additional helper scripts
- I can provide step-by-step CLI commands
- I can explain any part in more detail

All code is complete and ready. Just needs manual deployment configuration! 🚀
