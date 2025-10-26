# Post-Consultation Notes API

## Overview

Simple API endpoint for doctors to add consultation notes after completing a video consultation session.

## Database Changes

### Schema Updates

Added three new fields to the `VideoConsultation` model in `prisma/schema.prisma`:

- `consultationNotes`: Text field for general consultation notes
- `diagnosis`: Text field for diagnosis information
- `treatmentPlan`: Text field for treatment plan details

### Migration

Run the following to apply the schema changes:

```bash
npx prisma migrate dev --name add_consultation_notes_to_video_consultation
```

Or manually run the SQL migration:

```bash
psql -U your_user -d your_database -f prisma/migrations/add_consultation_notes_fields.sql
```

Then generate Prisma client:

```bash
npx prisma generate
```

## API Endpoint

### POST /api/consultations/:appointmentId/notes

Add or update post-consultation notes for a completed consultation.

#### URL Parameters

- `appointmentId` (string, required): The appointment ID associated with the consultation

#### Request Body

```json
{
  "notes": "Patient presented with persistent cough and mild fever. Lungs clear on auscultation. No signs of respiratory distress.",
  "diagnosis": "Upper Respiratory Tract Infection (URI)",
  "treatmentPlan": "Prescribed rest, increased fluid intake, and acetaminophen for fever. Follow up if symptoms worsen or persist beyond 7 days."
}
```

All fields are optional, but at least one must be provided.

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Consultation notes saved successfully",
  "data": {
    "appointmentId": "appt_abc123",
    "consultationId": "vc_xyz789",
    "notes": "Patient presented with persistent cough and mild fever...",
    "diagnosis": "Upper Respiratory Tract Infection (URI)",
    "treatmentPlan": "Prescribed rest, increased fluid intake...",
    "updatedAt": "2025-10-26T14:30:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Missing fields

```json
{
  "error": "Missing required fields",
  "message": "At least one of notes, diagnosis, or treatmentPlan must be provided"
}
```

**404 Not Found** - Consultation not found

```json
{
  "error": "Consultation not found",
  "message": "No video consultation found for appointment: appt_abc123"
}
```

**500 Internal Server Error**

```json
{
  "error": "Failed to save notes",
  "message": "Database connection error"
}
```

## Testing

### Example cURL Commands

#### 1. Save complete consultation notes

```bash
curl -X POST http://localhost:3000/api/consultations/appt_abc123/notes \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Patient presented with persistent cough and mild fever for 3 days. Temperature 100.2°F. Lungs clear on auscultation. No signs of respiratory distress. Patient is well-hydrated.",
    "diagnosis": "Upper Respiratory Tract Infection (URI)",
    "treatmentPlan": "1. Rest and increased fluid intake\n2. Acetaminophen 500mg every 6 hours for fever\n3. Avoid cold beverages\n4. Follow up if symptoms worsen or persist beyond 7 days"
  }'
```

#### 2. Save only diagnosis

```bash
curl -X POST http://localhost:3000/api/consultations/appt_abc123/notes \
  -H "Content-Type: application/json" \
  -d '{
    "diagnosis": "Acute Bronchitis"
  }'
```

#### 3. Update existing notes (same endpoint, replaces previous values)

```bash
curl -X POST http://localhost:3000/api/consultations/appt_abc123/notes \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Follow-up note: Patient condition improving. Continuing current treatment plan.",
    "treatmentPlan": "Continue current medications for 3 more days. Schedule follow-up if needed."
  }'
```

#### 4. Test with authentication (if enabled)

```bash
curl -X POST http://localhost:3000/api/consultations/appt_abc123/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "notes": "Consultation notes here",
    "diagnosis": "Diagnosis here",
    "treatmentPlan": "Treatment plan here"
  }'
```

### Testing with Postman

1. **Create New Request**
   - Method: POST
   - URL: `http://localhost:3000/api/consultations/{appointmentId}/notes`

2. **Headers**
   - Content-Type: application/json
   - Authorization: Bearer {token} (if auth is enabled)

3. **Body** (raw JSON)
   ```json
   {
     "notes": "Your consultation notes",
     "diagnosis": "Patient diagnosis",
     "treatmentPlan": "Treatment plan details"
   }
   ```

## TypeScript Types

Located in `server/types/consultations.ts`:

```typescript
export interface ConsultationNotesRequest {
  notes?: string;
  diagnosis?: string;
  treatmentPlan?: string;
}

export interface ConsultationNotesResponse {
  success: boolean;
  message: string;
  data: {
    appointmentId: string;
    consultationId: string;
    notes: string | null;
    diagnosis: string | null;
    treatmentPlan: string | null;
    updatedAt: Date;
  };
}

export interface ConsultationNotesError {
  error: string;
  message: string;
}
```

## Integration Notes

### Frontend Integration Example

```typescript
async function saveConsultationNotes(
  appointmentId: string,
  notes: string,
  diagnosis: string,
  treatmentPlan: string,
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/consultations/${appointmentId}/notes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          notes,
          diagnosis,
          treatmentPlan,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to save notes");
    }

    const result = await response.json();
    console.log("Notes saved:", result.data);
    return result;
  } catch (error) {
    console.error("Error saving notes:", error);
    throw error;
  }
}
```

## Authentication

The endpoint includes commented-out authentication checks. To enable:

1. Uncomment lines 343-348 in `server/routes/consultations.ts`
2. Ensure the `authenticateToken` middleware is applied to the route
3. The check verifies that the user is the assigned doctor for the consultation

## Security Considerations

- Consider enabling authentication in production
- Validate appointment ownership before allowing note updates
- Implement audit logging for all note modifications
- Consider HIPAA compliance requirements for PHI storage
- Use HTTPS in production environments

## Future Enhancements

If more complex consultation notes are needed, consider using the existing `ConsultationNote` model which includes:

- Chief complaint
- History of present illness
- Assessment
- ICD-10 diagnosis codes
- Prescription references
- Follow-up scheduling
- Audit trail
- Digital signatures

See `server/routes/consultation-notes.ts` for the comprehensive API.
