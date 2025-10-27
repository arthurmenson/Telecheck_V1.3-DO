-- Fix Role Schema: Convert lowercase roles to uppercase
-- This script resolves the mismatch between database constraints and Prisma schema

-- Step 1: Drop the existing check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Update all role values to uppercase
UPDATE users SET role = 'ADMIN' WHERE role = 'admin';
UPDATE users SET role = 'DOCTOR' WHERE role = 'doctor';
UPDATE users SET role = 'PATIENT' WHERE role = 'patient';
UPDATE users SET role = 'NURSE' WHERE role = 'nurse';
UPDATE users SET role = 'PHARMACIST' WHERE role = 'pharmacist';
UPDATE users SET role = 'CAREGIVER' WHERE role = 'caregiver';
UPDATE users SET role = 'PROVIDER' WHERE role = 'provider';
UPDATE users SET role = 'FIELD_NURSE' WHERE role = 'field_nurse';

-- Step 3: Recreate the check constraint with uppercase values
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('ADMIN', 'DOCTOR', 'PATIENT', 'NURSE', 'PHARMACIST', 'CAREGIVER', 'PROVIDER', 'FIELD_NURSE'));

-- Step 4: Verify the changes
SELECT 'Role distribution after update:' as info;
SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role;
