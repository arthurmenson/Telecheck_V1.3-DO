# Database Migration Guide - Telecheck V2.0

**Purpose**: Set up the production database schema for Telecheck V2.0 on DigitalOcean

**Status**: ✅ Ready to execute

---

## Overview

Your production database exists but is empty. We need to run migrations to:

1. Create all database tables (users, patients, appointments, etc.)
2. Set up indexes for performance
3. Create default admin user
4. Set up messaging and scheduling tables

---

## Migration Files

### 1. Core Schema ([server/config/init.sql](server/config/init.sql))

Creates the following tables:

- **users** - User authentication and profiles
- **patients** - Patient medical information
- **lab_reports** - Lab result documents
- **lab_results** - Individual lab test results
- **medications** - Medication tracking
- **appointments** - Appointment scheduling
- **vital_signs** - Patient vital signs history
- **notifications** - User notifications
- **health_insights** - AI-generated health insights

Also includes:

- Default admin user: `admin@telecheck.com` / `admin123`
- Performance indexes on all tables
- Automatic `updated_at` triggers

### 2. Messaging Schema ([server/config/messaging-tables.sql](server/config/messaging-tables.sql))

Creates the following tables:

- **patient_schedules** - Automated messaging schedules
- **communication_logs** - SMS/email communication history
- **message_templates** - Customizable message templates
- **messaging_config** - System configuration
- **care_team_members** - Care team directory
- **escalation_rules** - Alert escalation logic
- **audit_logs** - Security audit trail
- **chat_messages** - In-app chat history

Also includes:

- Default message templates (appointment reminders, medication reminders)
- Default care team members
- Default escalation rules

---

## Option 1: Run via DigitalOcean App Console (Recommended)

### Step 1: Access the App Console

```bash
# Get the app console URL
./doctl.exe apps get 3e163757-94ee-4483-a241-8b59cd451f32 --format ID,Spec.Name,ActiveDeployment.ID

# Then visit:
# https://cloud.digitalocean.com/apps/3e163757-94ee-4483-a241-8b59cd451f32/console
```

### Step 2: Select the API Service

1. Open DigitalOcean Console
2. Navigate to Apps → whale-app
3. Click on "telecheck-api" service
4. Click "Console" tab

### Step 3: Run the Migration

In the console terminal, execute:

```bash
npm run migrate:prod
```

**Expected Output:**

```
======================================================================
  Telecheck V2.0 - Production Database Migration
======================================================================

[INFO] 2025-10-25T... - Database URL found (connection string redacted)
[INFO] 2025-10-25T... - Testing database connection...
[SUCCESS] 2025-10-25T... - Database connection successful

======================================================================
  Running Database Migrations
======================================================================

[INFO] 2025-10-25T... - Running migration: Core schema (users, patients, appointments)
[SUCCESS] 2025-10-25T... - Core schema migration completed

[INFO] 2025-10-25T... - Running migration: Messaging schema (schedules, communications)
[SUCCESS] 2025-10-25T... - Messaging schema migration completed

======================================================================
  Verifying Database Schema
======================================================================

[INFO] 2025-10-25T... - Checking created tables...
[SUCCESS] 2025-10-25T... - Found 17 tables in database

[INFO] 2025-10-25T... - Tables created:
  - appointments
  - audit_logs
  - care_team_members
  - chat_messages
  - communication_logs
  - escalation_rules
  - health_insights
  - lab_reports
  - lab_results
  - medications
  - message_templates
  - messaging_config
  - notifications
  - patient_schedules
  - patients
  - users
  - vital_signs

[SUCCESS] 2025-10-25T... - Default admin user created
  Email: admin@telecheck.com
  Password: admin123
  ⚠️  Please change this password after first login!

======================================================================
  Migration Summary
======================================================================
  Migrations Run: 2
  Migrations Failed: 0
  Total Tables: 17
======================================================================

[SUCCESS] 2025-10-25T... - All migrations completed successfully!
```

---

## Option 2: Run via doctl CLI

If you have `doctl` configured, you can run a one-liner:

```bash
./doctl.exe apps create-deployment 3e163757-94ee-4483-a241-8b59cd451f32
```

Then access the console and run `npm run migrate:prod`

---

## Option 3: Manual Database Connection

If you want to run migrations manually using psql:

### Step 1: Get Database Credentials

From [.env.whale-app-dev](.env.whale-app-dev):

```
DATABASE_URL=postgresql://doadmin:YOUR_PASSWORD_HERE@telecheck-postgres-cluster-do-user-24735686-0.d.db.ondigitalocean.com:25060/telecheck?sslmode=require
```

### Step 2: Install PostgreSQL Client

```bash
# Windows (via Scoop)
scoop install postgresql

# Mac (via Homebrew)
brew install postgresql

# Linux
sudo apt-get install postgresql-client
```

### Step 3: Connect to Database

```bash
psql "postgresql://doadmin:YOUR_PASSWORD_HERE@telecheck-postgres-cluster-do-user-24735686-0.d.db.ondigitalocean.com:25060/telecheck?sslmode=require"
```

### Step 4: Run SQL Files

```sql
-- Run core schema
\i server/config/init.sql

-- Run messaging schema
\i server/config/messaging-tables.sql

-- Verify tables
\dt

-- Check admin user
SELECT email, role FROM users WHERE email = 'admin@telecheck.com';
```

---

## Verification After Migration

### 1. Check Tables Created

```bash
# Via app console
npm run migrate:prod

# Via psql
psql $DATABASE_URL -c "\dt"
```

**Expected**: 17 tables

### 2. Verify Admin User

```bash
# Via psql
psql $DATABASE_URL -c "SELECT email, role FROM users WHERE email = 'admin@telecheck.com'"
```

**Expected**:

```
         email          |  role
------------------------+-------
 admin@telecheck.com    | admin
```

### 3. Test Application

```bash
# Test health endpoint
curl https://whale-app-bs3xa.ondigitalocean.app/api/health

# Try logging in
curl -X POST https://whale-app-bs3xa.ondigitalocean.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@telecheck.com","password":"admin123"}'
```

**Expected**: Returns JWT token

---

## Default Credentials

After migration, you'll have these default accounts:

### Admin Account

- **Email**: admin@telecheck.com
- **Password**: admin123
- **Role**: admin
- ⚠️ **IMPORTANT**: Change this password immediately after first login

### Care Team Members

Default care team members are created for testing:

- **On-Call Nurse** - nurse@telecheck.com
- **Primary Doctor** - doctor@telecheck.com
- **Care Coordinator** - coordinator@telecheck.com

---

## Troubleshooting

### Error: "DATABASE_URL environment variable not set"

**Solution**: Make sure you're running from the DigitalOcean App console where DATABASE_URL is automatically available.

### Error: "Cannot connect to database"

**Solution**: Check that:

1. Database cluster is online
2. Firewall allows connections from the app
3. DATABASE_URL is correct

Verify database status:

```bash
./doctl.exe databases list --format ID,Name,Status
```

### Error: "Table already exists"

**Solution**: This is normal if you run migrations twice. The migrations use `CREATE TABLE IF NOT EXISTS` so they're safe to re-run.

### Migration Fails Halfway

**Solution**: The script will show which migration failed. You can:

1. Check the error message
2. Fix the SQL file if needed
3. Re-run the migration (it will skip already-created tables)

---

## Next Steps After Migration

1. **✅ Change Admin Password**
   - Log in as admin@telecheck.com
   - Navigate to Settings → Change Password

2. **✅ Create Real Users**
   - Create actual doctor/patient accounts
   - Remove or disable test accounts

3. **✅ Configure Care Team**
   - Update care team members with real contact info
   - Set up on-call schedules

4. **✅ Customize Message Templates**
   - Review default templates
   - Customize for your organization

5. **✅ Test Core Flows**
   - Patient registration
   - Appointment booking
   - Medication tracking

6. **✅ Run Security Validation** (Week 10 Day 3)
   - OWASP security scan
   - SSL/TLS testing
   - Authentication testing

---

## Migration Script Details

### Bash Script: [scripts/migrate-production.sh](scripts/migrate-production.sh)

- Uses `psql` to run SQL files
- Requires PostgreSQL client installed
- Best for manual execution

### TypeScript Script: [scripts/migrate-db.ts](scripts/migrate-db.ts)

- Uses Node.js `pg` library
- No external dependencies needed
- Best for automated deployment
- Available via `npm run migrate:prod`

---

## Database Schema Diagram

```
users (authentication & profiles)
  ├── patients (medical info)
  │   ├── lab_reports
  │   │   └── lab_results
  │   ├── medications
  │   ├── vital_signs
  │   ├── notifications
  │   └── health_insights
  └── appointments
      └── patient_id → users
      └── provider_id → users

patient_schedules (messaging automation)
communication_logs (SMS/email tracking)
message_templates (customizable messages)
care_team_members (care team directory)
escalation_rules (alert rules)
audit_logs (security audit)
chat_messages (in-app chat)
```

---

## Security Notes

1. **Passwords**: All passwords are hashed with bcrypt (12 rounds)
2. **SSL**: Database connections use SSL/TLS (sslmode=require)
3. **Audit**: All user actions are logged to `audit_logs`
4. **PHI**: Sensitive data uses encryption at rest (via environment keys)

---

**Ready to proceed?**

Run the migration using **Option 1** (DigitalOcean App Console) for the easiest experience.

---

_Last Updated: 2025-10-25_
_Database: telecheck-postgres-cluster (007511f2-f6f8-4174-8163-f2d4a8cfd49c)_
_App: whale-app (3e163757-94ee-4483-a241-8b59cd451f32)_
