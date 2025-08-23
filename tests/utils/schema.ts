import { Pool } from 'pg';

export const createTables = async (pool: Pool) => {
  // Enable UUID extension
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'pharmacist', 'admin')),
      phone VARCHAR(20),
      avatar_url VARCHAR(500),
      is_active BOOLEAN DEFAULT true,
      last_login_at TIMESTAMP,
      password_reset_token VARCHAR(255),
      password_reset_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Patients table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      date_of_birth DATE NOT NULL,
      gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
      blood_type VARCHAR(5),
      allergies TEXT[],
      emergency_contacts JSONB,
      insurance_info JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Lab reports table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lab_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      file_name VARCHAR(255) NOT NULL,
      file_size INTEGER NOT NULL,
      file_url VARCHAR(500) NOT NULL,
      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      analysis_status VARCHAR(20) DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
      ai_summary TEXT,
      confidence DECIMAL(3,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Lab results table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lab_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lab_report_id UUID REFERENCES lab_reports(id) ON DELETE CASCADE,
      test_name VARCHAR(255) NOT NULL,
      value DECIMAL(10,2) NOT NULL,
      unit VARCHAR(50) NOT NULL,
      reference_range VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL CHECK (status IN ('normal', 'borderline', 'high', 'low', 'critical')),
      test_date DATE NOT NULL,
      lab_name VARCHAR(255),
      doctor_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Medications table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS medications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      dosage VARCHAR(100) NOT NULL,
      frequency VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      prescribed_by VARCHAR(255) NOT NULL,
      instructions TEXT,
      side_effects TEXT[],
      interactions TEXT[],
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Appointments table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
      provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
      date_time TIMESTAMP NOT NULL,
      duration INTEGER NOT NULL DEFAULT 30,
      type VARCHAR(20) NOT NULL CHECK (type IN ('consultation', 'follow-up', 'emergency')),
      status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
      notes TEXT,
      video_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Vital signs table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vital_signs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      heart_rate INTEGER,
      blood_pressure_systolic INTEGER,
      blood_pressure_diastolic INTEGER,
      temperature DECIMAL(4,1),
      oxygen_saturation INTEGER,
      weight DECIMAL(5,2),
      height DECIMAL(5,2),
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'device', 'wearable')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notifications table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL CHECK (type IN ('appointment', 'medication', 'lab', 'system')),
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT false,
      action_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_lab_reports_user_id ON lab_reports(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_lab_results_report_id ON lab_results(lab_report_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON appointments(provider_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_vital_signs_user_id ON vital_signs(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`);
};

export const dropTables = async (pool: Pool) => {
  const tables = [
    'notifications',
    'vital_signs',
    'appointments',
    'medications',
    'lab_results',
    'lab_reports',
    'patients',
    'users'
  ];

  for (const table of tables) {
    await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
  }
};
