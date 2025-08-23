-- Additional Tables for Messaging and Scheduling System

-- Patient schedules table
CREATE TABLE IF NOT EXISTS patient_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id VARCHAR(255) NOT NULL,
  schedule_type VARCHAR(50) NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  time_of_day TIME NOT NULL,
  days_of_week VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Communication logs table
CREATE TABLE IF NOT EXISTS communication_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id VARCHAR(255) NOT NULL,
  message_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  provider VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  response_received_at TIMESTAMP,
  response_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Message templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id VARCHAR(100) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  variables TEXT,
  updated_by VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messaging config table
CREATE TABLE IF NOT EXISTS messaging_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_data JSONB NOT NULL,
  updated_by VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Care team members table
CREATE TABLE IF NOT EXISTS care_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  priority_level INTEGER DEFAULT 1,
  availability_schedule JSONB,
  is_active BOOLEAN DEFAULT true,
  updated_by VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Escalation rules table
CREATE TABLE IF NOT EXISTS escalation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level INTEGER NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table (if not exists from main schema)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255),
  action VARCHAR(255) NOT NULL,
  description TEXT,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table (if not exists from main schema)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  sender VARCHAR(50) NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patient_schedules_patient_id ON patient_schedules(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_schedules_active ON patient_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_communication_logs_patient_id ON communication_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_status ON communication_logs(status);
CREATE INDEX IF NOT EXISTS idx_communication_logs_sent_at ON communication_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_care_team_members_active ON care_team_members(is_active);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

-- Insert some default message templates
INSERT INTO message_templates (id, type, name, content, variables) VALUES
('appointment_reminder_24h', 'appointment', '24 Hour Reminder', 'Hello {{patientName}}, you have an appointment with {{providerName}} tomorrow at {{appointmentTime}}. Please confirm by replying YES.', 'patientName,providerName,appointmentTime'),
('appointment_reminder_2h', 'appointment', '2 Hour Reminder', 'Hi {{patientName}}, your appointment with {{providerName}} is in 2 hours at {{appointmentTime}}. Please arrive 15 minutes early.', 'patientName,providerName,appointmentTime'),
('medication_reminder', 'medication', 'Medication Reminder', 'Time to take your {{medicationName}}. Take {{dosage}} as prescribed.', 'medicationName,dosage'),
('wellness_check', 'wellness', 'Wellness Check', 'Hi {{patientName}}, how are you feeling today? Please reply with a number 1-10 (10 being excellent).', 'patientName'),
('critical_alert', 'alert', 'Critical Alert', 'URGENT: Patient {{patientName}} requires immediate attention. {{alertDetails}}', 'patientName,alertDetails')
ON CONFLICT (id) DO NOTHING;

-- Insert default care team configuration
INSERT INTO care_team_members (name, role, phone, email, priority_level) VALUES
('On-Call Nurse', 'nurse', '+1-555-0123', 'nurse@telecheck.com', 1),
('Primary Doctor', 'doctor', '+1-555-0124', 'doctor@telecheck.com', 2),
('Care Coordinator', 'coordinator', '+1-555-0125', 'coordinator@telecheck.com', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert default escalation rules
INSERT INTO escalation_rules (level, rule_type, conditions, actions) VALUES
(1, 'vital_threshold', '{"type": "critical", "delay_minutes": 0}', '{"notify": ["nurse"], "method": "sms"}'),
(2, 'vital_threshold', '{"type": "critical", "delay_minutes": 15}', '{"notify": ["doctor"], "method": "call"}'),
(3, 'medication_missed', '{"consecutive_days": 3}', '{"notify": ["coordinator"], "method": "sms"}')
ON CONFLICT (id) DO NOTHING;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patient_schedules_updated_at BEFORE UPDATE ON patient_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_care_team_members_updated_at BEFORE UPDATE ON care_team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escalation_rules_updated_at BEFORE UPDATE ON escalation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
