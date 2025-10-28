-- Migration to fix HCWMessage schema for patient-caregiver messaging
-- This allows both patients and caregivers to send/receive messages

-- Add sender_type and recipient_type columns
ALTER TABLE "hcw_messages"
ADD COLUMN IF NOT EXISTS "sender_type" TEXT NOT NULL DEFAULT 'patient',
ADD COLUMN IF NOT EXISTS "recipient_type" TEXT NOT NULL DEFAULT 'caregiver';

-- Drop old foreign key constraints that reference hcw_caregivers
ALTER TABLE "hcw_messages"
DROP CONSTRAINT IF EXISTS "hcw_messages_sender_id_fkey";

ALTER TABLE "hcw_messages"
DROP CONSTRAINT IF EXISTS "hcw_messages_recipient_id_fkey";

-- Add new foreign key constraints that reference users table
ALTER TABLE "hcw_messages"
ADD CONSTRAINT "hcw_messages_sender_id_fkey"
FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "hcw_messages"
ADD CONSTRAINT "hcw_messages_recipient_id_fkey"
FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS "hcw_messages_sender_type_idx" ON "hcw_messages"("sender_type");
CREATE INDEX IF NOT EXISTS "hcw_messages_recipient_type_idx" ON "hcw_messages"("recipient_type");

-- Add composite index for efficient queries
CREATE INDEX IF NOT EXISTS "hcw_messages_sender_recipient_idx"
ON "hcw_messages"("sender_id", "recipient_id");

CREATE INDEX IF NOT EXISTS "hcw_messages_thread_created_idx"
ON "hcw_messages"("thread_id", "created_at" DESC);

COMMENT ON COLUMN "hcw_messages"."sender_type" IS 'Type of sender: patient or caregiver';
COMMENT ON COLUMN "hcw_messages"."recipient_type" IS 'Type of recipient: patient or caregiver';
