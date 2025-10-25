# DigitalOcean Deployment Guide for whale-app

**Repository**: https://github.com/arthurmenson/Telecheck_V1.3-DO
**Branch**: ETM_telecheck
**Status**: Ready to Deploy ✅

---

## 🚀 Deploy to whale-app (3 Steps)

### Step 1: Open DigitalOcean App Platform

Visit: https://cloud.digitalocean.com/apps

Find your **whale-app** or create new app

### Step 2: Connect GitHub Repository

- Repository: `arthurmenson/Telecheck_V1.3-DO`
- Branch: `ETM_telecheck`
- Auto-deploy on push: ✅ Enabled

### Step 3: Configure Services

**API Service** (Dockerfile.server):

- Name: telecheck-api
- Port: 3000
- Instances: 2× Professional XS
- Health Check: /health

**Web Service** (Dockerfile.client):

- Name: telecheck-web
- Port: 80
- Instances: 1× Basic XXS

---

## 🔐 Required Environment Variables

Generate secrets and add to App Platform:

```bash
# Generate JWT secret
openssl rand -base64 48

# Generate encryption keys
openssl rand -hex 32  # For each PHI key
```

Set in whale-app settings:

- `DATABASE_URL` (from managed database)
- `REDIS_URL` (from managed Redis)
- `JWT_SECRET` (generated above)
- `PHI_PATIENT_KEY` (generated above)
- `PHI_MEDICAL_KEY` (generated above)
- `PHI_FINANCIAL_KEY` (generated above)
- `PHI_COMMUNICATION_KEY` (generated above)

---

## 📦 Resources

**Managed Services**:

- PostgreSQL 15 (Basic tier - $15/mo)
- Redis 7 (Basic tier - $15/mo)

**Compute**:

- API: 2× Professional XS ($24/mo)
- Web: 1× Basic XXS ($5/mo)

**Total**: ~$60/month

---

## ✅ Deploy Now!

1. Go to https://cloud.digitalocean.com/apps/whale-app (or create app)
2. Connect GitHub repo: arthurmenson/Telecheck_V1.3-DO (ETM_telecheck branch)
3. Upload `.do/app.yaml` config file
4. Add environment variables (secrets above)
5. Click "Deploy"
6. Wait ~10 minutes
7. Visit your app URL!

**Deployment time**: ~10 minutes  
**Auto-scaling**: Yes  
**Auto-SSL**: Yes  
**Auto-deploy on push**: Yes

---

Ready to go live! 🚀
