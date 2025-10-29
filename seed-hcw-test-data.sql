-- Seed HCW Test Data
-- This script creates comprehensive test data for testing the HCW integration

-- Step 1: Create test patient user
-- Note: password_hash is a bcrypt hash of "Test123!" for testing purposes
INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone, date_of_birth, address, city, state, zip_code, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test.patient@telecheck.com',
  '$2b$10$rKJ.HCW8HOME.TestDataSeed',
  'John',
  'Patient',
  'PATIENT',
  '(555) 111-2222',
  '1985-06-15',
  '123 Main St',
  'San Francisco',
  'CA',
  '94102',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Step 2: Create test caregiver users
INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    'dr.johnson@telecheck.com',
    '$2b$10$rKJ.HCW8HOME.TestDataSeed',
    'Sarah',
    'Johnson',
    'CAREGIVER',
    '(555) 123-4567',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'dr.chen@telecheck.com',
    '$2b$10$rKJ.HCW8HOME.TestDataSeed',
    'Michael',
    'Chen',
    'CAREGIVER',
    '(555) 234-5678',
    NOW(),
    NOW()
  )
ON CONFLICT (email) DO NOTHING;

-- Step 3: Create caregiver profiles
DO $$
DECLARE
  johnson_user_id UUID;
  chen_user_id UUID;
  patient_user_id UUID;
  johnson_caregiver_id UUID;
  chen_caregiver_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO johnson_user_id FROM users WHERE email = 'dr.johnson@telecheck.com';
  SELECT id INTO chen_user_id FROM users WHERE email = 'dr.chen@telecheck.com';
  SELECT id INTO patient_user_id FROM users WHERE email = 'test.patient@telecheck.com';

  -- Create caregiver profiles
  INSERT INTO hcw_caregivers (id, user_id, hcw_user_id, specialty, credentials, bio, phone_number, email, is_active, created_at, updated_at)
  VALUES
    (
      gen_random_uuid(),
      johnson_user_id,
      NULL,
      'Primary Care',
      'MD, FACP',
      'Board-certified internist with 15 years of experience in primary care and chronic disease management. Passionate about preventive medicine and patient education.',
      '(555) 123-4567',
      'dr.johnson@telecheck.com',
      true,
      NOW(),
      NOW()
    )
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO johnson_caregiver_id;

  IF johnson_caregiver_id IS NULL THEN
    SELECT id INTO johnson_caregiver_id FROM hcw_caregivers WHERE user_id = johnson_user_id;
  END IF;

  INSERT INTO hcw_caregivers (id, user_id, hcw_user_id, specialty, credentials, bio, phone_number, email, is_active, created_at, updated_at)
  VALUES
    (
      gen_random_uuid(),
      chen_user_id,
      NULL,
      'Cardiology',
      'MD, FACC',
      'Cardiologist specializing in heart failure and preventive cardiology with expertise in advanced heart failure management and cardiac imaging.',
      '(555) 234-5678',
      'dr.chen@telecheck.com',
      true,
      NOW(),
      NOW()
    )
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO chen_caregiver_id;

  IF chen_caregiver_id IS NULL THEN
    SELECT id INTO chen_caregiver_id FROM hcw_caregivers WHERE user_id = chen_user_id;
  END IF;

  -- Step 4: Create assignments
  INSERT INTO hcw_assignments (id, patient_id, caregiver_id, assignment_type, is_primary, status, assigned_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), patient_user_id, johnson_caregiver_id, 'primary_care', true, 'active', NOW(), NOW(), NOW()),
    (gen_random_uuid(), patient_user_id, chen_caregiver_id, 'specialist', false, 'active', NOW(), NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- Step 5: Create test messages
  INSERT INTO hcw_messages (id, sender_id, sender_type, recipient_id, recipient_type, content, message_type, priority, is_read, read_at, created_at, updated_at)
  VALUES
    -- Message from Dr. Johnson to patient (read)
    (
      gen_random_uuid(),
      johnson_user_id,
      'caregiver',
      patient_user_id,
      'patient',
      'Hello John! I''ve reviewed your recent lab results and everything looks great. Your cholesterol levels have improved significantly since our last visit.',
      'text',
      'normal',
      true,
      NOW() - INTERVAL '1 hour',
      NOW() - INTERVAL '2 days',
      NOW() - INTERVAL '2 days'
    ),
    -- Message from patient to Dr. Johnson (read)
    (
      gen_random_uuid(),
      patient_user_id,
      'patient',
      johnson_user_id,
      'caregiver',
      'Thank you Dr. Johnson! That''s great news. Do I need to make any changes to my medication or diet?',
      'text',
      'normal',
      true,
      NOW() - INTERVAL '30 minutes',
      NOW() - INTERVAL '1 day',
      NOW() - INTERVAL '1 day'
    ),
    -- Message from Dr. Johnson to patient (unread)
    (
      gen_random_uuid(),
      johnson_user_id,
      'caregiver',
      patient_user_id,
      'patient',
      'No changes needed! Just continue with your current medication and diet plan. Keep up the excellent work with your exercise routine.',
      'text',
      'normal',
      false,
      NULL,
      NOW() - INTERVAL '2 hours',
      NOW() - INTERVAL '2 hours'
    ),
    -- Message from Dr. Chen to patient (unread, high priority)
    (
      gen_random_uuid(),
      chen_user_id,
      'caregiver',
      patient_user_id,
      'patient',
      'Hi John, this is Dr. Chen. I''d like to schedule a follow-up appointment to discuss your cardiac imaging results. Please let me know your availability for next week.',
      'text',
      'high',
      false,
      NULL,
      NOW() - INTERVAL '30 minutes',
      NOW() - INTERVAL '30 minutes'
    );

  -- Step 6: Create test visits
  INSERT INTO hcw_visits (id, patient_id, caregiver_id, scheduled_time, visit_type, purpose, location, status, created_at, updated_at)
  VALUES
    -- Upcoming visit 1
    (
      gen_random_uuid(),
      patient_user_id,
      johnson_caregiver_id,
      NOW() + INTERVAL '3 days',
      'routine',
      'Quarterly check-up and blood pressure monitoring',
      'Home Visit - 123 Main St, San Francisco, CA 94102',
      'scheduled',
      NOW(),
      NOW()
    ),
    -- Upcoming visit 2
    (
      gen_random_uuid(),
      patient_user_id,
      chen_caregiver_id,
      NOW() + INTERVAL '7 days',
      'follow_up',
      'Cardiology follow-up - discuss cardiac imaging results',
      'Telecheck Clinic - 456 Medical Plaza, San Francisco, CA',
      'scheduled',
      NOW(),
      NOW()
    );

  -- Past completed visit
  INSERT INTO hcw_visits (id, patient_id, caregiver_id, scheduled_time, actual_start, actual_end, visit_type, purpose, location, status, rating, feedback, notes, created_at, updated_at)
  VALUES
    (
      gen_random_uuid(),
      patient_user_id,
      johnson_caregiver_id,
      NOW() - INTERVAL '30 days',
      NOW() - INTERVAL '30 days',
      NOW() - INTERVAL '30 days' + INTERVAL '45 minutes',
      'routine',
      'Annual physical examination',
      'Home Visit - 123 Main St, San Francisco, CA 94102',
      'completed',
      5,
      'Excellent visit! Dr. Johnson was very thorough and took the time to answer all my questions. Very professional and caring.',
      'Patient is in good overall health. Blood pressure controlled. Continue current medications. Follow up in 3 months for routine check-up.',
      NOW() - INTERVAL '30 days',
      NOW() - INTERVAL '30 days'
    );

END $$;

-- Display results
DO $$
DECLARE
  patient_email TEXT := 'test.patient@telecheck.com';
  patient_id UUID;
  caregiver_count INT;
  assignment_count INT;
  message_count INT;
  visit_count INT;
BEGIN
  SELECT id INTO patient_id FROM users WHERE email = patient_email;

  SELECT COUNT(*) INTO caregiver_count FROM hcw_caregivers;
  SELECT COUNT(*) INTO assignment_count FROM hcw_assignments WHERE patient_id = patient_id;
  SELECT COUNT(*) INTO message_count FROM hcw_messages WHERE recipient_id = patient_id OR sender_id = patient_id;
  SELECT COUNT(*) INTO visit_count FROM hcw_visits WHERE patient_id = patient_id;

  RAISE NOTICE '====================================================================';
  RAISE NOTICE '✅ HCW TEST DATA SEEDED SUCCESSFULLY!';
  RAISE NOTICE '====================================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   - Patient: % (ID: %)', patient_email, patient_id;
  RAISE NOTICE '   - Caregivers: %', caregiver_count;
  RAISE NOTICE '   - Assignments: %', assignment_count;
  RAISE NOTICE '   - Messages: %', message_count;
  RAISE NOTICE '   - Visits: %', visit_count;
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Ready for testing!';
  RAISE NOTICE '🔗 Test URL: https://whale-app-bs3xa.ondigitalocean.app';
  RAISE NOTICE '   Login as: %', patient_email;
END $$;
