# Database Schema Quick Start Guide

## TL;DR - Get Started in 5 Minutes

### 1. Set up environment variables

Create or update `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/telecheck?schema=public"
```

### 2. Run migrations

```bash
npm run migrate
```

### 3. Start the server

```bash
npm run dev
```

## What Was Implemented

### Database Schema

Three main models with complete relationships:

1. **User** - Extended with role field (PATIENT, DOCTOR, ADMIN, NURSE)
2. **Appointment** - Scheduled appointments between patients and doctors
3. **VideoConsultation** - HCW@Home video session data

### API Endpoints

#### Appointments (`/api/appointments`)

- `POST /` - Create appointment
- `GET /:id` - Get appointment
- `GET /` - List appointments (with filters)
- `PATCH /:id` - Update appointment
- `DELETE /:id` - Cancel/delete appointment
- `POST /:id/start` - Start appointment

#### Consultations (`/api/consultations`)

- `POST /:appointmentId/hcw-session` - Create HCW video session
- `POST /:appointmentId/end` - End consultation
- `GET /:appointmentId/status` - Get consultation status

## Files Created/Modified

### New Files

```
prisma/
├── schema.prisma                                    # Prisma schema definition
├── migrations/
│   ├── migration_lock.toml                         # Migration lock file
│   └── 20251026000000_add_appointments_and_video_consultations/
│       └── migration.sql                           # Initial migration

server/
├── config/
│   └── prisma.ts                                   # Prisma client initialization
└── routes/
    └── appointments.ts                             # Appointments CRUD API

scripts/
└── run-migrations.ts                               # Migration runner script

Documentation/
├── DATABASE_SCHEMA_GUIDE.md                        # Complete schema documentation
├── VERIFICATION_CHECKLIST.md                       # Deployment checklist
└── DATABASE_QUICK_START.md                         # This file
```

### Modified Files

```
package.json                                        # Added Prisma scripts
server/index.ts                                     # Registered appointments routes
server/routes/consultations.ts                      # Updated to use Prisma
```

## Example Usage

### Create an Appointment

```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-cuid-here",
    "doctorId": "doctor-cuid-here",
    "scheduledTime": "2025-10-27T14:00:00Z",
    "type": "video",
    "reason": "Follow-up consultation"
  }'
```

### Create HCW Video Session

```bash
curl -X POST http://localhost:3000/api/consultations/{appointment-id}/hcw-session
```

Response includes:

- `hcwUrl` - Patient join URL
- `doctorUrl` - Doctor join URL
- `consultationId` - Telecheck consultation ID
- `hcwConsultationId` - HCW@Home consultation ID

### End Consultation

```bash
curl -X POST http://localhost:3000/api/consultations/{appointment-id}/end \
  -H "Content-Type: application/json" \
  -d '{"consultationId": "consultation-id-here"}'
```

## Database Commands

### Development

```bash
# Run migrations
npm run migrate

# Open database GUI
npm run prisma:studio

# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Reset database (WARNING: Deletes all data)
npm run migrate:reset
```

### Production

```bash
# Deploy migrations
npm run migrate:deploy

# Generate Prisma Client
npm run prisma:generate
```

## Schema Overview

### Appointment Model

```typescript
{
  id: string                  // CUID
  patientId: string           // Foreign key to User
  doctorId: string            // Foreign key to User
  scheduledTime: DateTime     // When appointment is scheduled
  type: "video" | "in_person" // Appointment type
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled"
  reason?: string             // Appointment reason
  notes?: string              // Additional notes
  hcwConsultationId?: string  // HCW@Home consultation ID (unique)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### VideoConsultation Model

```typescript
{
  id: string                  // CUID
  appointmentId: string       // Foreign key to Appointment (unique)
  hcwConsultationId: string   // HCW@Home consultation ID
  patientUrl: string          // Patient join URL
  doctorUrl?: string          // Doctor join URL
  status: "pending" | "active" | "completed" | "cancelled" | "failed"
  startedAt?: DateTime        // When consultation started
  endedAt?: DateTime          // When consultation ended
  duration?: number           // Duration in minutes
  errorMessage?: string       // Error details if failed
  metadata?: JSON             // Additional HCW response data
  createdAt: DateTime
  updatedAt: DateTime
}
```

## Indexing Strategy

All queries are optimized with indexes:

- `appointments.patientId` - Fast patient lookups
- `appointments.doctorId` - Fast doctor lookups
- `appointments.scheduledTime` - Date range queries
- `appointments.status` - Status filtering
- `appointments(patientId, scheduledTime)` - Compound index for patient scheduling
- `appointments(doctorId, scheduledTime)` - Compound index for doctor scheduling
- `appointments.hcwConsultationId` - Unique index for HCW mapping
- `video_consultations.appointmentId` - Unique index for appointment mapping
- `video_consultations.hcwConsultationId` - Fast HCW lookups

## Common Queries

### Get Upcoming Appointments

```typescript
const upcomingAppointments = await prisma.appointment.findMany({
  where: {
    patientId: userId,
    scheduledTime: { gte: new Date() },
    status: { in: ["pending", "confirmed"] },
  },
  include: {
    doctor: true,
    videoConsultation: true,
  },
  orderBy: { scheduledTime: "asc" },
});
```

### Get Active Consultations

```typescript
const activeConsultations = await prisma.videoConsultation.findMany({
  where: { status: "active" },
  include: {
    appointment: {
      include: { patient: true, doctor: true },
    },
  },
});
```

### Get Appointment with Full Details

```typescript
const appointment = await prisma.appointment.findUnique({
  where: { id: appointmentId },
  include: {
    patient: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    },
    doctor: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    },
    videoConsultation: true,
  },
});
```

## Troubleshooting

### Issue: "Cannot find module '@prisma/client'"

```bash
npm run prisma:generate
```

### Issue: "Database connection failed"

1. Check DATABASE_URL in `.env`
2. Verify database is running: `psql $DATABASE_URL -c "SELECT 1"`
3. Check firewall/network settings

### Issue: "Migration failed"

1. Check migration status: `npx prisma migrate status`
2. View detailed error in console
3. If needed, reset and reapply: `npm run migrate:reset`

### Issue: "HCW session creation fails"

1. Verify HCW environment variables are set:
   - `HCW_API_URL`
   - `HCW_USER_EMAIL`
   - `HCW_USER_PASSWORD`
2. Check HCW service health: `GET /api/health`
3. Review HCW service logs

## Production Deployment

### Step-by-Step

1. **Backup database**

   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Set production environment**

   ```bash
   export NODE_ENV=production
   export DATABASE_URL="postgresql://..."
   ```

3. **Deploy migrations**

   ```bash
   npm run migrate:deploy
   ```

4. **Build application**

   ```bash
   npm run build:prod
   ```

5. **Start server**

   ```bash
   npm run start:prod
   ```

6. **Verify deployment**
   ```bash
   curl http://your-domain/health
   ```

## Next Steps

1. **Test the implementation**
   - Follow VERIFICATION_CHECKLIST.md for complete testing

2. **Configure production database**
   - Set up PostgreSQL with proper backups
   - Enable SSL/TLS connections
   - Configure connection pooling

3. **Set up monitoring**
   - Database query performance
   - API endpoint latency
   - Error rates

4. **Review security**
   - Authentication middleware
   - Row-level access control
   - Data encryption

## Resources

- **Complete Documentation**: See `DATABASE_SCHEMA_GUIDE.md`
- **Testing Guide**: See `VERIFICATION_CHECKLIST.md`
- **Prisma Documentation**: https://www.prisma.io/docs
- **HCW@Home API**: https://docs.hcw-at-home.com/

## Support

For questions or issues:

1. Review `DATABASE_SCHEMA_GUIDE.md` for detailed information
2. Check `VERIFICATION_CHECKLIST.md` for testing procedures
3. Consult Prisma documentation for ORM-specific questions
4. Review HCW@Home documentation for integration issues
