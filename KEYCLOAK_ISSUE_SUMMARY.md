# Keycloak SSO Button Missing - Issue Summary

**Date**: October 27, 2025
**Issue**: Keycloak "Sign in with Keycloak SSO" button not appearing on login page
**Root Cause**: DigitalOcean App Platform not decrypting SECRET environment variables
**Status**: ❌ **Blocked by DigitalOcean Platform Issue**

---

## Problem Description

The Keycloak SSO integration is fully implemented in the code, but the "Sign in with Keycloak SSO" button doesn't appear on the login page because the application cannot detect that Keycloak is configured.

---

## Investigation Results

### 1. Code Implementation ✅ CORRECT

The Keycloak button IS implemented in [client/pages/Login.tsx](client/pages/Login.tsx#L462-L472):

```typescript
{oauthProviders?.keycloak?.enabled && (
  <Button
    type="button"
    variant="outline"
    onClick={handleKeycloakLogin}
    className="w-full"
  >
    <KeyRound className="w-4 h-4 mr-2" />
    Sign in with Keycloak SSO
  </Button>
)}
```

### 2. Provider Detection Logic ✅ CORRECT

The `/api/auth/providers` endpoint checks for Keycloak configuration in [server/routes/oauth.ts](server/routes/oauth.ts#L36-L46):

```typescript
router.get("/providers", (req: Request, res: Response) => {
  const providers = {
    oauth_enabled: OAUTH_ENABLED,
    google: {
      enabled: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
      auth_url: "/api/auth/google",
    },
    keycloak: {
      enabled: !!(KEYCLOAK_CLIENT_ID && KEYCLOAK_CLIENT_SECRET),
      auth_url: "/api/auth/keycloak",
    },
  };
  res.json(providers);
});
```

### 3. Environment Variables ❌ **PROBLEM IDENTIFIED**

**API Response**:

```json
{
  "oauth_enabled": true,
  "keycloak": {
    "enabled": false // ← Should be true!
  }
}
```

**Debug Endpoint Results** (`/api/debug/env-check`):

```json
{
  "KEYCLOAK_CLIENT_ID": false,
  "KEYCLOAK_CLIENT_SECRET": false,
  "KEYCLOAK_AUTH_SERVER_URL": false,
  "DATABASE_URL": false,
  "JWT_SECRET": false,
  "REDIS_URL": false
}
```

**ALL encrypted secrets are returning `false`** - they're not being decrypted by DigitalOcean.

---

## Root Cause Analysis

### DigitalOcean App Platform Secret Decryption Failure

**Issue**: Encrypted secrets (type: SECRET) in the app spec are **NOT** being decrypted and injected as environment variables at runtime.

**App Spec Configuration**:

```yaml
- key: KEYCLOAK_CLIENT_ID
  scope: RUN_AND_BUILD_TIME
  type: SECRET
  value: EV[1:NOmIUVs4T921+bujQZ5tEG8J42kUlk8G:RKHmhqBmXwd01EBJ0MleoQ==]
```

**Expected**: DigitalOcean decrypts `EV[1:...]` and sets `process.env.KEYCLOAK_CLIENT_ID`
**Actual**: `process.env.KEYCLOAK_CLIENT_ID` is `undefined`

### Affected Variables

All encrypted secrets are affected:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `SESSION_SECRET`
- `OAUTH_SESSION_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- **`KEYCLOAK_CLIENT_ID`** ← This is why the button doesn't show
- **`KEYCLOAK_CLIENT_SECRET`**
- **`KEYCLOAK_AUTH_SERVER_URL`**

---

## Attempted Fixes

### ✅ Fix #1: Changed Scope to RUN_AND_BUILD_TIME

**Commit**: 3f10b46

Changed all secrets from `scope: RUN_TIME` to `scope: RUN_AND_BUILD_TIME`:

```yaml
- key: KEYCLOAK_CLIENT_ID
  scope: RUN_AND_BUILD_TIME # ← Changed from RUN_TIME
  type: SECRET
  value: EV[1:...]
```

**Result**: Still not working - secrets still not decrypted

### ✅ Fix #2: Added Debug Endpoints

**File**: [server/routes/debug.ts](server/routes/debug.ts)

Added endpoints to diagnose the issue:

- `GET /api/debug/env-check` - Shows which vars are set
- `GET /api/debug/keycloak-config` - Shows Keycloak config status

**Result**: Confirmed all encrypted secrets are `false`

---

## Workarounds

### Option 1: Use Plain Text Environment Variables ⚠️ **NOT RECOMMENDED**

Change secrets to plain text values:

```yaml
- key: KEYCLOAK_CLIENT_ID
  scope: RUN_AND_BUILD_TIME
  value: "your-actual-client-id-here" # ← No encryption
```

**Pros**: Will work immediately
**Cons**: ⚠️ **SECURITY RISK** - Secrets exposed in app spec

### Option 2: Set as Build Arguments

Some values could be set as build arguments if they're not truly secret:

```yaml
- key: KEYCLOAK_URL
  scope: BUILD_TIME
  value: "https://auth.example.com"
```

**Pros**: Available during build
**Cons**: Only works for non-secret values

### Option 3: Manual Keycloak Configuration (Recommended)

Since Keycloak isn't working, document the manual SSO setup process for users:

1. Users can still use email/password login
2. Document Keycloak setup steps for self-hosted deployments
3. Wait for DigitalOcean to fix secret decryption

---

## Impact Assessment

### What Works ✅

- ✅ Email/password login
- ✅ Role-based authentication
- ✅ Demo credentials
- ✅ Registration
- ✅ OAuth code infrastructure

### What Doesn't Work ❌

- ❌ Keycloak SSO button (not visible)
- ❌ Google SSO button (same issue)
- ❌ Test accounts API (DATABASE_URL not accessible)
- ❌ Any feature requiring encrypted secrets

### Severity

- **Keycloak SSO**: Medium (workaround: email/password login)
- **Test Accounts API**: Low (workaround: manual registration)
- **DATABASE_URL**: **CRITICAL** (if Prisma routes fail)

---

## Recommended Actions

### Immediate (Today)

1. ✅ Document the issue
2. ✅ Add debug endpoints
3. ✅ Confirm root cause
4. ⏳ Contact DigitalOcean support about secret decryption

### Short-Term (This Week)

1. ⏳ Test with plain-text secrets (in staging, not production)
2. ⏳ Consider alternative secret management (Vault, Parameter Store)
3. ⏳ Document manual SSO setup for users

### Long-Term (Future)

1. ⏳ Migrate to DigitalOcean managed database (auto-injects DATABASE_URL)
2. ⏳ Use external secret manager (HashiCorp Vault)
3. ⏳ Consider alternative platforms if issue persists

---

## DigitalOcean Support Query

**Subject**: Encrypted Secrets (type: SECRET) Not Being Decrypted at Runtime

**Description**:

```
App ID: dcf80f7c-790f-4e2a-bd3a-78c62576a8e2
Deployment ID: 85be0089-05cd-42be-8cc1-5c35dcf12caf

Issue: All environment variables with type: SECRET and encrypted
values (EV[1:...]) are not being decrypted and injected at runtime.

Configuration:
- scope: RUN_AND_BUILD_TIME
- type: SECRET
- value: EV[1:encrypted_value_here]

Expected: Variable should be decrypted and available in process.env
Actual: process.env[VAR_NAME] returns undefined

Tested Variables:
- DATABASE_URL
- KEYCLOAK_CLIENT_ID
- KEYCLOAK_CLIENT_SECRET
- JWT_SECRET
- (and 6 others)

All return false/undefined when checked via debug endpoint.

Debug endpoint: https://telecheck-api-8jwxq.ondigitalocean.app/api/debug/env-check

This is blocking Keycloak SSO integration, database connections,
and other critical features.
```

---

## Testing the Fix (When DigitalOcean Resolves)

### 1. Verify Secret Decryption

```bash
curl https://telecheck-api-8jwxq.ondigitalocean.app/api/debug/env-check
```

**Expected**:

```json
{
  "KEYCLOAK_CLIENT_ID": true,
  "KEYCLOAK_CLIENT_SECRET": true,
  "DATABASE_URL": true
}
```

### 2. Check Providers Endpoint

```bash
curl https://telecheck-api-8jwxq.ondigitalocean.app/api/auth/providers
```

**Expected**:

```json
{
  "keycloak": {
    "enabled": true // ← Should be true now
  }
}
```

### 3. Verify Keycloak Button Appears

1. Navigate to: https://whale-app-bs3xa.ondigitalocean.app/login
2. Look for "Sign in with Keycloak SSO" button below email/password form
3. Button should appear with a key icon

### 4. Test Keycloak Login Flow

1. Click "Sign in with Keycloak SSO"
2. Should redirect to Keycloak auth server
3. Enter credentials
4. Should redirect back to TeleCheck with auth token
5. Should be logged in successfully

---

## Code Files Reference

### Implementation Files ✅

- [client/pages/Login.tsx](client/pages/Login.tsx) - Login UI with Keycloak button (lines 462-472)
- [server/routes/oauth.ts](server/routes/oauth.ts) - OAuth providers endpoint (lines 36-46)
- [server/routes/auth.ts](server/routes/auth.ts) - Auth routes

### Configuration Files

- [api-app-spec.yaml](api-app-spec.yaml) - App configuration with secrets

### Debug Files

- [server/routes/debug.ts](server/routes/debug.ts) - Debug endpoints
- [KEYCLOAK_ISSUE_SUMMARY.md](KEYCLOAK_ISSUE_SUMMARY.md) - This file

### Documentation

- [KEYCLOAK_PRODUCTION_DEPLOYMENT.md](KEYCLOAK_PRODUCTION_DEPLOYMENT.md) - Keycloak setup guide
- [PRISMA_FIX_SUMMARY.md](PRISMA_FIX_SUMMARY.md) - Related DATABASE_URL issue

---

## Conclusion

**The Keycloak SSO integration is fully implemented and correct**. The button doesn't appear because DigitalOcean App Platform is not decrypting the encrypted SECRET environment variables.

**Code Status**: ✅ Complete and correct
**Infrastructure Status**: ❌ Blocked by platform issue
**Workaround**: Email/password login works perfectly

**Next Action**: Contact DigitalOcean support to resolve secret decryption issue, or use plain-text secrets in a non-production environment for testing.

---

**Last Updated**: October 27, 2025
**Status**: Waiting for DigitalOcean platform fix
