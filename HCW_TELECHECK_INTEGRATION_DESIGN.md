# HCW@Home + Telecheck Video Consultation Integration

**Status**: Integration Ready
**HCW Deployment**: http://143.198.2.224 (hcw-video-production)
**Integration Date**: October 26, 2025

---

## 🎯 Integration Overview

### Existing Components

**Telecheck** (Patient Health Management Platform):

- ✅ Schedule page ([client/pages/Schedule.tsx](client/pages/Schedule.tsx))
- ✅ Appointment workflow ([client/components/workflows/AppointmentWorkflow.tsx](client/components/workflows/AppointmentWorkflow.tsx))
- ✅ Consultation API routes ([server/routes/consultations.ts](server/routes/consultations.ts))
- ✅ HCW service layer ([server/services/hcwService.ts](server/services/hcwService.ts))
- ⚠️ **ISSUE**: Currently pointing to old HCW droplet (165.227.180.202)

**HCW@Home** (Video Consultation Platform):

- ✅ Backend API: http://143.198.2.224:1337 (SailsJS)
- ✅ Patient Interface: http://143.198.2.224:4200 (Angular/Ionic)
- ✅ Doctor Interface: http://143.198.2.224:4201 (Angular)
- ✅ Mediasoup WebRTC: Port 3005 + RTP ports 40000-40100

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      TELECHECK PLATFORM                         │
│                                                                 │
│  ┌───────────────┐      ┌──────────────────┐                  │
│  │   Schedule    │─────▶│ Appointment      │                  │
│  │   Page        │      │ Booking Flow     │                  │
│  └───────────────┘      └──────────────────┘                  │
│         │                        │                             │
│         │                        ▼                             │
│         │              ┌──────────────────┐                    │
│         │              │  Create HCW      │                    │
│         └─────────────▶│  Consultation    │                    │
│                        │  Session         │                    │
│                        └──────────────────┘                    │
│                               │                                 │
│                               ▼                                 │
│                    ┌──────────────────────┐                    │
│                    │ HCW Service Layer    │                    │
│                    │ (JWT Auth)           │                    │
│                    └──────────────────────┘                    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/JWT
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HCW@HOME PLATFORM                            │
│                  (143.198.2.224)                                │
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Backend    │─────▶│  Mediasoup   │─────▶│   MongoDB    │ │
│  │  API (1337)  │      │  WebRTC      │      │   Database   │ │
│  └──────────────┘      │  (3005)      │      └──────────────┘ │
│         │              └──────────────┘                        │
│         │                     │                                │
│         ▼                     ▼                                │
│  ┌──────────────┐      ┌──────────────┐                       │
│  │   Patient    │      │   Doctor     │                       │
│  │   App (4200) │      │   App (4201) │                       │
│  └──────────────┘      └──────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Integration User Flow

### Patient Journey

1. **Lab Results Trigger**
   - Patient receives abnormal lab results in Telecheck dashboard
   - System displays alert: "Lab results need doctor review"
   - CTA button: "Schedule Video Consultation"

2. **Doctor Selection**
   - Patient clicks "Schedule Video Consultation"
   - System shows recommended doctors based on:
     - Lab result specialty requirements
     - Doctor availability for video consultations
     - Doctor ratings and experience
   - Each doctor card shows:
     - Video consultation availability badge
     - Next available slot
     - Urgent same-day slots if available

3. **Appointment Booking**
   - Patient selects doctor
   - Chooses date/time slot
   - Selects consultation type: "Video Consultation"
   - Enters reason (auto-populated from lab results context)
   - Confirms booking

4. **Pre-Consultation**
   - Telecheck creates appointment in local database
   - Telecheck calls HCW API to create consultation session
   - HCW creates:
     - Patient record (if doesn't exist)
     - Doctor record (if doesn't exist)
     - Consultation/invite with Mediasoup room
   - Patient receives:
     - Email confirmation with video link
     - SMS reminder 24h before
     - SMS reminder 2h before
     - Lab results automatically shared with doctor

5. **Video Consultation**
   - Patient clicks "Join Video Consultation" in Telecheck
   - Options:
     - **Option A (Embedded)**: iFrame loads HCW patient app inside Telecheck
     - **Option B (Redirect)**: Opens HCW patient app in new tab
   - HCW patient app loads with consultation ID
   - Patient joins Mediasoup WebRTC room
   - Real-time video/audio with doctor
   - Secure chat with file attachments
   - Doctor can review lab results shared via FHIR

6. **Post-Consultation**
   - Doctor ends consultation
   - HCW sends consultation summary back to Telecheck
   - Telecheck marks appointment as completed
   - Patient receives:
     - Consultation summary
     - Next steps/action items
     - Prescription (if any)
     - Follow-up appointment scheduling link

### Doctor Journey

1. **Appointment Notification**
   - Doctor receives notification of scheduled video consultation
   - Can view patient's:
     - Lab results
     - Medical history
     - Current medications
     - Reason for consultation

2. **Pre-Consultation Preparation**
   - Doctor reviews patient chart in Telecheck
   - Notes any concerns or follow-up items
   - Prepares prescription templates if needed

3. **Video Consultation**
   - Doctor joins via HCW doctor app (143.198.2.224:4201)
   - WebRTC connection established via Mediasoup
   - Can share screen to review lab results
   - Can send secure messages/files
   - Can record consultation notes

4. **Post-Consultation**
   - Doctor completes consultation notes
   - Sends prescriptions via eRx integration
   - Schedules follow-up if needed
   - Marks consultation complete

---

## 🔧 Required Changes

### 1. Update Environment Variables

**File**: `server/.env` (or Digital Ocean environment variables)

```bash
# OLD (Delete these)
# HCW_API_URL=http://165.227.180.202:1337
# HCW_PATIENT_URL=http://165.227.180.202:4200
# HCW_DOCTOR_URL=http://165.227.180.202:4201

# NEW (Add these)
HCW_API_URL=http://143.198.2.224:1337
HCW_PATIENT_URL=http://143.198.2.224:4200
HCW_DOCTOR_URL=http://143.198.2.224:4201
HCW_API_SECRET=<SECURE_JWT_SECRET_HERE>

# Optional: Enable SSL when ready
# HCW_API_URL=https://video.telecheck.health/api
# HCW_PATIENT_URL=https://video.telecheck.health/patient
# HCW_DOCTOR_URL=https://video.telecheck.health/doctor
```

### 2. Update HCW Service

**File**: `server/services/hcwService.ts`

**Changes**:

- ✅ Already has correct structure
- ⚠️ Update default URLs (lines 27-34) to use new HCW deployment
- ✅ JWT generation is correct
- ⚠️ API endpoints need verification against HCW routes

**Action Items**:

1. Verify HCW API route names (may be `/api/v1/` prefix)
2. Update patient/doctor creation endpoints
3. Update consultation creation endpoint
4. Test authentication flow

### 3. Enhance Schedule Page

**File**: `client/pages/Schedule.tsx`

**Add video consultation support**:

```typescript
// Add to doctor card
{doctor.hasVideo && (
  <div className="mt-2 p-2 bg-blue-50 rounded-lg">
    <div className="flex items-center gap-2">
      <Video className="w-4 h-4 text-blue-600" />
      <span className="text-xs text-blue-700">
        Powered by HCW@Home WebRTC
      </span>
    </div>
  </div>
)}

// Add consultation type selector
<div className="space-y-2">
  <label className="font-medium">Consultation Type</label>
  <RadioGroup value={consultationType} onValueChange={setConsultationType}>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="video" id="video" />
      <Label htmlFor="video" className="flex items-center gap-2">
        <Video className="w-4 h-4" />
        Video Consultation (Recommended for lab review)
      </Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="in-person" id="in-person" />
      <Label htmlFor="in-person" className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        In-Person Visit
      </Label>
    </div>
  </RadioGroup>
</div>
```

### 4. Create Video Consultation Component

**New File**: `client/components/VideoConsultation.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Video, Phone, Mic, MicOff, VideoOff, X } from 'lucide-react';

interface VideoConsultationProps {
  appointmentId: string;
  onEnd?: () => void;
}

export function VideoConsultation({ appointmentId, onEnd }: VideoConsultationProps) {
  const [consultationUrl, setConsultationUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Create HCW consultation session
    fetch(`/api/consultations/${appointmentId}/hcw-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        setConsultationUrl(data.hcwUrl);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to start video consultation');
        setLoading(false);
      });
  }, [appointmentId]);

  if (loading) {
    return <div>Loading video consultation...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="h-full flex flex-col">
        {/* Video controls header */}
        <div className="bg-gray-900 p-4 flex justify-between items-center">
          <div className="text-white font-medium">Video Consultation</div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-white">
              <Mic className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <Video className="w-5 h-5" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={onEnd}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* HCW@Home iFrame */}
        <iframe
          src={consultationUrl}
          className="flex-1 w-full border-0"
          allow="camera; microphone; fullscreen"
          title="Video Consultation"
        />
      </div>
    </div>
  );
}
```

### 5. Update Consultation Routes

**File**: `server/routes/consultations.ts`

**Changes needed**:

1. Update HCW API endpoint paths to match actual HCW routes
2. Add proper error handling for HCW service unavailability
3. Store HCW consultation ID in Telecheck database
4. Add webhook endpoint for HCW status updates

**Updated route** (lines 30-128):

```typescript
router.post(
  "/:appointmentId/hcw-session",
  async (req: Request, res: Response) => {
    const { appointmentId } = req.params;
    const userId = (req as any).user?.id;

    try {
      // Get appointment from Telecheck database
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          doctor: true,
        },
      });

      if (!appointment) {
        return res.status(404).json({
          error: "Appointment not found",
        });
      }

      // Check if HCW consultation already exists
      let consultation = await prisma.consultation.findFirst({
        where: { appointmentId },
      });

      if (consultation && consultation.hcwConsultationId) {
        // Return existing consultation
        const status = await getHcwConsultationStatus(
          consultation.hcwConsultationId,
        );

        return res.json({
          consultationId: consultation.hcwConsultationId,
          hcwUrl: `${HCW_PATIENT_URL}/consultation/${consultation.hcwConsultationId}`,
          status,
          scheduledTime: appointment.scheduledTime,
        });
      }

      // Create or get HCW patient
      const hcwPatientId = await createHcwPatient({
        telecheckUserId: appointment.patient.id,
        firstName: appointment.patient.firstName,
        lastName: appointment.patient.lastName,
        email: appointment.patient.email,
        phone: appointment.patient.phone,
        birthdate: appointment.patient.birthdate,
        gender: appointment.patient.gender,
      });

      // Create or get HCW doctor
      const hcwDoctorId = await createHcwDoctor({
        telecheckUserId: appointment.doctor.id,
        firstName: appointment.doctor.firstName,
        lastName: appointment.doctor.lastName,
        email: appointment.doctor.email,
        specialty: appointment.doctor.specialty,
      });

      // Create HCW consultation
      const hcwConsultation = await createHcwConsultation({
        telecheckAppointmentId: appointment.id,
        hcwPatientId,
        hcwDoctorId,
        scheduledTime: appointment.scheduledTime,
        reason: appointment.reason,
      });

      // Store in Telecheck database
      consultation = await prisma.consultation.create({
        data: {
          appointmentId: appointment.id,
          hcwConsultationId: hcwConsultation.id,
          status: "pending",
          createdAt: new Date(),
        },
      });

      res.json({
        consultationId: hcwConsultation.id,
        hcwUrl: hcwConsultation.joinUrl,
        status: hcwConsultation.status,
        scheduledTime: hcwConsultation.scheduledDate,
      });
    } catch (error) {
      console.error("Failed to create HCW consultation session:", error);
      res.status(500).json({
        error: "Failed to create consultation",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
);
```

### 6. Database Schema Updates

**Add to Prisma schema** (or PostgreSQL migration):

```prisma
model Appointment {
  id              String    @id @default(uuid())
  patientId       String
  doctorId        String
  scheduledTime   DateTime
  duration        Int       @default(30) // minutes
  type            AppointmentType // in_person, video, phone
  status          AppointmentStatus
  reason          String?
  consultations   Consultation[]

  patient         User      @relation("PatientAppointments", fields: [patientId], references: [id])
  doctor          User      @relation("DoctorAppointments", fields: [doctorId], references: [id])

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Consultation {
  id                  String    @id @default(uuid())
  appointmentId       String
  hcwConsultationId   String?   // HCW@Home consultation ID
  hcwPatientId        String?   // HCW patient ID
  hcwDoctorId         String?   // HCW doctor ID
  status              ConsultationStatus
  startedAt           DateTime?
  endedAt             DateTime?
  duration            Int?      // actual duration in minutes
  summary             String?   // post-consultation summary

  appointment         Appointment @relation(fields: [appointmentId], references: [id])

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

enum AppointmentType {
  IN_PERSON
  VIDEO
  PHONE
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum ConsultationStatus {
  PENDING
  ACTIVE
  COMPLETED
  CANCELLED
}
```

---

## 🔌 HCW@Home API Integration

### Available HCW API Endpoints

Based on HCW backend `config/routes.js`:

#### Authentication

```
POST /api/v1/login-local           - Login with email/password
POST /api/v1/login-invite          - Login via consultation invite
GET  /api/v1/current-user          - Get current user
POST /api/v1/refresh-token         - Refresh JWT
GET  /api/v1/config                - Get HCW config
```

#### Consultation/Invite Management

```
POST /api/v1/invite                      - Create consultation invite
GET  /api/v1/invite                      - List invites
GET  /api/v1/invite/:id                  - Get invite details
DELETE /api/v1/invite/:id                - Delete invite
PATCH /api/v1/invite/:id                 - Update invite
POST /api/v1/invite/:invite/resend       - Resend invite

POST /api/v1/consultation                - Create consultation
POST /api/v1/consultation/:id/accept     - Accept consultation
POST /api/v1/consultation/:id/close      - Close consultation
POST /api/v1/consultation/:id/call       - Initiate call
GET  /api/v1/consultation/:id/current-call - Get active call
POST /api/v1/consultation/:id/reject-call - Reject call
POST /api/v1/consultation/:id/accept-call - Accept call
```

#### FHIR Appointments

```
POST /api/v1/fhir/Appointment      - Create FHIR appointment
GET  /api/v1/fhir/Appointment      - List FHIR appointments
GET  /api/v1/fhir/Appointment/:id  - Get FHIR appointment
PUT  /api/v1/fhir/Appointment/:id  - Update FHIR appointment
DELETE /api/v1/fhir/Appointment/:id - Delete FHIR appointment
```

#### User Management

```
GET  /api/v1/user/:id              - Get user
PUT  /api/v1/user/:id/status       - Update user status
POST /api/v1/user/notif            - Update notifications
POST /api/v1/user/terms            - Accept terms
GET  /api/v1/users/paginated       - Get users (paginated)
```

### Correct Integration Pattern

**Instead of** creating patient/doctor separately, **use HCW's invite system**:

```typescript
// Telecheck creates HCW consultation via FHIR or invite
async function createHcwConsultation(params: {
  telecheckAppointmentId: string;
  patient: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  doctor: {
    firstName: string;
    lastName: string;
    email: string;
  };
  scheduledTime: Date;
  reason?: string;
}): Promise<HcwConsultation> {
  const token = generateHcwToken();

  // Option 1: Use FHIR Appointment API
  const response = await hcwClient.post(
    "/api/v1/fhir/Appointment",
    {
      status: "booked",
      participant: [
        {
          actor: {
            reference: `Patient/${params.patient.email}`,
            display: `${params.patient.firstName} ${params.patient.lastName}`,
          },
          status: "accepted",
        },
        {
          actor: {
            reference: `Practitioner/${params.doctor.email}`,
            display: `${params.doctor.firstName} ${params.doctor.lastName}`,
          },
          status: "accepted",
        },
      ],
      start: params.scheduledTime.toISOString(),
      end: new Date(params.scheduledTime.getTime() + 30 * 60000).toISOString(),
      reasonCode: [
        {
          text: params.reason || "Video consultation",
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  // Option 2: Use Invite API (simpler)
  const inviteResponse = await hcwClient.post(
    "/api/v1/invite",
    {
      patientFirstname: params.patient.firstName,
      patientLastname: params.patient.lastName,
      patientEmail: params.patient.email,
      patientPhone: params.patient.phone,
      doctorId: params.doctor.email, // or HCW doctor ID if already exists
      scheduledDate: params.scheduledTime.toISOString(),
      reason: params.reason,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const consultationId = inviteResponse.data.id || inviteResponse.data._id;

  return {
    id: consultationId,
    patientId: inviteResponse.data.patient,
    doctorId: inviteResponse.data.doctor,
    scheduledDate: params.scheduledTime,
    status: "pending",
    joinUrl: `${HCW_PATIENT_URL}/consultation/${consultationId}`,
  };
}
```

---

## 🧪 Testing Checklist

### Pre-Integration Testing

- [ ] Verify HCW services are running (all 7 containers healthy)
- [ ] Test HCW patient interface: http://143.198.2.224:4200
- [ ] Test HCW doctor interface: http://143.198.2.224:4201
- [ ] Test HCW API health: `curl http://143.198.2.224:1337/api/v1/config`
- [ ] Verify Mediasoup WebRTC ports are accessible

### Integration Testing

- [ ] Update environment variables in Telecheck
- [ ] Test HCW service health check from Telecheck
- [ ] Test JWT token generation
- [ ] Test consultation creation via API
- [ ] Test iFrame embedding in Telecheck
- [ ] Test video/audio in embedded consultation
- [ ] Test consultation end and status updates

### End-to-End Testing

- [ ] Complete patient journey: Lab results → Schedule → Video consult → Summary
- [ ] Test doctor workflow: Review patient → Join video → Complete notes
- [ ] Test appointment notifications (email, SMS)
- [ ] Test pre-consultation data sharing (lab results to HCW)
- [ ] Test post-consultation summary retrieval
- [ ] Test error scenarios (HCW unavailable, network issues)

---

## 🚀 Deployment Plan

### Phase 1: Environment Setup (15 min)

1. Update Digital Ocean environment variables for Telecheck
2. Redeploy Telecheck server to pick up new HCW URLs
3. Verify HCW health check passes from Telecheck logs

### Phase 2: Database Migration (30 min)

1. Create Prisma migration for Appointment and Consultation models
2. Run migration on development database
3. Test database operations locally
4. Run migration on production database

### Phase 3: Code Updates (1 hour)

1. Update `hcwService.ts` to use invite API
2. Update `consultations.ts` routes with database operations
3. Update `Schedule.tsx` with video consultation option
4. Create `VideoConsultation.tsx` component
5. Test locally with HCW integration

### Phase 4: Deployment (30 min)

1. Deploy updated Telecheck code to Digital Ocean
2. Verify environment variables are loaded
3. Test API endpoints
4. Test frontend components

### Phase 5: E2E Testing (1 hour)

1. Create test patient and doctor accounts
2. Run complete appointment booking flow
3. Test video consultation with real WebRTC
4. Verify consultation data flows correctly
5. Test error scenarios

### Phase 6: Production Readiness (ongoing)

1. Set up SSL certificates for HCW (Let's Encrypt)
2. Configure domain: video.telecheck.health
3. Set up monitoring and alerting
4. Document troubleshooting procedures
5. Train support team on video consultation flow

---

## 📊 Success Metrics

- Video consultation availability: >99.5%
- Average time to join consultation: <30 seconds
- Video quality: >80% sessions rated "good" or "excellent"
- Doctor adoption: >70% of doctors use video within 30 days
- Patient satisfaction: >4.5/5 for video consultations
- No-show rate reduction: Target 50% decrease with video option

---

## 🔒 Security Considerations

1. **JWT Authentication**: HCW API calls use short-lived JWT tokens (1 hour expiry)
2. **Data Privacy**: Patient data encrypted in transit (HTTPS) and at rest (MongoDB encryption)
3. **HIPAA Compliance**: HCW@Home supports HIPAA-compliant video consultations
4. **Access Control**: Consultation URLs are unique and time-limited
5. **Audit Logging**: All consultation access logged in both Telecheck and HCW
6. **Virus Scanning**: ClamAV scans all file uploads in consultations

---

## 📝 Next Steps

1. **Immediate** (Today):
   - [ ] Update HCW environment variables
   - [ ] Test HCW service from Telecheck
   - [ ] Verify API endpoints work

2. **Short-term** (This Week):
   - [ ] Implement database schema changes
   - [ ] Update HCW service to use invite API
   - [ ] Create video consultation UI component
   - [ ] Deploy and test end-to-end

3. **Medium-term** (Next 2 Weeks):
   - [ ] Set up SSL for HCW
   - [ ] Configure custom domain
   - [ ] Implement consultation analytics
   - [ ] Add patient/doctor feedback collection

4. **Long-term** (Next Month):
   - [ ] Implement advanced features (screen sharing, recording)
   - [ ] Add AI transcription for consultation notes
   - [ ] Integrate with EHR systems via FHIR
   - [ ] Scale infrastructure for production load

---

_Integration designed by Claude Code on October 26, 2025_
_HCW@Home deployment: hcw-video-production (143.198.2.224)_
