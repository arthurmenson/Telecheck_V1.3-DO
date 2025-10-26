# Appointment Notification System - Architecture

Visual architecture and flow diagrams for the notification system.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client Application                          │
│  (Web/Mobile - Patient & Doctor Interfaces)                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ POST /api/appointments
                         │ {patientId, doctorId, scheduledTime...}
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API Layer (Express)                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  server/routes/appointments.ts                          │    │
│  │  • Validates request                                    │    │
│  │  • Creates appointment in database                      │    │
│  │  • Generates confirmation number & meeting link         │    │
│  │  • Returns 201 response immediately                     │    │
│  └────────────┬───────────────────────────────────────────┘    │
└───────────────┼────────────────────────────────────────────────┘
                │
                │ Async (non-blocking)
                ▼
┌─────────────────────────────────────────────────────────────────┐
│         Notification Service Layer                               │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  appointmentNotificationService.ts                      │    │
│  │  • Orchestrates all notifications                       │    │
│  │  • Handles errors gracefully                            │    │
│  │  • Schedules future reminders                           │    │
│  └──┬──────────┬──────────┬──────────┬──────────┬─────────┘    │
└─────┼──────────┼──────────┼──────────┼──────────┼──────────────┘
      │          │          │          │          │
      │          │          │          │          │
┌─────▼─────┐ ┌─▼────────┐ ┌▼────────┐ ┌▼────────▼──────┐
│   Email   │ │   SMS    │ │ Doctor  │ │  Job Scheduler │
│  Service  │ │ Service  │ │  Email  │ │ (node-schedule)│
│           │ │          │ │         │ │                │
│ Nodemailer│ │ Telnyx/  │ │ HTML    │ │ • 24h reminder │
│ • SMTP    │ │ Twilio   │ │ Email   │ │ • 2h reminder  │
│ • SendGrid│ │          │ │         │ │                │
│ • AWS SES │ │ Failover │ │         │ │ Persists until │
│           │ │ Support  │ │         │ │ appointment    │
└───────────┘ └──────────┘ └─────────┘ └────────────────┘
      │            │            │              │
      │            │            │              │
      ▼            ▼            ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ Patient  │ │ Patient  │ │ Doctor   │ │  At scheduled│
│ Email    │ │ Phone    │ │ Email    │ │  time, sends │
│ Inbox    │ │          │ │ Inbox    │ │  SMS reminder│
└──────────┘ └──────────┘ └──────────┘ └──────────────┘
```

## Notification Flow - Appointment Creation

```
1. API Request
   │
   ├─► Validate patient & doctor exist
   │
   ├─► Create appointment in database
   │   └─► Status: pending
   │       Type: video/phone/in_person
   │       ScheduledTime: Future date
   │
   ├─► Generate confirmation number (APPT-XXXXXXXX)
   │
   ├─► Generate meeting link (if video)
   │   └─► https://yourdomain.com/consultation/{confirmationNumber}
   │
   ├─► Return 201 Success Response
   │   ├─► appointment object
   │   ├─► confirmationNumber
   │   ├─► meetingLink
   │   └─► notificationStatus: "pending"
   │
   └─► Trigger Notifications (Async) ────────────────────┐
                                                          │
                                                          ▼
                                    ┌─────────────────────────────────────┐
                                    │  Parallel Notification Execution    │
                                    │  (All run concurrently)             │
                                    └─────────────────────────────────────┘
                                                   │
                        ┌──────────────────────────┼──────────────────────┐
                        │                          │                      │
                        ▼                          ▼                      ▼
            ┌────────────────────┐    ┌────────────────────┐  ┌────────────────────┐
            │  Patient Email     │    │   Patient SMS      │  │   Doctor Email     │
            │  Confirmation      │    │   Confirmation     │  │   Notification     │
            ├────────────────────┤    ├────────────────────┤  ├────────────────────┤
            │ • HTML formatted   │    │ • Date & time      │  │ • New appointment  │
            │ • Appointment      │    │ • Doctor name      │  │ • Patient info     │
            │   details          │    │ • Meeting link     │  │ • Appointment type │
            │ • Meeting link btn │    │ • Confirmation #   │  │ • Reason for visit │
            │ • Instructions     │    │ • Brief message    │  │ • Notes            │
            │ • Cancellation     │    │                    │  │                    │
            │   policy           │    │ Max 160 chars      │  │ HTML formatted     │
            └────────┬───────────┘    └────────┬───────────┘  └────────┬───────────┘
                     │                         │                       │
                     │ Success/Fail            │ Success/Fail          │ Success/Fail
                     │                         │                       │
                     └─────────────────────────┼───────────────────────┘
                                               │
                                               ▼
                                    ┌────────────────────┐
                                    │  Schedule Reminders│
                                    ├────────────────────┤
                                    │ 24h before:        │
                                    │  └─► SMS Reminder  │
                                    │                    │
                                    │ 2h before:         │
                                    │  └─► SMS Reminder  │
                                    └────────────────────┘
                                               │
                                               ▼
                                    ┌────────────────────┐
                                    │  Log Results       │
                                    ├────────────────────┤
                                    │ AuditLogger:       │
                                    │ • appointmentId    │
                                    │ • emailSent: true  │
                                    │ • smsSent: true    │
                                    │ • remindersScheduled│
                                    │ • errorsCount: 0   │
                                    └────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Notification Service (Try/Catch for each notification)         │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │  Email   │        │   SMS    │        │  Doctor  │
    │  Service │        │ Service  │        │  Email   │
    └────┬─────┘        └────┬─────┘        └────┬─────┘
         │                   │                   │
    ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
    │Success? │         │Success? │         │Success? │
    └────┬────┘         └────┬────┘         └────┬────┘
         │                   │                   │
    Yes  │  No          Yes  │  No          Yes  │  No
    ┌────▼────┐        ┌─────▼────┐        ┌─────▼────┐
    │Continue │        │Continue  │        │Continue  │
    │         │        │          │        │          │
    └────┬────┘        └────┬─────┘        └────┬─────┘
         │                  │                    │
         └──────────────────┼────────────────────┘
                            │
                            ▼
                ┌──────────────────────┐
                │  Collect Results     │
                │  success: true if    │
                │  ANY notification    │
                │  succeeded           │
                │                      │
                │  errors: [] array    │
                │  of any failures     │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │  Return Result       │
                │  {                   │
                │   success: true,     │
                │   email: {           │
                │     sent: true,      │
                │     messageId: "..." │
                │   },                 │
                │   sms: {             │
                │     sent: true,      │
                │     messageId: "..." │
                │   },                 │
                │   errors: []         │
                │  }                   │
                └──────────────────────┘

Key Points:
• Appointment creation NEVER fails due to notification errors
• Each notification type is independent
• If email fails, SMS still attempts
• If all fail, appointment still exists
• All errors are logged for debugging
• Client receives appointment immediately
```

## Reminder Scheduling Flow

```
Appointment Created
       │
       ▼
┌────────────────────────────────────────┐
│  Calculate Reminder Times              │
│                                        │
│  scheduledTime: 2025-10-27 14:00:00   │
│                                        │
│  24h reminder: 2025-10-26 14:00:00    │
│  2h reminder:  2025-10-27 12:00:00    │
└───────────────┬────────────────────────┘
                │
                ▼
         ┌──────────────┐
         │ Is reminder  │
         │ in future?   │
         └──────┬───────┘
                │
        Yes ────┼──── No (skip)
                │
                ▼
         ┌──────────────┐
         │  node-schedule│
         │  Job Created │
         │              │
         │ job_24h_{id} │
         │ job_2h_{id}  │
         └──────┬───────┘
                │
                │ Stored in memory
                │ (Map<jobId, Job>)
                │
      Wait for scheduled time...
                │
                ▼
       ┌────────────────┐
       │ Trigger Time   │
       │ Reached        │
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │ Execute Job    │
       │ • Send SMS     │
       │ • Log event    │
       │ • Clean up job │
       └────────────────┘

Cancellation Flow:
─────────────────

Appointment Cancelled
       │
       ▼
┌────────────────────┐
│ Find scheduled jobs│
│ • job_24h_{id}     │
│ • job_2h_{id}      │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Cancel all jobs    │
│ job.cancel()       │
│ Remove from Map    │
└────────────────────┘
```

## Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   appointmentNotificationService.ts              │
│  Main orchestrator for all appointment notifications             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Public Methods:                                                 │
│  ├─► sendAppointmentCreatedNotifications(appointment)           │
│  ├─► sendAppointmentCancelledNotifications(appointment)         │
│  └─► getScheduledRemindersStatus()                              │
│                                                                  │
│  Private Methods:                                                │
│  ├─► sendPatientConfirmationEmail(appointment)                  │
│  ├─► sendPatientConfirmationSMS(appointment)                    │
│  ├─► sendDoctorNotification(appointment)                        │
│  ├─► scheduleAppointmentReminders(appointment)                  │
│  ├─► send24HourReminder(appointment)                            │
│  ├─► send2HourReminder(appointment)                             │
│  ├─► cancelScheduledReminders(appointmentId)                    │
│  ├─► generateConfirmationEmailHTML(...)                         │
│  └─► generateConfirmationEmailText(...)                         │
│                                                                  │
│  State:                                                          │
│  └─► scheduledJobs: Map<jobId, schedule.Job>                    │
│                                                                  │
└───────────────┬──────────────────────┬──────────────────────────┘
                │                      │
                ▼                      ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│    emailService.ts        │  │   messagingService.ts     │
│  Email delivery service   │  │   SMS delivery service    │
├───────────────────────────┤  ├───────────────────────────┤
│                           │  │                           │
│  Methods:                 │  │  Methods:                 │
│  ├─► sendEmail(options)   │  │  ├─► sendMessage(request) │
│  ├─► verifyConnection()   │  │  ├─► sendSMS(to, message) │
│  └─► getStatus()          │  │  └─► getMessageStatus()   │
│                           │  │                           │
│  Supports:                │  │  Supports:                │
│  ├─► SMTP                 │  │  ├─► Telnyx (primary)     │
│  ├─► SendGrid             │  │  └─► Twilio (fallback)    │
│  └─► AWS SES              │  │                           │
│                           │  │  Features:                │
│  Features:                │  │  ├─► Automatic failover   │
│  ├─► HTML emails          │  │  ├─► Template system      │
│  ├─► Plain text fallback  │  │  └─► Delivery tracking    │
│  ├─► Attachments          │  │                           │
│  └─► Connection pooling   │  │                           │
│                           │  │                           │
└───────────┬───────────────┘  └───────────┬───────────────┘
            │                              │
            ▼                              ▼
    ┌──────────────┐              ┌──────────────┐
    │ SMTP Server  │              │ SMS Provider │
    │ • Gmail      │              │ • Telnyx     │
    │ • SendGrid   │              │ • Twilio     │
    │ • AWS SES    │              │              │
    └──────────────┘              └──────────────┘
```

## Data Flow - Appointment Object

```
API Request Body
{
  "patientId": "uuid-patient",
  "doctorId": "uuid-doctor",
  "scheduledTime": "2025-10-27T14:00:00Z",
  "type": "video",
  "reason": "Follow-up consultation"
}
        │
        ▼
Database (Prisma)
{
  id: "generated-uuid",
  patientId: "uuid-patient",
  doctorId: "uuid-doctor",
  scheduledTime: Date object,
  type: "video",
  status: "pending",
  reason: "Follow-up consultation",
  notes: null,
  createdAt: Date object,
  patient: { ... },  // joined
  doctor: { ... }    // joined
}
        │
        ▼
Notification Data (AppointmentData)
{
  id: "generated-uuid",
  patientId: "uuid-patient",
  patientName: "John Doe",
  patientEmail: "john@example.com",
  patientPhone: "+15551234567",
  doctorId: "uuid-doctor",
  doctorName: "Dr. Sarah Chen",
  doctorEmail: "sarah@telecheck.com",
  doctorPhone: "+15559876543",
  scheduledTime: Date object,
  type: "video",
  reason: "Follow-up consultation",
  notes: undefined,
  meetingLink: "https://telecheck.com/consultation/APPT-A1B2C3D4",
  confirmationNumber: "APPT-A1B2C3D4"
}
        │
        ▼
Email Template Variables
{
  patientName: "John Doe",
  doctorName: "Dr. Sarah Chen",
  formattedDate: "Monday, October 27, 2025",
  formattedTime: "2:00 PM",
  appointmentType: "Video Consultation",
  meetingLink: "https://...",
  confirmationNumber: "APPT-A1B2C3D4",
  reason: "Follow-up consultation"
}
        │
        ▼
Rendered HTML Email
[Professional HTML email with all variables filled in]
        │
        ▼
Sent via Email Service
→ Patient's inbox
```

## Database Schema (Related Tables)

```
┌──────────────────────────────────────────┐
│            Appointment                   │
├──────────────────────────────────────────┤
│ id                  String (PK)          │
│ patientId           String (FK → User)   │
│ doctorId            String (FK → User)   │
│ scheduledTime       DateTime             │
│ type                Enum (video/phone)   │
│ status              Enum (pending/...)   │
│ reason              String?              │
│ notes               String?              │
│ createdAt           DateTime             │
│ updatedAt           DateTime             │
└───────────┬────────────────┬─────────────┘
            │                │
            │                │
   ┌────────▼────────┐  ┌───▼──────────────┐
   │      User       │  │  VideoConsultation│
   │  (Patient)      │  ├──────────────────┤
   ├─────────────────┤  │ appointmentId    │
   │ id              │  │ roomUrl          │
   │ email ✓         │  │ meetingLink ✓    │
   │ firstName ✓     │  │ status           │
   │ lastName ✓      │  │ startedAt        │
   │ phone ✓         │  │ endedAt          │
   │ role            │  │ duration         │
   └─────────────────┘  └──────────────────┘
            ▲
            │
   ┌────────┴────────┐
   │      User       │
   │   (Doctor)      │
   ├─────────────────┤
   │ id              │
   │ email ✓         │
   │ firstName ✓     │
   │ lastName ✓      │
   │ phone ✓         │
   │ role            │
   └─────────────────┘

✓ = Used in notifications
```

## Notification Status Tracking (Future Enhancement)

```
┌──────────────────────────────────────────┐
│     AppointmentNotification              │
│  (Future table for tracking)             │
├──────────────────────────────────────────┤
│ id              String (PK)              │
│ appointmentId   String (FK)              │
│ type            String                   │
│                 "confirmation"           │
│                 "24h_reminder"           │
│                 "2h_reminder"            │
│                 "cancellation"           │
│ channel         String                   │
│                 "email" / "sms"          │
│ status          String                   │
│                 "pending"                │
│                 "sent"                   │
│                 "failed"                 │
│                 "cancelled"              │
│ recipient       String                   │
│ sentAt          DateTime?                │
│ deliveredAt     DateTime?                │
│ error           String?                  │
│ messageId       String?                  │
│ provider        String?                  │
│                 "smtp" / "sendgrid" /    │
│                 "telnyx" / "twilio"      │
│ metadata        JSON?                    │
└──────────────────────────────────────────┘
```

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Load Balancer (Nginx)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  API Server  │ │  API Server  │ │  API Server  │
│   Instance   │ │   Instance   │ │   Instance   │
│      1       │ │      2       │ │      3       │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        │ Push jobs to queue
                        ▼
           ┌────────────────────────┐
           │    Message Queue       │
           │  (Redis / RabbitMQ)    │
           └────────┬───────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Notification│ │ Notification│ │ Notification│
│   Worker    │ │   Worker    │ │   Worker    │
│      1      │ │      2      │ │      3      │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Email Service│ │  SMS Service │ │  Database    │
│ (SendGrid)   │ │ (Telnyx)     │ │ (PostgreSQL) │
└──────────────┘ └──────────────┘ └──────────────┘
```

## Monitoring Dashboard (Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│             Notification Monitoring Dashboard                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Today's Metrics:                                                │
│  ├─ Appointments Created: 247                                   │
│  ├─ Notifications Sent: 741 (3 per appointment)                 │
│  ├─ Email Delivery Rate: 98.5%                                  │
│  ├─ SMS Delivery Rate: 99.2%                                    │
│  └─ Failed Notifications: 4 (view details)                      │
│                                                                  │
│  Reminders:                                                      │
│  ├─ 24h Reminders Sent Today: 189                               │
│  ├─ 2h Reminders Sent Today: 235                                │
│  └─ Scheduled for Tomorrow: 312                                 │
│                                                                  │
│  Service Health:                                                 │
│  ├─ Email Service: ● Online (SendGrid)                          │
│  ├─ SMS Service: ● Online (Telnyx)                              │
│  └─ Job Scheduler: ● Online (498 jobs queued)                   │
│                                                                  │
│  Recent Errors: (last 24 hours)                                 │
│  ├─ 10:23 AM - Invalid email: bounce@example.com                │
│  ├─ 09:15 AM - SMS failed: +1555000XXXX (invalid number)        │
│  └─ 08:42 AM - SMTP timeout: retry successful                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

This architecture provides a scalable, reliable, and maintainable notification system for appointment management.
