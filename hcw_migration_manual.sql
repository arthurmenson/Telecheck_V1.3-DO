-- HCW@Home Care Team Integration - Database Migration
-- Run this on your Digital Ocean PostgreSQL database

-- Add CAREGIVER role to UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CAREGIVER';

-- Create HCWCaregiver table
CREATE TABLE IF NOT EXISTS "hcw_caregivers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL UNIQUE,
    "hcw_user_id" TEXT UNIQUE,
    "specialty" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "bio" TEXT,
    "phone_number" TEXT,
    "email" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "hcw_caregivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "hcw_caregivers_user_id_idx" ON "hcw_caregivers"("user_id");
CREATE INDEX IF NOT EXISTS "hcw_caregivers_specialty_idx" ON "hcw_caregivers"("specialty");
CREATE INDEX IF NOT EXISTS "hcw_caregivers_is_active_idx" ON "hcw_caregivers"("is_active");

-- Create HCWAssignment table
CREATE TABLE IF NOT EXISTS "hcw_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_id" TEXT NOT NULL,
    "caregiver_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "end_date" TIMESTAMPTZ(6),
    "assignment_type" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "hcw_assignments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hcw_assignments_caregiver_id_fkey" FOREIGN KEY ("caregiver_id") REFERENCES "hcw_caregivers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "hcw_assignments_patient_id_idx" ON "hcw_assignments"("patient_id");
CREATE INDEX IF NOT EXISTS "hcw_assignments_caregiver_id_idx" ON "hcw_assignments"("caregiver_id");
CREATE INDEX IF NOT EXISTS "hcw_assignments_status_idx" ON "hcw_assignments"("status");
CREATE INDEX IF NOT EXISTS "hcw_assignments_is_primary_idx" ON "hcw_assignments"("is_primary");

-- Create HCWVisit table
CREATE TABLE IF NOT EXISTS "hcw_visits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_id" TEXT NOT NULL,
    "caregiver_id" TEXT NOT NULL,
    "scheduled_time" TIMESTAMPTZ(6) NOT NULL,
    "actual_start" TIMESTAMPTZ(6),
    "actual_end" TIMESTAMPTZ(6),
    "visit_type" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "rating" INTEGER,
    "feedback" TEXT,
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "hcw_visits_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hcw_visits_caregiver_id_fkey" FOREIGN KEY ("caregiver_id") REFERENCES "hcw_caregivers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "hcw_visits_patient_id_idx" ON "hcw_visits"("patient_id");
CREATE INDEX IF NOT EXISTS "hcw_visits_caregiver_id_idx" ON "hcw_visits"("caregiver_id");
CREATE INDEX IF NOT EXISTS "hcw_visits_scheduled_time_idx" ON "hcw_visits"("scheduled_time");
CREATE INDEX IF NOT EXISTS "hcw_visits_status_idx" ON "hcw_visits"("status");

-- Create HCWMessage table
CREATE TABLE IF NOT EXISTS "hcw_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sender_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ(6),
    "thread_id" TEXT,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "hcw_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "hcw_caregivers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hcw_messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "hcw_caregivers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "hcw_messages_sender_id_idx" ON "hcw_messages"("sender_id");
CREATE INDEX IF NOT EXISTS "hcw_messages_recipient_id_idx" ON "hcw_messages"("recipient_id");
CREATE INDEX IF NOT EXISTS "hcw_messages_thread_id_idx" ON "hcw_messages"("thread_id");
CREATE INDEX IF NOT EXISTS "hcw_messages_is_read_idx" ON "hcw_messages"("is_read");
CREATE INDEX IF NOT EXISTS "hcw_messages_created_at_idx" ON "hcw_messages"("created_at");

-- Create HCWCarePlan table
CREATE TABLE IF NOT EXISTS "hcw_care_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_id" TEXT NOT NULL,
    "caregiver_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6),
    "status" TEXT NOT NULL DEFAULT 'active',
    "goals" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "hcw_care_plans_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "hcw_care_plans_patient_id_idx" ON "hcw_care_plans"("patient_id");
CREATE INDEX IF NOT EXISTS "hcw_care_plans_caregiver_id_idx" ON "hcw_care_plans"("caregiver_id");
CREATE INDEX IF NOT EXISTS "hcw_care_plans_status_idx" ON "hcw_care_plans"("status");

-- Create HCWCarePlanTask table
CREATE TABLE IF NOT EXISTS "hcw_care_plan_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "care_plan_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMPTZ(6),
    "frequency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completed_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "hcw_care_plan_tasks_care_plan_id_fkey" FOREIGN KEY ("care_plan_id") REFERENCES "hcw_care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "hcw_care_plan_tasks_care_plan_id_idx" ON "hcw_care_plan_tasks"("care_plan_id");
CREATE INDEX IF NOT EXISTS "hcw_care_plan_tasks_status_idx" ON "hcw_care_plan_tasks"("status");
CREATE INDEX IF NOT EXISTS "hcw_care_plan_tasks_due_date_idx" ON "hcw_care_plan_tasks"("due_date");

-- Create HCWTaskComment table
CREATE TABLE IF NOT EXISTS "hcw_task_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "is_system_comment" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hcw_task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "hcw_care_plan_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hcw_task_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "hcw_task_comments_task_id_idx" ON "hcw_task_comments"("task_id");
CREATE INDEX IF NOT EXISTS "hcw_task_comments_user_id_idx" ON "hcw_task_comments"("user_id");

-- Create HCWDataSharingPreference table
CREATE TABLE IF NOT EXISTS "hcw_data_sharing_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_id" TEXT NOT NULL,
    "caregiver_id" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "can_view" BOOLEAN NOT NULL DEFAULT true,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMPTZ(6),
    "granted_by" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "hcw_data_sharing_preferences_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hcw_data_sharing_preferences_caregiver_id_fkey" FOREIGN KEY ("caregiver_id") REFERENCES "hcw_caregivers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("patient_id", "caregiver_id", "data_type")
);

CREATE INDEX IF NOT EXISTS "hcw_data_sharing_preferences_patient_id_idx" ON "hcw_data_sharing_preferences"("patient_id");
CREATE INDEX IF NOT EXISTS "hcw_data_sharing_preferences_caregiver_id_idx" ON "hcw_data_sharing_preferences"("caregiver_id");

-- Create HCWDocument table
CREATE TABLE IF NOT EXISTS "hcw_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_id" TEXT NOT NULL,
    "caregiver_id" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "shared_with" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "hcw_documents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "hcw_documents_patient_id_idx" ON "hcw_documents"("patient_id");
CREATE INDEX IF NOT EXISTS "hcw_documents_caregiver_id_idx" ON "hcw_documents"("caregiver_id");
CREATE INDEX IF NOT EXISTS "hcw_documents_category_idx" ON "hcw_documents"("category");
