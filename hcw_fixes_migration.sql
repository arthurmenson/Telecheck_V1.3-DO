-- HCW Database Fix Migration
-- This migration fixes critical issues in the HCW schema
-- Run this AFTER the main hcw_migration.sql has been applied

-- =========================================
-- 1. Fix HCWMessage to Allow Patient-Caregiver Messaging
-- =========================================

BEGIN;

-- Drop existing foreign key constraints (if they exist)
ALTER TABLE hcw_messages DROP CONSTRAINT IF EXISTS hcw_messages_sender_id_fkey;
ALTER TABLE hcw_messages DROP CONSTRAINT IF EXISTS hcw_messages_recipient_id_fkey;

-- Add sender_type column to track who sent the message
ALTER TABLE hcw_messages ADD COLUMN IF NOT EXISTS sender_type VARCHAR(20) DEFAULT 'patient';

-- Add new foreign keys pointing to users table instead of hcw_caregivers
ALTER TABLE hcw_messages
  ADD CONSTRAINT hcw_messages_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE hcw_messages
  ADD CONSTRAINT hcw_messages_recipient_id_fkey
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add check constraint for sender_type
ALTER TABLE hcw_messages
  ADD CONSTRAINT check_sender_type
  CHECK (sender_type IN ('patient', 'caregiver', 'system'));

-- Update User model to support message relations (handled in Prisma schema)

COMMIT;

-- =========================================
-- 2. Add Composite Indexes for Performance
-- =========================================

-- Index for fetching active patient assignments with caregiver details
CREATE INDEX IF NOT EXISTS idx_assignments_patient_status_caregiver
  ON hcw_assignments(patient_id, status, caregiver_id)
  WHERE status = 'active';

-- Index for message threads (common query pattern)
CREATE INDEX IF NOT EXISTS idx_messages_thread_created
  ON hcw_messages(thread_id, created_at DESC);

-- Index for sender/recipient message queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient
  ON hcw_messages(sender_id, recipient_id, created_at DESC);

-- Index for upcoming visits query
CREATE INDEX IF NOT EXISTS idx_visits_patient_scheduled_status
  ON hcw_visits(patient_id, scheduled_time, status)
  WHERE status IN ('scheduled', 'in_progress');

-- Index for caregiver availability queries
CREATE INDEX IF NOT EXISTS idx_visits_caregiver_scheduled_status
  ON hcw_visits(caregiver_id, scheduled_time, status)
  WHERE status IN ('scheduled', 'in_progress');

-- Index for active care plans
CREATE INDEX IF NOT EXISTS idx_care_plans_patient_status
  ON hcw_care_plans(patient_id, status)
  WHERE status = 'active';

-- Index for care plan tasks by due date
CREATE INDEX IF NOT EXISTS idx_tasks_careplan_status_due
  ON hcw_care_plan_tasks(care_plan_id, status, due_date)
  WHERE status != 'completed';

-- Index for unread messages count
CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread
  ON hcw_messages(recipient_id, is_read)
  WHERE is_read = false;

-- =========================================
-- 3. Add Data Validation Check Constraints
-- =========================================

-- Visit rating must be 1-5 stars
ALTER TABLE hcw_visits
  ADD CONSTRAINT IF NOT EXISTS check_visit_rating
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

-- Visit end time must be after start time
ALTER TABLE hcw_visits
  ADD CONSTRAINT IF NOT EXISTS check_visit_times
  CHECK (actual_end IS NULL OR actual_end > actual_start);

-- Scheduled time should be in the future (for new visits)
-- Note: This is better enforced at application level, not database level

-- Document file size validation (positive and less than 100MB)
ALTER TABLE hcw_documents
  ADD CONSTRAINT IF NOT EXISTS check_file_size
  CHECK (file_size > 0 AND file_size < 104857600);

-- Care plan end date must be after start date
ALTER TABLE hcw_care_plans
  ADD CONSTRAINT IF NOT EXISTS check_plan_dates
  CHECK (end_date IS NULL OR end_date > start_date);

-- Task due date should be after creation (if specified)
-- Note: Better to enforce at application level

-- Priority validation for tasks
ALTER TABLE hcw_care_plan_tasks
  ADD CONSTRAINT IF NOT EXISTS check_task_priority
  CHECK (priority IN ('low', 'medium', 'high', 'critical'));

-- Status validation for visits
ALTER TABLE hcw_visits
  ADD CONSTRAINT IF NOT EXISTS check_visit_status
  CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'));

-- Status validation for assignments
ALTER TABLE hcw_assignments
  ADD CONSTRAINT IF NOT EXISTS check_assignment_status
  CHECK (status IN ('active', 'inactive', 'transferred'));

-- Status validation for care plans
ALTER TABLE hcw_care_plans
  ADD CONSTRAINT IF NOT EXISTS check_careplan_status
  CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold'));

-- Status validation for care plan tasks
ALTER TABLE hcw_care_plan_tasks
  ADD CONSTRAINT IF NOT EXISTS check_task_status
  CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'overdue'));

-- =========================================
-- 4. Add Soft Delete Support (Optional)
-- =========================================

-- Add deletedAt column to caregivers for soft deletes
ALTER TABLE hcw_caregivers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ(6);

-- Create index on deletedAt for filtering
CREATE INDEX IF NOT EXISTS idx_caregivers_deleted
  ON hcw_caregivers(deleted_at)
  WHERE deleted_at IS NOT NULL;

-- Add deletedAt to assignments
ALTER TABLE hcw_assignments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ(6);

-- Add deletedAt to care plans
ALTER TABLE hcw_care_plans ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ(6);

-- =========================================
-- 5. Add Helper Functions (Optional but Useful)
-- =========================================

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id_param TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM hcw_messages
    WHERE recipient_id = user_id_param
      AND is_read = false
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if a caregiver is available at a given time
CREATE OR REPLACE FUNCTION is_caregiver_available(
  caregiver_id_param TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM hcw_visits
    WHERE caregiver_id = caregiver_id_param
      AND status IN ('scheduled', 'in_progress')
      AND (
        (scheduled_time >= start_time AND scheduled_time < end_time)
        OR (actual_end IS NULL AND scheduled_time < end_time)
      )
  );
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- 6. Create Views for Common Queries (Optional)
-- =========================================

-- View for active patient-caregiver relationships
CREATE OR REPLACE VIEW v_active_care_relationships AS
SELECT
  a.id as assignment_id,
  a.patient_id,
  p.first_name as patient_first_name,
  p.last_name as patient_last_name,
  p.email as patient_email,
  a.caregiver_id,
  c.specialty as caregiver_specialty,
  c.credentials as caregiver_credentials,
  u.first_name as caregiver_first_name,
  u.last_name as caregiver_last_name,
  u.email as caregiver_email,
  a.is_primary,
  a.assignment_type,
  a.assigned_at,
  a.status
FROM hcw_assignments a
JOIN users p ON a.patient_id = p.id
JOIN hcw_caregivers c ON a.caregiver_id = c.id
JOIN users u ON c.user_id = u.id
WHERE a.status = 'active'
  AND c.is_active = true;

-- View for upcoming visits with caregiver details
CREATE OR REPLACE VIEW v_upcoming_visits AS
SELECT
  v.id as visit_id,
  v.patient_id,
  v.caregiver_id,
  v.scheduled_time,
  v.visit_type,
  v.purpose,
  v.location,
  v.status,
  p.first_name as patient_first_name,
  p.last_name as patient_last_name,
  c.specialty as caregiver_specialty,
  u.first_name as caregiver_first_name,
  u.last_name as caregiver_last_name,
  u.phone as caregiver_phone
FROM hcw_visits v
JOIN users p ON v.patient_id = p.id
JOIN hcw_caregivers c ON v.caregiver_id = c.id
JOIN users u ON c.user_id = u.id
WHERE v.scheduled_time >= NOW()
  AND v.status IN ('scheduled', 'in_progress')
ORDER BY v.scheduled_time ASC;

-- =========================================
-- 7. Add Audit Logging (HIPAA Compliance)
-- =========================================

-- Create audit log table for tracking data access
CREATE TABLE IF NOT EXISTS hcw_audit_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'view', 'create', 'update', 'delete'
  resource_type TEXT NOT NULL, -- 'caregiver', 'visit', 'message', etc.
  resource_id TEXT,
  patient_id TEXT, -- For tracking which patient's data was accessed
  ip_address TEXT,
  user_agent TEXT,
  request_path TEXT,
  timestamp TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_user_timestamp ON hcw_audit_log(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_patient_timestamp ON hcw_audit_log(patient_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON hcw_audit_log(resource_type, resource_id);

-- Function to log data access (call from application)
CREATE OR REPLACE FUNCTION log_data_access(
  user_id_param TEXT,
  action_param TEXT,
  resource_type_param TEXT,
  resource_id_param TEXT,
  patient_id_param TEXT,
  ip_address_param TEXT,
  user_agent_param TEXT,
  request_path_param TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO hcw_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    patient_id,
    ip_address,
    user_agent,
    request_path
  ) VALUES (
    user_id_param,
    action_param,
    resource_type_param,
    resource_id_param,
    patient_id_param,
    ip_address_param,
    user_agent_param,
    request_path_param
  );
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- 8. Verification Queries
-- =========================================

-- Run these queries to verify the migration worked:

-- Check all HCW tables exist
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name LIKE 'hcw_%'
-- ORDER BY table_name;

-- Check message constraints
-- SELECT conname, contype
-- FROM pg_constraint
-- WHERE conrelid = 'hcw_messages'::regclass;

-- Check indexes on hcw_messages
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'hcw_messages';

-- Check if sender_type column exists
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'hcw_messages'
--   AND column_name = 'sender_type';

-- Verify views were created
-- SELECT viewname
-- FROM pg_views
-- WHERE schemaname = 'public'
--   AND viewname LIKE 'v_%';

-- =========================================
-- Migration Complete
-- =========================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'HCW Fixes Migration completed successfully at %', NOW();
END $$;
