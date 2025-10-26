-- Migration: Add consultation notes fields to video_consultations table
-- This migration adds simple post-consultation documentation fields directly to the video_consultations table

-- Add consultation_notes column
ALTER TABLE "video_consultations"
ADD COLUMN IF NOT EXISTS "consultation_notes" TEXT;

-- Add diagnosis column
ALTER TABLE "video_consultations"
ADD COLUMN IF NOT EXISTS "diagnosis" TEXT;

-- Add treatment_plan column
ALTER TABLE "video_consultations"
ADD COLUMN IF NOT EXISTS "treatment_plan" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN "video_consultations"."consultation_notes" IS 'Post-consultation notes written by the doctor';
COMMENT ON COLUMN "video_consultations"."diagnosis" IS 'Diagnosis from the consultation';
COMMENT ON COLUMN "video_consultations"."treatment_plan" IS 'Treatment plan prescribed by the doctor';
