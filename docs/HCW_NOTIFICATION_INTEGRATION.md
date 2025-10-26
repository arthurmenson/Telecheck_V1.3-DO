# HCW@Home Video Consultation - Notification Integration

Integration guide for connecting the HCW@Home telemedicine service with the appointment notification system.

## Overview

This guide shows how to integrate appointment notifications with the existing HCW@Home video consultation booking flow.

## Current HCW Integration

### Existing Routes

**File**: `server/routes/telemedicine.ts`

- `POST /api/telemedicine/schedule` - Schedule appointment
- `GET /api/telemedicine/providers` - Get available providers
- `GET /api/telemedicine/appointments/:userId` - Get user appointments
- `POST /api/telemedicine/room` - Create consultation room

### TelemedicineService

**File**: `server/utils/telemedicine.ts`

Mock implementation that returns provider data and schedules appointments.

## Integration Steps

### Option 1: Update TelemedicineService (Recommended)

Modify `server/utils/telemedicine.ts` to use the appointment notification service:

```typescript
// Add imports
import { appointmentNotificationService } from './appointmentNotificationService';
import prisma from '../config/prisma';

// Update scheduleAppointment method
static async scheduleAppointment(appointmentData: {
  providerId: string;
  userId: string;
  dateTime: string;
  type: "video" | "phone" | "in_person";
  reason: string;
  duration: number;
}): Promise<{
  appointmentId: string;
  confirmationNumber: string;
  meetingLink?: string;
  instructions: string[];
}> {
  // Generate confirmation number
  const confirmationNumber = `HCW${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  const appointmentId = `appt_${Date.now()}`;

  // Create meeting link for video appointments
  const meetingLink =
    appointmentData.type === "video"
      ? `https://telecheck.com/consultation/${confirmationNumber}`
      : undefined;

  // Store in database (if using Prisma)
  const appointment = await prisma.appointment.create({
    data: {
      patientId: appointmentData.userId,
      doctorId: appointmentData.providerId,
      scheduledTime: new Date(appointmentData.dateTime),
      type: appointmentData.type,
      status: 'pending',
      reason: appointmentData.reason,
    },
    include: {
      patient: true,
      doctor: true,
    },
  });

  // Prepare notification data
  const notificationData = {
    id: appointment.id,
    patientId: appointment.patientId,
    patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
    patientEmail: appointment.patient.email,
    patientPhone: appointment.patient.phone || '',
    doctorId: appointment.doctorId,
    doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
    doctorEmail: appointment.doctor.email,
    doctorPhone: appointment.doctor.phone,
    scheduledTime: appointment.scheduledTime,
    type: appointment.type as 'video' | 'phone' | 'in_person',
    reason: appointment.reason || undefined,
    meetingLink,
    confirmationNumber,
  };

  // Send notifications asynchronously
  appointmentNotificationService
    .sendAppointmentCreatedNotifications(notificationData)
    .then((result) => {
      console.log('HCW Notifications sent:', result);
    })
    .catch((error) => {
      console.error('HCW Notification error:', error);
    });

  return {
    appointmentId,
    confirmationNumber,
    meetingLink,
    instructions: [
      "Join the consultation 5 minutes before your scheduled time",
      "Ensure you have a stable internet connection",
      "Have your current medications list ready",
      "Prepare any questions you want to discuss",
      appointmentData.type === "video"
        ? "Test your camera and microphone beforehand"
        : "",
    ].filter(Boolean),
  };
}
```

### Option 2: Update Telemedicine Route (Simpler)

Modify `server/routes/telemedicine.ts` to call notification service after scheduling:

```typescript
// Add imports at top
import { appointmentNotificationService } from "../utils/appointmentNotificationService";
import prisma from "../config/prisma";

// Update scheduleAppointment handler
export const scheduleAppointment: RequestHandler = async (req, res) => {
  try {
    const appointmentData = req.body;

    // Create appointment using TelemedicineService
    const appointment =
      await TelemedicineService.scheduleAppointment(appointmentData);

    // Fetch patient and provider details for notifications
    const patient = await prisma.user.findUnique({
      where: { id: appointmentData.userId },
    });

    const provider = await prisma.user.findUnique({
      where: { id: appointmentData.providerId },
    });

    if (patient && provider) {
      // Send notifications
      const notificationData = {
        id: appointment.appointmentId,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientEmail: patient.email,
        patientPhone: patient.phone || "",
        doctorId: provider.id,
        doctorName: `Dr. ${provider.firstName} ${provider.lastName}`,
        doctorEmail: provider.email,
        doctorPhone: provider.phone,
        scheduledTime: new Date(appointmentData.dateTime),
        type: appointmentData.type,
        reason: appointmentData.reason,
        meetingLink: appointment.meetingLink,
        confirmationNumber: appointment.confirmationNumber,
      };

      // Send notifications asynchronously (non-blocking)
      appointmentNotificationService
        .sendAppointmentCreatedNotifications(notificationData)
        .catch((error) => {
          console.error("Error sending HCW notifications:", error);
        });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Schedule appointment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to schedule appointment",
    });
  }
};
```

## Frontend Integration

### Booking Flow with Notifications

```typescript
// client/src/components/HCWBooking.tsx

async function bookAppointment(bookingData: BookingData) {
  try {
    // Schedule appointment via HCW API
    const response = await fetch("/api/telemedicine/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId: bookingData.doctorId,
        userId: currentUser.id,
        dateTime: bookingData.appointmentTime.toISOString(),
        type: "video",
        reason: bookingData.reason,
        duration: 30,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Show success message
      toast.success("Appointment booked successfully!");

      // Display confirmation details
      showConfirmation({
        confirmationNumber: result.data.confirmationNumber,
        meetingLink: result.data.meetingLink,
        instructions: result.data.instructions,
        message: "Check your email and phone for confirmation and reminders.",
      });

      // Navigate to appointment details
      navigate(`/appointments/${result.data.appointmentId}`);
    }
  } catch (error) {
    console.error("Booking error:", error);
    toast.error("Failed to book appointment");
  }
}
```

### Display Notification Status

```typescript
// Show notification delivery status
function AppointmentConfirmation({ appointment }: Props) {
  return (
    <div className="confirmation-card">
      <h2>Appointment Confirmed</h2>

      <div className="confirmation-details">
        <p>Confirmation #: {appointment.confirmationNumber}</p>
        <p>Date: {formatDate(appointment.scheduledTime)}</p>
        <p>Doctor: {appointment.doctorName}</p>

        {appointment.meetingLink && (
          <a href={appointment.meetingLink} className="meeting-link">
            Join Video Consultation
          </a>
        )}
      </div>

      <div className="notification-status">
        <h3>Notifications Sent</h3>
        <ul>
          <li>✓ Confirmation email sent to {appointment.patientEmail}</li>
          <li>✓ Confirmation SMS sent to {appointment.patientPhone}</li>
          <li>✓ Reminders scheduled for 24h and 2h before appointment</li>
        </ul>
      </div>

      <div className="next-steps">
        <h3>What's Next?</h3>
        <ul>
          <li>Check your email for appointment details</li>
          <li>You'll receive SMS reminders before your appointment</li>
          <li>Join the video call 5 minutes before your scheduled time</li>
          <li>Have your questions and medications list ready</li>
        </ul>
      </div>
    </div>
  );
}
```

## Testing HCW Integration

### Test Appointment Creation

```bash
# Create test appointment through HCW API
curl -X POST http://localhost:8080/api/telemedicine/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "doctor-uuid",
    "userId": "patient-uuid",
    "dateTime": "2025-10-27T14:00:00Z",
    "type": "video",
    "reason": "Video consultation",
    "duration": 30
  }'
```

### Expected Notifications

1. Patient receives confirmation email (HTML formatted)
2. Patient receives confirmation SMS with meeting link
3. Doctor receives notification email
4. System schedules 24h and 2h reminders

### Verify Reminders

```bash
# Check scheduled reminders via test script
npm run test:notifications patient-email@example.com
```

## Customizing for HCW

### Custom Email Templates

Modify templates in `server/utils/appointmentNotificationService.ts`:

```typescript
// Add HCW branding
private generateConfirmationEmailHTML(appointment: AppointmentData, ...): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .header {
          background-color: #your-brand-color;
          /* Add HCW logo */
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://yourdomain.com/hcw-logo.png" alt="HCW@Home">
        <h1>Video Consultation Confirmed</h1>
      </div>
      <!-- Rest of template -->
    </body>
    </html>
  `;
}
```

### Custom SMS Messages

Update SMS templates in `messagingService.ts`:

```typescript
const MESSAGE_TEMPLATES = {
  // ... existing templates

  hcw_video_confirmation: {
    sms: "HCW@Home: Video consultation confirmed for {time} with {provider}. Link: {meetingLink}",
  },

  hcw_video_reminder_24h: {
    sms: "HCW@Home: Video consultation tomorrow at {time}. Test your camera/mic. Link: {meetingLink}",
  },
};
```

## Monitoring HCW Notifications

### Check Notification Delivery

```typescript
// Add logging for HCW-specific notifications
AuditLogger.logSystemEvent("hcw_notifications", "appointment_created", {
  appointmentId: appointment.id,
  patientId: appointment.patientId,
  providerId: appointment.providerId,
  emailSent: result.email?.sent,
  smsSent: result.sms?.sent,
  service: "hcw_telemedicine",
});
```

### Dashboard Metrics

Track these metrics:

- HCW appointments created per day
- Notification delivery rate
- Email open rate (if using SendGrid/tracking)
- SMS delivery rate
- Reminder effectiveness (appointments kept vs missed)

## Production Deployment

### Environment Variables for HCW

Add to production `.env`:

```bash
# HCW-specific settings
HCW_ENABLED=true
HCW_BRAND_NAME="HCW@Home"
HCW_LOGO_URL="https://yourdomain.com/hcw-logo.png"
HCW_SUPPORT_EMAIL="support@hcwathome.com"
HCW_SUPPORT_PHONE="1-800-HCW-HOME"

# Notification settings
EMAIL_FROM="noreply@hcwathome.com"
APP_URL="https://hcwathome.com"
```

### Deployment Checklist

- [ ] HCW branding added to email templates
- [ ] Custom SMS messages configured
- [ ] Email service configured with HCW domain
- [ ] Test notifications received successfully
- [ ] Monitoring/logging enabled for HCW notifications
- [ ] Support contact info updated in templates
- [ ] Meeting links point to correct domain
- [ ] Timezone configured correctly

## Troubleshooting

### Issue: Notifications not sending for HCW appointments

**Check**:

1. Verify email/SMS services are configured
2. Check patient has valid email and phone number
3. Look for errors in server logs
4. Test notification service independently

### Issue: Meeting links not working

**Check**:

1. Verify `APP_URL` is set correctly in `.env`
2. Confirm video consultation route is configured
3. Test link generation in `TelemedicineService`

### Issue: Reminders not being sent

**Check**:

1. Verify server timezone is correct
2. Ensure server stays running (use PM2 or similar)
3. Check scheduled jobs: `appointmentNotificationService.getScheduledRemindersStatus()`

## Support

- Full notification documentation: `docs/APPOINTMENT_NOTIFICATIONS.md`
- Quick start guide: `docs/NOTIFICATION_QUICK_START.md`
- Test suite: `npm run test:notifications`

---

For questions about HCW integration, contact the development team.
