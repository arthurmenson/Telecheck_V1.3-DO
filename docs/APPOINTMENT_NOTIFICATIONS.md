# Appointment Notification System

Complete notification system for video consultation appointments with email, SMS reminders, and doctor notifications.

## Overview

The appointment notification system automatically sends:

- Patient confirmation emails (HTML with appointment details)
- Patient confirmation SMS (immediate)
- Patient SMS reminders (24 hours before appointment)
- Patient SMS reminders (2 hours before appointment)
- Doctor email notifications (new appointment alerts)
- Cancellation notifications (both email and SMS)

All notifications are **non-blocking** - appointment creation/cancellation will succeed even if notifications fail.

## Architecture

### Components

```
server/utils/
├── emailService.ts                      # Email service using Nodemailer
├── appointmentNotificationService.ts    # Main notification orchestrator
└── messagingService.ts                  # SMS service (Telnyx/Twilio)

server/routes/
└── appointments.ts                      # Enhanced with notification calls
```

### Flow Diagram

```
Create Appointment
       |
       v
[Save to Database] --> Return 201 Success
       |
       v (async)
[Send Notifications]
       |
       +---> Patient Confirmation Email (HTML)
       +---> Patient Confirmation SMS
       +---> Doctor Notification Email
       +---> Schedule 24h Reminder (node-schedule)
       +---> Schedule 2h Reminder (node-schedule)
```

## Configuration

### Required Environment Variables

Add these to your `.env` file:

```bash
# Email Service Configuration (choose one)

# Option 1: SMTP (Generic - works with Gmail, Outlook, etc.)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@telecheck.com

# Option 2: SendGrid
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@telecheck.com

# Option 3: AWS SES
EMAIL_PROVIDER=ses
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
EMAIL_FROM=noreply@telecheck.com

# SMS Service Configuration (already configured)
TELNYX_API_KEY=your-telnyx-api-key
TELNYX_PHONE_NUMBER=+1234567890
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Application Settings
APP_URL=https://yourdomain.com
CLINIC_PHONE=(555) 123-4567
```

### Email Provider Setup Guides

#### Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to: https://myaccount.google.com/security
   - Click "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
3. Use these settings:
   ```bash
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=<16-character-app-password>
   ```

#### SendGrid Setup

1. Sign up at https://sendgrid.com
2. Create an API key:
   - Go to Settings > API Keys
   - Create API Key with "Mail Send" permissions
3. Verify your sender email/domain
4. Use these settings:
   ```bash
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   EMAIL_FROM=verified@yourdomain.com
   ```

#### AWS SES Setup

1. Sign up for AWS and enable SES
2. Verify your email address or domain
3. Move out of sandbox mode (optional, for production)
4. Create IAM credentials with SES permissions
5. Use these settings:
   ```bash
   EMAIL_PROVIDER=ses
   AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxx
   AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxx
   AWS_REGION=us-east-1
   EMAIL_FROM=verified@yourdomain.com
   ```

## API Integration

### Creating an Appointment with Notifications

```typescript
POST /api/appointments

Request Body:
{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "scheduledTime": "2025-10-27T14:00:00Z",
  "type": "video",
  "reason": "Follow-up consultation",
  "notes": "Patient has questions about medication"
}

Response (201 Created):
{
  "id": "appointment-uuid",
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "scheduledTime": "2025-10-27T14:00:00.000Z",
  "type": "video",
  "status": "pending",
  "reason": "Follow-up consultation",
  "notes": "Patient has questions about medication",
  "confirmationNumber": "APPT-A1B2C3D4",
  "meetingLink": "https://telecheck.com/consultation/APPT-A1B2C3D4",
  "notificationStatus": "pending",
  "createdAt": "2025-10-26T10:00:00.000Z",
  "updatedAt": "2025-10-26T10:00:00.000Z",
  "patient": { ... },
  "doctor": { ... }
}
```

### Notifications Sent Automatically

After successful appointment creation:

1. **Patient Confirmation Email** (immediate)
   - Professional HTML email with appointment details
   - Meeting link for video consultations
   - Instructions for joining
   - Cancellation policy

2. **Patient Confirmation SMS** (immediate)
   - Brief confirmation with date, time, doctor
   - Meeting link for video consultations
   - Confirmation number

3. **Doctor Notification Email** (immediate)
   - New appointment alert
   - Patient information
   - Appointment details and reason

4. **Scheduled Reminders** (automatic)
   - 24-hour SMS reminder
   - 2-hour SMS reminder

### Cancelling an Appointment

```typescript
DELETE /api/appointments/:id

Response (200 OK):
{
  "success": true,
  "message": "Appointment cancelled",
  "appointment": { ... }
}
```

**Notifications sent automatically:**

- Patient cancellation email
- Patient cancellation SMS
- Scheduled reminders are cancelled

## Notification Templates

### Patient Confirmation Email

Professional HTML email with:

- Blue header with checkmark
- Appointment details in styled box
- Video consultation link (if applicable)
- Instructions for video consultations
- Reschedule/cancellation information
- Footer with branding

### Patient Confirmation SMS

```
Appointment confirmed! Oct 27 at 2:00 PM with Dr. Sarah Chen.
Video link: https://telecheck.com/consultation/APPT-A1B2C3D4
Confirmation: APPT-A1B2C3D4
```

### 24-Hour Reminder SMS

```
Reminder: You have an appointment tomorrow at 2:00 PM with Dr. Sarah Chen.
Video link: https://telecheck.com/consultation/APPT-A1B2C3D4
Reply CONFIRM to acknowledge or call to reschedule.
```

### 2-Hour Reminder SMS

```
Reminder: Your appointment with Dr. Sarah Chen is in 2 hours at 2:00 PM.
Join here: https://telecheck.com/consultation/APPT-A1B2C3D4
```

### Doctor Notification Email

Professional HTML email with:

- Green header with calendar icon
- Patient name and appointment details
- Reason for visit and notes
- Appointment type (video/phone/in-person)

### Cancellation Email

```
Subject: Appointment Cancelled - [Date]

Dear [Patient Name],

Your appointment scheduled for [Date] at [Time] with [Doctor Name]
has been cancelled.

If you need to reschedule, please contact our office.

Best regards,
TeleCheck Healthcare Team
```

## Error Handling

### Non-Blocking Design

```typescript
// Appointment is created successfully
const appointment = await prisma.appointment.create({ ... });

// Notifications sent asynchronously (won't block response)
appointmentNotificationService
  .sendAppointmentCreatedNotifications(appointmentData)
  .then((result) => {
    console.log('Notifications sent:', result);
  })
  .catch((error) => {
    console.error('Notification error:', error);
    // Error is logged but doesn't affect appointment creation
  });

// Response sent immediately
res.status(201).json(appointment);
```

### Graceful Degradation

The system handles failures gracefully:

- **Email service unavailable**: SMS still sent
- **SMS service unavailable**: Email still sent
- **Both services unavailable**: Appointment still created, errors logged
- **Invalid phone/email**: Skips invalid contact, continues with valid ones

### Error Logging

All notification attempts are logged via AuditLogger:

```typescript
AuditLogger.logSystemEvent("appointment_notifications", "appointment_created", {
  appointmentId: "...",
  patientId: "...",
  doctorId: "...",
  emailSent: true,
  smsSent: true,
  errorsCount: 0,
});
```

## Testing

### Testing Configuration

Create a `.env.test` file:

```bash
# Test with console logging (no actual emails/SMS sent)
NODE_ENV=development
EMAIL_PROVIDER=smtp
SMTP_HOST=test
SMTP_USER=test
SMTP_PASS=test

# Or test with real services
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=test@gmail.com
SMTP_PASS=app-password-here
```

### Manual Testing Script

```bash
# Test appointment creation with notifications
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "existing-patient-id",
    "doctorId": "existing-doctor-id",
    "scheduledTime": "2025-10-27T14:00:00Z",
    "type": "video",
    "reason": "Test appointment"
  }'
```

### Automated Test Suite

```typescript
// tests/notifications/appointment-notifications.test.ts

import { appointmentNotificationService } from "../../server/utils/appointmentNotificationService";
import { AppointmentData } from "../../server/utils/appointmentNotificationService";

describe("Appointment Notification Service", () => {
  const mockAppointment: AppointmentData = {
    id: "test-appt-1",
    patientId: "patient-1",
    patientName: "John Doe",
    patientEmail: "john@example.com",
    patientPhone: "+1234567890",
    doctorId: "doctor-1",
    doctorName: "Dr. Sarah Chen",
    doctorEmail: "sarah@telecheck.com",
    scheduledTime: new Date("2025-10-27T14:00:00Z"),
    type: "video",
    reason: "Follow-up consultation",
    meetingLink: "https://telecheck.com/consultation/TEST123",
    confirmationNumber: "TEST123",
  };

  it("should send confirmation notifications", async () => {
    const result =
      await appointmentNotificationService.sendAppointmentCreatedNotifications(
        mockAppointment,
      );

    expect(result.success).toBe(true);
    expect(result.email?.sent).toBe(true);
    expect(result.sms?.sent).toBe(true);
  });

  it("should schedule reminders", async () => {
    await appointmentNotificationService.sendAppointmentCreatedNotifications(
      mockAppointment,
    );

    const reminders =
      appointmentNotificationService.getScheduledRemindersStatus();

    expect(reminders.length).toBeGreaterThan(0);
  });

  it("should handle email failure gracefully", async () => {
    // Mock email failure
    const result =
      await appointmentNotificationService.sendAppointmentCreatedNotifications({
        ...mockAppointment,
        patientEmail: "invalid-email",
      });

    // Should still succeed with SMS
    expect(result.success).toBe(true);
    expect(result.errors?.length).toBeGreaterThan(0);
  });
});
```

### Testing Checklist

- [ ] Email service connection verified
- [ ] SMS service connection verified
- [ ] Patient confirmation email received with correct details
- [ ] Patient confirmation SMS received
- [ ] Doctor notification email received
- [ ] Meeting link is accessible
- [ ] Confirmation number is valid
- [ ] 24-hour reminder scheduled correctly
- [ ] 2-hour reminder scheduled correctly
- [ ] Cancellation notifications sent
- [ ] Scheduled reminders cancelled on appointment cancellation
- [ ] System handles email failures gracefully
- [ ] System handles SMS failures gracefully
- [ ] Appointment creation succeeds even if all notifications fail

## Monitoring and Debugging

### Check Email Service Status

```bash
curl http://localhost:8080/api/messaging/status
```

Response:

```json
{
  "success": true,
  "status": {
    "services": {
      "telnyx": { "available": true, "configured": true },
      "twilio": { "available": true, "configured": true }
    },
    "features": {
      "sms": true,
      "email": true
    }
  }
}
```

### View Notification Logs

```typescript
// Server logs show notification status
📧 Notifications sent for appointment abc-123: {
  success: true,
  email: { sent: true, messageId: 'msg_123' },
  sms: { sent: true, messageId: 'sms_456' },
  errors: undefined
}

📅 Scheduled 24-hour reminder for appointment abc-123 at 2025-10-26T14:00:00Z
📅 Scheduled 2-hour reminder for appointment abc-123 at 2025-10-27T12:00:00Z
```

### Check Scheduled Reminders

```typescript
// In your application code
const reminders = appointmentNotificationService.getScheduledRemindersStatus();
console.log("Scheduled reminders:", reminders);
```

### Common Issues and Solutions

#### Email Not Sending

1. **Check SMTP credentials**

   ```bash
   # Test email connection
   node -e "require('./server/utils/emailService').emailService.verifyConnection()"
   ```

2. **Gmail blocking**: Enable "Less secure app access" or use App Password

3. **Port blocked**: Try different ports (587, 465, 25)

4. **Firewall issues**: Check server firewall allows outbound SMTP

#### SMS Not Sending

1. **Check Telnyx/Twilio credentials**

   ```bash
   curl http://localhost:8080/api/messaging/test \
     -H "Content-Type: application/json" \
     -d '{"provider":"both","testPhone":"+1234567890"}'
   ```

2. **Phone number format**: Must include country code (+1 for US)

3. **Account balance**: Check Telnyx/Twilio account has credits

#### Reminders Not Triggering

1. **Server timezone**: Ensure server timezone is correct
2. **Server uptime**: Server must be running at reminder time
3. **Job persistence**: Consider using Redis/database for job persistence in production

## Production Considerations

### Scaling

For high-volume deployments:

1. **Use message queue** (Redis/RabbitMQ) instead of async promises
2. **Dedicated notification service** separate from main API
3. **Job persistence** store scheduled jobs in database
4. **Retry mechanism** implement exponential backoff for failures

### Recommended Queue Setup

```typescript
// Example with Bull Queue
import Queue from "bull";

const notificationQueue = new Queue("appointment-notifications", {
  redis: process.env.REDIS_URL,
});

// Producer (in appointments route)
await notificationQueue.add("send-confirmation", { appointmentData });

// Consumer (separate worker process)
notificationQueue.process("send-confirmation", async (job) => {
  await appointmentNotificationService.sendAppointmentCreatedNotifications(
    job.data.appointmentData,
  );
});
```

### Database Schema Updates

Consider adding notification tracking:

```prisma
model AppointmentNotification {
  id            String   @id @default(uuid())
  appointmentId String
  type          String   // "confirmation", "24h_reminder", "2h_reminder", "cancellation"
  channel       String   // "email", "sms"
  status        String   // "pending", "sent", "failed"
  sentAt        DateTime?
  error         String?
  messageId     String?

  appointment   Appointment @relation(fields: [appointmentId], references: [id])

  @@index([appointmentId])
}
```

### Security

1. **Rate limiting**: Prevent notification spam
2. **Template sanitization**: Escape user input in templates
3. **Unsubscribe links**: Add to marketing emails (if applicable)
4. **Phone number validation**: Verify format before sending SMS
5. **Email validation**: Verify format before sending email

## Support and Maintenance

### Updating Templates

Email templates are in `appointmentNotificationService.ts`:

- `generateConfirmationEmailHTML()` - HTML email template
- `generateConfirmationEmailText()` - Plain text fallback

SMS templates use existing `messagingService` templates.

### Adding New Notification Types

1. Create new method in `appointmentNotificationService.ts`
2. Call method from appropriate route
3. Add error handling
4. Update documentation

Example:

```typescript
async sendAppointmentUpdatedNotifications(appointment: AppointmentData) {
  // Implementation
}
```

### Monitoring Recommendations

- Track notification delivery rates
- Monitor email bounce rates
- Alert on high failure rates
- Log all notification attempts
- Set up dashboards (Grafana/CloudWatch)

## License

This notification system is part of the TeleCheck Healthcare platform.

---

For questions or issues, contact the development team or create an issue in the project repository.
