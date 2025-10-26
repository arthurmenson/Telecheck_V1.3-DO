# Appointment Notification System - README

Complete notification system for TeleCheck Healthcare video consultations.

## Quick Links

- **Quick Start**: [NOTIFICATION_QUICK_START.md](NOTIFICATION_QUICK_START.md) - 5-minute setup
- **Full Documentation**: [APPOINTMENT_NOTIFICATIONS.md](APPOINTMENT_NOTIFICATIONS.md) - Complete guide
- **Architecture**: [NOTIFICATION_ARCHITECTURE.md](NOTIFICATION_ARCHITECTURE.md) - System diagrams
- **HCW Integration**: [HCW_NOTIFICATION_INTEGRATION.md](HCW_NOTIFICATION_INTEGRATION.md) - HCW@Home specific

## What Is This?

An automated notification system that sends:

- Patient confirmation emails (HTML)
- Patient confirmation SMS
- Patient reminders (24h and 2h before)
- Doctor notifications
- Cancellation alerts

**All notifications are automatic** - no manual intervention needed!

## Features

- Professional HTML email templates
- SMS notifications with failover
- Automatic reminder scheduling
- Non-blocking (never fails appointment creation)
- Graceful error handling
- Multi-provider support (SMTP, SendGrid, AWS SES)
- Comprehensive logging

## Installation

Already installed! All dependencies are in package.json.

## Configuration (Required)

### Step 1: Choose Email Provider

Pick one and add to `.env`:

**Option A: Gmail** (easiest for testing)

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Generate at google.com/security
EMAIL_FROM=noreply@telecheck.com
```

**Option B: SendGrid** (recommended for production)

```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@telecheck.com
```

**Option C: AWS SES**

```bash
EMAIL_PROVIDER=ses
AWS_ACCESS_KEY_ID=AKIAxxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=us-east-1
EMAIL_FROM=noreply@telecheck.com
```

### Step 2: Configure Application

Add to `.env`:

```bash
APP_URL=https://yourdomain.com
CLINIC_PHONE=(555) 123-4567
```

### Step 3: Test

```bash
npm run test:notifications your-email@example.com
```

## Usage

### Creating Appointments

Notifications are sent automatically:

```typescript
// API call
POST /api/appointments
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "scheduledTime": "2025-10-27T14:00:00Z",
  "type": "video",
  "reason": "Follow-up"
}

// Response includes:
{
  "id": "appointment-uuid",
  "confirmationNumber": "APPT-A1B2C3D4",
  "meetingLink": "https://...",
  "notificationStatus": "pending"  // Sent async
}
```

**What happens automatically:**

1. Patient gets confirmation email
2. Patient gets confirmation SMS
3. Doctor gets notification email
4. System schedules 24h reminder
5. System schedules 2h reminder

### Cancelling Appointments

```typescript
DELETE /api/appointments/:id

// Automatically sends:
// - Cancellation email to patient
// - Cancellation SMS to patient
// - Cancels scheduled reminders
```

## File Structure

```
server/
├── utils/
│   ├── emailService.ts                       # Email sending
│   ├── appointmentNotificationService.ts     # Main orchestrator
│   └── messagingService.ts                   # SMS sending (existing)
│
├── routes/
│   └── appointments.ts                       # Enhanced with notifications
│
docs/
├── README_NOTIFICATIONS.md                   # This file
├── NOTIFICATION_QUICK_START.md               # 5-min setup
├── APPOINTMENT_NOTIFICATIONS.md              # Full documentation
├── NOTIFICATION_ARCHITECTURE.md              # System diagrams
└── HCW_NOTIFICATION_INTEGRATION.md           # HCW integration

scripts/
└── test-appointment-notifications.ts         # Test suite
```

## Notification Templates

### Patient Confirmation Email

- Professional HTML design
- Responsive (mobile-friendly)
- Blue header with checkmark
- Appointment details in styled box
- Video consultation button (if applicable)
- Instructions and policies

### Patient Confirmation SMS

```
Appointment confirmed! Oct 27 at 2:00 PM with Dr. Sarah Chen.
Video link: https://... Confirmation: APPT-A1B2C3D4
```

### 24-Hour Reminder SMS

```
Reminder: You have an appointment tomorrow at 2:00 PM with Dr. Sarah Chen.
Video link: https://... Reply CONFIRM or call to reschedule.
```

### 2-Hour Reminder SMS

```
Reminder: Your appointment with Dr. Sarah Chen is in 2 hours at 2:00 PM.
Join here: https://...
```

### Doctor Notification Email

- Green header with calendar icon
- Patient information
- Appointment details
- Reason for visit

## Testing

### Test Suite

```bash
# Run comprehensive test suite
npm run test:notifications your-email@example.com

# Tests:
# ✓ Email service connectivity
# ✓ SMS service connectivity
# ✓ Confirmation email
# ✓ Confirmation SMS
# ✓ Scheduled reminders
# ✓ Cancellation notifications
```

### Manual Testing

```bash
# 1. Create test appointment
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "test-patient",
    "doctorId": "test-doctor",
    "scheduledTime": "2025-10-27T14:00:00Z",
    "type": "video"
  }'

# 2. Check your email and phone for notifications
# 3. Check server logs for confirmation
```

## Monitoring

### Check Service Status

```bash
curl http://localhost:8080/api/messaging/status
```

### View Logs

Server logs show notification delivery:

```
📧 Notifications sent for appointment abc-123:
  email: { sent: true, messageId: 'msg_123' }
  sms: { sent: true, messageId: 'sms_456' }

📅 Scheduled 24-hour reminder at 2025-10-26T14:00:00Z
📅 Scheduled 2-hour reminder at 2025-10-27T12:00:00Z
```

## Troubleshooting

### Email Not Sending

**Problem**: Gmail blocking
**Solution**: Use App Password (not regular password)

**Problem**: SMTP connection error
**Solution**: Check firewall allows port 587

### SMS Not Sending

**Problem**: Invalid phone number
**Solution**: Include country code: `+1234567890`

**Problem**: Telnyx/Twilio error
**Solution**: Check API credentials and account balance

### Reminders Not Scheduling

**Problem**: Server timezone wrong
**Solution**: Set `TZ=America/New_York` in .env

**Problem**: Server not running
**Solution**: Server must run at reminder time (use PM2 in production)

## Error Handling

**Non-blocking design**: Appointments always succeed, even if notifications fail.

```typescript
// Appointment created ✓
const appointment = await prisma.appointment.create({...});

// Notifications sent asynchronously (non-blocking)
notificationService.send(...).catch(err => log(err));

// Response returned immediately ✓
res.status(201).json(appointment);
```

**Graceful degradation**:

- Email fails → SMS still sent
- SMS fails → Email still sent
- Both fail → Appointment created, errors logged

## Production Deployment

### Checklist

- [ ] Email service configured (SendGrid/SES recommended)
- [ ] SMS service configured and tested
- [ ] APP_URL set to production domain
- [ ] Monitoring/logging enabled
- [ ] Test notifications received successfully
- [ ] Server timezone configured
- [ ] Process manager (PM2) configured
- [ ] Error alerting set up

### Recommended Setup

```bash
# Use SendGrid or AWS SES for production
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=production-key

# Use process manager
pm2 start dist/server/node-build.mjs --name telecheck

# Monitor logs
pm2 logs telecheck
```

## Customization

### Email Templates

Edit templates in `server/utils/appointmentNotificationService.ts`:

- `generateConfirmationEmailHTML()` - HTML email
- `generateConfirmationEmailText()` - Plain text fallback

### SMS Templates

Edit templates in `server/utils/messagingService.ts`:

- `MESSAGE_TEMPLATES` object

### Branding

Update:

- Email header colors
- Logo URL
- Company name
- Support contact info

## API Reference

### POST /api/appointments

Creates appointment and sends notifications

**Request**:

```json
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "scheduledTime": "ISO8601 datetime",
  "type": "video|phone|in_person",
  "reason": "string (optional)",
  "notes": "string (optional)"
}
```

**Response**:

```json
{
  "id": "appointment-uuid",
  "patientId": "uuid",
  "doctorId": "uuid",
  "scheduledTime": "datetime",
  "type": "video",
  "status": "pending",
  "confirmationNumber": "APPT-A1B2C3D4",
  "meetingLink": "https://...",
  "notificationStatus": "pending",
  "patient": {...},
  "doctor": {...}
}
```

### DELETE /api/appointments/:id

Cancels appointment and sends notifications

**Response**:

```json
{
  "success": true,
  "message": "Appointment cancelled",
  "appointment": {...}
}
```

## Advanced Features

### Message Queue (Production)

For high volume, use Redis/RabbitMQ:

```typescript
import Queue from "bull";

const notificationQueue = new Queue("notifications", {
  redis: process.env.REDIS_URL,
});

// Producer
await notificationQueue.add("appointment-created", { appointmentData });

// Consumer
notificationQueue.process("appointment-created", async (job) => {
  await notificationService.send(job.data.appointmentData);
});
```

### Database Tracking

Add notification tracking table:

```prisma
model AppointmentNotification {
  id            String   @id @default(uuid())
  appointmentId String
  type          String   // "confirmation", "24h_reminder", etc.
  channel       String   // "email", "sms"
  status        String   // "pending", "sent", "failed"
  sentAt        DateTime?
  error         String?
  messageId     String?
}
```

## Performance

- Asynchronous delivery (non-blocking)
- Concurrent notification sending
- Connection pooling for SMTP
- Message queue ready
- Horizontal scaling supported

## Security

- Template sanitization (XSS protection)
- Phone/email validation
- Rate limiting ready
- Secure SMTP connections (TLS)
- API key protection
- Audit logging

## Support

### Documentation

- Quick Start: [NOTIFICATION_QUICK_START.md](NOTIFICATION_QUICK_START.md)
- Full Docs: [APPOINTMENT_NOTIFICATIONS.md](APPOINTMENT_NOTIFICATIONS.md)
- Architecture: [NOTIFICATION_ARCHITECTURE.md](NOTIFICATION_ARCHITECTURE.md)
- HCW Guide: [HCW_NOTIFICATION_INTEGRATION.md](HCW_NOTIFICATION_INTEGRATION.md)

### Testing

```bash
npm run test:notifications your-email@example.com
```

### Monitoring

```bash
curl http://localhost:8080/api/messaging/status
```

### Logs

Check server logs for notification delivery status

## FAQ

**Q: Do notifications block appointment creation?**
A: No, notifications are sent asynchronously. Appointments succeed even if notifications fail.

**Q: What if email service is down?**
A: SMS still sends. System handles errors gracefully.

**Q: Can I customize email templates?**
A: Yes, edit templates in `appointmentNotificationService.ts`

**Q: Do reminders work if server restarts?**
A: In current version, scheduled jobs are in-memory. For production, use Redis/database persistence.

**Q: How do I test without sending real notifications?**
A: Set `NODE_ENV=development` - notifications log to console only.

**Q: Can I track notification delivery?**
A: Currently logged to console/audit system. Add database tracking for production.

**Q: What email providers are supported?**
A: SMTP (Gmail, Outlook, etc.), SendGrid, AWS SES

**Q: What SMS providers are supported?**
A: Telnyx (primary), Twilio (fallback)

## License

Part of TeleCheck Healthcare platform.

---

**Ready to use!** Notifications are automatically sent for all appointments.

For help: Check documentation links above or contact the development team.
