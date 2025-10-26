# Telecheck Database Schema - HCW Video Consultation Integration

## Overview

This document describes the complete database schema implementation for the HCW video consultation integration using Prisma ORM with PostgreSQL.

## Architecture

```
Telecheck Application
    ├── Prisma Client (ORM)
    ├── PostgreSQL Database
    └── HCW@Home API Integration
```

## Database Models

### 1. User Model

The `User` model extends the existing users table with a role field to distinguish between patients and doctors.

**Fields:**

- `id`: String (CUID primary key)
- `email`: String (unique, indexed)
- `firstName`: String
- `lastName`: String
- `dateOfBirth`: DateTime (optional)
- `phone`: String (optional)
- `role`: Enum (PATIENT, DOCTOR, ADMIN, NURSE) - default: PATIENT
- `emergencyContactName`: String (optional)
- `emergencyContactPhone`: String (optional)
- `medicalHistory`: Text (optional)
- `currentMedications`: Text (optional)
- `allergies`: Text (optional)
- `insuranceProvider`: String (optional)
- `insurancePolicyNumber`: String (optional)
- `primaryCarePhysician`: String (optional)
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Relations:**

- One-to-many with Appointment (as patient)
- One-to-many with Appointment (as doctor)

### 2. Appointment Model

The `Appointment` model stores scheduled appointments between patients and doctors.

**Fields:**

- `id`: String (CUID primary key)
- `patientId`: String (foreign key to User)
- `doctorId`: String (foreign key to User)
- `scheduledTime`: DateTime (timestamptz)
- `type`: Enum (video, in_person) - default: video
- `status`: Enum (pending, confirmed, active, completed, cancelled) - default: pending
- `reason`: String (optional)
- `notes`: String (optional)
- `hcwConsultationId`: String (optional, unique) - Links to HCW@Home consultation
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Relations:**

- Many-to-one with User (patient)
- Many-to-one with User (doctor)
- One-to-one with VideoConsultation

**Indexes:**

- `patientId` - Fast patient appointment lookups
- `doctorId` - Fast doctor appointment lookups
- `scheduledTime` - Fast date-range queries
- `status` - Filter by appointment status
- `patientId, scheduledTime` - Compound index for patient scheduling queries
- `doctorId, scheduledTime` - Compound index for doctor scheduling queries

### 3. VideoConsultation Model

The `VideoConsultation` model stores HCW@Home video consultation session data.

**Fields:**

- `id`: String (CUID primary key)
- `appointmentId`: String (unique foreign key to Appointment)
- `hcwConsultationId`: String - HCW@Home consultation ID (indexed)
- `patientUrl`: String - Patient join URL
- `doctorUrl`: String (optional) - Doctor join URL
- `status`: Enum (pending, active, completed, cancelled, failed) - default: pending
- `startedAt`: DateTime (optional, timestamptz)
- `endedAt`: DateTime (optional, timestamptz)
- `duration`: Integer (optional) - Duration in minutes
- `errorMessage`: String (optional) - Error details if consultation failed
- `metadata`: JSON (optional) - Additional HCW response data
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Relations:**

- One-to-one with Appointment

**Indexes:**

- `appointmentId` - Fast appointment lookup
- `hcwConsultationId` - Fast HCW consultation lookup
- `status` - Filter by consultation status
- `startedAt` - Time-based queries

## Database Schema Diagram

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ firstName           │
│ lastName            │
│ role                │
│ ...                 │
└─────────────────────┘
         │ 1
         │
         │ N (as patient)
         ├───────────────────┐
         │                   │
         │ N (as doctor)     │
         ├───────────────────┤
         ▼                   ▼
┌─────────────────────┐
│    Appointment      │
├─────────────────────┤
│ id (PK)             │
│ patientId (FK)      │◄────┐
│ doctorId (FK)       │     │
│ scheduledTime       │     │
│ type                │     │
│ status              │     │
│ hcwConsultationId   │     │ 1:1
│ ...                 │     │
└─────────────────────┘     │
         │ 1                │
         │                  │
         │                  │
         ▼                  │
┌─────────────────────┐     │
│ VideoConsultation   │     │
├─────────────────────┤     │
│ id (PK)             │     │
│ appointmentId (FK)  │─────┘
│ hcwConsultationId   │
│ patientUrl          │
│ doctorUrl           │
│ status              │
│ startedAt           │
│ endedAt             │
│ duration            │
│ ...                 │
└─────────────────────┘
```

## Enums

### UserRole

- `PATIENT` - Patient user
- `DOCTOR` - Doctor/provider user
- `ADMIN` - Administrative user
- `NURSE` - Nurse user

### AppointmentStatus

- `pending` - Appointment created but not confirmed
- `confirmed` - Appointment confirmed with HCW consultation created
- `active` - Appointment currently in progress
- `completed` - Appointment finished successfully
- `cancelled` - Appointment cancelled

### AppointmentType

- `video` - Video consultation appointment
- `in_person` - In-person appointment

### VideoConsultationStatus

- `pending` - Consultation created but not started
- `active` - Consultation currently active
- `completed` - Consultation ended successfully
- `cancelled` - Consultation cancelled
- `failed` - Consultation failed due to error

## API Endpoints

### Appointments API (`/api/appointments`)

#### Create Appointment

```http
POST /api/appointments
Content-Type: application/json

{
  "patientId": "cuid...",
  "doctorId": "cuid...",
  "scheduledTime": "2025-10-26T14:00:00Z",
  "type": "video",
  "reason": "Follow-up consultation",
  "notes": "Patient requests medication review"
}
```

#### Get Appointment

```http
GET /api/appointments/:id
```

#### List Appointments

```http
GET /api/appointments?patientId=cuid...&status=confirmed&limit=50&offset=0
```

Query Parameters:

- `patientId` - Filter by patient ID
- `doctorId` - Filter by doctor ID
- `status` - Filter by status
- `type` - Filter by appointment type
- `startDate` - Filter appointments after this date
- `endDate` - Filter appointments before this date
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

#### Update Appointment

```http
PATCH /api/appointments/:id
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "Updated notes"
}
```

#### Delete/Cancel Appointment

```http
DELETE /api/appointments/:id
```

#### Start Appointment

```http
POST /api/appointments/:id/start
```

### Video Consultations API (`/api/consultations`)

#### Create HCW Session

```http
POST /api/consultations/:appointmentId/hcw-session
```

Response:

```json
{
  "consultationId": "cuid...",
  "hcwConsultationId": "hcw-id...",
  "hcwUrl": "http://143.198.2.224:4200/invite/token...",
  "doctorUrl": "http://143.198.2.224:4201/consultation/id...",
  "status": "pending",
  "scheduledTime": "2025-10-26T14:00:00Z"
}
```

#### End Consultation

```http
POST /api/consultations/:appointmentId/end
Content-Type: application/json

{
  "consultationId": "cuid..."
}
```

Response:

```json
{
  "success": true,
  "message": "Consultation ended successfully",
  "appointmentId": "cuid...",
  "consultationId": "cuid...",
  "duration": 45
}
```

#### Get Consultation Status

```http
GET /api/consultations/:appointmentId/status
```

Response:

```json
{
  "appointmentId": "cuid...",
  "consultationId": "cuid...",
  "hcwConsultationId": "hcw-id...",
  "status": "active",
  "appointmentStatus": "active",
  "startedAt": "2025-10-26T14:05:00Z",
  "endedAt": null,
  "duration": null
}
```

## Database Setup

### Prerequisites

1. PostgreSQL database (version 12+)
2. Node.js (version 20.14.0 or higher)
3. DATABASE_URL environment variable configured

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure DATABASE_URL in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/telecheck?schema=public"
```

3. Generate Prisma Client:

```bash
npm run prisma:generate
```

4. Run migrations:

```bash
# Development
npm run migrate

# Production
npm run migrate:deploy
```

5. (Optional) Open Prisma Studio to view data:

```bash
npm run prisma:studio
```

## Migration Commands

### Development

```bash
# Run migrations (creates new migrations if schema changed)
npm run migrate

# Generate Prisma Client
npm run prisma:generate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Reset database (WARNING: Deletes all data)
npm run migrate:reset
```

### Production

```bash
# Deploy existing migrations (does not create new ones)
npm run migrate:deploy

# Generate Prisma Client
npm run prisma:generate
```

## Data Flow

### Creating a Video Consultation

1. **Create Appointment**
   - Client calls `POST /api/appointments`
   - Server creates Appointment record with status "pending"

2. **Initialize HCW Session**
   - Client calls `POST /api/consultations/:appointmentId/hcw-session`
   - Server retrieves Appointment with patient and doctor data
   - Server calls HCW@Home API to create consultation
   - Server creates VideoConsultation record
   - Server updates Appointment status to "confirmed" and sets `hcwConsultationId`
   - Server returns join URLs for patient and doctor

3. **Start Consultation**
   - Client calls `POST /api/appointments/:id/start`
   - Server updates Appointment status to "active"
   - Server updates VideoConsultation status to "active" and sets `startedAt`

4. **End Consultation**
   - Client calls `POST /api/consultations/:appointmentId/end`
   - Server calls HCW@Home API to end session
   - Server calculates duration
   - Server updates VideoConsultation status to "completed" with `endedAt` and `duration`
   - Server updates Appointment status to "completed"

### Querying Appointment Data

**Get upcoming appointments for a patient:**

```typescript
const appointments = await prisma.appointment.findMany({
  where: {
    patientId: userId,
    scheduledTime: {
      gte: new Date(),
    },
    status: {
      in: ["pending", "confirmed"],
    },
  },
  include: {
    doctor: true,
    videoConsultation: true,
  },
  orderBy: {
    scheduledTime: "asc",
  },
});
```

**Get active consultations:**

```typescript
const activeConsultations = await prisma.videoConsultation.findMany({
  where: {
    status: "active",
  },
  include: {
    appointment: {
      include: {
        patient: true,
        doctor: true,
      },
    },
  },
});
```

## Performance Considerations

### Indexes

All critical query patterns are covered by indexes:

- Patient appointment lookups: `appointments(patientId, scheduledTime)`
- Doctor appointment lookups: `appointments(doctorId, scheduledTime)`
- Status filtering: `appointments(status)`
- HCW consultation mapping: `appointments(hcwConsultationId)` (unique)
- Video consultation lookups: `video_consultations(appointmentId)` (unique)

### Connection Pooling

Prisma automatically manages connection pooling. Default configuration:

- Connection pool size: Based on database connection limit
- Query timeout: 10 seconds
- Connection timeout: 10 seconds

### Query Optimization

1. **Use includes selectively**: Only include relations when needed
2. **Pagination**: Always use `take` and `skip` for list queries
3. **Batch operations**: Use `createMany`, `updateMany` for bulk operations
4. **Transactions**: Use `$transaction` for multi-step operations

## Data Integrity

### Constraints

1. **Foreign Keys**: Cascade delete ensures orphaned records are removed
2. **Unique Constraints**: Prevent duplicate appointments or consultations
3. **Required Fields**: Enforce data completeness at database level
4. **Enums**: Type-safe status values

### Transactions

Critical operations use transactions:

```typescript
await prisma.$transaction(async (tx) => {
  const consultation = await tx.videoConsultation.create({
    data: videoConsultationData,
  });

  await tx.appointment.update({
    where: { id: appointmentId },
    data: {
      status: "confirmed",
      hcwConsultationId: consultation.hcwConsultationId,
    },
  });
});
```

## Monitoring and Logging

### Query Logging

Prisma logs all queries in development:

```
prisma:query SELECT * FROM "appointments" WHERE "id" = $1
prisma:query INSERT INTO "video_consultations" ...
```

### Error Handling

All database operations include error handling:

```typescript
try {
  const appointment = await prisma.appointment.create({ ... });
} catch (error) {
  console.error('Failed to create appointment:', error);
  res.status(500).json({
    error: 'Failed to create appointment',
    message: error instanceof Error ? error.message : 'Unknown error',
  });
}
```

## Security

### SQL Injection Prevention

Prisma automatically parameterizes all queries, preventing SQL injection.

### Row-Level Security

Implement authorization middleware to ensure users can only access their own data:

```typescript
// Verify user has access to appointment
const appointment = await prisma.appointment.findFirst({
  where: {
    id: appointmentId,
    OR: [{ patientId: currentUserId }, { doctorId: currentUserId }],
  },
});
```

### HIPAA Compliance

1. **Encryption at rest**: Configure PostgreSQL with encryption
2. **Encryption in transit**: Use SSL/TLS for database connections
3. **Audit logging**: All queries logged with timestamps
4. **Access control**: Role-based access via User.role field

## Troubleshooting

### Common Issues

**Issue: "Cannot find module '@prisma/client'"**

```bash
npm run prisma:generate
```

**Issue: "Migration failed"**

```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Verify database is accessible
psql $DATABASE_URL -c "SELECT 1"

# View migration status
npx prisma migrate status
```

**Issue: "Prisma Client not initialized"**

```typescript
// Ensure import from config
import prisma from "../config/prisma";
```

### Database Inspection

```bash
# View current schema
npx prisma db pull

# View migration history
npx prisma migrate status

# Open database GUI
npm run prisma:studio
```

## Backup and Recovery

### Backup

```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### Migration Rollback

Prisma doesn't support automatic rollbacks. To rollback:

1. Restore database from backup
2. Delete failed migration folder
3. Re-run migrations

## Future Enhancements

Potential schema improvements:

1. **Appointment Reminders Table**: Store scheduled reminders
2. **Consultation Notes Table**: Doctor notes from consultations
3. **Appointment History Table**: Track status changes
4. **Video Quality Metrics**: Store connection quality data
5. **Billing Integration**: Link appointments to billing records

## Support

For questions or issues:

- Prisma Documentation: https://www.prisma.io/docs
- HCW@Home API: https://docs.hcw-at-home.com/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
