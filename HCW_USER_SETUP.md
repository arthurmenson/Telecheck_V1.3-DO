# HCW@Home User Setup Guide

## Session-Based API Integration - Setup Instructions

The integration code has been updated to use **session-based authentication** with HCW@Home. This requires creating a dedicated HCW user account that Telecheck will use for API calls.

---

## Step 1: Create HCW User Account

### Option A: Via HCW Doctor App UI (RECOMMENDED)

1. **Open HCW Doctor App**:

   ```
   http://143.198.2.224:4201
   ```

2. **Register New Account**:
   - Click "Register" or "Sign Up"
   - Fill in the form:
     - **Email**: `telecheck-api@telecheckhealth.com`
     - **Password**: `TeleCh3ck!HCW@2025!Secure` (or use your own strong password)
     - **First Name**: `Telecheck`
     - **Last Name**: `API`
     - **Role**: Doctor (if prompted)

3. **Verify Account** (if required):
   - Check the email inbox for verification
   - Or check MongoDB for the user and set `emailVerified: true`

4. **Test Login**:
   - Try logging in with the credentials
   - Verify you can access the doctor dashboard

### Option B: Via MongoDB (Advanced)

If you have direct MongoDB access and want to create the user programmatically:

```javascript
// Connect to MongoDB
use hcw

// Create user (you'll need to hash the password with bcrypt first)
db.user.insertOne({
  email: "telecheck-api@telecheckhealth.com",
  password: "$2b$10$...", // Bcrypt hash of password
  firstName: "Telecheck",
  lastName: "API",
  role: "doctor",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## Step 2: Set Password in Digital Ocean

1. **Go to Digital Ocean Dashboard**:
   - Navigate to Apps → `telecheck-api`
   - Settings → Environment Variables

2. **Find HCW_USER_PASSWORD**:
   - Currently marked as `SECRET` (no value set)

3. **Set the Value**:
   - Click Edit
   - Enter the password you used when creating the HCW user
   - Save changes

4. **Redeploy**:
   - App will automatically redeploy with new environment variable
   - Wait for deployment to complete (~3-5 minutes)

---

## Step 3: Verify Integration

Once the user is created and password is set, test the integration:

### Test 1: Check API Logs

```bash
# Monitor API logs for HCW login
./doctl.exe apps logs dcf80f7c-790f-4e2a-bd3a-78c62576a8e2 telecheck-api --type run --follow
```

Look for:

- `🔐 Logging into HCW as telecheck-api@telecheckhealth.com...`
- `✅ HCW session established`

### Test 2: Create Test Consultation

```bash
curl -X POST https://telecheck-api-8jwxq.ondigitalocean.app/api/consultations/test-123/hcw-session \
  -H "Content-Type: application/json" \
  -d '{
    "patientEmail": "patient@test.com",
    "patientFirstName": "John",
    "patientLastName": "Doe",
    "patientPhone": "+1234567890",
    "doctorEmail": "doctor@test.com",
    "scheduledTime": "2025-10-27T14:00:00Z",
    "reason": "Initial consultation"
  }'
```

Expected response:

```json
{
  "consultation": {
    "id": "...",
    "joinUrl": "http://143.198.2.224:4200/invite/...",
    "doctorUrl": "http://143.198.2.224:4201/consultation/...",
    "status": "pending"
  }
}
```

---

## Environment Variables

The integration uses these environment variables (already configured in `.do/app-api.yaml`):

```yaml
- key: HCW_USER_EMAIL
  value: "telecheck-api@telecheckhealth.com"

- key: HCW_USER_PASSWORD
  scope: RUN_TIME
  type: SECRET # SET THIS VALUE IN DIGITAL OCEAN DASHBOARD

- key: HCW_API_URL
  value: "http://143.198.2.224:1337"

- key: HCW_PATIENT_URL
  value: "http://143.198.2.224:4200"

- key: HCW_DOCTOR_URL
  value: "http://143.198.2.224:4201"
```

---

## How Session Management Works

1. **First Request**:
   - Telecheck API calls `getHcwSession()`
   - Logs into HCW with user credentials
   - Receives session cookie (`sails.sid`)
   - Stores cookie in memory

2. **Subsequent Requests**:
   - Reuses cached session cookie
   - No login required (until cookie expires)
   - Session valid for 1 hour

3. **Session Expiry**:
   - After 1 hour, session expires
   - Next request triggers automatic re-login
   - New session established

---

## Troubleshooting

### Issue: "HCW login failed: Unauthorized"

**Solution**:

- Verify user account exists in HCW
- Check password in Digital Ocean matches HCW user password
- Test manual login at http://143.198.2.224:4201

### Issue: "HCW_USER_EMAIL and HCW_USER_PASSWORD environment variables must be set"

**Solution**:

- Verify HCW_USER_PASSWORD is set in Digital Ocean dashboard
- Redeploy the API app after setting

### Issue: "No session cookie received from HCW login"

**Solution**:

- HCW backend might not be running
- Check HCW services: `ssh root@143.198.2.224 "docker ps"`
- Verify HCW backend is on port 1337

---

## Security Notes

- Password is stored as a SECRET in Digital Ocean (encrypted at rest)
- Session cookies are stored in memory only (not persisted)
- Cookies automatically expire after 1 hour
- HCW uses HTTPS in production (update URLs when SSL is configured)

---

## Next Steps

After setup is complete:

1. ✅ User created and credentials set
2. ✅ Test consultation creation works
3. 🔜 Build frontend UI for video consultations
4. 🔜 Test end-to-end patient/doctor video flow
5. 🔜 Configure SSL for HCW services (Let's Encrypt)

---

## Quick Reference

**HCW Doctor App**: http://143.198.2.224:4201  
**User Email**: telecheck-api@telecheckhealth.com  
**Password**: (set in Digital Ocean > telecheck-api > Environment Variables)  
**API Test Endpoint**: https://telecheck-api-8jwxq.ondigitalocean.app/api/consultations/:id/hcw-session
