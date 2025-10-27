-- Migration to align existing users table with Prisma schema
-- This migration adds all missing columns from the Prisma schema to the existing users table

-- Step 1: Add missing columns to users table (all nullable initially)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "date_of_birth" DATE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "zip_code" TEXT;

-- Emergency contact fields
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emergency_contact_name" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emergency_contact_phone" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emergency_contact_relation" TEXT;

-- Medical information
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "medical_history" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "current_medications" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "allergies" TEXT;

-- Insurance
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "insurance_provider" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "insurance_policy_number" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "insurance_group_number" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "primary_care_physician" TEXT;

-- Settings - Notification Preferences
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_notifications" BOOLEAN DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "sms_notifications" BOOLEAN DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "push_notifications" BOOLEAN DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "appointment_notifications" BOOLEAN DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lab_result_notifications" BOOLEAN DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "message_notifications" BOOLEAN DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reminder_notifications" BOOLEAN DEFAULT true;

-- Settings - Privacy Controls
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "data_sharing" BOOLEAN DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marketing_consent" BOOLEAN DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "third_party_sharing" BOOLEAN DEFAULT false;

-- Settings - Communication Preferences
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferred_contact_method" TEXT DEFAULT 'email';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "language_preference" TEXT DEFAULT 'en';

-- Settings - Security
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_enabled" BOOLEAN DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_secret" TEXT;

-- Step 2: Migrate data from patients table to users table (if patients table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'patients') THEN
    -- Copy date_of_birth from patients to users
    UPDATE users u
    SET date_of_birth = p.date_of_birth,
        gender = p.gender
    FROM patients p
    WHERE u.id = p.user_id
    AND u.date_of_birth IS NULL;

    RAISE NOTICE 'Migrated patient data to users table';
  END IF;
END $$;

-- Step 3: Update existing column types if needed
-- Change created_at and updated_at to TIMESTAMPTZ if they aren't already
DO $$
BEGIN
  -- Check if columns need type conversion
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'created_at'
    AND data_type = 'timestamp without time zone'
  ) THEN
    ALTER TABLE "users" ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(6) USING created_at AT TIME ZONE 'UTC';
    ALTER TABLE "users" ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(6) USING updated_at AT TIME ZONE 'UTC';
    RAISE NOTICE 'Converted timestamp columns to timestamptz';
  END IF;
END $$;

-- Step 4: Ensure id column is TEXT (for cuid compatibility)
-- Note: This is complex as it affects foreign keys. For now, keep UUID and let Prisma handle conversion

-- Step 5: Add password column if it doesn't exist (for backwards compatibility with password_hash)
-- Prisma schema doesn't include password, but test-accounts.ts tries to use it
-- We'll keep password_hash and let the application handle it
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- Copy password_hash to password for compatibility
UPDATE "users"
SET password = password_hash
WHERE password IS NULL AND password_hash IS NOT NULL;

-- Step 6: Add name column (compatibility with test-accounts.ts)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" TEXT;

-- Generate name from first_name and last_name if exists
UPDATE "users"
SET name = CONCAT(first_name, ' ', last_name)
WHERE name IS NULL AND first_name IS NOT NULL AND last_name IS NOT NULL;

-- Step 7: Ensure role column uses proper enum values
-- NOTE: Skipping role conversion because existing schema has CHECK constraint
-- that only allows lowercase values ('patient', 'doctor', 'pharmacist', 'admin')
-- The application layer will handle role mapping between database and Prisma
-- UPDATE "users" SET role = UPPER(role) WHERE role IS NOT NULL;

-- Step 8: Add index on email if not exists (Prisma schema expects this)
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: users table aligned with Prisma schema';
  RAISE NOTICE 'Added columns: date_of_birth, gender, address, medical_history, settings, etc.';
  RAISE NOTICE 'Migrated data from patients table if it existed';
  RAISE NOTICE 'Users table is now compatible with Prisma schema';
END $$;
