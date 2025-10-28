-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'DOCTOR', 'ADMIN', 'NURSE', 'CAREGIVER');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('video', 'in_person');

-- CreateEnum
CREATE TYPE "VideoConsultationStatus" AS ENUM ('pending', 'active', 'completed', 'cancelled', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "keycloak_id" TEXT,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATE,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PATIENT',
    "gender" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "emergency_contact_relation" TEXT,
    "medical_history" TEXT,
    "current_medications" TEXT,
    "allergies" TEXT,
    "insurance_provider" TEXT,
    "insurance_policy_number" TEXT,
    "insurance_group_number" TEXT,
    "primary_care_physician" TEXT,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "sms_notifications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT false,
    "appointment_notifications" BOOLEAN NOT NULL DEFAULT true,
    "lab_result_notifications" BOOLEAN NOT NULL DEFAULT true,
    "message_notifications" BOOLEAN NOT NULL DEFAULT true,
    "reminder_notifications" BOOLEAN NOT NULL DEFAULT true,
    "data_sharing" BOOLEAN NOT NULL DEFAULT false,
    "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
    "third_party_sharing" BOOLEAN NOT NULL DEFAULT false,
    "preferred_contact_method" TEXT NOT NULL DEFAULT 'email',
    "language_preference" TEXT NOT NULL DEFAULT 'en',
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "bio" TEXT,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "languages" TEXT[] DEFAULT ARRAY['English']::TEXT[],
    "video_enabled" BOOLEAN NOT NULL DEFAULT true,
    "phone_enabled" BOOLEAN NOT NULL DEFAULT true,
    "in_person_enabled" BOOLEAN NOT NULL DEFAULT false,
    "license_number" TEXT,
    "license_state" TEXT,
    "location" TEXT,
    "education" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "doctor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "scheduled_time" TIMESTAMPTZ(6) NOT NULL,
    "type" "AppointmentType" NOT NULL DEFAULT 'video',
    "status" "AppointmentStatus" NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "notes" TEXT,
    "hcw_consultation_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_consultations" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "hcw_consultation_id" TEXT NOT NULL,
    "patient_url" TEXT NOT NULL,
    "doctor_url" TEXT,
    "status" "VideoConsultationStatus" NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMPTZ(6),
    "ended_at" TIMESTAMPTZ(6),
    "duration" INTEGER,
    "error_message" TEXT,
    "metadata" JSONB,
    "consultation_notes" TEXT,
    "diagnosis" TEXT,
    "treatment_plan" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "video_consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_notes" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "chief_complaint" TEXT,
    "history_of_present" TEXT,
    "assessment" TEXT,
    "clinical_notes" TEXT,
    "diagnosis_codes" JSONB,
    "treatment_plan" TEXT,
    "follow_up_instructions" TEXT,
    "prescription_ids" JSONB,
    "follow_up_date" TIMESTAMPTZ(6),
    "follow_up_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "signed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "consultation_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_note_audits" (
    "id" TEXT NOT NULL,
    "note_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field_changed" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultation_note_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_consultation_summaries" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "summary_html" TEXT NOT NULL,
    "summary_plain_text" TEXT NOT NULL,
    "email_sent" BOOLEAN NOT NULL DEFAULT false,
    "email_sent_at" TIMESTAMPTZ(6),
    "viewed_by_patient" BOOLEAN NOT NULL DEFAULT false,
    "viewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "patient_consultation_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "specialty" TEXT,
    "chief_complaint_template" TEXT,
    "history_template" TEXT,
    "assessment_template" TEXT,
    "treatment_plan_template" TEXT,
    "follow_up_template" TEXT,
    "common_diagnosis_codes" JSONB,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "medical_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hcw_caregivers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hcw_user_id" TEXT,
    "specialty" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "bio" TEXT,
    "phone_number" TEXT,
    "email" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "hcw_caregivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hcw_assignments" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "hcw_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hcw_visits" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "hcw_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hcw_messages" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "hcw_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hcw_care_plans" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "hcw_care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hcw_care_plan_tasks" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "hcw_care_plan_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hcw_task_comments" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "is_system_comment" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hcw_task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hcw_data_sharing_preferences" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "caregiver_id" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "can_view" BOOLEAN NOT NULL DEFAULT true,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMPTZ(6),
    "granted_by" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "hcw_data_sharing_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hcw_documents" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "hcw_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_keycloak_id_key" ON "users"("keycloak_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_user_id_key" ON "doctor_profiles"("user_id");

-- CreateIndex
CREATE INDEX "doctor_profiles_specialty_idx" ON "doctor_profiles"("specialty");

-- CreateIndex
CREATE INDEX "doctor_profiles_video_enabled_idx" ON "doctor_profiles"("video_enabled");

-- CreateIndex
CREATE INDEX "doctor_profiles_rating_idx" ON "doctor_profiles"("rating");

-- CreateIndex
CREATE INDEX "doctor_profiles_user_id_idx" ON "doctor_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_hcw_consultation_id_key" ON "appointments"("hcw_consultation_id");

-- CreateIndex
CREATE INDEX "appointments_patient_id_idx" ON "appointments"("patient_id");

-- CreateIndex
CREATE INDEX "appointments_doctor_id_idx" ON "appointments"("doctor_id");

-- CreateIndex
CREATE INDEX "appointments_scheduled_time_idx" ON "appointments"("scheduled_time");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE INDEX "appointments_patient_id_scheduled_time_idx" ON "appointments"("patient_id", "scheduled_time");

-- CreateIndex
CREATE INDEX "appointments_doctor_id_scheduled_time_idx" ON "appointments"("doctor_id", "scheduled_time");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_doctor_id_scheduled_time_key" ON "appointments"("doctor_id", "scheduled_time");

-- CreateIndex
CREATE UNIQUE INDEX "video_consultations_appointment_id_key" ON "video_consultations"("appointment_id");

-- CreateIndex
CREATE INDEX "video_consultations_appointment_id_idx" ON "video_consultations"("appointment_id");

-- CreateIndex
CREATE INDEX "video_consultations_hcw_consultation_id_idx" ON "video_consultations"("hcw_consultation_id");

-- CreateIndex
CREATE INDEX "video_consultations_status_idx" ON "video_consultations"("status");

-- CreateIndex
CREATE INDEX "video_consultations_started_at_idx" ON "video_consultations"("started_at");

-- CreateIndex
CREATE INDEX "consultation_notes_appointment_id_idx" ON "consultation_notes"("appointment_id");

-- CreateIndex
CREATE INDEX "consultation_notes_doctor_id_idx" ON "consultation_notes"("doctor_id");

-- CreateIndex
CREATE INDEX "consultation_notes_patient_id_idx" ON "consultation_notes"("patient_id");

-- CreateIndex
CREATE INDEX "consultation_notes_status_idx" ON "consultation_notes"("status");

-- CreateIndex
CREATE INDEX "consultation_notes_created_at_idx" ON "consultation_notes"("created_at");

-- CreateIndex
CREATE INDEX "consultation_note_audits_note_id_idx" ON "consultation_note_audits"("note_id");

-- CreateIndex
CREATE INDEX "consultation_note_audits_user_id_idx" ON "consultation_note_audits"("user_id");

-- CreateIndex
CREATE INDEX "consultation_note_audits_timestamp_idx" ON "consultation_note_audits"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "patient_consultation_summaries_appointment_id_key" ON "patient_consultation_summaries"("appointment_id");

-- CreateIndex
CREATE INDEX "patient_consultation_summaries_appointment_id_idx" ON "patient_consultation_summaries"("appointment_id");

-- CreateIndex
CREATE INDEX "patient_consultation_summaries_patient_id_idx" ON "patient_consultation_summaries"("patient_id");

-- CreateIndex
CREATE INDEX "patient_consultation_summaries_doctor_id_idx" ON "patient_consultation_summaries"("doctor_id");

-- CreateIndex
CREATE INDEX "patient_consultation_summaries_email_sent_idx" ON "patient_consultation_summaries"("email_sent");

-- CreateIndex
CREATE INDEX "medical_templates_category_idx" ON "medical_templates"("category");

-- CreateIndex
CREATE INDEX "medical_templates_specialty_idx" ON "medical_templates"("specialty");

-- CreateIndex
CREATE INDEX "medical_templates_is_active_idx" ON "medical_templates"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "hcw_caregivers_user_id_key" ON "hcw_caregivers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "hcw_caregivers_hcw_user_id_key" ON "hcw_caregivers"("hcw_user_id");

-- CreateIndex
CREATE INDEX "hcw_caregivers_user_id_idx" ON "hcw_caregivers"("user_id");

-- CreateIndex
CREATE INDEX "hcw_caregivers_specialty_idx" ON "hcw_caregivers"("specialty");

-- CreateIndex
CREATE INDEX "hcw_caregivers_is_active_idx" ON "hcw_caregivers"("is_active");

-- CreateIndex
CREATE INDEX "hcw_assignments_patient_id_idx" ON "hcw_assignments"("patient_id");

-- CreateIndex
CREATE INDEX "hcw_assignments_caregiver_id_idx" ON "hcw_assignments"("caregiver_id");

-- CreateIndex
CREATE INDEX "hcw_assignments_status_idx" ON "hcw_assignments"("status");

-- CreateIndex
CREATE INDEX "hcw_assignments_is_primary_idx" ON "hcw_assignments"("is_primary");

-- CreateIndex
CREATE INDEX "hcw_visits_patient_id_idx" ON "hcw_visits"("patient_id");

-- CreateIndex
CREATE INDEX "hcw_visits_caregiver_id_idx" ON "hcw_visits"("caregiver_id");

-- CreateIndex
CREATE INDEX "hcw_visits_scheduled_time_idx" ON "hcw_visits"("scheduled_time");

-- CreateIndex
CREATE INDEX "hcw_visits_status_idx" ON "hcw_visits"("status");

-- CreateIndex
CREATE INDEX "hcw_messages_sender_id_idx" ON "hcw_messages"("sender_id");

-- CreateIndex
CREATE INDEX "hcw_messages_recipient_id_idx" ON "hcw_messages"("recipient_id");

-- CreateIndex
CREATE INDEX "hcw_messages_thread_id_idx" ON "hcw_messages"("thread_id");

-- CreateIndex
CREATE INDEX "hcw_messages_is_read_idx" ON "hcw_messages"("is_read");

-- CreateIndex
CREATE INDEX "hcw_messages_created_at_idx" ON "hcw_messages"("created_at");

-- CreateIndex
CREATE INDEX "hcw_care_plans_patient_id_idx" ON "hcw_care_plans"("patient_id");

-- CreateIndex
CREATE INDEX "hcw_care_plans_caregiver_id_idx" ON "hcw_care_plans"("caregiver_id");

-- CreateIndex
CREATE INDEX "hcw_care_plans_status_idx" ON "hcw_care_plans"("status");

-- CreateIndex
CREATE INDEX "hcw_care_plan_tasks_care_plan_id_idx" ON "hcw_care_plan_tasks"("care_plan_id");

-- CreateIndex
CREATE INDEX "hcw_care_plan_tasks_status_idx" ON "hcw_care_plan_tasks"("status");

-- CreateIndex
CREATE INDEX "hcw_care_plan_tasks_due_date_idx" ON "hcw_care_plan_tasks"("due_date");

-- CreateIndex
CREATE INDEX "hcw_task_comments_task_id_idx" ON "hcw_task_comments"("task_id");

-- CreateIndex
CREATE INDEX "hcw_task_comments_user_id_idx" ON "hcw_task_comments"("user_id");

-- CreateIndex
CREATE INDEX "hcw_data_sharing_preferences_patient_id_idx" ON "hcw_data_sharing_preferences"("patient_id");

-- CreateIndex
CREATE INDEX "hcw_data_sharing_preferences_caregiver_id_idx" ON "hcw_data_sharing_preferences"("caregiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "hcw_data_sharing_preferences_patient_id_caregiver_id_data_t_key" ON "hcw_data_sharing_preferences"("patient_id", "caregiver_id", "data_type");

-- CreateIndex
CREATE INDEX "hcw_documents_patient_id_idx" ON "hcw_documents"("patient_id");

-- CreateIndex
CREATE INDEX "hcw_documents_caregiver_id_idx" ON "hcw_documents"("caregiver_id");

-- CreateIndex
CREATE INDEX "hcw_documents_category_idx" ON "hcw_documents"("category");

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_consultations" ADD CONSTRAINT "video_consultations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcw_caregivers" ADD CONSTRAINT "hcw_caregivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcw_assignments" ADD CONSTRAINT "hcw_assignments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcw_assignments" ADD CONSTRAINT "hcw_assignments_caregiver_id_fkey" FOREIGN KEY ("caregiver_id") REFERENCES "hcw_caregivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcw_visits" ADD CONSTRAINT "hcw_visits_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcw_visits" ADD CONSTRAINT "hcw_visits_caregiver_id_fkey" FOREIGN KEY ("caregiver_id") REFERENCES "hcw_caregivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcw_messages" ADD CONSTRAINT "hcw_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "hcw_caregivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcw_messages" ADD CONSTRAINT "hcw_messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "hcw_caregivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcw_care_plans" ADD CONSTRAINT "hcw_care_plans_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcw_care_plan_tasks" ADD CONSTRAINT "hcw_care_plan_tasks_care_plan_id_fkey" FOREIGN KEY ("care_plan_id") REFERENCES "hcw_care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcw_task_comments" ADD CONSTRAINT "hcw_task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "hcw_care_plan_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcw_task_comments" ADD CONSTRAINT "hcw_task_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcw_data_sharing_preferences" ADD CONSTRAINT "hcw_data_sharing_preferences_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcw_data_sharing_preferences" ADD CONSTRAINT "hcw_data_sharing_preferences_caregiver_id_fkey" FOREIGN KEY ("caregiver_id") REFERENCES "hcw_caregivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hcw_documents" ADD CONSTRAINT "hcw_documents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

