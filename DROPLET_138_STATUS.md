# Droplet 138.197.122.16 - HCW@Home Status Report

**Date**: October 26, 2025
**Droplet ID**: 526312060
**IP Address**: 138.197.122.16
**Status**: ACTIVE ✅

---

## Infrastructure Details

| Property         | Value                    |
| ---------------- | ------------------------ |
| **Droplet Name** | hcw-telecheck-video      |
| **ID**           | 526312060                |
| **Public IPv4**  | 138.197.122.16           |
| **Status**       | ACTIVE                   |
| **RAM**          | 8192 MB (8 GB)           |
| **vCPUs**        | 4                        |
| **Disk**         | 160 GB SSD               |
| **Region**       | nyc3 (New York 3)        |
| **Purpose**      | HCW@Home Televisit Stack |

---

## Service Status Check Results

### HCW@Home Services (All OFFLINE ⚠️)

| Service             | Port  | Expected URL                               | Status     | HTTP Code |
| ------------------- | ----- | ------------------------------------------ | ---------- | --------- |
| **HCW Backend API** | 1337  | http://138.197.122.16:1337/api/healthcheck | ⚠️ OFFLINE | 000       |
| **HCW Patient App** | 4200  | http://138.197.122.16:4200                 | ⚠️ OFFLINE | 000       |
| **HCW Doctor App**  | 4201  | http://138.197.122.16:4201                 | ⚠️ OFFLINE | 000       |
| **Mediasoup SFU**   | 3005  | http://138.197.122.16:3005/health          | ⚠️ OFFLINE | 000       |
| **MongoDB**         | 27017 | (internal only)                            | ⚠️ OFFLINE | N/A       |

**Result**: HTTP Status 000 indicates connection timeout/refused - services are not running.

---

## SSH Access Status

### Attempt 1: Direct SSH

```bash
ssh root@138.197.122.16
```

**Result**: ❌ Permission denied (publickey)

**Reason**:

- Local SSH key not authorized on droplet
- Droplet was created with SSH key ID: 50053934 (telecheck-ssh-key)
- Local machine SSH key doesn't match

### Available SSH Keys in DigitalOcean

| Key ID   | Name              |
| -------- | ----------------- |
| 50053934 | telecheck-ssh-key |

**Status**: SSH access requires either:

1. Adding the matching private key to local ~/.ssh/ directory
2. Using DigitalOcean Console Access (web-based terminal)
3. Adding a new SSH key to the droplet via DigitalOcean dashboard

---

## What's Missing

### 1. Docker Installation

**Status**: UNKNOWN (cannot verify without SSH access)

**Required**:

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
docker --version
```

### 2. HCW@Home Docker Compose Files

**Status**: NOT DEPLOYED

**Required Files**:

- `/root/docker-compose.hcw-production.yml`
- `/root/.env` (environment variables)

**Available Locally**:

- ✅ `docker-compose.hcw-production.yml` (197 lines)
- ✅ Deployment script: `scripts/deploy-hcw-droplet.sh` (325 lines)

### 3. Environment Configuration

**Status**: NOT CONFIGURED

**Required Environment Variables**:

```env
# MongoDB
HCW_MONGODB_URI=mongodb://hcw:PASSWORD@hcw-mongodb:27017/hcw?authSource=admin
MONGO_INITDB_ROOT_USERNAME=hcw
MONGO_INITDB_ROOT_PASSWORD=secure_password_here

# Mediasoup WebRTC
MEDIASOUP_ANNOUNCED_IP=138.197.122.16
MEDIASOUP_USER=mediasoup
MEDIASOUP_SECRET=secure_mediasoup_secret

# HCW Backend
HCW_JWT_SECRET=secure_jwt_secret_64_chars_minimum
NODE_ENV=production
HCW_API_PORT=1337

# Frontend Apps
HCW_PATIENT_PORT=4200
HCW_DOCTOR_PORT=4201

# OpenID/SAML (Optional - for Keycloak integration)
OIDC_ISSUER=https://whale-app-bs3xa.ondigitalocean.app/auth/realms/telecheck
OIDC_CLIENT_ID=hcw-backend
OIDC_CLIENT_SECRET=SECRET_FROM_KEYCLOAK
```

### 4. Firewall Rules

**Status**: UNKNOWN

**Required Ports**:

```bash
# TCP ports
ufw allow 1337/tcp  # HCW Backend API
ufw allow 3005/tcp  # Mediasoup API
ufw allow 4200/tcp  # Patient App
ufw allow 4201/tcp  # Doctor App
ufw allow 27017/tcp # MongoDB (restrict to localhost)

# UDP ports for WebRTC
ufw allow 40000:40100/udp  # RTP for Mediasoup
ufw allow 40000:40100/tcp  # RTP for Mediasoup
```

### 5. Docker Containers

**Status**: NOT RUNNING

**Expected Containers** (from docker-compose.hcw-production.yml):

1. `hcw-backend` - Node.js/Express API server
2. `hcw-mediasoup` - WebRTC SFU for video/audio
3. `hcw-patient-app` - Angular/Ionic patient frontend
4. `hcw-doctor-app` - Angular/Ionic doctor frontend
5. `hcw-mongodb` - MongoDB database
6. `hcw-clamav` - Antivirus scanner (optional)

---

## Deployment Options

### Option 1: Manual Deployment via DigitalOcean Console

1. **Access Console**:
   - Go to: https://cloud.digitalocean.com/droplets/526312060/console
   - Login as root (password-based or recovery console)

2. **Install Docker**:

   ```bash
   curl -fsSL https://get.docker.com | sh
   systemctl enable --now docker
   docker --version
   ```

3. **Upload Files** (via SCP from another machine or copy-paste):

   ```bash
   # Create directory
   mkdir -p /root/hcw-home
   cd /root/hcw-home

   # Create docker-compose.yml (paste content)
   nano docker-compose.hcw-production.yml
   # Paste content from local file

   # Create .env file
   nano .env
   # Paste environment variables
   ```

4. **Configure Firewall**:

   ```bash
   ufw allow 1337/tcp
   ufw allow 3005/tcp
   ufw allow 4200/tcp
   ufw allow 4201/tcp
   ufw allow 40000:40100/udp
   ufw allow 40000:40100/tcp
   ufw --force enable
   ```

5. **Start Services**:

   ```bash
   cd /root/hcw-home
   docker compose -f docker-compose.hcw-production.yml pull
   docker compose -f docker-compose.hcw-production.yml up -d
   ```

6. **Verify**:
   ```bash
   docker compose ps
   curl http://localhost:1337/api/healthcheck
   curl http://localhost:4200
   curl http://localhost:4201
   ```

### Option 2: Add SSH Key and Use Automated Script

1. **Find Private Key** (matching key ID 50053934):
   - Check: `~/.ssh/id_rsa` or `~/.ssh/telecheck-ssh-key`
   - OR generate new key and add to droplet via DigitalOcean dashboard

2. **Test SSH Access**:

   ```bash
   ssh -i ~/.ssh/telecheck-ssh-key root@138.197.122.16
   ```

3. **Run Automated Deployment**:
   ```bash
   cd /c/Users/menso/Downloads/Telecheck_V1.3-DO
   chmod +x scripts/deploy-hcw-droplet.sh
   bash scripts/deploy-hcw-droplet.sh
   ```

### Option 3: Use doctl SSH (if supported)

```bash
./doctl.exe compute ssh 526312060 --ssh-command "docker --version"
```

---

## Integration with Telecheck

### Current Telecheck Deployment

| Property         | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Status**       | ✅ ACTIVE (deployment 49c535d6)                 |
| **URL**          | https://whale-app-bs3xa.ondigitalocean.app      |
| **API Endpoint** | https://whale-app-bs3xa.ondigitalocean.app/api  |
| **Health Check** | PASSING                                         |
| **Database**     | ⚠️ NOT CONFIGURED (graceful degradation active) |

### HCW Integration Endpoints

**Implemented in Telecheck**:

- ✅ POST `/api/consultations/:id/hcw-session` - Create consultation
- ✅ POST `/api/consultations/:id/end` - End consultation
- ✅ GET `/api/consultations/:id/status` - Get status

**Configuration**:

```yaml
# In .do/app.yaml
- key: HCW_API_URL
  value: "http://138.197.122.16:1337" # ⚠️ Pointing to OFFLINE service
- key: HCW_PATIENT_URL
  value: "http://138.197.122.16:4200" # ⚠️ Pointing to OFFLINE service
- key: HCW_DOCTOR_URL
  value: "http://138.197.122.16:4201" # ⚠️ Pointing to OFFLINE service
```

**Impact**:

- Telecheck Televisit component will fail to create HCW consultations
- Frontend will show: "HCW@Home service is unavailable"
- Axios connection errors: `ECONNREFUSED 138.197.122.16:1337`

---

## Testing Readiness

### Prerequisites Checklist

#### Infrastructure

- [x] Droplet created (138.197.122.16)
- [x] 8GB RAM, 4 vCPUs allocated
- [x] Droplet status: ACTIVE
- [ ] SSH access configured
- [ ] Docker installed
- [ ] Firewall rules configured

#### HCW Stack

- [x] docker-compose.hcw-production.yml ready
- [ ] Uploaded to droplet
- [ ] Environment variables configured
- [ ] Services started
- [ ] Health checks passing

#### Telecheck Integration

- [x] Frontend code updated (Televisit.tsx)
- [x] Backend service created (hcwService.ts)
- [x] API routes implemented (consultations.ts)
- [x] Environment variables in .do/app.yaml
- [ ] HCW services accessible from App Platform
- [ ] End-to-end test successful

### Current Blockers

1. **SSH Access** (HIGH PRIORITY)
   - Cannot deploy without console/SSH access
   - Need matching private key for key ID 50053934
   - OR use DigitalOcean web console

2. **HCW Services Not Running** (CRITICAL)
   - All ports returning connection refused
   - Docker likely not installed
   - No containers running

3. **Environment Configuration** (MEDIUM PRIORITY)
   - Need to generate secure secrets
   - MongoDB credentials required
   - JWT secrets required

---

## Next Steps

### Immediate Actions Required

1. **Gain SSH/Console Access**

   ```bash
   # Option A: Find telecheck-ssh-key private key
   # Option B: Access via DigitalOcean web console
   # Option C: Generate new key and add to droplet
   ```

2. **Install Docker**

   ```bash
   curl -fsSL https://get.docker.com | sh
   systemctl enable --now docker
   ```

3. **Deploy HCW Stack**

   ```bash
   # Upload files
   scp docker-compose.hcw-production.yml root@138.197.122.16:/root/

   # Create .env with secrets
   ssh root@138.197.122.16
   cat > /root/.env << 'EOF'
   [environment variables here]
   EOF

   # Start services
   cd /root
   docker compose -f docker-compose.hcw-production.yml up -d
   ```

4. **Verify Deployment**

   ```bash
   # Run test script
   bash scripts/test-hcw-journey.sh

   # Expected output:
   # ✓ HCW Backend: ONLINE
   # ✓ Patient App: ONLINE
   # ✓ Doctor App: ONLINE
   # ✓ Mediasoup: ONLINE
   ```

5. **Run Full Test Journey**
   ```bash
   # Complete doctor-patient test
   # Manual testing with two browsers
   # Verify video/audio connection
   ```

---

## Files Ready for Deployment

### Local Files (Ready to Upload)

1. **docker-compose.hcw-production.yml** (197 lines)
   - All 6 services defined
   - Production-ready configuration
   - Health checks included

2. **scripts/deploy-hcw-droplet.sh** (325 lines)
   - Automated deployment script
   - Docker installation
   - Service startup
   - Health verification

3. **scripts/test-hcw-journey.sh** (393 lines)
   - 10-step comprehensive test
   - Infrastructure verification
   - Patient/doctor creation
   - Consultation flow testing

4. **HCW_HOME_BEST_PRACTICE_DEPLOYMENT.md** (820 lines)
   - Complete deployment guide
   - Architecture diagrams
   - Troubleshooting section
   - Security best practices

### Environment Template

```env
# Save this as /root/.env on the droplet

# MongoDB Configuration
HCW_MONGO_USER=hcw
HCW_MONGO_PASSWORD=$(openssl rand -hex 32)
HCW_MONGODB_URI=mongodb://hcw:${HCW_MONGO_PASSWORD}@hcw-mongodb:27017/hcw?authSource=admin

# Mediasoup WebRTC
MEDIASOUP_ANNOUNCED_IP=138.197.122.16
MEDIASOUP_USER=mediasoup
MEDIASOUP_SECRET=$(openssl rand -hex 32)

# HCW Backend
HCW_JWT_SECRET=$(openssl rand -hex 64)
HCW_API_SECRET=$(openssl rand -hex 64)
NODE_ENV=production
HCW_API_PORT=1337

# Telecheck Integration
TELECHECK_API_URL=https://whale-app-bs3xa.ondigitalocean.app/api
TELECHECK_CALLBACK_URL=https://whale-app-bs3xa.ondigitalocean.app/televisit/callback

# Frontend Apps
HCW_PATIENT_PORT=4200
HCW_DOCTOR_PORT=4201

# Optional: Keycloak SSO
# OIDC_ISSUER=https://whale-app-bs3xa.ondigitalocean.app/auth/realms/telecheck
# OIDC_CLIENT_ID=hcw-backend
# OIDC_CLIENT_SECRET=<from_keycloak>
```

---

## Summary

### What Works ✅

- Droplet is created and active
- Telecheck deployment is ACTIVE
- All integration code is ready
- Test scripts are prepared
- Documentation is complete

### What Doesn't Work ⚠️

- SSH access blocked (no private key)
- HCW services not deployed
- No Docker on droplet (unverified)
- All HCW ports returning connection refused

### To Get Testing ✅

1. Gain console/SSH access (15 minutes)
2. Install Docker (5 minutes)
3. Upload docker-compose.yml and .env (2 minutes)
4. Start services (3 minutes)
5. Run test script (10 minutes)

**Total Time Estimate**: ~35 minutes to full testing readiness

---

## Quick Commands Reference

```bash
# Check droplet status
./doctl.exe compute droplet get 526312060 --format ID,Name,PublicIPv4,Status

# Test HCW services
curl http://138.197.122.16:1337/api/healthcheck
curl http://138.197.122.16:4200
curl http://138.197.122.16:4201

# Run full test journey
bash scripts/test-hcw-journey.sh

# Access droplet console
# https://cloud.digitalocean.com/droplets/526312060/console
```

---

**Status**: 🔴 HCW services NOT DEPLOYED - Requires SSH/console access to continue
**Blocker**: SSH private key for telecheck-ssh-key (ID: 50053934) not available locally
**Recommendation**: Use DigitalOcean web console to manually deploy services
