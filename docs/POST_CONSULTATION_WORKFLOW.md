# Post-Consultation Workflow Documentation

## Overview

The Post-Consultation Workflow is a comprehensive system that enables healthcare providers to complete clinical documentation after video consultations. The system includes consultation notes, diagnosis coding, treatment plans, prescription management, and automated patient summaries.

## Features

### 1. Clinical Documentation

- **Chief Complaint**: Patient's primary reason for visit
- **History of Present Illness**: Detailed symptom history
- **Assessment & Findings**: Clinical examination results
- **Additional Clinical Notes**: Supplementary observations

### 2. Diagnosis Management

- **ICD-10 Code Search**: Quick search for diagnosis codes
- **Multiple Diagnoses**: Support for multiple diagnosis codes per consultation
- **Common Codes**: Quick access to frequently used codes

### 3. Treatment Planning

- **Treatment Plan**: Detailed intervention documentation
- **Medical Templates**: Pre-built templates for common conditions
- **Prescription Integration**: Links to eRx system

### 4. Follow-up Management

- **Follow-up Instructions**: Patient care instructions
- **Next Appointment Scheduling**: Schedule follow-up visits
- **Appointment Type Selection**: Video, in-person, or phone

### 5. Patient Summaries

- **Automated Generation**: HTML and plain-text summaries
- **Email Delivery**: Automatic email to patients
- **In-App Access**: Available in patient portal

### 6. Compliance Features

- **Auto-save**: Drafts saved every 30 seconds
- **Audit Logging**: Complete audit trail of all changes
- **Digital Signature**: Sign notes to finalize
- **Version Control**: Track note versions
- **HIPAA Compliance**: Encrypted storage and transmission

## Database Schema

### ConsultationNote Table

```sql
- id (cuid)
- appointmentId
- doctorId
- patientId
- chiefComplaint (text)
- historyOfPresent (text)
- assessment (text)
- clinicalNotes (text)
- diagnosisCodes (json) -- Array of ICD-10 codes
- treatmentPlan (text)
- followUpInstructions (text)
- prescriptionIds (json) -- Array of eRx prescription IDs
- followUpDate (timestamptz)
- followUpType (string)
- status (draft/completed/signed)
- isDraft (boolean)
- signedAt (timestamptz)
- createdAt (timestamptz)
- updatedAt (timestamptz)
- version (int)
```

### ConsultationNoteAudit Table

```sql
- id (cuid)
- noteId
- userId
- action (created/updated/signed/viewed)
- fieldChanged
- oldValue (text)
- newValue (text)
- ipAddress
- userAgent
- timestamp (timestamptz)
```

### PatientConsultationSummary Table

```sql
- id (cuid)
- appointmentId (unique)
- patientId
- doctorId
- summaryHtml (text)
- summaryPlainText (text)
- emailSent (boolean)
- emailSentAt (timestamptz)
- viewedByPatient (boolean)
- viewedAt (timestamptz)
- createdAt (timestamptz)
- updatedAt (timestamptz)
```

### MedicalTemplate Table

```sql
- id (cuid)
- name
- category
- specialty
- chiefComplaintTemplate (text)
- historyTemplate (text)
- assessmentTemplate (text)
- treatmentPlanTemplate (text)
- followUpTemplate (text)
- commonDiagnosisCodes (json)
- usageCount (int)
- isActive (boolean)
- createdAt (timestamptz)
- updatedAt (timestamptz)
```

## API Endpoints

### Consultation Notes

#### POST `/api/consultation-notes/:appointmentId`

Create or update consultation note.

**Request Body:**

```json
{
  "chiefComplaint": "string",
  "historyOfPresent": "string",
  "assessment": "string",
  "clinicalNotes": "string",
  "diagnosisCodes": [
    {
      "code": "J06.9",
      "description": "Acute upper respiratory infection",
      "type": "ICD-10"
    }
  ],
  "treatmentPlan": "string",
  "followUpInstructions": "string",
  "prescriptionIds": ["rx_123"],
  "followUpDate": "2024-01-15T10:00:00Z",
  "followUpType": "video",
  "isDraft": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "note_id",
    "appointmentId": "appt_id"
    // ... note fields
  }
}
```

#### POST `/api/consultation-notes/:appointmentId/auto-save`

Auto-save draft note (called periodically by frontend).

#### GET `/api/consultation-notes/:appointmentId`

Retrieve consultation note for an appointment.

#### POST `/api/consultation-notes/:noteId/sign`

Sign/finalize consultation note (cannot be edited after signing).

#### GET `/api/consultation-notes/:noteId/audit`

Get complete audit trail for a note.

#### POST `/api/consultation-notes/:appointmentId/prescription`

Create and attach prescription to consultation.

**Request Body:**

```json
{
  "medication": {
    "coding": [
      {
        "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
        "code": "313782",
        "display": "Amoxicillin 500mg"
      }
    ]
  },
  "dosageInstruction": {
    "text": "Take 1 capsule by mouth three times daily for 10 days"
  }
}
```

### Patient Summaries

#### POST `/api/consultation-notes/:appointmentId/summary`

Generate and send patient summary via email.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "summary_id",
    "appointmentId": "appt_id",
    "emailSent": true,
    "emailSentAt": "2024-01-10T15:30:00Z"
  },
  "message": "Patient summary generated and sent successfully"
}
```

#### GET `/api/consultation-notes/:appointmentId/summary`

Retrieve patient summary.

### Templates

#### GET `/api/consultation-notes/templates`

Get available medical templates.

**Query Parameters:**

- `category`: Filter by category (respiratory, cardiovascular, etc.)
- `specialty`: Filter by specialty (primary_care, urgent_care, etc.)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "template_id",
      "name": "Upper Respiratory Infection (URI)",
      "category": "respiratory",
      "specialty": "primary_care",
      "chiefComplaintTemplate": "...",
      "historyTemplate": "..."
      // ... other template fields
    }
  ]
}
```

#### POST `/api/consultation-notes/templates/:templateId/use`

Increment template usage counter.

### Patient History

#### GET `/api/consultation-notes/patient/:patientId/history`

Get consultation notes history for a patient.

**Query Parameters:**

- `limit`: Number of notes to return (default: 10)

## Frontend Component Usage

### Basic Implementation

```tsx
import PostConsultationWorkflow from "@/components/PostConsultationWorkflow";

function DoctorConsultationPage() {
  const [showPostConsult, setShowPostConsult] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string>("");

  const handleEndConsultation = (apptId: string) => {
    setAppointmentId(apptId);
    setShowPostConsult(true);
  };

  return (
    <div>
      {/* Video consultation interface */}

      {showPostConsult && (
        <PostConsultationWorkflow
          appointmentId={appointmentId}
          patientName="John Doe"
          consultationDate={new Date()}
          onComplete={() => {
            setShowPostConsult(false);
            // Navigate to appointments list or dashboard
          }}
          onClose={() => setShowPostConsult(false)}
        />
      )}
    </div>
  );
}
```

### Integration with Video Consultation

```tsx
// After ending video consultation
const endConsultation = async () => {
  await fetch(`/api/consultations/${appointmentId}/end`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ consultationId }),
  });

  // Open post-consultation workflow
  setShowPostConsultation(true);
};
```

## Email Service Configuration

### Environment Variables

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@telecheck.health

# Application URL (for links in emails)
APP_URL=https://telecheck.health
```

### Email Templates

The system includes professionally designed email templates for:

- Consultation summaries
- Appointment reminders
- Prescription notifications

Templates are mobile-responsive and include:

- Branded headers
- Clear information hierarchy
- Action buttons
- Contact information
- Legal disclaimers

## Security & Compliance

### HIPAA Compliance

1. **Encryption**: All PHI is encrypted at rest and in transit
2. **Access Controls**: Role-based access control (RBAC)
3. **Audit Logging**: Complete audit trail of all note access and modifications
4. **Data Retention**: Configurable retention policies
5. **Secure Email**: Encrypted email delivery for summaries

### Audit Logging

Every action is logged with:

- User ID
- Action type (created, updated, signed, viewed)
- Field changed (for updates)
- Old and new values
- IP address
- User agent
- Timestamp

### Data Privacy

- Doctors can only view/edit their own notes
- Patients can only view their own summaries
- Admins have full access for compliance purposes
- All access is logged

## Testing Checklist

### Unit Tests

- [ ] Consultation note creation
- [ ] Consultation note update
- [ ] Auto-save functionality
- [ ] Note signing
- [ ] Audit log creation
- [ ] Summary generation
- [ ] Email sending

### Integration Tests

- [ ] Complete post-consultation workflow
- [ ] Template application
- [ ] Prescription attachment
- [ ] Follow-up scheduling
- [ ] Patient summary delivery
- [ ] Multi-user access control

### End-to-End Tests

- [ ] Doctor completes consultation
- [ ] Doctor fills out post-consultation form
- [ ] Doctor applies template
- [ ] Doctor adds diagnosis codes
- [ ] Doctor sends prescription
- [ ] Doctor signs note
- [ ] System generates summary
- [ ] Patient receives email
- [ ] Patient views summary in portal

### Security Tests

- [ ] Unauthorized access prevention
- [ ] Cross-patient data access prevention
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Session management

### Compliance Tests

- [ ] Audit log completeness
- [ ] Data encryption verification
- [ ] Access control verification
- [ ] Data retention policies
- [ ] Email encryption
- [ ] PHI handling

## Database Migration

### Run Prisma Migration

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_consultation_notes

# Apply migration to production
npx prisma migrate deploy
```

### Seed Medical Templates

```bash
# Run template seeding script
npx ts-node prisma/seed-templates.ts
```

## Deployment Steps

1. **Update Database Schema**

   ```bash
   npx prisma migrate deploy
   ```

2. **Seed Templates**

   ```bash
   npx ts-node prisma/seed-templates.ts
   ```

3. **Configure Email Service**
   - Set SMTP environment variables
   - Test email delivery

4. **Deploy Backend**
   - Deploy updated server code
   - Verify API endpoints

5. **Deploy Frontend**
   - Build and deploy React components
   - Update routing

6. **Testing**
   - Run test suite
   - Manual UAT testing

7. **Documentation**
   - Update API documentation
   - Train users
   - Update help documentation

## Troubleshooting

### Email Not Sending

- Verify SMTP credentials
- Check SMTP host and port
- Review email service logs
- Check firewall rules

### Auto-save Not Working

- Check browser console for errors
- Verify authentication token
- Check network connectivity
- Review server logs

### Templates Not Loading

- Verify database seeding completed
- Check API endpoint
- Review browser console

### Audit Logs Missing

- Verify database migration completed
- Check audit service logs
- Verify request object passed to service

## Performance Optimization

### Database Indexes

All critical fields are indexed:

- appointmentId
- doctorId
- patientId
- status
- createdAt

### Caching Strategy

- Template data cached (infrequently changes)
- Patient summaries cached after generation
- Auto-save throttled to 30-second intervals

### Email Queue

For high-volume deployments, consider:

- Background job processing
- Email queue (Bull, Agenda)
- Retry logic for failed emails

## Future Enhancements

### Planned Features

- [ ] Voice-to-text dictation
- [ ] AI-assisted documentation
- [ ] Custom template builder
- [ ] Multi-language support
- [ ] PDF export
- [ ] E-signature integration
- [ ] Integration with EHR systems
- [ ] Mobile app support
- [ ] Offline mode

### API Enhancements

- [ ] Batch operations
- [ ] GraphQL support
- [ ] Webhooks for events
- [ ] Real-time collaboration

## Support & Maintenance

### Monitoring

- Log error rates
- Track email delivery rates
- Monitor auto-save success rates
- Track template usage
- Audit log analysis

### Maintenance Tasks

- Regular audit log cleanup
- Template updates
- Email template updates
- Security patches
- Performance optimization

## Contact

For technical support or questions:

- Email: support@telecheck.health
- Documentation: https://docs.telecheck.health
- GitHub Issues: https://github.com/telecheck/issues

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Author**: Telecheck Development Team
