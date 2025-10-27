# Keycloak SSL Configuration Complete

## Overview

Successfully configured Keycloak with custom domain and SSL certificate for the Telecheck application.

**Domain**: `auth.telecheck.health`
**Keycloak Server IP**: `198.211.110.151`
**SSL Certificate**: Let's Encrypt (Auto-renewal enabled)
**Date**: October 27, 2025

---

## Configuration Summary

### 1. DNS Configuration

- **A Record**: `auth.telecheck.health` → `198.211.110.151`
- **DNS Status**: ✅ Propagated and verified
- **DNS Servers Tested**: Google DNS (8.8.8.8), Cloudflare DNS (1.1.1.1)

### 2. Nginx Reverse Proxy

**Location**: `/etc/nginx/sites-available/keycloak` on droplet `198.211.110.151`

```nginx
server {
    listen 80;
    server_name auth.telecheck.health;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # WebSocket support (for Keycloak admin console)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Buffer settings
        proxy_buffering off;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
}
```

**Status**: ✅ Configured and enabled

### 3. SSL Certificate (Let's Encrypt)

**Certificate Details**:

- **Certificate Path**: `/etc/letsencrypt/live/auth.telecheck.health/fullchain.pem`
- **Private Key Path**: `/etc/letsencrypt/live/auth.telecheck.health/privkey.pem`
- **Expiration Date**: January 25, 2026
- **Auto-Renewal**: ✅ Enabled via systemd timer

**Installation Command Used**:

```bash
certbot --nginx -d auth.telecheck.health \
  --non-interactive \
  --agree-tos \
  --email admin@telecheck.health \
  --redirect
```

**SSL Configuration Applied by Certbot**:

- Automatic HTTP to HTTPS redirect
- Strong SSL ciphers
- HSTS (HTTP Strict Transport Security) enabled
- Security headers configured

### 4. Keycloak Docker Compose Configuration

**Updated Configuration** (`/opt/keycloak/docker-compose.yml`):

```yaml
environment:
  KC_HOSTNAME: auth.telecheck.health
  KC_HOSTNAME_STRICT: true
  KC_HOSTNAME_STRICT_HTTPS: true
  KC_HTTP_ENABLED: true
  KC_PROXY: edge
  KC_HEALTH_ENABLED: true
  KC_METRICS_ENABLED: true
```

**Key Changes**:

- `KC_HOSTNAME`: Changed from IP address to `auth.telecheck.health`
- `KC_HOSTNAME_STRICT`: Enabled to enforce hostname validation
- `KC_HOSTNAME_STRICT_HTTPS`: Enabled to enforce HTTPS
- `KC_PROXY: edge`: Configured for reverse proxy setup

**Status**: ✅ Restarted and operational

### 5. API Environment Variables

**Updated in** `api-app-spec.yaml`:

```yaml
- key: KEYCLOAK_URL
  scope: RUN_AND_BUILD_TIME
  value: https://auth.telecheck.health

- key: KEYCLOAK_AUTH_SERVER_URL
  scope: RUN_AND_BUILD_TIME
  value: https://auth.telecheck.health
```

**Status**: ✅ Deployed to DigitalOcean App Platform

---

## Verification Tests

### Health Endpoint

```bash
curl https://auth.telecheck.health/health/ready
```

**Result**: ✅ HTTP 200 OK

### OpenID Configuration

```bash
curl https://auth.telecheck.health/realms/telecheck/.well-known/openid-configuration
```

**Key Endpoints Verified**:

- **Issuer**: `https://auth.telecheck.health/realms/telecheck`
- **Authorization Endpoint**: `https://auth.telecheck.health/realms/telecheck/protocol/openid-connect/auth`
- **Token Endpoint**: `https://auth.telecheck.health/realms/telecheck/protocol/openid-connect/token`
- **JWKS URI**: `https://auth.telecheck.health/realms/telecheck/protocol/openid-connect/certs`
- **UserInfo Endpoint**: `https://auth.telecheck.health/realms/telecheck/protocol/openid-connect/userinfo`

**Status**: ✅ All endpoints using HTTPS with correct domain

### Admin Console

**URL**: `https://auth.telecheck.health/admin/`

**Status**: ✅ Accessible with automatic redirect to master console

### SSL Certificate Validation

```bash
curl -I https://auth.telecheck.health
```

**Security Headers Present**:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: no-referrer`

**Status**: ✅ Valid SSL certificate, secure headers configured

---

## Access Information

### Admin Console

- **URL**: `https://auth.telecheck.health/admin/`
- **Username**: `admin`
- **Password**: `AdminPassword123!SecureChangeMe` (⚠️ Change in production!)

### Realm Information

- **Realm Name**: `telecheck`
- **Display Name**: TeleCheck Healthcare
- **SSL Required**: External requests only

### Clients

1. **telecheck-web** (Public Client)
   - Client ID: `telecheck-web`
   - Type: Public (browser-based)
   - Authentication Flow: Authorization Code with PKCE

2. **telecheck-api** (Service Account)
   - Client ID: `telecheck-api`
   - Type: Confidential (server-side)
   - Service Account: Enabled

### Realm Endpoints

- **Account Management**: `https://auth.telecheck.health/realms/telecheck/account`
- **OIDC Configuration**: `https://auth.telecheck.health/realms/telecheck/.well-known/openid-configuration`
- **SAML Metadata**: `https://auth.telecheck.health/realms/telecheck/protocol/saml/descriptor`

---

## Maintenance & Operations

### SSL Certificate Renewal

Certificate auto-renewal is managed by `certbot.timer`:

```bash
# Check renewal timer status
systemctl status certbot.timer

# Test renewal (dry run)
certbot renew --dry-run

# Manual renewal if needed
certbot renew
```

### Keycloak Service Management

```bash
# SSH into Keycloak server
ssh root@198.211.110.151

# Navigate to Keycloak directory
cd /opt/keycloak

# View logs
docker compose logs -f keycloak

# Restart Keycloak
docker compose restart keycloak

# Full restart (database included)
docker compose down && docker compose up -d

# Check status
docker compose ps
```

### Nginx Management

```bash
# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# View logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Firewall Configuration

Current firewall rules (UFW):

```bash
# View status
ufw status

# Current rules:
# - 22/tcp (SSH): ALLOW
# - 80/tcp (HTTP): ALLOW
# - 443/tcp (HTTPS): ALLOW
# - 8080/tcp (Keycloak): ALLOW
```

---

## Security Recommendations

### Completed ✅

- [x] SSL/TLS certificate installed and configured
- [x] HTTPS redirect enabled
- [x] HSTS header configured
- [x] Security headers enabled
- [x] Hostname strict mode enabled
- [x] Proxy headers configured correctly
- [x] Auto-renewal for SSL certificate enabled

### Recommended Next Steps ⚠️

- [ ] **Change default admin password** (currently using default)
- [ ] **Rotate Keycloak database password**
- [ ] **Configure firewall to restrict port 8080** (only allow localhost/Nginx)
- [ ] **Enable MFA for admin accounts**
- [ ] **Configure rate limiting** (at Nginx level)
- [ ] **Set up monitoring and alerting** (uptime, certificate expiry)
- [ ] **Regular security updates** (schedule system updates)
- [ ] **Database backups** (automate PostgreSQL backups)

---

## Integration with Telecheck API

### Environment Variables Set

The following environment variables are now configured in the Telecheck API:

```yaml
KEYCLOAK_URL: https://auth.telecheck.health
KEYCLOAK_AUTH_SERVER_URL: https://auth.telecheck.health
KEYCLOAK_REALM: telecheck
KEYCLOAK_CLIENT_ID: telecheck-web-app
KEYCLOAK_CLIENT_SECRET: [ENCRYPTED]
KEYCLOAK_CALLBACK_URL: ${APP_URL}/api/auth/keycloak/callback
```

### Testing Authentication Flow

1. **User Login**:

   ```
   https://auth.telecheck.health/realms/telecheck/protocol/openid-connect/auth
   ```

2. **Token Exchange**:

   ```
   POST https://auth.telecheck.health/realms/telecheck/protocol/openid-connect/token
   ```

3. **User Info**:
   ```
   GET https://auth.telecheck.health/realms/telecheck/protocol/openid-connect/userinfo
   ```

---

## Troubleshooting

### Issue: Cannot access admin console

**Solution**:

```bash
# Check Keycloak logs
ssh root@198.211.110.151
cd /opt/keycloak
docker compose logs keycloak --tail=100
```

### Issue: SSL certificate errors

**Solution**:

```bash
# Check certificate validity
openssl s_client -connect auth.telecheck.health:443 -servername auth.telecheck.health

# Renew certificate
certbot renew --force-renewal
```

### Issue: Authentication redirects not working

**Potential Causes**:

1. Client redirect URIs not configured correctly in Keycloak
2. CORS settings need adjustment
3. Cookie domain mismatch

**Solution**: Check client configuration in Keycloak admin console

---

## Git Commit Reference

**Branch**: `ETM_telecheck`
**Commit**: `bd1c435`
**Commit Message**: "fix: Configure Keycloak with SSL domain auth.telecheck.health"

**Files Modified**:

- `api-app-spec.yaml` - Updated Keycloak environment variables

**Infrastructure Changes**:

- Keycloak droplet: `198.211.110.151`
- Nginx reverse proxy configured
- Let's Encrypt SSL certificate installed
- Keycloak docker-compose.yml updated

---

## Support & Documentation

- **Keycloak Documentation**: https://www.keycloak.org/documentation
- **Let's Encrypt**: https://letsencrypt.org/
- **Nginx Proxy Documentation**: https://nginx.org/en/docs/http/ngx_http_proxy_module.html
- **Telecheck Keycloak Setup Guide**: `docs/KEYCLOAK_SETUP.md`
- **Telecheck Security Guide**: `docs/KEYCLOAK_SECURITY.md`

---

**Configuration Completed**: October 27, 2025
**Status**: ✅ Production Ready (with security recommendations to implement)
**Next Deployment**: Changes pushed and deployed to DigitalOcean App Platform
