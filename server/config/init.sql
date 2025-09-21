-- Database initialization script for Telecheck
-- This script creates the necessary tables and indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  blood_type VARCHAR(5),
  allergies TEXT[],
  emergency_contacts JSONB,
  insurance_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab reports table
CREATE TABLE IF NOT EXISTS lab_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
);

-- Lab results table
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
);

-- Appointment slots table for scheduling service
CREATE TABLE IF NOT EXISTS appointment_slots (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  location_id TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'held', 'booked', 'cancelled')),
  patient_id TEXT,
  booking_reference TEXT,
  seed_reference TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointment_slots_unique ON appointment_slots(provider_id, start_time);

INSERT INTO appointment_slots (id, provider_id, location_id, start_time, end_time, status, seed_reference, metadata)
VALUES (
  's1',
  'provider-demo',
  'main',
  '2025-01-02 09:00:00+00',
  '2025-01-02 09:30:00+00',
  'available',
  'apt1',
  '{"source":"seed"}'
)
ON CONFLICT (id) DO NOTHING;

-- RPM vitals table
CREATE TABLE IF NOT EXISTS rpm_vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id TEXT NOT NULL,
  metric TEXT NOT NULL,
  unit TEXT,
  value NUMERIC(10,2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rpm_vitals_patient_metric_time ON rpm_vitals(patient_id, metric, recorded_at);

-- RPM thresholds table
CREATE TABLE IF NOT EXISTS rpm_thresholds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id TEXT NOT NULL,
  metric TEXT NOT NULL,
  unit TEXT,
  min_value NUMERIC(10,2),
  max_value NUMERIC(10,2),
  metadata JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(patient_id, metric)
);

-- RPM alerts table
CREATE TABLE IF NOT EXISTS rpm_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id TEXT NOT NULL,
  metric TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE,
  context JSONB
);

CREATE INDEX IF NOT EXISTS idx_rpm_alerts_patient_status ON rpm_alerts(patient_id, status, created_at DESC);

INSERT INTO rpm_vitals (patient_id, metric, unit, value, recorded_at, metadata)
VALUES
  ('rpm-demo', 'heart_rate', 'bpm', 72, '2025-01-01 08:00:00+00', '{"source":"bluetooth"}'),
  ('rpm-demo', 'heart_rate', 'bpm', 76, '2025-01-02 08:00:00+00', '{"source":"bluetooth"}'),
  ('rpm-demo', 'blood_pressure_systolic', 'mmHg', 120, '2025-01-02 08:00:00+00', '{"source":"manual"}')
ON CONFLICT DO NOTHING;

INSERT INTO rpm_thresholds (patient_id, metric, unit, min_value, max_value, metadata, updated_at)
VALUES
  ('rpm-demo', 'heart_rate', 'bpm', 55, 110, '{"escalation":"notify-clinician"}', '2025-01-01 07:00:00+00'),
  ('rpm-demo', 'blood_pressure_systolic', 'mmHg', 90, 140, '{"escalation":"notify-rn"}', '2025-01-01 07:00:00+00')
ON CONFLICT (patient_id, metric) DO NOTHING;

INSERT INTO rpm_alerts (id, patient_id, metric, severity, status, message, created_at, resolved_at, context)
VALUES (
  'alert-demo-1',
  'rpm-demo',
  'heart_rate',
  'medium',
  'open',
  'Heart rate exceeded threshold',
  '2025-01-02 08:30:00+00',
  NULL,
  '{"value":120,"unit":"bpm"}'
)
ON CONFLICT (id) DO NOTHING;

-- Vital signs table
CREATE TABLE IF NOT EXISTS vital_signs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('appointment', 'medication', 'lab', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health insights table
CREATE TABLE IF NOT EXISTS health_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  is_dismissed BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_user_id ON lab_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_status ON lab_reports(analysis_status);
CREATE INDEX IF NOT EXISTS idx_lab_results_report_id ON lab_results(lab_report_id);
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_is_active ON medications(is_active);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_vital_signs_user_id ON vital_signs(user_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_recorded_at ON vital_signs(recorded_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_health_insights_user_id ON health_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_health_insights_is_dismissed ON health_insights(is_dismissed);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_reports_updated_at BEFORE UPDATE ON lab_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
VALUES (
  'admin@telecheck.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O',
  'Admin',
  'User',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;
