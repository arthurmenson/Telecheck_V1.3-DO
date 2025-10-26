# Appointment Notifications - Quick Start Guide

Fast setup guide for the appointment notification system.

## 5-Minute Setup

### Step 1: Configure Email Service (Choose One)

#### Option A: Gmail SMTP (Easiest)

1. Enable 2-Factor Authentication on your Google account
2. Generate App Password: https://myaccount.google.com/security > App passwords
3. Add to `.env`:

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=<16-character-app-password>
EMAIL_FROM=noreply@telecheck.com
```

#### Option B: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com
2. Create API key with Mail Send permissions
3. Verify sender email
4. Add to `.env`:

```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=verified@yourdomain.com
```

### Step 2: Configure SMS Service (Already Setup)

Your SMS services (Telnyx/Twilio) are already configured. Verify in `.env`:

```bash
TELNYX_API_KEY=your-key
TELNYX_PHONE_NUMBER=+1234567890
# or
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 3: Add Application Settings

```bash
APP_URL=https://yourdomain.com
CLINIC_PHONE=(555) 123-4567
```

### Step 4: Test the System

```bash
npm run test:notifications your-email@example.com
```

This will:

- Verify email/SMS connectivity
- Send test confirmation email
- Send test SMS
- Check scheduled reminders
- Send test cancellation notification

## What Gets Sent Automatically

### When Patient Books Appointment

1. **Confirmation Email** (to patient)
   - Professional HTML email
   - Appointment details
   - Meeting link (for video)
   - Instructions

2. **Confirmation SMS** (to patient)
   - Brief confirmation
   - Meeting link
   - Confirmation number

3. **Doctor Notification Email**
   - New appointment alert
   - Patient details
   - Appointment info

4. **Scheduled Reminders**
   - 24 hours before: SMS reminder
   - 2 hours before: SMS reminder

### When Appointment is Cancelled

1. **Cancellation Email** (to patient)
2. **Cancellation SMS** (to patient)
3. **Reminders Cancelled** (automatic)

## Testing in Development

### Test Without Real Services

In `.env`:

```bash
NODE_ENV=development
```

Notifications will be logged to console instead of sent.

### Test With Real Services

1. Configure email/SMS as above
2. Create test appointment via API:

```bash
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

3. Check your email and phone for notifications

## Integration Example

```typescript
// Your frontend code
const response = await fetch("/api/appointments", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    patientId: currentUser.id,
    doctorId: selectedDoctor.id,
    scheduledTime: appointmentDate.toISOString(),
    type: "video",
    reason: "Follow-up consultation",
  }),
});

const appointment = await response.json();

// Notifications are sent automatically!
// appointment.confirmationNumber - for display
// appointment.meetingLink - for video consultations
// appointment.notificationStatus - 'pending' (sent async)
```

## Common Issues

### Email Not Sending

**Problem**: Gmail blocking SMTP
**Solution**: Use App Password, not regular password

**Problem**: "Invalid login" error
**Solution**: Enable "Less secure app access" or use App Password

### SMS Not Sending

**Problem**: "Invalid phone number"
**Solution**: Ensure phone includes country code: `+1234567890`

**Problem**: Messages not arriving
**Solution**: Check Telnyx/Twilio account balance and status

### Reminders Not Scheduling

**Problem**: Server timezone incorrect
**Solution**: Set `TZ=America/New_York` (or your timezone) in `.env`

## Production Checklist

- [ ] Email service configured and verified
- [ ] SMS service configured and tested
- [ ] APP_URL set to production domain
- [ ] Email templates reviewed
- [ ] Test notifications received successfully
- [ ] Monitoring/logging set up
- [ ] Error alerting configured

## Support

- Full Documentation: `docs/APPOINTMENT_NOTIFICATIONS.md`
- Test Suite: `npm run test:notifications your-email@example.com`
- Check Service Status: `GET /api/messaging/status`

## Next Steps

1. Review email templates in `server/utils/appointmentNotificationService.ts`
2. Customize templates for your brand
3. Add notification tracking to database (optional)
4. Set up monitoring dashboard (optional)
5. Configure production email service (SendGrid/SES recommended)

---

Ready to go! Notifications will be sent automatically for all new appointments.
