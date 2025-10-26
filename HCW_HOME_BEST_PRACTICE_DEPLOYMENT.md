# HCW@Home Best Practice Deployment Guide

## Telecheck Integration with HCW@Home Embedded Televisit

**Last Updated**: 2025-10-26
**HCW@Home Version**: Latest (Open Source GPLv3)
**Documentation**: https://docs.hcw-at-home.com/

---

## Overview

HCW@Home is an open-source, institution-level secure teleconsultation system featuring:

- ✅ **WebRTC Video/Audio** via Mediasoup (NOT Jitsi, NOT Twilio)
- ✅ **Secure Chat** with file attachments
- ✅ **HIPAA-Compliant** architecture
- ✅ **HL7 FHIR** API integration
- ✅ **OpenID/SAML** authentication
- ✅ **MongoDB** for data storage
- ✅ **ClamAV** antivirus scanning

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Telecheck Platform                        │
│  ┌─────────────────┐  ┌──────────────────┐                  │
│  │   PostgreSQL    │  │   Telecheck API  │                  │
│  │   (User Auth)   │  │   (Port 3000)    │                  │
│  └────────┬────────┘  └─────────┬────────┘                  │
│           │                     │                            │
│           └─────────┬───────────┘                            │
│                     │ JWT Token                              │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           HCW@Home Integration Layer                  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  HCW@Home Backend API (Port 1337)              │  │   │
│  │  │  - Patient Management                          │  │   │
│  │  │  - Doctor Management                           │  │   │
│  │  │  - Consultation Scheduling                     │  │   │
│  │  │  - WebRTC Session Management                   │  │   │
│  │  └──────────────┬─────────────────────────────────┘  │   │
│  │                 │                                     │   │
│  │  ┌──────────────┼─────────────────────────────────┐  │   │
│  │  │              ▼                                  │  │   │
│  │  │  Mediasoup Video Server (Port 3005)            │  │   │
│  │  │  - WebRTC SFU (Selective Forwarding Unit)      │  │   │
│  │  │  - RTP Ports: 40000-40100 UDP/TCP              │  │   │
│  │  │  - NO EXTERNAL SDKs (Jitsi/Twilio)             │  │   │
│  │  └─────────────────────────────────────────────────┘  │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │  MongoDB (Port 27017)                            │ │   │
│  │  │  - Consultation Data                             │ │   │
│  │  │  - Messages & Files                              │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │  ClamAV Antivirus (Port 3310)                    │ │   │
│  │  │  - File Upload Scanning                          │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

     ┌────────────────┐         ┌────────────────┐
     │ Patient App    │         │ Doctor App     │
     │ (Port 4200)    │         │ (Port 4201)    │
     │ Angular/Ionic  │         │ Angular        │
     └────────────────┘         └────────────────┘
```

---

## Deployment Steps

### Step 1: Prerequisites

**Required DigitalOcean Resources**:

1. **App Platform**: Telecheck API (already deployed)
2. **Managed PostgreSQL**: telecheck-postgres-cluster (already created)
3. **Droplet or App Platform Component**: For HCW@Home services
4. **Managed MongoDB** (recommended) OR MongoDB container

**Required Secrets** (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")`):

- `HCW_APP_SECRET` (64 hex characters)
- `HCW_REFRESH_TOKEN_SECRET` (64 hex characters)
- `MEDIASOUP_USER` (username for video server auth)
- `MEDIASOUP_SECRET` (64 hex characters)
- `HCW_MONGO_USER` (MongoDB admin username)
- `HCW_MONGO_PASSWORD` (strong password)

### Step 2: Deploy HCW@Home Stack

**Option A: DigitalOcean Droplet** (Recommended for RTP/WebRTC)

1. **Create Droplet**:

   ```bash
   # Premium Intel 8GB RAM / 4 vCPUs / 160GB SSD
   # Location: Same region as Telecheck (nyc3)
   # Image: Ubuntu 24.04 LTS
   ```

2. **Install Docker**:

   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo systemctl enable --now docker
   ```

3. **Deploy HCW@Home**:

   ```bash
   # Upload docker-compose.hcw-production.yml
   scp docker-compose.hcw-production.yml root@<droplet-ip>:/root/

   # SSH into droplet
   ssh root@<droplet-ip>

   # Create .env file
   cat > .env <<'EOF'
   # === HCW@Home URLs ===
   HCW_PUBLIC_URL=https://telecheck-patient.yourdomain.com
   HCW_DOCTOR_URL=https://telecheck-doctor.yourdomain.com
   TELECHECK_APP_URL=https://whale-app-bs3xa.ondigitalocean.app

   # === MongoDB ===
   HCW_MONGODB_URI=mongodb://hcw:PASSWORD@hcw-mongodb:27017/hcw-athome?authSource=admin
   HCW_MONGO_USER=hcw
   HCW_MONGO_PASSWORD=<GENERATE_STRONG_PASSWORD>

   # === JWT Secrets ===
   HCW_APP_SECRET=<GENERATE_64_HEX_CHARS>
   HCW_REFRESH_TOKEN_SECRET=<GENERATE_64_HEX_CHARS>

   # === Keycloak Integration ===
   KEYCLOAK_AUTH_SERVER_URL=https://whale-app-bs3xa.ondigitalocean.app/auth
   KEYCLOAK_REALM=telecheck
   KEYCLOAK_CLIENT_ID=hcw-integration
   KEYCLOAK_CLIENT_SECRET=<FROM_KEYCLOAK_ADMIN>

   # === Email (SendGrid) ===
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_SENDER=noreply@telecheck.com
   SMTP_USER=apikey
   SMTP_PASSWORD=<SENDGRID_API_KEY>

   # === Twilio (SMS Only - NOT Video) ===
   TWILIO_ACCOUNT_SID=<YOUR_TWILIO_SID>
   TWILIO_AUTH_TOKEN=<YOUR_TWILIO_TOKEN>
   TWILIO_PHONE_NUMBER=<YOUR_TWILIO_NUMBER>

   # === Mediasoup Video Server ===
   MEDIASOUP_USER=mediasoup-admin
   MEDIASOUP_SECRET=<GENERATE_64_HEX_CHARS>
   MEDIASOUP_ANNOUNCED_IP=<DROPLET_PUBLIC_IP>
   EOF

   # Deploy stack
   docker compose -f docker-compose.hcw-production.yml up -d
   ```

4. **Configure Firewall**:
   ```bash
   # Allow essential ports
   ufw allow 22/tcp      # SSH
   ufw allow 80/tcp      # HTTP
   ufw allow 443/tcp     # HTTPS
   ufw allow 1337/tcp    # HCW Backend API
   ufw allow 3005/tcp    # Mediasoup signaling
   ufw allow 4200/tcp    # Patient app
   ufw allow 4201/tcp    # Doctor app
   ufw allow 40000:40100/udp  # RTP for WebRTC
   ufw allow 40000:40100/tcp  # RTP for WebRTC
   ufw enable
   ```

**Option B: DigitalOcean App Platform Component**

Add to `.do/app.yaml`:

```yaml
services:
  - name: hcw-backend
    github:
      repo: HCW-home/backend
      branch: master
      deploy_on_push: false
    instance_count: 1
    instance_size_slug: professional-s
    http_port: 1337
    envs:
      # (Use same environment variables as above)
```

### Step 3: Configure Reverse Proxy (NGINX)

```nginx
# /etc/nginx/sites-available/hcw-telecheck

# Patient Interface
server {
    listen 443 ssl http2;
    server_name telecheck-patient.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/telecheck-patient.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/telecheck-patient.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Doctor Interface
server {
    listen 443 ssl http2;
    server_name telecheck-doctor.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/telecheck-doctor.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/telecheck-doctor.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4201;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# HCW Backend API
server {
    listen 443 ssl http2;
    server_name hcw-api.telecheck.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/hcw-api.telecheck.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hcw-api.telecheck.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

### Step 4: Integrate Telecheck with HCW@Home

**Update Telecheck environment** (`.do/app.yaml`):

```yaml
envs:
  # === HCW@Home Integration ===
  - key: HCW_API_URL
    value: "https://hcw-api.telecheck.yourdomain.com"
  - key: HCW_API_SECRET
    scope: RUN_TIME
    type: SECRET
  - key: HCW_PATIENT_URL
    value: "https://telecheck-patient.yourdomain.com"
  - key: HCW_DOCTOR_URL
    value: "https://telecheck-doctor.yourdomain.com"
```

**Create HCW service client** (`server/services/hcwService.ts`):

```typescript
import axios from "axios";
import jwt from "jsonwebtoken";

const HCW_API_URL = process.env.HCW_API_URL;
const HCW_API_SECRET = process.env.HCW_API_SECRET;

export async function createHCWConsultation(params: {
  patientId: string;
  doctorId: string;
  scheduledTime: Date;
}) {
  const token = jwt.sign(
    {
      aud: "hcw-backend",
      iss: "telecheck",
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    HCW_API_SECRET,
  );

  const response = await axios.post(
    `${HCW_API_URL}/api/consultation`,
    {
      patient: params.patientId,
      doctor: params.doctorId,
      scheduledDate: params.scheduledTime.toISOString(),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}
```

### Step 5: Update Televisit Component

**Replace Jitsi with HCW@Home** ([client/pages/ehr/Televisit.tsx](client/pages/ehr/Televisit.tsx)):

```typescript
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function Televisit() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [consultationUrl, setConsultationUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get HCW@Home consultation URL from Telecheck API
    fetch(`/api/consultations/${appointmentId}/hcw-url`)
      .then((res) => res.json())
      .then((data) => {
        // HCW@Home provides a direct URL for the video consultation
        setConsultationUrl(data.hcwUrl);
      })
      .catch((err) => console.error("Failed to get HCW consultation", err));
  }, [appointmentId]);

  if (!consultationUrl) {
    return <div>Loading consultation...</div>;
  }

  return (
    <div className="h-screen w-full">
      {/* Embed HCW@Home patient interface directly */}
      <iframe
        src={consultationUrl}
        className="w-full h-full border-0"
        allow="camera; microphone; display-capture"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
      />
    </div>
  );
}
```

---

## Testing Checklist

### Health Checks

```bash
# HCW Backend
curl https://hcw-api.telecheck.yourdomain.com/api/healthcheck

# Mediasoup
curl http://<droplet-ip>:3005/health

# MongoDB
docker exec hcw-mongodb mongosh --eval "db.adminCommand('ping')"

# ClamAV
docker exec hcw-clamav /usr/local/bin/clamdcheck.sh
```

### Integration Tests

1. ✅ **Patient Registration**: Create patient in Telecheck → Verify in HCW MongoDB
2. ✅ **Doctor Onboarding**: Create doctor in Telecheck → Verify in HCW MongoDB
3. ✅ **Appointment Scheduling**: Create appointment in Telecheck → Create consultation in HCW
4. ✅ **Video Consultation**: Join video via Telecheck → Verify Mediasoup WebRTC connection
5. ✅ **File Upload**: Upload file in consultation → Verify ClamAV scan → Store in MongoDB
6. ✅ **SMS Notifications**: Schedule consultation → Verify Twilio SMS sent

---

## Security Best Practices

### 1. JWT Secret Rotation

```bash
# Rotate every 90 days
NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "New HCW_APP_SECRET: $NEW_SECRET"
# Update .env and restart services
```

### 2. MongoDB Backup

```bash
# Daily automated backups
crontab -e
# Add: 0 2 * * * docker exec hcw-mongodb mongodump --out /backup/$(date +\%Y\%m\%d) --authenticationDatabase admin -u hcw -p PASSWORD
```

### 3. TLS Certificate Renewal

```bash
# Auto-renew with Let's Encrypt
certbot renew --deploy-hook "systemctl reload nginx"
```

### 4. Network Segmentation

- HCW services on private network
- Only NGINX reverse proxy exposed publicly
- PostgreSQL (Telecheck) and MongoDB (HCW) on separate VPCs

### 5. Audit Logging

```yaml
# Enable comprehensive logging
LOGLEVEL: info
LOGFORMAT: splunk # For SIEM integration
```

---

## Monitoring & Observability

### Prometheus Metrics

```yaml
# docker-compose.hcw-production.yml additions
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=<STRONG_PASSWORD>
```

### Key Metrics to Monitor

- **Mediasoup**: Active connections, RTP packet loss, jitter
- **MongoDB**: Query performance, connection pool, replication lag
- **Backend**: API response times, error rates, consultation duration
- **ClamAV**: Scan times, threats detected

---

## Cost Estimation (DigitalOcean)

| Resource               | Spec               | Monthly Cost   |
| ---------------------- | ------------------ | -------------- |
| Telecheck App Platform | 2x Professional XS | $24            |
| PostgreSQL             | 1GB RAM, 10GB SSD  | $15            |
| HCW Droplet            | 8GB RAM, 4 vCPUs   | $48            |
| MongoDB (Managed)      | 1GB RAM, 15GB SSD  | $15            |
| Load Balancer          | 1 instance         | $12            |
| **Total**              |                    | **$114/month** |

---

## Troubleshooting

### Video Connection Issues

**Symptom**: Video fails to connect
**Solution**:

```bash
# Check Mediasoup logs
docker logs hcw-mediasoup

# Verify RTP ports are open
netstat -tuln | grep -E "40000|40100"

# Test WebRTC connectivity
curl http://<droplet-ip>:3005/health
```

### Authentication Failures

**Symptom**: Cannot log in via OpenID
**Solution**:

```bash
# Verify Keycloak configuration
curl https://whale-app-bs3xa.ondigitalocean.app/auth/realms/telecheck/.well-known/openid-configuration

# Check HCW backend logs
docker logs hcw-backend | grep -i openid
```

### File Upload Errors

**Symptom**: File uploads fail
**Solution**:

```bash
# Check ClamAV status
docker exec hcw-clamav freshclam  # Update virus definitions
docker logs hcw-clamav | grep -i error

# Verify upload size limits
docker exec hcw-backend env | grep MAX_UPLOAD_SIZE_MB
```

---

## References

- **HCW@Home Official Docs**: https://docs.hcw-at-home.com/
- **GitHub Repository**: https://github.com/HCW-home/backend
- **Mediasoup Documentation**: https://mediasoup.org/documentation/
- **WebRTC Best Practices**: https://webrtc.org/getting-started/overview

---

## Support

For HCW@Home issues:

- **GitHub Issues**: https://github.com/HCW-home/backend/issues
- **Documentation**: https://docs.hcw-at-home.com/

For Telecheck integration issues:

- Contact Telecheck development team
