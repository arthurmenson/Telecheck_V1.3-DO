# Test Accounts Setup and Usage

**Date**: October 27, 2025
**Status**: ✅ Deployed to Production
**Purpose**: Create test provider and patient accounts for full televisit testing

---

## Quick Start

### Option 1: Enable in Production (Temporary)

1. **Set environment variable** in DigitalOcean App Platform:

   ```
   ALLOW_TEST_ACCOUNTS=true
   ```

2. **Redeploy the app** to apply the change

3. **Create test accounts**:

   ```bash
   curl -X POST https://telecheck-api-8jwxq.ondigitalocean.app/api/test-accounts/create \
     -H "Content-Type: application/json"
   ```

4. **Remove the environment variable** after testing

### Option 2: Use Locally (Recommended)

1. **Set DATABASE_URL** in local environment:

   ```bash
   export DATABASE_URL="your-production-database-url"
   ```

2. **Run the script**:

   ```bash
   npx tsx scripts/create-test-accounts.ts
   ```

---

## Test Accounts Created

### 👨‍⚕️ Test Provider (Doctor)

- **Email**: testdoctor-20251027@telecheck.test
- **Password**: TestDoctor123!
- **Role**: DOCTOR
- **Name**: Dr. Test Provider
- **Specialty**: Family Medicine
- **Rating**: 4.8 ⭐
- **Experience**: 10 years
- **Languages**: English, Spanish
- **Availability**: Monday-Friday, 9 AM - 5 PM
- **Video Enabled**: Yes
- **Phone Enabled**: Yes
- **In-Person Enabled**: Yes
- **Location**: New York, NY

### 👤 Test Patient

- **Email**: testpatient-20251027@telecheck.test
- **Password**: TestPatient123!
- **Role**: PATIENT
- **Name**: Test Patient
- **Date of Birth**: January 15, 1990
- **Phone**: +1-555-TEST-001
- **Address**: 123 Test Street, Test City, NY 10001

---

## API Endpoints

### Create Test Accounts

```http
POST /api/test-accounts/create
```

**Security**: Only available when:

- `NODE_ENV !== 'production'` OR
- `ALLOW_TEST_ACCOUNTS === 'true'` in environment

**Response**:

```json
{
  "success": true,
  "results": {
    "provider": {
      "status": "created",
      "email": "testdoctor-20251027@telecheck.test",
      "userId": "uuid-here",
      "doctorProfileId": "uuid-here",
      "specialty": "Family Medicine",
      "message": "Provider account created successfully"
    },
    "patient": {
      "status": "created",
      "email": "testpatient-20251027@telecheck.test",
      "userId": "uuid-here",
      "message": "Patient account created successfully"
    }
  },
  "credentials": {
    "provider": {
      "email": "testdoctor-20251027@telecheck.test",
      "password": "TestDoctor123!",
      "role": "DOCTOR"
    },
    "patient": {
      "email": "testpatient-20251027@telecheck.test",
      "password": "TestPatient123!",
      "role": "PATIENT"
    }
  },
  "message": "Test accounts ready"
}
```

### Verify Test Accounts

```http
GET /api/test-accounts/verify
```

**Response**:

```json
{
  "success": true,
  "accounts": {
    "provider": {
      "exists": true,
      "email": "testdoctor-20251027@telecheck.test",
      "userId": "uuid-here",
      "hasProfile": true,
      "specialty": "Family Medicine"
    },
    "patient": {
      "exists": true,
      "email": "testpatient-20251027@telecheck.test",
      "userId": "uuid-here"
    }
  }
}
```

### Cleanup Test Accounts

```http
DELETE /api/test-accounts/cleanup
```

**Security**: Same as create endpoint

**Response**:

```json
{
  "success": true,
  "deleted": {
    "provider": 1,
    "patient": 1
  },
  "message": "Test accounts cleaned up successfully"
}
```

---

## Testing Flow

### Step 1: Create Test Accounts

Choose one of the two options above to create accounts.

### Step 2: Verify Accounts Created

```bash
curl https://telecheck-api-8jwxq.ondigitalocean.app/api/test-accounts/verify
```

### Step 3: Login as Patient

1. Navigate to: https://whale-app-bs3xa.ondigitalocean.app
2. Click "Login"
3. Enter:
   - Email: testpatient-20251027@telecheck.test
   - Password: TestPatient123!
4. Click "Sign In"

### Step 4: Start Test Plan

Follow the comprehensive test plan in [TELEVISIT_TEST_PLAN.md](TELEVISIT_TEST_PLAN.md)

**Critical Test Cases**:

- ✅ **TC-007**: Provider selection (tests auth fix)
- ✅ **TC-009**: Appointment booking
- ✅ **TC-011**: Database persistence
- ✅ **TC-013**: Video consultation setup

### Step 5: Login as Provider (for video testing)

1. Open new browser/incognito window
2. Navigate to: https://whale-app-bs3xa.ondigitalocean.app
3. Click "Login"
4. Enter:
   - Email: testdoctor-20251027@telecheck.test
   - Password: TestDoctor123!
5. Navigate to appointments
6. Join the test appointment

### Step 6: Execute Full Test

Follow [TELEVISIT_TESTING_GUIDE.md](TELEVISIT_TESTING_GUIDE.md) for step-by-step instructions.

---

## Troubleshooting

### Issue: "Test account creation is disabled in production"

**Solution**: Set `ALLOW_TEST_ACCOUNTS=true` environment variable or use local script with DATABASE_URL.

### Issue: Accounts already exist

**Response**: The API is idempotent. If accounts exist, it returns:

```json
{
  "provider": {
    "status": "already_exists",
    "message": "Provider account already exists"
  }
}
```

This is normal and expected on subsequent calls.

### Issue: Cannot login with test accounts

**Check**:

1. Verify accounts were created:
   ```bash
   curl https://telecheck-api-8jwxq.ondigitalocean.app/api/test-accounts/verify
   ```
2. Check exact credentials (case-sensitive)
3. Ensure using correct environment
4. Clear browser cache/cookies

### Issue: Test provider not appearing in doctor list

**Possible causes**:

- Doctor profile not created (check API response)
- API filtering out provider (check `videoEnabled` flag)
- Frontend filtering (check browser console)

**Check in database**:

```sql
SELECT u.email, d.specialty, d."videoEnabled"
FROM "User" u
JOIN "DoctorProfile" d ON d."userId" = u.id
WHERE u.email = 'testdoctor-20251027@telecheck.test';
```

---

## Cleanup After Testing

### Option 1: API Cleanup

```bash
curl -X DELETE https://telecheck-api-8jwxq.ondigitalocean.app/api/test-accounts/cleanup
```

(Requires `ALLOW_TEST_ACCOUNTS=true`)

### Option 2: Database Cleanup

```sql
-- Delete test provider (cascade deletes doctor profile)
DELETE FROM "User" WHERE email = 'testdoctor-20251027@telecheck.test';

-- Delete test patient
DELETE FROM "User" WHERE email = 'testpatient-20251027@telecheck.test';

-- Optionally delete any test appointments
DELETE FROM "Appointment"
WHERE "doctorId" IN (
  SELECT id FROM "User" WHERE email LIKE '%@telecheck.test'
)
OR "userId" IN (
  SELECT id FROM "User" WHERE email LIKE '%@telecheck.test'
);
```

---

## Security Notes

⚠️ **IMPORTANT SECURITY CONSIDERATIONS**:

1. **Production Safety**: Test account creation is **disabled by default** in production
2. **Temporary Enable Only**: Only enable `ALLOW_TEST_ACCOUNTS=true` during active testing
3. **Remove After Testing**: **ALWAYS** remove the environment variable after testing
4. **Test Credentials**: Use obvious test email domain (`@telecheck.test`)
5. **No Real Data**: Never use test accounts for real patient data
6. **Cleanup**: Always cleanup test accounts after testing
7. **Monitoring**: Monitor for unauthorized test account creation attempts

---

## Files Reference

### Test Plan & Guides

- **[TELEVISIT_TEST_PLAN.md](TELEVISIT_TEST_PLAN.md)** - 17 comprehensive test cases
- **[TELEVISIT_TESTING_GUIDE.md](TELEVISIT_TESTING_GUIDE.md)** - Step-by-step testing walkthrough
- **[TEST_ACCOUNTS_README.md](TEST_ACCOUNTS_README.md)** - This file

### Implementation Files

- **[server/routes/test-accounts.ts](server/routes/test-accounts.ts)** - API endpoints
- **[scripts/create-test-accounts.ts](scripts/create-test-accounts.ts)** - Script version
- **[server/index.ts](server/index.ts)** - Route registration (line 251)

---

## Next Steps

1. ✅ Test accounts infrastructure created
2. ⏳ Enable in production (temporary)
3. ⏳ Create test accounts via API
4. ⏳ Execute test plan (TC-001 through TC-017)
5. ⏳ Document bugs found
6. ⏳ Fix critical issues
7. ⏳ Retest
8. ⏳ Cleanup test accounts
9. ⏳ Disable test account creation

---

## Support

For issues or questions:

- Check [TELEVISIT_TEST_PLAN.md](TELEVISIT_TEST_PLAN.md) for detailed test cases
- Review [TELEVISIT_TESTING_GUIDE.md](TELEVISIT_TESTING_GUIDE.md) for step-by-step instructions
- Examine browser console (F12) for errors
- Check Network tab for API call failures
- Review server logs for backend errors

---

**Test Account Infrastructure**: ✅ Complete and Deployed
**Status**: Ready for testing
**Last Updated**: October 27, 2025
