# Post-Consultation Workflow - Integration Guide

## Quick Start (5 Minutes)

### 1. Database Setup

```bash
# Generate Prisma client with new models
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_consultation_notes

# Seed medical templates
npx ts-node prisma/seed-templates.ts
```

### 2. Configure Email Service

Add to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@telecheck.health
APP_URL=http://localhost:5000
```

**Note for Gmail users:**

- Enable 2-factor authentication
- Generate an app-specific password
- Use the app password in SMTP_PASSWORD

### 3. Install Dependencies

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 4. Server Already Updated

The following files have been created/updated:

- ✅ `server/routes/consultation-notes.ts` (new API routes)
- ✅ `server/services/consultationNotesService.ts` (business logic)
- ✅ `server/services/summaryService.ts` (summary generation)
- ✅ `server/services/emailService.ts` (email sending)
- ✅ `server/index.ts` (route registration)
- ✅ `prisma/schema.prisma` (database models)

### 5. Frontend Integration

Add the component to your video consultation page:

```tsx
import PostConsultationWorkflow from "@/components/PostConsultationWorkflow";

// In your video consultation component
const [showPostConsult, setShowPostConsult] = useState(false);

// After ending consultation
const handleEndConsultation = async () => {
  // End the video consultation first
  await fetch(`/api/consultations/${appointmentId}/end`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ consultationId }),
  });

  // Show post-consultation workflow
  setShowPostConsult(true);
};

// Render
return (
  <>
    {/* Your video consultation UI */}

    {showPostConsult && (
      <PostConsultationWorkflow
        appointmentId={appointmentId}
        patientName={patientName}
        consultationDate={new Date()}
        onComplete={() => {
          setShowPostConsult(false);
          navigate("/appointments");
        }}
        onClose={() => setShowPostConsult(false)}
      />
    )}
  </>
);
```

## Common Integration Patterns

### Pattern 1: Modal After Video Ends

```tsx
// Open post-consultation immediately after video ends
const endVideoConsultation = async () => {
  await endConsultationAPI();
  setShowPostConsultationModal(true);
};
```

### Pattern 2: Deferred Documentation

```tsx
// Add "Complete Documentation" button to appointments list
const appointmentActions = (
  <button onClick={() => openPostConsultation(appointmentId)}>
    Complete Documentation
  </button>
);
```

### Pattern 3: Auto-save Integration

The component automatically saves drafts every 30 seconds. No additional setup needed.

## Testing the Integration

### 1. Test Email Service

```bash
# Start your server
npm run dev

# Test email configuration
curl -X POST http://localhost:5000/api/consultation-notes/test-email \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Test Note Creation

```bash
# Create a test consultation note
curl -X POST http://localhost:5000/api/consultation-notes/APPOINTMENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "chiefComplaint": "Test complaint",
    "assessment": "Test assessment",
    "isDraft": true
  }'
```

### 3. Test Template Loading

```bash
# Get available templates
curl http://localhost:5000/api/consultation-notes/templates \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Summary Generation

```bash
# Generate and send summary
curl -X POST http://localhost:5000/api/consultation-notes/APPOINTMENT_ID/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Customization Options

### Custom Medical Templates

Add your own templates to `prisma/seed-templates.ts`:

```typescript
{
  name: "Custom Condition",
  category: "custom_category",
  specialty: "primary_care",
  chiefComplaintTemplate: "Your template text...",
  historyTemplate: "Your template text...",
  assessmentTemplate: "Your template text...",
  treatmentPlanTemplate: "Your template text...",
  followUpTemplate: "Your template text...",
  commonDiagnosisCodes: [
    { code: "CODE", description: "Description" }
  ],
}
```

Then run: `npx ts-node prisma/seed-templates.ts`

### Custom Email Templates

Edit `server/services/summaryService.ts`, function `generateSummaryHtml()` to customize:

- Colors and branding
- Logo and header
- Layout and styling
- Footer information

### Custom ICD-10 Codes

Edit `client/components/PostConsultationWorkflow.tsx`, the `commonICD10Codes` array to add your frequently used codes.

### Auto-save Interval

Change auto-save interval (default 30 seconds):

```tsx
// In PostConsultationWorkflow.tsx
useEffect(() => {
  const autoSaveInterval = setInterval(() => {
    if (!isSigned && hasContent(noteData)) {
      autoSave();
    }
  }, 60000); // Changed to 60 seconds
  // ...
}, [noteData, isSigned]);
```

## Integration with Existing Systems

### Integration with eRx System

Prescriptions created during consultation are automatically linked:

```tsx
// The component already integrates with /api/erx/prescriptions
// Prescription IDs are stored in consultation note
```

### Integration with Appointment System

The workflow is tied to appointments via `appointmentId`:

```typescript
// Get appointment details
const appointment = await prisma.appointment.findUnique({
  where: { id: appointmentId },
  include: {
    patient: true,
    doctor: true,
    videoConsultation: true,
  },
});
```

### Integration with Patient Portal

Patients can view summaries in their portal:

```tsx
// In patient portal component
const viewSummary = async (appointmentId: string) => {
  const response = await fetch(
    `/api/consultation-notes/${appointmentId}/summary`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  const result = await response.json();
  if (result.success) {
    setSummaryHtml(result.data.summaryHtml);
    setShowSummary(true);
  }
};
```

## Workflow Customization

### Required Fields

To make certain fields required before signing:

```tsx
// In PostConsultationWorkflow.tsx
const validateNote = (): boolean => {
  if (!noteData.chiefComplaint) {
    alert("Chief complaint is required");
    return false;
  }
  if (!noteData.assessment) {
    alert("Assessment is required");
    return false;
  }
  if (!noteData.diagnosisCodes || noteData.diagnosisCodes.length === 0) {
    alert("At least one diagnosis code is required");
    return false;
  }
  return true;
};

// Call before signing
const signNote = async () => {
  if (!validateNote()) return;
  // ... rest of signing logic
};
```

### Add Custom Tabs

Add a new tab to the interface:

```tsx
// Add to tabs array
{ id: "vitals", label: "Vital Signs", icon: Activity }

// Add tab content
{activeTab === "vitals" && (
  <div className="space-y-4">
    <VitalSignsInput
      value={noteData.vitals}
      onChange={(vitals) => setNoteData({ ...noteData, vitals })}
    />
  </div>
)}
```

### Conditional Follow-up

Automatically suggest follow-up based on diagnosis:

```tsx
useEffect(() => {
  // Auto-suggest follow-up for chronic conditions
  const chronicCodes = ["I10", "E11.9", "J45.909"];
  const hasChronic = noteData.diagnosisCodes?.some((dx) =>
    chronicCodes.includes(dx.code),
  );

  if (hasChronic && !noteData.followUpDate) {
    // Suggest follow-up in 3 months
    const followUpDate = new Date();
    followUpDate.setMonth(followUpDate.getMonth() + 3);
    setNoteData({
      ...noteData,
      followUpDate: followUpDate.toISOString().slice(0, 16),
      followUpType: "video",
    });
  }
}, [noteData.diagnosisCodes]);
```

## Production Deployment

### Database Migration

```bash
# Production database migration
npx prisma migrate deploy

# Verify migration
npx prisma migrate status
```

### Email Service Setup

**Recommended production email services:**

1. **SendGrid** (99% deliverability)
2. **AWS SES** (cost-effective)
3. **Mailgun** (developer-friendly)
4. **Postmark** (transactional emails)

**SendGrid Example:**

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

### Environment Variables

Production `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxx
SMTP_FROM=noreply@yourdomain.com

# Application
APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Performance Optimization

1. **Database Indexes** (already added in schema)
2. **Template Caching**:

   ```typescript
   // Cache templates in memory
   let templateCache: Template[] | null = null;

   const getTemplates = async () => {
     if (!templateCache) {
       templateCache = await prisma.medicalTemplate.findMany({
         where: { isActive: true },
       });
     }
     return templateCache;
   };
   ```

3. **Email Queue** (for high volume):
   ```bash
   npm install bull
   npm install @types/bull
   ```

## Monitoring & Logging

### Important Metrics to Track

1. **Note Completion Rate**

   ```sql
   SELECT
     COUNT(*) FILTER (WHERE status = 'signed') * 100.0 / COUNT(*) as completion_rate
   FROM consultation_notes
   WHERE created_at > NOW() - INTERVAL '30 days';
   ```

2. **Auto-save Success Rate**

   ```typescript
   // Add to auto-save function
   try {
     await autoSaveAPI();
     metrics.increment("autosave.success");
   } catch (error) {
     metrics.increment("autosave.failure");
   }
   ```

3. **Email Delivery Rate**

   ```sql
   SELECT
     COUNT(*) FILTER (WHERE email_sent = true) * 100.0 / COUNT(*) as delivery_rate
   FROM patient_consultation_summaries
   WHERE created_at > NOW() - INTERVAL '30 days';
   ```

4. **Template Usage**
   ```sql
   SELECT name, usage_count
   FROM medical_templates
   ORDER BY usage_count DESC
   LIMIT 10;
   ```

### Error Logging

Monitor these error patterns:

- Failed email sends
- Auto-save failures
- Sign note failures
- Template loading errors
- Audit log failures

## Troubleshooting Common Issues

### Issue: Emails not sending

**Solutions:**

1. Check SMTP credentials
2. Verify SMTP host and port
3. Check email service logs: `docker logs telecheck-server | grep EMAIL`
4. Test with a simple email tool
5. Check firewall rules (port 587 outbound)

### Issue: Auto-save not working

**Solutions:**

1. Check browser console for errors
2. Verify authentication token is valid
3. Check network tab for API calls
4. Verify server is receiving requests
5. Check server logs for errors

### Issue: Templates not loading

**Solutions:**

1. Verify seed script ran: `SELECT COUNT(*) FROM medical_templates;`
2. Check API endpoint is accessible
3. Verify authentication
4. Check browser console for errors

### Issue: Cannot sign note

**Solutions:**

1. Verify note has content
2. Check user is the note author
3. Verify note is not already signed
4. Check server logs for errors

## Security Considerations

### Access Control

```typescript
// Verify doctor owns the note
if (note.doctorId !== userId && userRole !== "ADMIN") {
  return res.status(403).json({ error: "Not authorized" });
}
```

### Input Validation

```typescript
// Validate diagnosis codes
const validateDiagnosisCode = (code: string): boolean => {
  // ICD-10 format: Letter followed by 2 digits, optional dot and more digits
  return /^[A-Z]\d{2}(\.\d{1,4})?$/.test(code);
};
```

### SQL Injection Prevention

✅ Using Prisma ORM (parameterized queries by default)

### XSS Prevention

```typescript
// HTML escaping in summary service
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
```

## Support

### Documentation

- API Reference: `/docs/POST_CONSULTATION_WORKFLOW.md`
- Integration Guide: This file
- Schema Reference: `prisma/schema.prisma`

### Getting Help

- GitHub Issues: https://github.com/telecheck/issues
- Email: dev-support@telecheck.health
- Slack: #post-consultation-workflow

### Contributing

See `CONTRIBUTING.md` for guidelines on:

- Adding new templates
- Improving email templates
- Adding features
- Reporting bugs

---

**Version**: 1.0.0
**Last Updated**: January 2025
