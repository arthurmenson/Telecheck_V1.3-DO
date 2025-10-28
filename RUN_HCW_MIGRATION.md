# HCW@Home Database Migration Instructions

## ✅ What's Already Done:

- Frontend UI deployed and live ✅
- Backend API deployed with HCW routes ✅
- Migration SQL file created ✅

## 🔧 What You Need to Do:

### Option 1: Run via Digital Ocean Console (Easiest)

1. **Go to Digital Ocean Databases**:
   - Visit: https://cloud.digitalocean.com/databases
   - Click on `telecheck-postgres-cluster`

2. **Open Connection Details**:
   - Click "Connection Details" tab
   - Copy the connection string

3. **Run the Migration**:
   - Click on "Console" or use the connection string with psql
   - Copy the contents of `hcw_migration_manual.sql`
   - Paste and execute in the console

### Option 2: Run via psql Command Line

```bash
# Get your database password from Digital Ocean console
# Then run:

psql "postgresql://doadmin:YOUR_PASSWORD@telecheck-postgres-cluster-do-user-24735686-0.d.db.ondigitalocean.com:25060/telecheck?sslmode=require" -f hcw_migration_manual.sql
```

### Option 3: Run via Digital Ocean CLI (doctl)

```bash
# The migration file is in your repo
./doctl.exe databases connection 007511f2-f6f8-4174-8163-f2d4a8cfd49c

# Then use the connection info to run:
psql "connection_string_here" -f hcw_migration_manual.sql
```

## ✅ Verify Migration Worked:

After running the migration, test that it worked:

```bash
# Check if tables were created
psql "your_connection_string" -c "\dt hcw_*"

# You should see:
# - hcw_caregivers
# - hcw_assignments
# - hcw_visits
# - hcw_messages
# - hcw_care_plans
# - hcw_care_plan_tasks
# - hcw_task_comments
# - hcw_data_sharing_preferences
# - hcw_documents
```

## 🎉 Then Test the UI:

1. Go to: https://whale-app-bs3xa.ondigitalocean.app/dashboard
2. Log in as a patient
3. You should see new navigation items:
   - **My Care Team**
   - **Messages**
   - **My Visits**
4. Click each one to test (they'll show empty states since no data yet)

## 📝 Need Help?

If you get any errors, copy the error message and I can help troubleshoot.

The migration is idempotent (safe to run multiple times) due to the `IF NOT EXISTS` clauses.
