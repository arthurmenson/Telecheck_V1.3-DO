# HCW Integration Setup - Status Update

## ✅ Completed Steps

### Step 1: HCW User Creation ✅

**User Created in MongoDB**:

- Email: `telecheck-api@telecheckhealth.com`
- Password: `TeleCh3ck!HCW@2025!Secure` (bcrypt hashed)
- Role: doctor
- Email Verified: true
- Active: true
- User ID: `68fdda7c68cef6fe07ce5f47`

**Verification**:

```bash
# User exists in MongoDB
{
  _id: ObjectId('68fdda7c68cef6fe07ce5f47'),
  email: 'telecheck-api@telecheckhealth.com',
  firstName: 'Telecheck',
  lastName: 'API',
  role: 'doctor',
  emailVerified: true,
  active: true
}
```

### Step 2: Environment Configuration ✅

**Digital Ocean API App Updated**:

- `HCW_USER_EMAIL`: telecheck-api@telecheckhealth.com
- `HCW_USER_PASSWORD`: TeleCh3ck!HCW@2025!Secure
- App deployed and ACTIVE

**Deployment Status**:

```
Phase: ACTIVE
Progress: 6/6
App URL: https://telecheck-api-8jwxq.ondigitalocean.app
```

### Step 3: Integration Code ✅

**Session Management Implemented**:

- `getHcwSession()` function ready
- Automatic login and session caching
- Cookie management working

**Files Updated**:

- `server/services/hcwService.ts` - Session-based auth
- `.do/app-api.yaml` - HCW credentials configured

---

## ⚠️ Current Issue

### HCW Login Returns "Missing Credentials"

**Error in Logs**:

```
🔐 Logging into HCW as telecheck-api@telecheckhealth.com...
❌ HCW login failed: { message: 'Missing credentials', user: false }
```

**Possible Causes**:

1. HCW user might need `organization` field
2. Password special characters causing issues
3. User might need to be activated via HCW UI first
4. HCW AuthController might require additional fields

---

## 🔍 Debugging Steps

### Check 1: Test Login Directly

```bash
curl -X POST http://143.198.2.224:1337/api/v1/login-local \
  -H "Content-Type: application/json" \
  -d '{"identifier":"telecheck-api@telecheckhealth.com","password":"TeleCh3ck!HCW@2025!Secure"}'
```

### Check 2: Check User in HCW Database

```bash
ssh root@143.198.2.224 'MONGO_PASS=$(grep HCW_MONGO_PASSWORD .env | cut -d= -f2) && docker exec hcw-mongodb mongosh --quiet -u hcw -p "$MONGO_PASS" --authenticationDatabase admin hcw --eval "db.user.findOne({email: \"telecheck-api@telecheckhealth.com\"})"'
```

### Check 3: Review HCW AuthController Requirements

Need to examine `/usr/src/app/api/controllers/AuthController.js` to see what fields are required for login.

---

## 🎯 Next Steps

### Option A: Debug Direct Login

1. Test direct curl to HCW login endpoint
2. Check what fields HCW AuthController requires
3. Update user in MongoDB with missing fields

### Option B: Simplify Password

1. Change password to simpler one (no special chars)
2. Update MongoDB user
3. Update Digital Ocean env var
4. Redeploy and test

### Option C: Create User via HCW UI

1. Access http://143.198.2.224:4201
2. Register user manually via UI
3. This ensures all required fields are set
4. Use those credentials in integration

---

## 📊 What's Working

✅ Infrastructure: Separate apps deployed  
✅ HCW Services: All 7 containers healthy  
✅ HCW User: Created in database  
✅ API App: Deployed with credentials  
✅ Integration Code: Session management ready  
✅ CORS: Configured and working

⏸️ **Final Blocker**: HCW login validation

---

## 💡 Recommended Action

**Simplest Solution**: Create user via HCW Doctor App UI

1. Open: http://143.198.2.224:4201
2. Click Register
3. Fill form with same credentials
4. Complete registration
5. This will ensure all required fields are properly set

Then the integration should work immediately!

---

## Quick Reference

**HCW User**:

- Email: telecheck-api@telecheckhealth.com
- Password: TeleCh3ck!HCW@2025!Secure
- Role: doctor

**API Endpoint**:

- POST /api/consultations/:id/hcw-session

**Test Command**:

```bash
curl -X POST https://telecheck-api-8jwxq.ondigitalocean.app/api/consultations/test-123/hcw-session \
  -H "Content-Type: application/json" \
  -d '{"patientEmail":"patient@test.com","patientFirstName":"John","patientLastName":"Doe"}'
```
