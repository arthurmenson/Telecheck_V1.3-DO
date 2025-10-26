# Database Schema Implementation - Verification Checklist

## Overview

This checklist ensures the HCW video consultation database schema is correctly implemented and ready for production use.

## Pre-Deployment Checklist

### 1. Schema Files

- [x] **Prisma schema created** (`prisma/schema.prisma`)
  - Location: `c:\Users\menso\Downloads\Telecheck_V1.3-DO\prisma\schema.prisma`
  - Contains: User, Appointment, VideoConsultation models
  - Enums: UserRole, AppointmentStatus, AppointmentType, VideoConsultationStatus

- [x] **Migration files created**
  - Location: `prisma/migrations/20251026000000_add_appointments_and_video_consultations/`
  - Contains: migration.sql with complete schema
  - Migration lock file present

- [x] **Prisma Client configuration** (`server/config/prisma.ts`)
  - Initialization logic
  - Connection management
  - Health check function
  - Graceful shutdown handling

### 2. Dependencies

- [x] **Prisma packages installed**

  ```bash
  npm list @prisma/client prisma
  ```

  - `@prisma/client`: Installed as production dependency
  - `prisma`: Installed as dev dependency

- [x] **Prisma Client generated**

  ```bash
  npx prisma generate
  ```

  - Generated successfully in `node_modules/@prisma/client`

### 3. API Routes

- [x] **Appointments API** (`server/routes/appointments.ts`)
  - `POST /api/appointments` - Create appointment
  - `GET /api/appointments/:id` - Get appointment by ID
  - `GET /api/appointments` - List appointments with filters
  - `PATCH /api/appointments/:id` - Update appointment
  - `DELETE /api/appointments/:id` - Delete/cancel appointment
  - `POST /api/appointments/:id/start` - Start appointment

- [x] **Consultations API updated** (`server/routes/consultations.ts`)
  - `POST /api/consultations/:appointmentId/hcw-session` - Create HCW session
  - `POST /api/consultations/:appointmentId/end` - End consultation
  - `GET /api/consultations/:appointmentId/status` - Get status
  - All endpoints use Prisma (no mock data)

- [x] **Routes registered** in `server/index.ts`
  - Appointments routes imported
  - Consultations routes imported
  - Both mounted under `/api`

### 4. Database Migration Scripts

- [x] **Migration script created** (`scripts/run-migrations.ts`)
  - Checks DATABASE_URL
  - Runs `prisma migrate dev` or `prisma migrate deploy`
  - Generates Prisma Client
  - Handles errors gracefully

- [x] **NPM scripts added** to `package.json`
  - `npm run migrate` - Run migrations in dev
  - `npm run migrate:deploy` - Deploy migrations in prod
  - `npm run migrate:reset` - Reset database
  - `npm run prisma:generate` - Generate client
  - `npm run prisma:studio` - Open database GUI

### 5. Documentation

- [x] **Database schema guide** (`DATABASE_SCHEMA_GUIDE.md`)
  - Complete model documentation
  - API endpoint specifications
  - Setup instructions
  - Data flow diagrams
  - Troubleshooting guide

- [x] **Verification checklist** (`VERIFICATION_CHECKLIST.md`)
  - Pre-deployment steps
  - Testing procedures
  - Production deployment guide

## Testing Checklist

### Database Connection

- [ ] **Environment variables configured**

  ```bash
  # Check .env file contains:
  DATABASE_URL="postgresql://user:password@host:5432/database"
  ```

- [ ] **Database accessible**

  ```bash
  # Test connection
  psql $DATABASE_URL -c "SELECT 1"
  ```

- [ ] **Prisma can connect**
  ```bash
  npx prisma db pull
  ```

### Schema Validation

- [ ] **Run migrations successfully**

  ```bash
  npm run migrate
  # Should complete without errors
  ```

- [ ] **Verify tables created**

  ```sql
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('users', 'appointments', 'video_consultations');
  ```

- [ ] **Verify indexes created**

  ```sql
  SELECT indexname FROM pg_indexes
  WHERE tablename IN ('appointments', 'video_consultations');
  ```

- [ ] **Verify foreign keys**
  ```sql
  SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY';
  ```

### API Endpoint Testing

#### Appointments API

- [ ] **Create appointment (valid data)**

  ```bash
  curl -X POST http://localhost:3000/api/appointments \
    -H "Content-Type: application/json" \
    -d '{
      "patientId": "valid-patient-id",
      "doctorId": "valid-doctor-id",
      "scheduledTime": "2025-10-27T14:00:00Z",
      "type": "video",
      "reason": "Test consultation"
    }'
  # Expected: 201 Created with appointment object
  ```

- [ ] **Create appointment (missing fields)**

  ```bash
  curl -X POST http://localhost:3000/api/appointments \
    -H "Content-Type: application/json" \
    -d '{"patientId": "test"}'
  # Expected: 400 Bad Request
  ```

- [ ] **Get appointment by ID**

  ```bash
  curl http://localhost:3000/api/appointments/{appointment-id}
  # Expected: 200 OK with appointment details
  ```

- [ ] **List appointments**

  ```bash
  curl "http://localhost:3000/api/appointments?limit=10&offset=0"
  # Expected: 200 OK with appointments array
  ```

- [ ] **Update appointment**

  ```bash
  curl -X PATCH http://localhost:3000/api/appointments/{appointment-id} \
    -H "Content-Type: application/json" \
    -d '{"status": "confirmed"}'
  # Expected: 200 OK with updated appointment
  ```

- [ ] **Delete appointment**
  ```bash
  curl -X DELETE http://localhost:3000/api/appointments/{appointment-id}
  # Expected: 200 OK with success message
  ```

#### Consultations API

- [ ] **Create HCW session (valid appointment)**

  ```bash
  curl -X POST http://localhost:3000/api/consultations/{appointment-id}/hcw-session
  # Expected: 200 OK with consultation URLs
  ```

- [ ] **Create HCW session (existing consultation)**

  ```bash
  # Call same endpoint again
  curl -X POST http://localhost:3000/api/consultations/{appointment-id}/hcw-session
  # Expected: 200 OK with existing consultation (idempotent)
  ```

- [ ] **Get consultation status**

  ```bash
  curl http://localhost:3000/api/consultations/{appointment-id}/status
  # Expected: 200 OK with status details
  ```

- [ ] **End consultation**
  ```bash
  curl -X POST http://localhost:3000/api/consultations/{appointment-id}/end \
    -H "Content-Type: application/json" \
    -d '{"consultationId": "consultation-id"}'
  # Expected: 200 OK with duration
  ```

### Data Integrity Testing

- [ ] **Foreign key constraints work**

  ```sql
  -- Try to delete a user with appointments (should fail or cascade)
  DELETE FROM users WHERE id = 'user-with-appointments';
  ```

- [ ] **Unique constraints enforced**

  ```sql
  -- Try to create duplicate hcwConsultationId (should fail)
  INSERT INTO appointments (id, patient_id, doctor_id, scheduled_time, hcw_consultation_id)
  VALUES ('test-id', 'patient-id', 'doctor-id', NOW(), 'existing-hcw-id');
  ```

- [ ] **Enum values validated**

  ```sql
  -- Try to insert invalid status (should fail)
  INSERT INTO appointments (id, patient_id, doctor_id, scheduled_time, status)
  VALUES ('test-id', 'patient-id', 'doctor-id', NOW(), 'invalid_status');
  ```

- [ ] **Timestamps auto-generated**
  ```sql
  -- Verify createdAt and updatedAt are set
  SELECT id, created_at, updated_at FROM appointments ORDER BY created_at DESC LIMIT 1;
  ```

### Performance Testing

- [ ] **Index usage verified**

  ```sql
  EXPLAIN ANALYZE SELECT * FROM appointments WHERE patient_id = 'test-id';
  -- Should use index on patient_id
  ```

- [ ] **Query performance acceptable**

  ```sql
  -- Test common queries
  EXPLAIN ANALYZE
  SELECT a.*, u1.first_name as patient_name, u2.first_name as doctor_name
  FROM appointments a
  JOIN users u1 ON a.patient_id = u1.id
  JOIN users u2 ON a.doctor_id = u2.id
  WHERE a.scheduled_time >= NOW()
  ORDER BY a.scheduled_time
  LIMIT 50;
  ```

- [ ] **Connection pooling works**
  ```bash
  # Run 100 concurrent requests
  ab -n 100 -c 10 http://localhost:3000/api/appointments
  # Should not exceed connection limits
  ```

### Integration Testing

- [ ] **Full appointment flow**
  1. Create patient user
  2. Create doctor user
  3. Create appointment
  4. Create HCW session
  5. Start appointment
  6. End consultation
  7. Verify all status updates

- [ ] **Error handling**
  - Invalid appointment ID
  - Missing HCW configuration
  - Database connection failure
  - HCW API failure

- [ ] **Concurrent operations**
  - Multiple users creating appointments
  - Multiple consultations ending simultaneously
  - Read/write contention

## Production Deployment Checklist

### Pre-Deployment

- [ ] **Backup existing database**

  ```bash
  pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql
  ```

- [ ] **Review migration SQL**

  ```bash
  cat prisma/migrations/20251026000000_add_appointments_and_video_consultations/migration.sql
  # Verify SQL is correct
  ```

- [ ] **Test migration on staging**
  ```bash
  DATABASE_URL=$STAGING_DATABASE_URL npm run migrate:deploy
  ```

### Deployment Steps

1. [ ] **Set production environment variables**

   ```bash
   export DATABASE_URL="postgresql://..."
   export NODE_ENV="production"
   ```

2. [ ] **Deploy migrations**

   ```bash
   npm run migrate:deploy
   ```

3. [ ] **Generate Prisma Client**

   ```bash
   npm run prisma:generate
   ```

4. [ ] **Build application**

   ```bash
   npm run build:prod
   ```

5. [ ] **Start application**

   ```bash
   npm run start:prod
   ```

6. [ ] **Verify health check**
   ```bash
   curl http://localhost:3000/health
   # Should show database: healthy
   ```

### Post-Deployment

- [ ] **Monitor error logs**

  ```bash
  tail -f logs/error.log
  # Watch for database errors
  ```

- [ ] **Test critical endpoints**
  - Create appointment
  - Create HCW session
  - End consultation

- [ ] **Verify database performance**

  ```sql
  SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
  ```

- [ ] **Check connection pool**
  ```sql
  SELECT count(*) as connections FROM pg_stat_activity;
  ```

### Rollback Plan

If deployment fails:

1. [ ] **Stop application**

   ```bash
   pkill -f "node.*telecheck"
   ```

2. [ ] **Restore database backup**

   ```bash
   psql $DATABASE_URL < backup.sql
   ```

3. [ ] **Revert code changes**

   ```bash
   git revert HEAD
   ```

4. [ ] **Restart previous version**
   ```bash
   npm run start:prod
   ```

## Monitoring and Maintenance

### Daily Checks

- [ ] Database connection pool utilization
- [ ] Slow query logs
- [ ] Error rate for appointment/consultation APIs
- [ ] Disk space usage

### Weekly Maintenance

- [ ] Review and optimize slow queries
- [ ] Analyze table statistics
- [ ] Check for orphaned records
- [ ] Review audit logs

### Monthly Tasks

- [ ] Database backup verification
- [ ] Index maintenance (REINDEX if needed)
- [ ] Performance trending analysis
- [ ] Schema optimization review

## Security Verification

- [ ] **SQL injection prevention**
  - All queries use Prisma (parameterized)
  - No raw SQL with user input

- [ ] **Authentication required**
  - All endpoints check user authentication
  - Authorization checks for patient/doctor access

- [ ] **Data encryption**
  - SSL/TLS enabled for database connection
  - Sensitive data encrypted at rest

- [ ] **HIPAA compliance**
  - Audit logging enabled
  - PHI access restricted
  - Data retention policies implemented

## Sign-Off

### Development Team

- [ ] Database schema reviewed
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Documentation complete

**Signed:** **\*\*\*\***\_**\*\*\*\*** **Date:** **\_\_\_**

### QA Team

- [ ] Functional tests passing
- [ ] Integration tests passing
- [ ] Performance tests passing
- [ ] Security scan complete

**Signed:** **\*\*\*\***\_**\*\*\*\*** **Date:** **\_\_\_**

### Operations Team

- [ ] Infrastructure ready
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Rollback plan tested

**Signed:** **\*\*\*\***\_**\*\*\*\*** **Date:** **\_\_\_**

### Product Owner

- [ ] Requirements met
- [ ] Acceptance criteria satisfied
- [ ] Documentation reviewed
- [ ] Ready for production

**Signed:** **\*\*\*\***\_**\*\*\*\*** **Date:** **\_\_\_**

## Notes

Add any additional notes, issues, or observations:

```
[Space for notes]
```

## Completion Status

**Overall Status:** [ ] READY FOR PRODUCTION / [ ] NEEDS WORK

**Deployment Date:** **\*\***\_\_**\*\***

**Deployed By:** **\*\***\_\_**\*\***
