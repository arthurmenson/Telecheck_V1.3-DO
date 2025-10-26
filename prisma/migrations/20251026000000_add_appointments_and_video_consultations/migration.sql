-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'DOCTOR', 'ADMIN', 'NURSE');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('video', 'in_person');

-- CreateEnum
CREATE TYPE "VideoConsultationStatus" AS ENUM ('pending', 'active', 'completed', 'cancelled', 'failed');

-- AlterTable: Add role column to existing users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'PATIENT';

-- CreateTable: appointments
CREATE TABLE IF NOT EXISTS "appointments" (
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

-- CreateTable: video_consultations
CREATE TABLE IF NOT EXISTS "video_consultations" (
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
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "video_consultations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "appointments_hcw_consultation_id_key" ON "appointments"("hcw_consultation_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "appointments_patient_id_idx" ON "appointments"("patient_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "appointments_doctor_id_idx" ON "appointments"("doctor_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "appointments_scheduled_time_idx" ON "appointments"("scheduled_time");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "appointments_patient_id_scheduled_time_idx" ON "appointments"("patient_id", "scheduled_time");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "appointments_doctor_id_scheduled_time_idx" ON "appointments"("doctor_id", "scheduled_time");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "video_consultations_appointment_id_key" ON "video_consultations"("appointment_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "video_consultations_appointment_id_idx" ON "video_consultations"("appointment_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "video_consultations_hcw_consultation_id_idx" ON "video_consultations"("hcw_consultation_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "video_consultations_status_idx" ON "video_consultations"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "video_consultations_started_at_idx" ON "video_consultations"("started_at");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_consultations" ADD CONSTRAINT "video_consultations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
