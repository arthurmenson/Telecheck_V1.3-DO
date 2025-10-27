-- AlterTable: Add keycloak_id column to users table
-- This migration adds Keycloak ID tracking for user synchronization

-- Add keycloak_id column (nullable, unique)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "keycloak_id" TEXT;

-- Create unique index on keycloak_id for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS "users_keycloak_id_key" ON "users"("keycloak_id");

-- Add comment for documentation
COMMENT ON COLUMN "users"."keycloak_id" IS 'Keycloak user ID for identity synchronization';
