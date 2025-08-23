import { db as database } from '../utils/databaseAdapter';

export async function initializeMessagingTables(): Promise<void> {
  try {
    // Messaging configuration table
    await database.query(`
      CREATE TABLE IF NOT EXISTS messaging_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        config_data TEXT NOT NULL,
        updated_by TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Patient schedules table (if not exists)
    await database.query(`
      CREATE TABLE IF NOT EXISTS patient_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL UNIQUE,
        schedule_data TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Scheduled messages table (if not exists)
    await database.query(`
      CREATE TABLE IF NOT EXISTS scheduled_messages (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        scheduled_time DATETIME NOT NULL,
        timezone TEXT NOT NULL,
        phone TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        sent_at DATETIME,
        error_message TEXT
      )
    `);

    // Message templates table
    await database.query(`
      CREATE TABLE IF NOT EXISTS message_templates (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        variables TEXT, -- JSON array of variable names
        is_default INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        updated_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Care team members table
    await database.query(`
      CREATE TABLE IF NOT EXISTS care_team_members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        priority_level INTEGER DEFAULT 1,
        availability_schedule TEXT, -- JSON object
        notification_preferences TEXT, -- JSON object
        active INTEGER DEFAULT 1,
        updated_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Escalation rules table
    await database.query(`
      CREATE TABLE IF NOT EXISTS escalation_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level INTEGER NOT NULL,
        timeout_minutes INTEGER NOT NULL,
        criteria TEXT, -- JSON object describing escalation criteria
        actions TEXT, -- JSON array of actions to take
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Communication logs table (if not exists)
    await database.query(`
      CREATE TABLE IF NOT EXISTS communication_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT,
        care_team_member_id TEXT,
        provider TEXT NOT NULL, -- 'telnyx', 'twilio'
        type TEXT NOT NULL, -- 'sms', 'voice', 'email'
        direction TEXT NOT NULL, -- 'inbound', 'outbound'
        message_content TEXT,
        phone_number TEXT,
        status TEXT NOT NULL, -- 'success', 'failed', 'pending'
        external_message_id TEXT,
        cost_cents INTEGER,
        duration_seconds INTEGER,
        metadata TEXT, -- JSON object
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        sent_at DATETIME,
        delivered_at DATETIME,
        error_message TEXT
      )
    `);

    // Message analytics table
    await database.query(`
      CREATE TABLE IF NOT EXISTS message_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        provider TEXT NOT NULL,
        type TEXT NOT NULL,
        total_messages INTEGER DEFAULT 0,
        successful_messages INTEGER DEFAULT 0,
        failed_messages INTEGER DEFAULT 0,
        total_cost_cents INTEGER DEFAULT 0,
        avg_delivery_time_seconds INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, provider, type)
      )
    `);

    // Patient-specific thresholds table
    await database.query(`
      CREATE TABLE IF NOT EXISTS patient_thresholds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        threshold_type TEXT NOT NULL, -- 'glucose_low', 'glucose_high', 'bp_systolic_high', etc.
        threshold_value REAL NOT NULL,
        unit TEXT, -- 'mg/dL', 'mmHg', 'bpm', '°F', '%'
        notes TEXT,
        is_active INTEGER DEFAULT 1,
        created_by TEXT NOT NULL,
        updated_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, threshold_type)
      )
    `);

    // Create indexes for better performance
    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_patient_schedules_patient_id 
      ON patient_schedules(patient_id)
    `);

    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_scheduled_messages_patient_id 
      ON scheduled_messages(patient_id)
    `);

    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status 
      ON scheduled_messages(status)
    `);

    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_communication_logs_patient_id 
      ON communication_logs(patient_id)
    `);

    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_communication_logs_created_at 
      ON communication_logs(created_at)
    `);

    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_care_team_members_active
      ON care_team_members(active)
    `);

    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_patient_thresholds_patient_id
      ON patient_thresholds(patient_id)
    `);

    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_patient_thresholds_active
      ON patient_thresholds(is_active)
    `);

    // Insert default configuration if none exists
    const existingConfig = await database.query(
      'SELECT COUNT(*) as count FROM messaging_config'
    );

    if (!existingConfig || existingConfig[0]?.count === 0) {
      const defaultConfig = {
        primaryProvider: 'telnyx',
        enableSMS: true,
        enableVoice: false,
        enableScheduled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        maxRetries: 3,
        retryDelay: 5,
        auditLogging: true,
        thresholds: {
          glucoseLow: 70,
          glucoseHigh: 400,
          bpSystolicHigh: 180,
          bpDiastolicHigh: 110,
          heartRateHigh: 120,
          heartRateLow: 50,
          temperatureHigh: 101.5,
          temperatureLow: 95.0,
          oxygenSatLow: 88
        },
        careTeam: {
          enableAlerts: true,
          escalationTimeout: 15,
          maxEscalationLevels: 3
        }
      };

      await database.query(
        `INSERT INTO messaging_config (config_data, updated_by) 
         VALUES (?, 'system')`,
        [JSON.stringify(defaultConfig)]
      );
    }

    // Insert default message templates if none exist
    const existingTemplates = await database.query(
      'SELECT COUNT(*) as count FROM message_templates'
    );

    if (!existingTemplates || existingTemplates[0]?.count === 0) {
      const defaultTemplates = [
        {
          id: 'med_reminder',
          type: 'medication_reminder',
          name: 'Medication Reminder',
          content: 'Reminder: It\'s time to take your {{medication}} ({{dosage}}). {{instructions}}',
          variables: JSON.stringify(['medication', 'dosage', 'instructions']),
          is_default: 1
        },
        {
          id: 'glucose_check',
          type: 'glucose_check',
          name: 'Glucose Check Reminder',
          content: 'Time for your glucose check! Please test your blood sugar and log the results in your patient portal.',
          variables: JSON.stringify([]),
          is_default: 1
        },
        {
          id: 'appointment_24h',
          type: 'appointment_reminder',
          name: 'Appointment Reminder (24h)',
          content: 'Reminder: You have an appointment with {{provider}} tomorrow at {{time}}. Location: {{location}}. Please arrive 15 minutes early.',
          variables: JSON.stringify(['provider', 'time', 'location']),
          is_default: 1
        },
        {
          id: 'appointment_2h',
          type: 'appointment_reminder',
          name: 'Appointment Reminder (2h)',
          content: 'Your appointment with {{provider}} is in 2 hours at {{time}}. Location: {{location}}. Don\'t forget to bring your insurance card and medication list.',
          variables: JSON.stringify(['provider', 'time', 'location']),
          is_default: 1
        },
        {
          id: 'daily_update',
          type: 'daily_update',
          name: 'Daily Update',
          content: 'Good morning! Please remember to:\\n- Take your medications\\n- Check your glucose levels\\n- Log your meals and activities\\n- Contact us with any concerns: {{contact_number}}',
          variables: JSON.stringify(['contact_number']),
          is_default: 1
        },
        {
          id: 'critical_alert',
          type: 'care_team_alert',
          name: 'Critical Alert',
          content: 'Patient {{patient_name}} (ID: {{patient_id}}) requires attention: {{alert_reason}}. Last reading: {{last_reading}}. Please review and respond.',
          variables: JSON.stringify(['patient_name', 'patient_id', 'alert_reason', 'last_reading']),
          is_default: 1
        },
        {
          id: 'wellness_check',
          type: 'wellness_check',
          name: 'Wellness Check',
          content: 'Hi {{patient_name}}, how are you feeling today? Reply with a number 1-10 (1=very poor, 10=excellent) to rate your overall wellness.',
          variables: JSON.stringify(['patient_name']),
          is_default: 1
        }
      ];

      for (const template of defaultTemplates) {
        await database.query(
          `INSERT OR IGNORE INTO message_templates
           (id, type, name, content, variables, is_default, updated_by)
           VALUES (?, ?, ?, ?, ?, ?, 'system')`,
          [
            template.id,
            template.type,
            template.name,
            template.content,
            template.variables,
            template.is_default
          ]
        );
      }
    }

    // Insert default care team members if none exist
    const existingCareTeam = await database.query(
      'SELECT COUNT(*) as count FROM care_team_members'
    );

    if (!existingCareTeam || existingCareTeam[0]?.count === 0) {
      const defaultCareTeam = [
        {
          id: 'primary_nurse_1',
          name: 'Sarah Johnson, RN',
          role: 'Primary Nurse',
          phone: '+1234567890',
          email: 'sarah.johnson@healthcare.com',
          priority_level: 1,
          availability_schedule: JSON.stringify({
            monday: { start: '07:00', end: '19:00', available: true },
            tuesday: { start: '07:00', end: '19:00', available: true },
            wednesday: { start: '07:00', end: '19:00', available: true },
            thursday: { start: '07:00', end: '19:00', available: true },
            friday: { start: '07:00', end: '19:00', available: true },
            saturday: { start: '00:00', end: '00:00', available: false },
            sunday: { start: '00:00', end: '00:00', available: false }
          }),
          notification_preferences: JSON.stringify({
            sms: true,
            voice: false,
            email: true,
            urgentOnly: false
          })
        },
        {
          id: 'supervising_rn_1',
          name: 'Michael Chen, RN',
          role: 'Supervising RN',
          phone: '+1234567891',
          email: 'michael.chen@healthcare.com',
          priority_level: 2,
          availability_schedule: JSON.stringify({
            monday: { start: '19:00', end: '07:00', available: true },
            tuesday: { start: '19:00', end: '07:00', available: true },
            wednesday: { start: '19:00', end: '07:00', available: true },
            thursday: { start: '19:00', end: '07:00', available: true },
            friday: { start: '19:00', end: '07:00', available: true },
            saturday: { start: '00:00', end: '23:59', available: true },
            sunday: { start: '00:00', end: '23:59', available: true }
          }),
          notification_preferences: JSON.stringify({
            sms: true,
            voice: true,
            email: true,
            urgentOnly: false
          })
        },
        {
          id: 'attending_physician_1',
          name: 'Dr. Emma Rodriguez, MD',
          role: 'Attending Physician',
          phone: '+1234567892',
          email: 'emma.rodriguez@healthcare.com',
          priority_level: 3,
          availability_schedule: JSON.stringify({
            monday: { start: '08:00', end: '17:00', available: true },
            tuesday: { start: '08:00', end: '17:00', available: true },
            wednesday: { start: '08:00', end: '17:00', available: true },
            thursday: { start: '08:00', end: '17:00', available: true },
            friday: { start: '08:00', end: '17:00', available: true },
            saturday: { start: '00:00', end: '00:00', available: false },
            sunday: { start: '00:00', end: '00:00', available: false }
          }),
          notification_preferences: JSON.stringify({
            sms: false,
            voice: true,
            email: true,
            urgentOnly: true
          })
        }
      ];

      for (const member of defaultCareTeam) {
        await database.query(
          `INSERT OR IGNORE INTO care_team_members
           (id, name, role, phone, email, priority_level, availability_schedule, notification_preferences, updated_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'system')`,
          [
            member.id,
            member.name,
            member.role,
            member.phone,
            member.email,
            member.priority_level,
            member.availability_schedule,
            member.notification_preferences
          ]
        );
      }
    }

    // Insert default escalation rules if none exist
    const existingRules = await database.query(
      'SELECT COUNT(*) as count FROM escalation_rules'
    );

    if (!existingRules || existingRules[0]?.count === 0) {
      const defaultRules = [
        {
          level: 1,
          timeout_minutes: 15,
          criteria: JSON.stringify({ 
            severity: ['medium', 'high', 'critical'],
            timeOfDay: 'business_hours'
          }),
          actions: JSON.stringify([
            'notify_primary_nurse',
            'send_sms'
          ])
        },
        {
          level: 2,
          timeout_minutes: 30,
          criteria: JSON.stringify({ 
            severity: ['high', 'critical'],
            timeOfDay: 'after_hours'
          }),
          actions: JSON.stringify([
            'notify_supervising_rn',
            'send_sms',
            'send_voice_call'
          ])
        },
        {
          level: 3,
          timeout_minutes: 60,
          criteria: JSON.stringify({ 
            severity: ['critical'],
            noResponse: true
          }),
          actions: JSON.stringify([
            'notify_attending_physician',
            'send_voice_call',
            'page_emergency_contact'
          ])
        }
      ];

      for (const rule of defaultRules) {
        await database.query(
          `INSERT OR IGNORE INTO escalation_rules
           (level, timeout_minutes, criteria, actions)
           VALUES (?, ?, ?, ?)`,
          [
            rule.level,
            rule.timeout_minutes,
            rule.criteria,
            rule.actions
          ]
        );
      }
    }

    console.log('Messaging database tables initialized successfully');

  } catch (error) {
    console.error('Error initializing messaging database tables:', error);
    throw error;
  }
}

// Export the initialization function to be called when the server starts
