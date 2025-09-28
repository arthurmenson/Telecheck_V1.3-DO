import { dbPool } from "../config/database";

/**
 * PostgreSQL Database Adapter
 * Simplified adapter for PostgreSQL-only operations
 */
class DatabaseAdapter {
  async initialize(): Promise<void> {
    if (!dbPool) {
      console.warn(
        "PostgreSQL pool not configured. Skipping database adapter initialization.",
      );
      return;
    }
    // Test connection
    await dbPool.query("SELECT NOW()");
    console.log("✅ PostgreSQL database adapter initialized");
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    if (!dbPool) {
      console.warn(
        "PostgreSQL pool not configured. Returning empty result for query.",
      );
      return [];
    }
    try {
      let finalSql = sql;
      if (typeof sql === "string" && sql.includes("?")) {
        let placeholderIndex = 0;
        finalSql = sql.replace(/\?/g, () => {
          placeholderIndex += 1;
          return `$${placeholderIndex}`;
        });
      }

      const result = await dbPool.query(finalSql, params);
      return result.rows;
    } catch (error) {
      console.error("Database query failed:", error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.query("SELECT 1 as health");
      return true;
    } catch (error) {
      console.error("Database health check failed:", error);
      return false;
    }
  }

  getConnectionInfo(): any {
    return {
      type: "PostgreSQL",
      status: dbPool ? "active" : "not_configured",
      url: process.env.DATABASE_URL
        ? "[REDACTED]"
        : `${process.env.DB_HOST}:${process.env.DB_PORT || 5432}`,
    };
  }

  async close(): Promise<void> {
    if (dbPool) {
      await dbPool.end();
    }
  }

  // Helper methods for common operations
  async getUserById(id: string): Promise<any> {
    const users = await this.query(
      `
        SELECT 
          u.*,
          p.date_of_birth,
          p.gender,
          p.allergies AS patient_allergies,
          p.emergency_contacts,
          p.insurance_info
        FROM users u
        LEFT JOIN patients p ON p.user_id = u.id
        WHERE u.id = $1
      `,
      [id],
    );
    return users[0] || null;
  }

  async getUserByEmail(email: string): Promise<any> {
    const users = await this.query(
      `
        SELECT 
          u.*,
          p.date_of_birth,
          p.gender,
          p.allergies AS patient_allergies,
          p.emergency_contacts,
          p.insurance_info
        FROM users u
        LEFT JOIN patients p ON p.user_id = u.id
        WHERE u.email = $1
      `,
      [email],
    );
    return users[0] || null;
  }

  async createUser(userData: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    avatarUrl?: string;
    isActive?: boolean;
  }): Promise<any> {
    if (!dbPool) {
      throw new Error("Database not configured");
    }

    const columns = [
      "email",
      "password_hash",
      "first_name",
      "last_name",
      "role",
    ];
    const values = [
      userData.email,
      userData.passwordHash,
      userData.firstName,
      userData.lastName,
      userData.role,
    ];

    if (userData.phone !== undefined) {
      columns.push("phone");
      values.push(userData.phone);
    }

    if (userData.avatarUrl !== undefined) {
      columns.push("avatar_url");
      values.push(userData.avatarUrl);
    }

    if (userData.isActive !== undefined) {
      columns.push("is_active");
      values.push(userData.isActive);
    }

    const placeholders = columns.map((_, index) => `$${index + 1}`);

    const result = await dbPool.query(
      `INSERT INTO users (${columns.join(", ")})
       VALUES (${placeholders.join(", ")})
       RETURNING *`,
      values,
    );

    return result.rows[0];
  }

  async getVitalSigns(userId: string, limit: number = 100): Promise<any[]> {
    return await this.query(
      `
      SELECT
        id,
        user_id,
        heart_rate,
        blood_pressure_systolic,
        blood_pressure_diastolic,
        temperature,
        oxygen_saturation,
        weight,
        height,
        recorded_at,
        source
      FROM vital_signs
      WHERE user_id = $1
      ORDER BY recorded_at DESC
      LIMIT $2
    `,
      [userId, limit],
    );
  }

  async addVitalSigns(vitalData: any): Promise<any> {
    const {
      userId,
      type,
      value,
      unit,
      measuredAt,
      deviceId,
      heartRate,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      temperature,
      oxygenSaturation,
      weight,
      height,
      source,
    } = vitalData;

    const recordedAt = measuredAt || vitalData.recordedAt || new Date();

    const result = await this.query(
      `
      INSERT INTO vital_signs (
        user_id,
        heart_rate,
        blood_pressure_systolic,
        blood_pressure_diastolic,
        temperature,
        oxygen_saturation,
        weight,
        height,
        recorded_at,
        source
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `,
      [
        userId,
        heartRate ?? value ?? null,
        bloodPressureSystolic ?? null,
        bloodPressureDiastolic ?? null,
        temperature ?? null,
        oxygenSaturation ?? null,
        weight ?? null,
        height ?? null,
        recordedAt,
        source || "manual",
      ],
    );
    return result[0];
  }

  async getVitalById(id: string): Promise<any> {
    const vitals = await this.query("SELECT * FROM vital_signs WHERE id = $1", [
      id,
    ]);
    return vitals[0] || null;
  }

  async getMedications(
    userId: string,
    activeOnly: boolean = true,
  ): Promise<any[]> {
    const activeClause = activeOnly ? "AND active = true" : "";
    return await this.query(
      `
      SELECT * FROM medications 
      WHERE user_id = $1 ${activeClause}
      ORDER BY created_at DESC
    `,
      [userId],
    );
  }

  async addMedication(medicationData: any): Promise<any> {
    const {
      userId,
      name,
      dosage,
      frequency,
      startDate,
      prescribingDoctor,
      notes,
    } = medicationData;

    const result = await this.query(
      `
      INSERT INTO medications (user_id, name, dosage, frequency, start_date, prescribing_doctor, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [userId, name, dosage, frequency, startDate, prescribingDoctor, notes],
    );
    return result[0];
  }

  async getMedicationById(id: string): Promise<any> {
    const medications = await this.query(
      "SELECT * FROM medications WHERE id = $1",
      [id],
    );
    return medications[0] || null;
  }

  async getLabResults(userId: string, limit: number = 50): Promise<any[]> {
    return await this.query(
      `
      SELECT * FROM lab_results 
      WHERE user_id = $1 
      ORDER BY date_collected DESC 
      LIMIT $2
    `,
      [userId, limit],
    );
  }

  async addLabResult(labData: any): Promise<any> {
    const {
      userId,
      testName,
      value,
      unit,
      referenceRange,
      status,
      dateCollected,
      labName,
    } = labData;

    const result = await this.query(
      `
      INSERT INTO lab_results (user_id, test_name, value, unit, reference_range, status, date_collected, lab_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        userId,
        testName,
        value,
        unit,
        referenceRange,
        status,
        dateCollected,
        labName,
      ],
    );
    return result[0];
  }

  async getLabResultById(id: string): Promise<any> {
    const results = await this.query(
      "SELECT * FROM lab_results WHERE id = $1",
      [id],
    );
    return results[0] || null;
  }

  async getChatMessages(userId: string, limit: number = 50): Promise<any[]> {
    return await this.query(
      `
      SELECT * FROM chat_messages 
      WHERE user_id = $1 
      ORDER BY timestamp DESC 
      LIMIT $2
    `,
      [userId, limit],
    );
  }

  async addChatMessage(messageData: any): Promise<any> {
    const { userId, content, sender, messageType, metadata } = messageData;

    const result = await this.query(
      `
      INSERT INTO chat_messages (user_id, content, sender, message_type, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [userId, content, sender, messageType || "text", metadata],
    );
    return result[0];
  }

  async getChatMessageById(id: string): Promise<any> {
    const messages = await this.query(
      "SELECT * FROM chat_messages WHERE id = $1",
      [id],
    );
    return messages[0] || null;
  }

  async getHealthInsights(
    userId: string,
    dismissed: boolean = false,
  ): Promise<any[]> {
    return await this.query(
      `
      SELECT * FROM health_insights 
      WHERE user_id = $1 AND dismissed = $2 
      ORDER BY priority DESC, created_at DESC
    `,
      [userId, dismissed],
    );
  }

  async addHealthInsight(insightData: any): Promise<any> {
    const {
      userId,
      title,
      description,
      type,
      priority,
      category,
      confidence,
      actionRequired,
    } = insightData;

    const result = await this.query(
      `
      INSERT INTO health_insights (user_id, title, description, type, priority, category, confidence, action_required)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        userId,
        title,
        description,
        type,
        priority,
        category,
        confidence,
        actionRequired,
      ],
    );
    return result[0];
  }

  async getHealthInsightById(id: string): Promise<any> {
    const insights = await this.query(
      "SELECT * FROM health_insights WHERE id = $1",
      [id],
    );
    return insights[0] || null;
  }

  async dismissHealthInsight(id: string): Promise<boolean> {
    const result = await this.query(
      "UPDATE health_insights SET dismissed = true WHERE id = $1",
      [id],
    );
    return result.length > 0;
  }

  // Audit logging for HIPAA compliance
  async logActivity(
    userId: string,
    action: string,
    description: string,
    details: any = {},
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.query(
      `
      INSERT INTO audit_logs (user_id, action, description, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [
        userId,
        action,
        description,
        JSON.stringify(details),
        ipAddress,
        userAgent,
      ],
    );
  }
}

// Export singleton instance
export const db = new DatabaseAdapter();

// Don't initialize on import - let the server handle initialization
// db.initialize().catch(console.error);

export default db;
