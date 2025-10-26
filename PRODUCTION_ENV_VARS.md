# Production Environment Variables - DigitalOcean Whale-App

## Complete HCW@Home Deployment Configuration

**Apply these in**: DigitalOcean App Platform → whale-app → Settings → Environment Variables

---

## 🔴 CRITICAL - Database Configuration

```env
# PostgreSQL Database (DigitalOcean Managed Database)
DATABASE_URL=postgresql://doadmin:YOUR_DATABASE_PASSWORD@telecheck-postgres-cluster-do-user-24735686-0.d.db.ondigitalocean.com:25060/telecheck?sslmode=require
```

**Scope**: RUN_TIME
**Type**: SECRET

---

## 🔐 Authentication & Security

### JWT Authentication

```env
JWT_SECRET=telecheck-production-jwt-secret-2025-minimum-32-characters-long-secure-key
```

**Scope**: RUN_TIME
**Type**: SECRET

### Session

```env
SESSION_SECRET=telecheck-session-secret-2025-minimum-32-characters-long-secure-key
```

**Scope**: RUN_TIME
**Type**: SECRET

### OAuth Session

```env
OAUTH_SESSION_SECRET=telecheck-oauth-session-secret-2025-minimum-32-characters-long
```

**Scope**: RUN_TIME
**Type**: SECRET

---

## 🔑 OAuth Configuration

### OAuth Master Switch

```env
OAUTH_ENABLED=true
```

**Scope**: RUN_TIME
**Type**: REGULAR

### Google OAuth (PLACEHOLDER - Configure later)

```env
GOOGLE_CLIENT_ID=your-google-client-id-from-cloud-console
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-cloud-console
GOOGLE_CALLBACK_URL=https://whale-app-bs3xa.ondigitalocean.app/api/auth/google/callback
```

**Scope**: RUN_TIME
**Type**: SECRET (for CLIENT_SECRET), REGULAR (for others)

**Setup Instructions**:

1. Go to https://console.cloud.google.com/
2. Create new project → "Telecheck Production"
3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
4. Application type: Web application
5. Authorized redirect URIs: `https://whale-app-bs3xa.ondigitalocean.app/api/auth/google/callback`
6. Copy Client ID and Client Secret
7. Update the values above

### Keycloak SSO (PLACEHOLDER - Configure later)

```env
KEYCLOAK_REALM=telecheck
KEYCLOAK_CLIENT_ID=telecheck-app
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret
KEYCLOAK_AUTH_SERVER_URL=https://your-keycloak-server.com/auth
KEYCLOAK_CALLBACK_URL=https://whale-app-bs3xa.ondigitalocean.app/api/auth/keycloak/callback
```

**Scope**: RUN_TIME
**Type**: SECRET (for CLIENT_SECRET), REGULAR (for others)

**Setup Instructions**:

1. Deploy Keycloak or use existing instance
2. Create realm: "telecheck"
3. Create client: "telecheck-app"
4. Client Protocol: openid-connect
5. Access Type: confidential
6. Valid Redirect URIs: `https://whale-app-bs3xa.ondigitalocean.app/api/auth/keycloak/callback`
7. Get client secret from Credentials tab
8. Update the values above

---

## 📱 Messaging Services

### Telnyx (Primary - SMS/Voice)

```env
TELNYX_API_KEY=your-telnyx-api-key-here
```

**Scope**: RUN_TIME
**Type**: SECRET

**Setup Instructions**:

1. Sign up at https://telnyx.com/
2. Portal → API Keys → Create API Key
3. Copy the API key
4. Update the value above

### Twilio (Backup - SMS/Voice)

```env
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
```

**Scope**: RUN_TIME
**Type**: SECRET

**Setup Instructions**:

1. Sign up at https://www.twilio.com/
2. Console → Account Info
3. Copy Account SID and Auth Token
4. Update the values above

### Twilio Video (Video Consultations)

```env
TWILIO_VIDEO_API_KEY=your-twilio-video-api-key
TWILIO_VIDEO_SECRET=your-twilio-video-api-secret
```

**Scope**: RUN_TIME
**Type**: SECRET

**Setup Instructions**:

1. Twilio Console → Video → Tools → API Keys
2. Create new API Key
3. Copy API Key SID and Secret
4. Update the values above

---

## 📧 Email Services

### SendGrid (Email Delivery)

```env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@telecheck.com
```

**Scope**: RUN_TIME
**Type**: SECRET (API key), REGULAR (EMAIL_FROM)

**Setup Instructions**:

1. Sign up at https://sendgrid.com/
2. Settings → API Keys → Create API Key
3. Full Access permissions
4. Copy the API key
5. Verify sender email: noreply@telecheck.com
6. Update the values above

---

## 💳 Payment Processing

### Stripe

```env
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

**Scope**: RUN_TIME
**Type**: SECRET

**Setup Instructions**:

1. Sign up at https://stripe.com/
2. Dashboard → Developers → API Keys
3. Copy Secret key and Publishable key
4. Webhooks → Add endpoint: `https://whale-app-bs3xa.ondigitalocean.app/api/webhooks/stripe`
5. Copy Signing secret
6. Update the values above

---

## 🏥 Healthcare Integrations

### Surescripts (ePrescribing)

```env
SURESCRIPTS_API_KEY=your-surescripts-api-key
SURESCRIPTS_ENDPOINT=https://api.surescripts.com
SURESCRIPTS_SENDER_ID=your-facility-sender-id
```

**Scope**: RUN_TIME
**Type**: SECRET

**Setup Instructions**:

1. Apply for Surescripts certification
2. Complete testing requirements
3. Get production credentials
4. Update the values above

### Change Healthcare (Medical Billing)

```env
CHANGE_HEALTHCARE_API_KEY=your-change-healthcare-api-key
CHANGE_HEALTHCARE_ENDPOINT=https://api.changehealthcare.com
```

**Scope**: RUN_TIME
**Type**: SECRET

**Setup Instructions**:

1. Sign up at https://www.changehealthcare.com/
2. Get API credentials
3. Update the values above

### Availity (Insurance Verification)

```env
AVAILITY_API_KEY=your-availity-api-key
AVAILITY_ENDPOINT=https://api.availity.com
```

**Scope**: RUN_TIME
**Type**: SECRET

**Setup Instructions**:

1. Sign up at https://www.availity.com/
2. Get API credentials
3. Update the values above

---

## 🔍 External Services

### OpenAI (AI Features)

```env
OPENAI_API_KEY=your-openai-api-key
```

**Scope**: RUN_TIME
**Type**: SECRET

**Setup Instructions**:

1. Sign up at https://platform.openai.com/
2. API Keys → Create new secret key
3. Update the value above

---

## ⚙️ Application Settings

### Node Environment

```env
NODE_ENV=production
```

**Scope**: BUILD_TIME and RUN_TIME
**Type**: REGULAR

### Port Configuration

```env
PORT=3000
```

**Scope**: RUN_TIME
**Type**: REGULAR

### Log Level

```env
LOG_LEVEL=info
```

**Scope**: RUN_TIME
**Type**: REGULAR

### CORS Configuration

```env
ALLOWED_ORIGINS=https://whale-app-bs3xa.ondigitalocean.app,https://telecheck.com
```

**Scope**: RUN_TIME
**Type**: REGULAR

---

## 🗄️ Redis Cache (Optional)

```env
REDIS_URL=${redis.DATABASE_URL}
```

**Scope**: RUN_TIME
**Type**: SECRET

**Note**: If using DigitalOcean Managed Redis, this will be auto-injected

---

## 📊 Monitoring & Analytics (Optional)

### Sentry (Error Tracking)

```env
SENTRY_DSN=your-sentry-dsn
```

**Scope**: RUN_TIME
**Type**: SECRET

### New Relic (APM)

```env
NEW_RELIC_LICENSE_KEY=your-new-relic-license-key
NEW_RELIC_APP_NAME=Telecheck-Production
```

**Scope**: RUN_TIME
**Type**: SECRET

---

## 🔧 Feature Flags

### Database Fallback

```env
ALLOW_DB_FAILURE=true
```

**Scope**: RUN_TIME
**Type**: REGULAR

**Note**: Allows app to start even if database is unreachable

---

## 📋 Quick Copy - Essential Variables Only

**Copy and paste into DigitalOcean (update placeholder values):**

```
DATABASE_URL=postgresql://doadmin:YOUR_DATABASE_PASSWORD@telecheck-postgres-cluster-do-user-24735686-0.d.db.ondigitalocean.com:25060/telecheck?sslmode=require
JWT_SECRET=telecheck-production-jwt-secret-2025-minimum-32-characters-long-secure-key
SESSION_SECRET=telecheck-session-secret-2025-minimum-32-characters-long-secure-key
OAUTH_ENABLED=true
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
ALLOW_DB_FAILURE=true
EMAIL_FROM=noreply@telecheck.com
```

---

## 🚨 Important Notes

### Security

- **NEVER commit these values to git**
- All secrets should be marked as "SECRET" type in DigitalOcean
- Rotate secrets regularly (every 90 days)
- Use different keys for production vs staging

### Deployment

- After adding/updating variables, app will **automatically redeploy**
- Monitor deployment logs for errors
- Test thoroughly after deployment

### Placeholders

Variables marked with `your-*` are **PLACEHOLDERS**:

- App will start without them (graceful degradation)
- Features depending on them will be disabled
- Configure them when ready to enable features

### Required vs Optional

**Required (App won't start without):**

- DATABASE_URL
- JWT_SECRET
- NODE_ENV

**Optional (Features disabled if missing):**

- OAuth credentials → Social login disabled
- Messaging credentials → SMS/calls disabled
- Video credentials → Video consultations disabled
- Payment credentials → Billing disabled

---

## 📝 Application Instructions

### How to Apply in DigitalOcean

1. **Navigate to App Settings**

   ```
   DigitalOcean → Apps → whale-app → Settings → Environment Variables
   ```

2. **Add Variables One by One**
   - Click "Edit" or "Add Variable"
   - Key: `DATABASE_URL`
   - Value: `postgresql://...`
   - Scope: `RUN_TIME`
   - Type: `SECRET`
   - Click "Save"

3. **Bulk Edit (Faster)**
   - Click "Bulk Editor"
   - Paste all KEY=VALUE pairs
   - Select scope and type for each
   - Click "Save"

4. **Trigger Deployment**
   - After saving, deployment will start automatically
   - Monitor: Apps → whale-app → Activity
   - Wait for "ACTIVE" status (~5-10 minutes)

### Verification Checklist

After deployment completes:

- [ ] App status: ACTIVE
- [ ] Health endpoint: `https://whale-app-bs3xa.ondigitalocean.app/health`
- [ ] Login page loads: `https://whale-app-bs3xa.ondigitalocean.app/login`
- [ ] Database connection: Check logs for "PostgreSQL connected"
- [ ] OAuth providers: Check `/api/auth/providers` response
- [ ] User registration works
- [ ] User login works (email/password)
- [ ] Social login works (if configured)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-26
**Next Review**: After first production deployment
