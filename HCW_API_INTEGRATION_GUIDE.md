# HCW@Home API Integration Guide

## 🔍 API Research Findings

### HCW@Home API Structure

**Backend**: SailsJS framework with session-based authentication  
**Port**: 1337  
**Base URL**: http://143.198.2.224:1337

### Available Endpoints

**Authentication**:

- `POST /api/v1/login-local` - Local user login
- `POST /api/v1/refresh-token` - Refresh auth token
- `GET /api/v1/current-user` - Get current user

**Invitations/Consultations**:

- `POST /api/v1/invite` - Create consultation invite
- `GET /api/v1/invite/:id` - Get invite details
- `PATCH /api/v1/invite/:id` - Update invite
- `POST /api/v1/invite/:invite/resend` - Resend invite
- `GET /api/v1/invite/:invite/consultation` - Get consultation from invite
- `POST /api/v1/invite/:invite/consultation/close` - Close consultation

### Authentication Requirements

**Policy for /api/v1/invite**:

```javascript
invite: ["isLoggedIn", "canInvite", "setPublicInviteOwner"];
```

**What this means**:

1. `isLoggedIn` - Requires active user session (cookie-based)
2. `canInvite` - User must have permission to create invites
3. `setPublicInviteOwner` - Sets the invite owner to current user

**Authentication Method**: Session cookies, NOT JWT tokens  
**Issue**: The JWT approach in our code won't work - HCW uses Sails session management

---

## ✅ Integration Solutions

### Option 1: Direct Link to HCW Apps (RECOMMENDED - Simplest)

Instead of API integration, directly link to HCW patient/doctor apps with pre-populated data.

**Implementation**:

```typescript
// In Telecheck backend
export async function createHcwConsultation(params: {
  telecheckAppointmentId: string;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  doctorEmail: string;
}) {
  // Return direct links to HCW apps
  return {
    patientUrl: `http://143.198.2.224:4200?firstName=${params.patientFirstName}&lastName=${params.patientLastName}&email=${params.patientEmail}`,
    doctorUrl: `http://143.198.2.224:4201?email=${params.doctorEmail}`,
    scheduledTime: new Date(),
  };
}
```

**Pros**:

- No authentication needed
- Works immediately
- Users register directly in HCW
- Full HCW features available

**Cons**:

- Patient/doctor must manually enter room
- No automatic consultation creation
- Less integrated experience

---

### Option 2: Create HCW User Account for Telecheck

Create a dedicated HCW user account that Telecheck uses for API calls.

**Implementation Steps**:

1. **Create HCW User** (via HCW Doctor App):
   - Email: `telecheck-api@yourdomain.com`
   - Role: Doctor (to have `canInvite` permission)
   - Password: Strong password stored in Telecheck secrets

2. **Update Integration Code**:

```typescript
import axios from "axios";

const HCW_API_URL = process.env.HCW_API_URL || "http://143.198.2.224:1337";
const HCW_USER_EMAIL = process.env.HCW_USER_EMAIL; // telecheck-api@yourdomain.com
const HCW_USER_PASSWORD = process.env.HCW_USER_PASSWORD;

// Session management
let sessionCookie: string | null = null;
let sessionExpiry: Date | null = null;

async function getHcwSession(): Promise<string> {
  // Reuse existing session if not expired
  if (sessionCookie && sessionExpiry && sessionExpiry > new Date()) {
    return sessionCookie;
  }

  // Login to HCW
  const response = await axios.post(
    `${HCW_API_URL}/api/v1/login-local`,
    {
      identifier: HCW_USER_EMAIL,
      password: HCW_USER_PASSWORD,
    },
    {
      withCredentials: true,
      maxRedirects: 0,
      validateStatus: (status) => status < 400,
    },
  );

  // Extract session cookie from Set-Cookie header
  const cookies = response.headers["set-cookie"];
  if (!cookies || !cookies.length) {
    throw new Error("No session cookie received from HCW login");
  }

  // Store session cookie (usually named 'sails.sid')
  sessionCookie = cookies.find((c) => c.startsWith("sails.sid"))!;
  sessionExpiry = new Date(Date.now() + 3600000); // 1 hour from now

  return sessionCookie;
}

export async function createHcwConsultation(params: {
  telecheckAppointmentId: string;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  patientPhone?: string;
  doctorEmail: string;
  scheduledTime?: Date;
  reason?: string;
}): Promise<HcwConsultation> {
  // Get authenticated session
  const cookie = await getHcwSession();

  // Create invite/consultation
  const response = await axios.post(
    `${HCW_API_URL}/api/v1/invite`,
    {
      firstName: params.patientFirstName,
      lastName: params.patientLastName,
      emailAddress: params.patientEmail,
      phoneNumber: params.patientPhone,
      gender: "male", // or 'female', required by HCW
      scheduledDate: params.scheduledTime?.toISOString(),
      // Add other required fields based on HCW configuration
    },
    {
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    },
  );

  const invite = response.data;

  return {
    id: invite.id,
    patientUrl: `http://143.198.2.224:4200/invite/${invite.invitationToken}`,
    doctorUrl: `http://143.198.2.224:4201/consultation/${invite.consultation}`,
    scheduledTime: params.scheduledTime,
  };
}
```

**Pros**:

- Full API integration
- Automatic consultation creation
- Can manage consultations via API

**Cons**:

- Requires HCW user creation
- Session management complexity
- Need to handle session expiry

---

### Option 3: Modify HCW Backend (Custom Development)

Add a custom API endpoint to HCW backend that accepts JWT or API key auth.

**Implementation**:

1. **Add custom route in HCW** (`config/routes.js`):

```javascript
'POST /api/v1/external/invite': 'ExternalController.createInvite',
```

2. **Create ExternalController.js**:

```javascript
module.exports = {
  async createInvite(req, res) {
    // Verify JWT or API key
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    // Verify token against HCW_APP_SECRET
    const decoded = jwt.verify(token, sails.config.custom.appSecret);

    // Create invite without requiring session
    const invite = await PublicInvite.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailAddress: req.body.emailAddress,
      // ... other fields
    }).fetch();

    return res.json(invite);
  },
};
```

**Pros**:

- Clean API-to-API integration
- No session management needed
- JWT authentication works

**Cons**:

- Requires modifying HCW backend code
- Need to maintain custom changes
- May conflict with HCW updates

---

## 🎯 Recommendation

**For immediate deployment**: Use **Option 1** (Direct Links)

- Works right now with zero code changes
- Patients/doctors access HCW directly
- Full HCW features available

**For production integration**: Use **Option 2** (HCW User Account)

- Proper API integration
- Automated consultation creation
- Can be implemented in 2-3 hours

**For long-term**: Consider **Option 3** (Custom Backend)

- Only if you plan to heavily customize HCW
- Requires maintaining fork of HCW project

---

## 📝 Next Steps

### If choosing Option 1 (Direct Links):

1. Update `server/services/hcwService.ts` to return direct URLs
2. Test patient/doctor access
3. Deploy - works immediately

### If choosing Option 2 (Session-based):

1. Create HCW user account via Doctor App UI
2. Implement session management in hcwService.ts
3. Test invite creation
4. Handle session refresh

### If choosing Option 3 (Custom Backend):

1. Fork HCW@Home repository
2. Add external API controller
3. Deploy modified backend
4. Update Telecheck integration

---

## 🔗 HCW Resources

- **HCW Backend Code**: `/usr/src/app` on server 143.198.2.224
- **API Controllers**: `/usr/src/app/api/controllers/`
- **Routes**: `/usr/src/app/config/routes.js`
- **Policies**: `/usr/src/app/config/policies.js`
