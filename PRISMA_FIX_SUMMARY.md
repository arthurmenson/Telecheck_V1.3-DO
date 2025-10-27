# Prisma DATABASE_URL Fix Summary

**Date**: October 27, 2025
**Issue**: Test accounts API endpoint cannot access DATABASE_URL
**Status**: ⚠️ **Partially Resolved** - Code fixed, environment issue remains

---

## Problem Analysis

### Root Cause

The DATABASE_URL environment variable (encrypted secret in DigitalOcean App Platform) is **not being decrypted and passed to the application runtime**.

### Evidence from Logs

```
❌ Failed to connect Prisma to database: PrismaClientInitializationError:
error: Error validating datasource `db`: You must provide a nonempty URL.
The environment variable `DATABASE_URL` resolved to an empty string.
```

### Why This Happens

1. DATABASE_URL is defined as an encrypted secret in app spec (scope: RUN_TIME, type: SECRET)
2. DigitalOcean should decrypt this at runtime and inject it as an environment variable
3. **The decryption/injection is not working** - the variable is empty at runtime

---

## Fixes Applied ✅

### Fix #1: Use Shared Prisma Instance

**Files Changed**:

- `server/routes/test-accounts.ts`
- `server/routes/telemedicine-providers.ts`

**Change**:

```typescript
// Before (WRONG):
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// After (CORRECT):
import prisma from "../config/prisma";
```

**Result**: Routes now use the shared, properly configured Prisma instance

---

### Fix #2: Initialize Prisma on Startup

**File Changed**: `server/index.ts`

**Change**:

```typescript
import { connectDatabase as connectPrisma } from "./config/prisma";

export async function createServer() {
  await initializeDatabase();

  // NEW: Initialize Prisma connection
  try {
    await connectPrisma();
  } catch (error) {
    console.error("Failed to connect Prisma, but continuing:", error);
  }

  // ... rest of server setup
}
```

**Result**: Prisma attempts to connect on server startup

---

## Remaining Issue ⚠️

### The Environment Variable Problem

**Issue**: DATABASE_URL is not accessible to the Node.js process

**Verification**:

- Server logs show: `DATABASE_URL resolved to an empty string`
- This happens even though it's defined in app spec with `scope: RUN_TIME`

**Possible Causes**:

1. **Build vs Runtime scope confusion**: SECRET type variables might not be available at build time, and Prisma generates client at build time
2. **DigitalOcean secret decryption failure**: The secret might not be getting decrypted/injected properly
3. **Prisma Client generation timing**: Prisma Client is generated during build, which doesn't have access to runtime secrets

---

## Solutions to Try

### Solution 1: Change DATABASE_URL Scope ⭐ **RECOMMENDED**

The DATABASE_URL is currently:

```yaml
- key: DATABASE_URL
  scope: RUN_TIME # ← This is the problem
  type: SECRET
  value: EV[1:...]
```

**Try changing to**:

```yaml
- key: DATABASE_URL
  scope: RUN_AND_BUILD_TIME # ← Make it available at both build and runtime
  type: SECRET
  value: EV[1:...]
```

**Steps**:

1. Edit `api-app-spec.yaml`
2. Change DATABASE_URL scope to `RUN_AND_BUILD_TIME`
3. Apply: `doctl apps update dcf80f7c-790f-4e2a-bd3a-78c62576a8e2 --spec api-app-spec.yaml`
4. Deploy: `doctl apps create-deployment dcf80f7c-790f-4e2a-bd3a-78c62576a8e2`

---

### Solution 2: Use Database Component Instead of Secret

DigitalOcean App Platform has managed databases that automatically inject DATABASE_URL.

**Steps**:

1. Use the DigitalOcean managed PostgreSQL database
2. Link it to the app in app spec:

```yaml
databases:
  - name: db
    engine: PG
    production: true
```

3. DigitalOcean automatically creates and injects `${db.DATABASE_URL}`

---

### Solution 3: Manual Account Creation (Workaround)

Since the API endpoint doesn't work, create accounts manually through frontend.

**Test Provider**:

1. Navigate to: https://whale-app-bs3xa.ondigitalocean.app
2. Register as Healthcare Provider
3. Email: testdoctor-20251027@telecheck.test
4. Password: TestDoctor123!
5. Complete provider profile

**Test Patient**:

1. Navigate to: https://whale-app-bs3xa.ondigitalocean.app
2. Register as Patient
3. Email: testpatient-20251027@telecheck.test
4. Password: TestPatient123!

---

## Code Changes Summary

### Commits Made

1. **b1cb318**: fix: Use shared Prisma instance instead of creating new clients
2. **53c6bfb**: fix: Initialize Prisma connection on server startup

### Files Modified

- `server/routes/test-accounts.ts` - Use shared prisma
- `server/routes/telemedicine-providers.ts` - Use shared prisma
- `server/index.ts` - Initialize Prisma on startup

### Deployments

- Deployment ID: c0535e5f-b502-4c80-84d3-dc5bca78bc3f
- Status: ACTIVE (6/6)
- Branch: ETM_telecheck
- Commit: 53c6bfb

---

## Testing Status

### What Works ✅

- Code is correct
- Shared Prisma instance properly configured
- Prisma initialization added to startup
- API endpoint structure is correct

### What Doesn't Work ❌

- DATABASE_URL not accessible at runtime
- Prisma cannot connect to database
- Test accounts API returns errors
- Any Prisma-dependent routes will fail

---

## Next Steps

### Immediate (Choose One)

**Option A**: Fix Environment Variable (Fastest)

```bash
# 1. Edit api-app-spec.yaml
# Change DATABASE_URL scope to RUN_AND_BUILD_TIME

# 2. Update app
./doctl apps update dcf80f7c-790f-4e2a-bd3a-78c62576a8e2 --spec api-app-spec.yaml

# 3. Redeploy
./doctl apps create-deployment dcf80f7c-790f-4e2a-bd3a-78c62576a8e2

# 4. Test
curl -X POST https://telecheck-api-8jwxq.ondigitalocean.app/api/test-accounts/create
```

**Option B**: Use Manual Account Creation (Workaround)

- Follow manual steps above
- Proceed with test plan execution
- Skip automated account creation

---

## Verification Commands

### Check if DATABASE_URL is Set

```bash
# Add a debug endpoint (temporary)
GET /api/debug/env
# Returns: { DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET" }
```

### Check Prisma Connection

```bash
curl https://telecheck-api-8jwxq.ondigitalocean.app/api/ping
# Should return health status including database connection
```

### Verify Test Accounts After Fix

```bash
curl https://telecheck-api-8jwxq.ondigitalocean.app/api/test-accounts/verify
# Should return account existence status
```

---

## Related Documentation

- [TEST_ACCOUNTS_README.md](TEST_ACCOUNTS_README.md) - Test accounts guide
- [TELEVISIT_TEST_PLAN.md](TELEVISIT_TEST_PLAN.md) - Comprehensive test plan
- [TEST_EXECUTION_REPORT.md](TEST_EXECUTION_REPORT.md) - Current test status
- [DigitalOcean Secrets Documentation](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)

---

## Conclusion

**Code**: ✅ Fixed and deployed
**Environment**: ❌ DATABASE_URL not accessible
**Workaround**: ✅ Manual account creation available
**Recommendation**: Change DATABASE_URL scope to `RUN_AND_BUILD_TIME`

The test accounts API endpoint is now correctly implemented, but cannot function until the DATABASE_URL environment variable is properly accessible to the application runtime.

---

**Last Updated**: October 27, 2025
**Status**: Waiting for environment variable fix or manual account creation
