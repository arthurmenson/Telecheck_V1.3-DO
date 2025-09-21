import { Client, Pool } from "pg";
import {
  User,
  LabResult,
  LabReport,
  Medication,
  VitalSigns,
  ChatMessage,
  HealthInsight,
} from "@shared/types";

interface PostgresConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
}

class PostgreSQLDatabase {
  private pool: Pool | null = null;
  private isConnected = false;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    const config: PostgresConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    };

    // If no connection string, build from individual components
    if (!config.connectionString) {
      config.host = process.env.DB_HOST || "localhost";
      config.port = parseInt(process.env.DB_PORT || "5432");
      config.database = process.env.DB_NAME || "telecheck";
      config.user = process.env.DB_USER || "postgres";
      config.password = process.env.DB_PASSWORD || "";
    }

    this.pool = new Pool(config);

    // Handle connection events
    this.pool.on("connect", () => {
      console.log("✅ Connected to PostgreSQL database");
      this.isConnected = true;
    });

    this.pool.on("error", (err) => {
      console.error("❌ PostgreSQL pool error:", err);
      this.isConnected = false;
    });
  }

  async initialize(): Promise<void> {
    try {
      if (!this.pool) {
        throw new Error("Database pool not initialized");
      }

      // Test connection
      const client = await this.pool.connect();
      await client.query("SELECT NOW()");
      client.release();

      // Initialize database schema
      await this.initializeTables();
      await this.initializeMessagingTables();
      await this.initializeRPMTables();
      await this.initializeCCMTables();

      console.log("🚀 PostgreSQL database initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing PostgreSQL database:", error);
      throw error;
    }
  }

  async query(text: string, params: any[] = []): Promise<any> {
    if (!this.pool) {
      throw new Error("Database pool not initialized");
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);

      // For SELECT queries, return rows
      if (text.trim().toUpperCase().startsWith("SELECT")) {
        return result.rows;
      }

      // For INSERT/UPDATE/DELETE, return the result object
      return result;
    } catch (error) {
      console.error("❌ Database query error:", error);
      console.error("SQL:", text);
      console.error("Params:", params);
      throw error;
    } finally {
      client.release();
    }
  }

  private async initializeTables(): Promise<void> {
    // Core users table
    await this.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE,
        phone VARCHAR(20),
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),
        medical_history TEXT,
        current_medications TEXT,
        allergies TEXT,
        insurance_provider VARCHAR(100),
        insurance_policy_number VARCHAR(50),
        primary_care_physician VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Audit logs for HIPAA compliance
    await this.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id UUID,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        details JSONB,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        ip_address INET,
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Lab results table
    await this.query(`
      CREATE TABLE IF NOT EXISTS lab_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        test_name VARCHAR(200) NOT NULL,
        value DECIMAL(10,3) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        reference_range VARCHAR(50),
        status VARCHAR(20),
        date_collected TIMESTAMPTZ,
        lab_name VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Medications table
    await this.query(`
      CREATE TABLE IF NOT EXISTS medications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        name VARCHAR(200) NOT NULL,
        dosage VARCHAR(50) NOT NULL,
        frequency VARCHAR(100) NOT NULL,
        start_date DATE,
        end_date DATE,
        prescribing_doctor VARCHAR(100),
        notes TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Vital signs table
    await this.query(`
      CREATE TABLE IF NOT EXISTS vital_signs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        type VARCHAR(50) NOT NULL,
        value DECIMAL(8,2) NOT NULL,
        unit VARCHAR(20),
        measured_at TIMESTAMPTZ,
        device_id VARCHAR(100),
        source VARCHAR(50) DEFAULT 'manual',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Chat messages table
    await this.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        content TEXT NOT NULL,
        sender VARCHAR(20) NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        message_type VARCHAR(20) DEFAULT 'text',
        metadata JSONB,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Health insights table
    await this.query(`
      CREATE TABLE IF NOT EXISTS health_insights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        priority VARCHAR(20) NOT NULL,
        category VARCHAR(50),
        confidence INTEGER,
        action_required BOOLEAN DEFAULT false,
        dismissed BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for performance
    await this.query(
      "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
    );
    await this.query(
      "CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)",
    );
    await this.query(
      "CREATE INDEX IF NOT EXISTS idx_lab_results_user_id ON lab_results(user_id)",
    );
    await this.query(
      "CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id)",
    );
    await this.query(
      "CREATE INDEX IF NOT EXISTS idx_vital_signs_user_id ON vital_signs(user_id)",
    );
    await this.query(
      "CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id)",
    );
    await this.query(
      "CREATE INDEX IF NOT EXISTS idx_health_insights_user_id ON health_insights(user_id)",
    );
    await this.query(
      "CREATE INDEX IF NOT EXISTS idx_vital_signs_type_measured ON vital_signs(type, measured_at)",
    );
  }

  private async initializeMessagingTables(): Promise<void> {
    // Messaging configuration
    await this.query(`
      CREATE TABLE IF NOT EXISTS messaging_config (
        id SERIAL PRIMARY KEY,
        config_data JSONB NOT NULL,
        updated_by VARCHAR(100) NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Patient schedules
    await this.query(`
      CREATE TABLE IF NOT EXISTS patient_schedules (
        id SERIAL PRIMARY KEY,
        patient_id UUID NOT NULL UNIQUE,
        schedule_data JSONB NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Scheduled messages
    await this.query(`
      CREATE TABLE IF NOT EXISTS scheduled_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        scheduled_time TIMESTAMPTZ NOT NULL,
        timezone VARCHAR(50) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        sent_at TIMESTAMPTZ,
        error_message TEXT,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Message templates
    await this.query(`
      CREATE TABLE IF NOT EXISTS message_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        variables JSONB,
        is_default BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        updated_by VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Care team members
    await this.query(`
      CREATE TABLE IF NOT EXISTS care_team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        priority_level INTEGER DEFAULT 1,
        availability_schedule JSONB,
        notification_preferences JSONB,
        active BOOLEAN DEFAULT true,
        updated_by VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Communication logs
    await this.query(`
      CREATE TABLE IF NOT EXISTS communication_logs (
        id SERIAL PRIMARY KEY,
        patient_id UUID,
        type VARCHAR(50) NOT NULL,
        method VARCHAR(20) NOT NULL,
        recipient VARCHAR(100) NOT NULL,
        message TEXT,
        status VARCHAR(20) NOT NULL,
        provider VARCHAR(20),
        message_id VARCHAR(100),
        cost DECIMAL(6,4),
        response_text TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        metadata JSONB,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
  }

  private async initializeRPMTables(): Promise<void> {
    // RPM devices
    await this.query(`
      CREATE TABLE IF NOT EXISTS rpm_devices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL,
        device_type VARCHAR(50) NOT NULL,
        device_model VARCHAR(100),
        device_serial VARCHAR(100),
        manufacturer VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        last_sync TIMESTAMPTZ,
        battery_level INTEGER,
        firmware_version VARCHAR(20),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // RPM readings (detailed vital signs)
    await this.query(`
      CREATE TABLE IF NOT EXISTS rpm_readings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL,
        device_id UUID,
        reading_type VARCHAR(50) NOT NULL,
        value DECIMAL(10,3) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        recorded_at TIMESTAMPTZ NOT NULL,
        transmitted_at TIMESTAMPTZ DEFAULT NOW(),
        quality_score INTEGER,
        flags JSONB,
        raw_data JSONB,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (device_id) REFERENCES rpm_devices(id) ON DELETE SET NULL
      )
    `);

    // Patient thresholds
    await this.query(`
      CREATE TABLE IF NOT EXISTS patient_thresholds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL,
        threshold_type VARCHAR(50) NOT NULL,
        min_value DECIMAL(10,3),
        max_value DECIMAL(10,3),
        severity VARCHAR(20) NOT NULL,
        active BOOLEAN DEFAULT true,
        notes TEXT,
        set_by VARCHAR(100),
        effective_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // RPM alerts
    await this.query(`
      CREATE TABLE IF NOT EXISTS rpm_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL,
        reading_id UUID,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        threshold_breached JSONB NOT NULL,
        value_recorded DECIMAL(10,3),
        unit VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active',
        acknowledged_by VARCHAR(100),
        acknowledged_at TIMESTAMPTZ,
        resolved_at TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reading_id) REFERENCES rpm_readings(id) ON DELETE SET NULL
      )
    `);
  }

  private async initializeCCMTables(): Promise<void> {
    // CCM patients (enrollment)
    await this.query(`
      CREATE TABLE IF NOT EXISTS ccm_patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL UNIQUE,
        enrollment_date DATE NOT NULL,
        provider_id VARCHAR(100) NOT NULL,
        care_plan_id UUID,
        status VARCHAR(20) DEFAULT 'active',
        consent_date DATE,
        consent_method VARCHAR(50),
        risk_level VARCHAR(20) DEFAULT 'medium',
        conditions TEXT[],
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // CCM encounters
    await this.query(`
      CREATE TABLE IF NOT EXISTS ccm_encounters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ccm_patient_id UUID NOT NULL,
        encounter_type VARCHAR(50) NOT NULL,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ,
        duration_minutes INTEGER,
        provider_id VARCHAR(100) NOT NULL,
        encounter_notes TEXT,
        billing_code VARCHAR(10),
        billing_status VARCHAR(20) DEFAULT 'pending',
        billed_amount DECIMAL(8,2),
        outcomes JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (ccm_patient_id) REFERENCES ccm_patients(id) ON DELETE CASCADE
      )
    `);

    // Care goals
    await this.query(`
      CREATE TABLE IF NOT EXISTS care_goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ccm_patient_id UUID NOT NULL,
        goal_description TEXT NOT NULL,
        target_value VARCHAR(50),
        current_value VARCHAR(50),
        target_date DATE,
        status VARCHAR(20) DEFAULT 'in_progress',
        priority VARCHAR(20) DEFAULT 'medium',
        category VARCHAR(50),
        progress_percentage INTEGER DEFAULT 0,
        notes TEXT,
        created_by VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (ccm_patient_id) REFERENCES ccm_patients(id) ON DELETE CASCADE
      )
    `);

    // Care plans
    await this.query(`
      CREATE TABLE IF NOT EXISTS care_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ccm_patient_id UUID NOT NULL,
        plan_name VARCHAR(200) NOT NULL,
        plan_description TEXT,
        start_date DATE NOT NULL,
        end_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        created_by VARCHAR(100),
        reviewed_date DATE,
        next_review_date DATE,
        plan_data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (ccm_patient_id) REFERENCES ccm_patients(id) ON DELETE CASCADE
      )
    `);

    // CCM billing
    await this.query(`
      CREATE TABLE IF NOT EXISTS ccm_billing (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ccm_patient_id UUID NOT NULL,
        billing_month DATE NOT NULL,
        total_minutes INTEGER NOT NULL,
        billing_codes JSONB NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        submitted_date DATE,
        payment_received DECIMAL(10,2),
        payment_date DATE,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (ccm_patient_id) REFERENCES ccm_patients(id) ON DELETE CASCADE
      )
    `);

    // Create CCM-specific indexes
    await this.query(
      "CREATE INDEX IF NOT EXISTS idx_ccm_patients_patient_id ON ccm_patients(patient_id)",
    );
    await this.query(
      "CREATE INDEX IF NOT EXISTS idx_ccm_encounters_patient_date ON ccm_encounters(ccm_patient_id, start_time)",
    );
    await this.query(
      "CREATE INDEX IF NOT EXISTS idx_care_goals_patient_status ON care_goals(ccm_patient_id, status)",
    );
    await this.query(
      "CREATE INDEX IF NOT EXISTS idx_rpm_readings_patient_type_time ON rpm_readings(patient_id, reading_type, recorded_at)",
    );
    await this.query(
      "CREATE INDEX IF NOT EXISTS idx_rpm_alerts_patient_status ON rpm_alerts(patient_id, status)",
    );
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log("🔒 PostgreSQL connection pool closed");
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      const result = await this.query("SELECT 1 as health");
      return result.length > 0 && result[0].health === 1;
    } catch (error) {
      console.error("❌ Database health check failed:", error);
      return false;
    }
  }

  // Get connection pool status
  getPoolStatus(): any {
    if (!this.pool) return null;
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      isConnected: this.isConnected,
    };
  }
}

// Create and export PostgreSQL database instance
export const postgresDb = new PostgreSQLDatabase();

// Auto-initialize
if (process.env.DATABASE_URL || process.env.DB_HOST) {
  postgresDb.initialize().catch(console.error);
}

export default postgresDb;
