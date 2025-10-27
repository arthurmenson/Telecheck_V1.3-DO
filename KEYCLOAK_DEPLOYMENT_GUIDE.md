# Keycloak Deployment Guide for TeleCheck

## The Issue

You're seeing a 404 error at `https://whale-app-bs3xa.ondigitalocean.app/realms/telecheck/account` because:

**Keycloak is a separate server application** that needs to be deployed independently from your TeleCheck web app and API.

## Current Status

✅ **TeleCheck Web App** - Deployed at https://whale-app-bs3xa.ondigitalocean.app
✅ **TeleCheck API** - Deployed at https://telecheck-api-8jwxq.ondigitalocean.app
✅ **Keycloak Integration Code** - Deployed in both apps
❌ **Keycloak Server** - NOT YET DEPLOYED

## Architecture Explained

```
┌─────────────────────────────────────────────┐
│  TeleCheck Web App (React)                  │
│  whale-app-bs3xa.ondigitalocean.app         │
│  ├─ Keycloak CLIENT code ✅                 │
│  └─ Redirects to Keycloak for auth          │
└─────────────────────────────────────────────┘
                    ↓ redirects to
┌─────────────────────────────────────────────┐
│  Keycloak Server (NEEDS TO BE DEPLOYED)     │
│  keycloak.yourdomain.com                    │
│  ├─ User Management                         │
│  ├─ Authentication                          │
│  ├─ /realms/telecheck/account ← HERE!       │
│  └─ Returns tokens to app                   │
└─────────────────────────────────────────────┘
                    ↓ authenticated
┌─────────────────────────────────────────────┐
│  TeleCheck API (Express)                    │
│  telecheck-api-8jwxq.ondigitalocean.app     │
│  ├─ Validates Keycloak tokens ✅            │
│  └─ Protected routes                        │
└─────────────────────────────────────────────┘
```

## Deployment Options

### Option 1: Local Development (FASTEST - 2 minutes) ⚡

Perfect for testing immediately on your local machine.

```bash
# Start Keycloak locally
docker run -d --name keycloak-dev -p 8180:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:23.0 start-dev

# Wait for startup (30 seconds)
sleep 30

# Configure TeleCheck realm
chmod +x scripts/configure-keycloak.sh
KEYCLOAK_URL=http://localhost:8180 ./scripts/configure-keycloak.sh
```

**Access**:

- Admin Console: http://localhost:8180/admin
- User Account: http://localhost:8180/realms/telecheck/account
- Login: `admin` / `admin`

**Test Users**:

- test.patient@example.com / TestPatient123!
- test.provider@example.com / TestProvider123! (MFA required)
- test.admin@example.com / TestAdmin123! (MFA required)

---

### Option 2: Production on Digital Ocean (RECOMMENDED) 🚀

Deploy Keycloak to a dedicated Digital Ocean droplet with PostgreSQL.

#### Quick Deploy (Automated Script)

```bash
# Make script executable
chmod +x scripts/deploy-keycloak-production.sh

# Deploy (takes ~15 minutes)
./scripts/deploy-keycloak-production.sh
```

**What This Does**:

1. Creates a Digital Ocean droplet ($24/month)
2. Installs Docker and Docker Compose
3. Deploys Keycloak + PostgreSQL
4. Configures firewall
5. Sets up the TeleCheck realm
6. Creates test users

**After Deployment**:

- Admin Console: http://DROPLET_IP:8080/admin
- User Account: http://DROPLET_IP:8080/realms/telecheck/account
- Droplet IP will be shown after deployment

#### Manual Deploy (Step-by-Step)

If you prefer manual control:

**Step 1: Create Droplet**

```bash
./doctl.exe compute droplet create telecheck-keycloak \
  --region nyc1 \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --ssh-keys $(./doctl.exe compute ssh-key list --format ID --no-header | head -n 1) \
  --wait
```

**Step 2: Get Droplet IP**

```bash
DROPLET_IP=$(./doctl.exe compute droplet list | grep telecheck-keycloak | awk '{print $3}')
echo "Droplet IP: $DROPLET_IP"
```

**Step 3: SSH and Install**

```bash
ssh root@$DROPLET_IP

# On the droplet:
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
```

**Step 4: Create Docker Compose File**

```bash
mkdir -p /opt/keycloak
cd /opt/keycloak

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: ChangeThisSecurePassword123!
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - keycloak-network

  keycloak:
    image: quay.io/keycloak/keycloak:23.0.0
    restart: always
    command: start
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: ChangeThisSecurePassword123!

      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: AdminSecurePassword123!

      KC_HTTP_ENABLED: true
      KC_PROXY: edge
      KC_HEALTH_ENABLED: true
      KC_METRICS_ENABLED: true
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    networks:
      - keycloak-network

volumes:
  postgres_data:

networks:
  keycloak-network:
    driver: bridge
EOF
```

**Step 5: Start Keycloak**

```bash
docker-compose up -d
```

**Step 6: Configure Firewall**

```bash
ufw allow 22/tcp
ufw allow 8080/tcp
ufw --force enable
```

**Step 7: Configure Realm (from your local machine)**

```bash
export KEYCLOAK_URL="http://$DROPLET_IP:8080"
./scripts/configure-keycloak.sh
```

---

### Option 3: Managed Keycloak Cloud (EASIEST) ☁️

Use a managed Keycloak service (costs money but zero maintenance).

**Recommended Providers**:

1. **Cloud-IAM** - https://www.cloud-iam.com (Keycloak as a Service)
2. **Phase Two** - https://phasetwo.io (Keycloak cloud hosting)
3. **Red Hat SSO** - https://access.redhat.com/products/red-hat-single-sign-on

**Setup**:

1. Sign up for managed Keycloak
2. Get your Keycloak URL (e.g., `https://yourorg.cloud-iam.com`)
3. Import the TeleCheck realm configuration
4. Update environment variables

---

## Post-Deployment Configuration

### 1. Update TeleCheck Environment Variables

After deploying Keycloak, update your Digital Ocean App Platform environment variables:

**For Web App** (whale-app):

```bash
# No changes needed - frontend uses OAuth redirect
```

**For API** (telecheck-api):

```
KEYCLOAK_AUTH_SERVER_URL=http://YOUR_DROPLET_IP:8080
KEYCLOAK_REALM=telecheck
KEYCLOAK_CLIENT_ID=telecheck-web
KEYCLOAK_CLIENT_SECRET=<get from Keycloak admin console>
KEYCLOAK_ADMIN_CLIENT_ID=telecheck-api
KEYCLOAK_ADMIN_CLIENT_SECRET=<get from Keycloak admin console>
```

### 2. Get Client Secrets

```bash
# SSH to Keycloak droplet
ssh root@YOUR_DROPLET_IP

# Get telecheck-web client secret
docker exec -it keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user admin \
  --password AdminSecurePassword123!

docker exec -it keycloak /opt/keycloak/bin/kcadm.sh get clients \
  -r telecheck \
  -q clientId=telecheck-web \
  --fields secret
```

### 3. Set Up SSL/HTTPS (Production)

**Using Nginx Reverse Proxy + Let's Encrypt**:

```bash
# On Keycloak droplet
apt-get install -y nginx certbot python3-certbot-nginx

# Configure Nginx
cat > /etc/nginx/sites-available/keycloak << 'EOF'
server {
    listen 80;
    server_name keycloak.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -s /etc/nginx/sites-available/keycloak /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Get SSL certificate
certbot --nginx -d keycloak.yourdomain.com
```

---

## Testing Your Deployment

### 1. Check Keycloak Health

```bash
curl http://YOUR_DROPLET_IP:8080/health/ready
# Should return: {"status":"UP","checks":[...]}
```

### 2. Access Admin Console

```
URL: http://YOUR_DROPLET_IP:8080/admin
Username: admin
Password: AdminSecurePassword123! (or what you set)
```

### 3. Test User Account Page

```
URL: http://YOUR_DROPLET_IP:8080/realms/telecheck/account
```

### 4. Test Login Flow

```bash
# From your TeleCheck app
curl -L http://YOUR_DROPLET_IP:8080/realms/telecheck/protocol/openid-connect/auth\
?client_id=telecheck-web\
&redirect_uri=https://whale-app-bs3xa.ondigitalocean.app\
&response_type=code\
&scope=openid

# Should redirect to login page
```

---

## Troubleshooting

### "Cannot connect to Keycloak"

- Check firewall: `ufw status`
- Check Keycloak is running: `docker ps`
- Check logs: `docker logs keycloak`

### "Realm not found"

- Run configuration script: `./scripts/configure-keycloak.sh`
- Check realm exists: Admin Console → Realms dropdown

### "Invalid redirect URI"

- Update redirect URIs in Admin Console
- Go to: Clients → telecheck-web → Valid redirect URIs
- Add: `https://whale-app-bs3xa.ondigitalocean.app/*`

### "SSL/TLS required"

- For development: Set `KC_HTTP_ENABLED=true` in docker-compose.yml
- For production: Set up Nginx + Let's Encrypt (see above)

---

## Cost Estimate

### Option 1: Local Docker

- **Cost**: $0 (runs on your machine)
- **Pros**: Free, instant
- **Cons**: Only accessible from your computer

### Option 2: Digital Ocean Droplet

- **Droplet**: $24/month (s-2vcpu-4gb)
- **Bandwidth**: Included (1TB)
- **Backups**: $4.80/month (optional)
- **Total**: ~$24-29/month

### Option 3: Managed Cloud

- **Cloud-IAM**: Starts at $99/month
- **Phase Two**: Starts at $150/month
- **Red Hat SSO**: Contact for pricing

---

## Security Checklist

Before going to production:

- [ ] Change default admin password
- [ ] Set up SSL/HTTPS
- [ ] Enable database backups
- [ ] Configure firewall (only allow necessary ports)
- [ ] Set up monitoring/alerts
- [ ] Enable audit logging
- [ ] Review password policies
- [ ] Set up MFA for admin accounts
- [ ] Regular security updates
- [ ] Backup recovery tested

---

## Quick Commands Reference

```bash
# Local Keycloak
docker run -d --name keycloak-dev -p 8180:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:23.0 start-dev

# Production Keycloak Deployment
chmod +x scripts/deploy-keycloak-production.sh
./scripts/deploy-keycloak-production.sh

# Configure Realm
KEYCLOAK_URL=http://YOUR_IP:8080 ./scripts/configure-keycloak.sh

# Check Status
ssh root@YOUR_DROPLET_IP "docker ps"

# View Logs
ssh root@YOUR_DROPLET_IP "docker logs keycloak -f"

# Restart Keycloak
ssh root@YOUR_DROPLET_IP "cd /opt/keycloak && docker-compose restart"

# Backup Database
ssh root@YOUR_DROPLET_IP "docker exec keycloak-postgres pg_dump -U keycloak keycloak > backup.sql"
```

---

## Next Steps

1. **Choose a deployment option** (I recommend Option 1 for testing, Option 2 for production)
2. **Deploy Keycloak** using the methods above
3. **Update environment variables** in Digital Ocean App Platform
4. **Test the integration** with your TeleCheck app
5. **Set up SSL/HTTPS** for production use

---

## Support

For issues or questions:

- See [docs/KEYCLOAK_SETUP.md](docs/KEYCLOAK_SETUP.md) for detailed setup
- See [docs/KEYCLOAK_SECURITY.md](docs/KEYCLOAK_SECURITY.md) for security guide
- Check Keycloak logs: `docker logs keycloak`
- Check deployment status: `docker ps`

---

**Generated**: $(date)
**For**: TeleCheck Healthcare Platform
**Keycloak Version**: 23.0.0
