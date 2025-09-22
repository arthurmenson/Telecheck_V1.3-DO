import bcrypt from "bcrypt";
import { Pool } from "pg";

import { dbPool } from "../config/database";
import { AuditLogger } from "../utils/auditLogger";

export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  allergies?: string[];
  emergencyContacts?: any;
  insuranceInfo?: any;
  primaryProviderId?: string;
  status: "active" | "inactive" | "archived";
  mrn?: string;
  createdAt: string;
  updatedAt: string;
  // Joined data
  providerName?: string;
  lastAppointment?: string;
  lastVitals?: any;
  activeConditions?: string[];
  currentMedications?: string[];
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  allergies?: string[];
  emergencyContacts?: any;
  insuranceInfo?: any;
  primaryProviderId?: string;
  password?: string; // Optional - can be auto-generated
}

export interface UpdatePatientRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  allergies?: string[];
  emergencyContacts?: any;
  insuranceInfo?: any;
  primaryProviderId?: string;
  status?: "active" | "inactive" | "archived";
}

export interface PatientSearchFilters {
  query?: string; // Search across name, email, phone, MRN
  status?: "active" | "inactive" | "archived";
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  providerId?: string;
  insuranceProvider?: string;
  hasConditions?: boolean;
  riskLevel?: "low" | "medium" | "high";
  lastAppointmentBefore?: string;
  lastAppointmentAfter?: string;
}

export interface PaginatedPatients {
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const getPool = (): Pool => {
  if (!dbPool) {
    throw new Error(
      "Database connection pool is not configured. Ensure PostgreSQL environment variables are set before using PatientService.",
    );
  }

  return dbPool;
};

const mapPatientRow = (row: any): Patient => ({
  id: row.id,
  userId: row.user_id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  phone: row.phone,
  dateOfBirth: row.date_of_birth,
  gender: row.gender,
  address: row.address,
  city: row.city,
  state: row.state,
  zipCode: row.zip_code,
  allergies:
    typeof row.allergies === "string"
      ? JSON.parse(row.allergies || "[]")
      : row.allergies || [],
  emergencyContacts:
    typeof row.emergency_contacts === "string"
      ? JSON.parse(row.emergency_contacts || "{}")
      : row.emergency_contacts || {},
  insuranceInfo:
    typeof row.insurance_info === "string"
      ? JSON.parse(row.insurance_info || "{}")
      : row.insurance_info || {},
  primaryProviderId: row.primary_provider_id,
  status: row.status,
  mrn: row.mrn,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  providerName:
    row.provider_first_name && row.provider_last_name
      ? `${row.provider_first_name} ${row.provider_last_name}`
      : null,
  lastAppointment: row.last_appointment,
  lastVitals: row.reading_data
    ? typeof row.reading_data === "string"
      ? JSON.parse(row.reading_data)
      : row.reading_data
    : null,
  activeConditions: row.active_conditions
    ? JSON.parse(row.active_conditions)
    : undefined,
  currentMedications: row.current_medications
    ? JSON.parse(row.current_medications)
    : undefined,
});

export class PatientService {
  private static generateMRN(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `MRN${timestamp}${random}`;
  }

  private static async generatePassword(): Promise<string> {
    const chars =
      "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  static async createPatient(
    data: CreatePatientRequest,
    createdBy: string,
  ): Promise<Patient> {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const password = data.password || (await this.generatePassword());
      const hashedPassword = await bcrypt.hash(password, 12);
      const mrn = this.generateMRN();

      await client.query("BEGIN");

      const userResult = await client.query(
        `
          INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'patient', NOW(), NOW())
          RETURNING id, email, first_name, last_name, phone, created_at, updated_at
        `,
        [data.email, hashedPassword, data.firstName, data.lastName, data.phone],
      );

      const user = userResult.rows[0];

      const patientResult = await client.query(
        `
          INSERT INTO patients (
            id, user_id, date_of_birth, gender, address, city, state, zip_code,
            allergies, emergency_contacts, insurance_info, primary_provider_id,
            mrn, status, created_at, updated_at
          )
          VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12, 'active', NOW(), NOW()
          )
          RETURNING id
        `,
        [
          user.id,
          data.dateOfBirth,
          data.gender || null,
          data.address || null,
          data.city || null,
          data.state || null,
          data.zipCode || null,
          JSON.stringify(data.allergies || []),
          JSON.stringify(data.emergencyContacts || {}),
          JSON.stringify(data.insuranceInfo || {}),
          data.primaryProviderId || null,
          mrn,
        ],
      );

      const patientId = patientResult.rows[0].id;
      await client.query("COMMIT");

      const patient = await this.getPatientById(patientId);

      await AuditLogger.logEvent({
        userId: createdBy,
        action: "patient_created",
        resourceType: "patient",
        resourceId: patientId,
        details: {
          patientId,
          mrn,
          email: user.email,
        },
      });

      if (!patient) {
        throw new Error("Failed to load patient after creation");
      }

      return patient;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async getPatientById(patientId: string): Promise<Patient | null> {
    try {
      const pool = getPool();
      const result = await pool.query(
        `
          SELECT
            p.*,
            u.email, u.first_name, u.last_name, u.phone,
            provider.first_name as provider_first_name,
            provider.last_name as provider_last_name,
            latest_apt.appointment_date as last_appointment,
            latest_vitals.reading_data as last_vitals
          FROM patients p
          JOIN users u ON p.user_id = u.id
          LEFT JOIN users provider ON p.primary_provider_id = provider.id
          LEFT JOIN LATERAL (
            SELECT appointment_date
            FROM appointments
            WHERE patient_id = u.id
            ORDER BY appointment_date DESC
            LIMIT 1
          ) latest_apt ON true
          LEFT JOIN LATERAL (
            SELECT to_json(vs.*) as reading_data
            FROM vital_signs vs
            WHERE vs.user_id = u.id
            ORDER BY vs.recorded_at DESC
            LIMIT 1
          ) latest_vitals ON true
          WHERE p.id = $1
        `,
        [patientId],
      );

      if (result.rows.length === 0) {
        return null;
      }

      return mapPatientRow(result.rows[0]);
    } catch (error) {
      console.error("Error fetching patient:", error);
      throw error;
    }
  }

  static async updatePatient(
    patientId: string,
    data: UpdatePatientRequest,
    updatedBy: string,
  ): Promise<Patient | null> {
    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const userFields = ["firstName", "lastName", "email", "phone"];
      const userUpdates = Object.entries(data)
        .filter(([key]) => userFields.includes(key))
        .map(([key, value]) => {
          const dbKey =
            key === "firstName"
              ? "first_name"
              : key === "lastName"
                ? "last_name"
                : key;
          return { dbKey, value };
        });

      if (userUpdates.length > 0) {
        const setClause = userUpdates
          .map((update, index) => `${update.dbKey} = $${index + 2}`)
          .join(", ");
        const values = userUpdates.map((update) => update.value);

        await client.query(
          `
            UPDATE users
            SET ${setClause}, updated_at = NOW()
            WHERE id = (SELECT user_id FROM patients WHERE id = $1)
          `,
          [patientId, ...values],
        );
      }

      const patientFields = [
        "dateOfBirth",
        "gender",
        "address",
        "city",
        "state",
        "zipCode",
        "allergies",
        "emergencyContacts",
        "insuranceInfo",
        "primaryProviderId",
        "status",
      ];

      const patientUpdates = Object.entries(data)
        .filter(([key]) => patientFields.includes(key))
        .map(([key, value]) => {
          const dbKey =
            key === "dateOfBirth"
              ? "date_of_birth"
              : key === "zipCode"
                ? "zip_code"
                : key === "emergencyContacts"
                  ? "emergency_contacts"
                  : key === "insuranceInfo"
                    ? "insurance_info"
                    : key === "primaryProviderId"
                      ? "primary_provider_id"
                      : key.replace(
                          /[A-Z]/g,
                          (letter) => `_${letter.toLowerCase()}`,
                        );

          const processedValue = [
            "allergies",
            "emergency_contacts",
            "insurance_info",
          ].includes(dbKey)
            ? JSON.stringify(value)
            : value;

          return { dbKey, value: processedValue };
        });

      if (patientUpdates.length > 0) {
        const setClause = patientUpdates
          .map((update, index) => `${update.dbKey} = $${index + 2}`)
          .join(", ");
        const values = patientUpdates.map((update) => update.value);

        await client.query(
          `
            UPDATE patients
            SET ${setClause}, updated_at = NOW()
            WHERE id = $1
          `,
          [patientId, ...values],
        );
      }

      await client.query("COMMIT");

      await AuditLogger.logEvent({
        userId: updatedBy,
        action: "patient_updated",
        resourceType: "patient",
        resourceId: patientId,
        details: {
          updatedFields: Object.keys(data),
        },
      });

      return await this.getPatientById(patientId);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async searchPatients(
    filters: PatientSearchFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedPatients> {
    try {
      const pool = getPool();
      let whereConditions = ["p.status != 'archived'"];
      let queryParams: any[] = [];
      let paramIndex = 1;

      if (filters.query) {
        whereConditions.push(`(
            LOWER(u.first_name) LIKE LOWER($${paramIndex}) OR
            LOWER(u.last_name) LIKE LOWER($${paramIndex}) OR
            LOWER(u.email) LIKE LOWER($${paramIndex}) OR
            u.phone LIKE $${paramIndex} OR
            LOWER(p.mrn) LIKE LOWER($${paramIndex})
          )`);
        queryParams.push(`%${filters.query}%`);
        paramIndex++;
      }

      if (filters.status) {
        whereConditions.push(`p.status = $${paramIndex}`);
        queryParams.push(filters.status);
        paramIndex++;
      }

      if (filters.gender) {
        whereConditions.push(`p.gender = $${paramIndex}`);
        queryParams.push(filters.gender);
        paramIndex++;
      }

      if (filters.ageMin) {
        whereConditions.push(
          `EXTRACT(YEAR FROM AGE(p.date_of_birth)) >= $${paramIndex}`,
        );
        queryParams.push(filters.ageMin);
        paramIndex++;
      }

      if (filters.ageMax) {
        whereConditions.push(
          `EXTRACT(YEAR FROM AGE(p.date_of_birth)) <= $${paramIndex}`,
        );
        queryParams.push(filters.ageMax);
        paramIndex++;
      }

      if (filters.providerId) {
        whereConditions.push(`p.primary_provider_id = $${paramIndex}`);
        queryParams.push(filters.providerId);
        paramIndex++;
      }

      if (filters.lastAppointmentAfter || filters.lastAppointmentBefore) {
        const clauses: string[] = [];
        if (filters.lastAppointmentAfter) {
          clauses.push(`a.appointment_date >= $${paramIndex}`);
          queryParams.push(filters.lastAppointmentAfter);
          paramIndex++;
        }
        if (filters.lastAppointmentBefore) {
          clauses.push(`a.appointment_date <= $${paramIndex}`);
          queryParams.push(filters.lastAppointmentBefore);
          paramIndex++;
        }
        whereConditions.push(`EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.patient_id = u.id
            ${clauses.length ? `AND ${clauses.join(" AND ")}` : ""}
          )`);
      }

      const whereClause = whereConditions.length
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

      const countQuery = `
        SELECT COUNT(*) as total
        FROM patients p
        JOIN users u ON p.user_id = u.id
        ${whereClause}
      `;

      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total, 10);
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit || 1);

      const searchQuery = `
        SELECT
          p.*,
          u.email, u.first_name, u.last_name, u.phone,
          provider.first_name as provider_first_name,
          provider.last_name as provider_last_name,
          latest_apt.appointment_date as last_appointment,
          to_json(latest_vitals.reading_data) as reading_data
        FROM patients p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN users provider ON p.primary_provider_id = provider.id
        LEFT JOIN LATERAL (
          SELECT appointment_date
          FROM appointments
          WHERE patient_id = u.id
          ORDER BY appointment_date DESC
          LIMIT 1
        ) latest_apt ON true
        LEFT JOIN LATERAL (
          SELECT to_json(vs.*) as reading_data
          FROM vital_signs vs
          WHERE vs.user_id = u.id
          ORDER BY vs.recorded_at DESC
          LIMIT 1
        ) latest_vitals ON true
        ${whereClause}
        ORDER BY u.last_name, u.first_name
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const searchResult = await pool.query(searchQuery, [
        ...queryParams,
        limit,
        offset,
      ]);
      const patients = searchResult.rows.map((row) => mapPatientRow(row));

      return { patients, total, page, limit, totalPages };
    } catch (error) {
      console.error("Error searching patients:", error);
      throw error;
    }
  }

  static async archivePatient(
    patientId: string,
    archivedBy: string,
  ): Promise<boolean> {
    try {
      const pool = getPool();
      const result = await pool.query(
        `
          UPDATE patients
          SET status = 'archived', updated_at = NOW()
          WHERE id = $1 AND status != 'archived'
        `,
        [patientId],
      );

      if (result.rowCount > 0) {
        await AuditLogger.logEvent({
          userId: archivedBy,
          action: "patient_archived",
          resourceType: "patient",
          resourceId: patientId,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error archiving patient:", error);
      throw error;
    }
  }

  static async getPatientStats(): Promise<any> {
    try {
      const pool = getPool();
      const result = await pool.query(`
        SELECT
          COUNT(*) as total_patients,
          COUNT(*) FILTER (WHERE status = 'active') as active_patients,
          COUNT(*) FILTER (WHERE status = 'inactive') as inactive_patients,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_this_month,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(date_of_birth)) < 18) as pediatric_patients,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(date_of_birth)) >= 65) as senior_patients
        FROM patients
        WHERE status != 'archived'
      `);

      return result.rows[0];
    } catch (error) {
      console.error("Error fetching patient stats:", error);
      throw error;
    }
  }

  static async getPatientAppointments(
    patientId: string,
    limit: number = 50,
  ): Promise<
    Array<{
      id: string;
      patientId: string;
      providerId: string | null;
      providerName: string | null;
      appointmentDate: string;
      duration: number | null;
      status: string;
      appointmentType: string | null;
      notes: string | null;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    const pool = getPool();

    const patient = await this.getPatientById(patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    const result = await pool.query(
      `
        SELECT
          a.id,
          a.patient_id,
          a.provider_id,
          a.date_time,
          a.duration,
          a.status,
          a.type,
          a.notes,
          a.created_at,
          a.updated_at,
          provider.first_name AS provider_first_name,
          provider.last_name AS provider_last_name
        FROM appointments a
        LEFT JOIN users provider ON a.provider_id = provider.id
        WHERE a.patient_id = $1
        ORDER BY a.date_time DESC
        LIMIT $2
      `,
      [patient.userId, limit],
    );

    return result.rows.map((row) => ({
      id: row.id,
      patientId: row.patient_id,
      providerId: row.provider_id,
      providerName:
        row.provider_first_name && row.provider_last_name
          ? `${row.provider_first_name} ${row.provider_last_name}`
          : null,
      appointmentDate: row.date_time,
      duration: row.duration,
      status: row.status,
      appointmentType: row.type,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  static async getPatientVitals(
    patientId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<
    Array<{
      id: string;
      patientId: string;
      recordedAt: string;
      heartRate: number | null;
      bloodPressureSystolic: number | null;
      bloodPressureDiastolic: number | null;
      temperature: number | null;
      oxygenSaturation: number | null;
      weight: string | null;
      height: string | null;
      source: string | null;
      createdAt: string;
    }>
  > {
    const pool = getPool();
    const patient = await this.getPatientById(patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;

    const result = await pool.query(
      `
        SELECT
          id,
          user_id,
          recorded_at,
          heart_rate,
          blood_pressure_systolic,
          blood_pressure_diastolic,
          temperature,
          oxygen_saturation,
          weight,
          height,
          source,
          created_at
        FROM vital_signs
        WHERE user_id = $1
        ORDER BY recorded_at DESC
        LIMIT $2 OFFSET $3
      `,
      [patient.userId, limit, offset],
    );

    return result.rows.map((row) => ({
      id: row.id,
      patientId: patientId,
      recordedAt: row.recorded_at,
      heartRate: row.heart_rate,
      bloodPressureSystolic: row.blood_pressure_systolic,
      bloodPressureDiastolic: row.blood_pressure_diastolic,
      temperature: row.temperature,
      oxygenSaturation: row.oxygen_saturation,
      weight: row.weight,
      height: row.height,
      source: row.source,
      createdAt: row.created_at,
    }));
  }
}
