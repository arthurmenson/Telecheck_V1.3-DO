-- CreateTable: ConsultationNote
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

-- CreateTable: ConsultationNoteAudit
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

-- CreateTable: PatientConsultationSummary
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

-- CreateTable: MedicalTemplate
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

-- CreateIndex
CREATE INDEX "consultation_notes_appointment_id_idx" ON "consultation_notes"("appointment_id");
CREATE INDEX "consultation_notes_doctor_id_idx" ON "consultation_notes"("doctor_id");
CREATE INDEX "consultation_notes_patient_id_idx" ON "consultation_notes"("patient_id");
CREATE INDEX "consultation_notes_status_idx" ON "consultation_notes"("status");
CREATE INDEX "consultation_notes_created_at_idx" ON "consultation_notes"("created_at");

CREATE INDEX "consultation_note_audits_note_id_idx" ON "consultation_note_audits"("note_id");
CREATE INDEX "consultation_note_audits_user_id_idx" ON "consultation_note_audits"("user_id");
CREATE INDEX "consultation_note_audits_timestamp_idx" ON "consultation_note_audits"("timestamp");

CREATE UNIQUE INDEX "patient_consultation_summaries_appointment_id_key" ON "patient_consultation_summaries"("appointment_id");
CREATE INDEX "patient_consultation_summaries_patient_id_idx" ON "patient_consultation_summaries"("patient_id");
CREATE INDEX "patient_consultation_summaries_doctor_id_idx" ON "patient_consultation_summaries"("doctor_id");
CREATE INDEX "patient_consultation_summaries_email_sent_idx" ON "patient_consultation_summaries"("email_sent");

CREATE INDEX "medical_templates_category_idx" ON "medical_templates"("category");
CREATE INDEX "medical_templates_specialty_idx" ON "medical_templates"("specialty");
CREATE INDEX "medical_templates_is_active_idx" ON "medical_templates"("is_active");

-- Add comments for documentation
COMMENT ON TABLE "consultation_notes" IS 'Stores clinical documentation for post-consultation workflow';
COMMENT ON TABLE "consultation_note_audits" IS 'HIPAA-compliant audit trail for all note changes';
COMMENT ON TABLE "patient_consultation_summaries" IS 'Patient-facing consultation summaries';
COMMENT ON TABLE "medical_templates" IS 'Pre-built templates for common medical conditions';

COMMENT ON COLUMN "consultation_notes"."diagnosis_codes" IS 'JSON array of ICD-10 codes with descriptions';
COMMENT ON COLUMN "consultation_notes"."prescription_ids" IS 'JSON array of eRx prescription IDs';
COMMENT ON COLUMN "consultation_notes"."status" IS 'Note status: draft, completed, or signed';
COMMENT ON COLUMN "consultation_notes"."version" IS 'Version number for tracking changes';

COMMENT ON COLUMN "consultation_note_audits"."action" IS 'Audit action: created, updated, signed, viewed';
COMMENT ON COLUMN "consultation_note_audits"."field_changed" IS 'Specific field that was modified';

COMMENT ON COLUMN "patient_consultation_summaries"."email_sent" IS 'Whether summary was successfully emailed to patient';
COMMENT ON COLUMN "patient_consultation_summaries"."viewed_by_patient" IS 'Whether patient has viewed the summary';

COMMENT ON COLUMN "medical_templates"."common_diagnosis_codes" IS 'JSON array of commonly used ICD-10 codes for this condition';
COMMENT ON COLUMN "medical_templates"."usage_count" IS 'Number of times this template has been used';
