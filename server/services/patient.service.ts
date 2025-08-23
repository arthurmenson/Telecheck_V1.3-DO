import { db as database } from '../utils/databaseAdapter';
import { AuditLogger } from '../utils/auditLogger';
import bcrypt from 'bcrypt';

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
  status: 'active' | 'inactive' | 'archived';
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
  status?: 'active' | 'inactive' | 'archived';
}

export interface PatientSearchFilters {
  query?: string; // Search across name, email, phone, MRN
  status?: 'active' | 'inactive' | 'archived';
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  providerId?: string;
  insuranceProvider?: string;
  hasConditions?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
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

export class PatientService {
  private static generateMRN(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MRN${timestamp}${random}`;
  }

  private static async generatePassword(): Promise<string> {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  static async createPatient(data: CreatePatientRequest, createdBy: string): Promise<Patient> {
    try {
      // Generate password if not provided
      const password = data.password || await this.generatePassword();
      const hashedPassword = await bcrypt.hash(password, 10);
      const mrn = this.generateMRN();

      await database.query('BEGIN');

      // Create user account
      const userResult = await database.query(`
        INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'patient', NOW(), NOW())
        RETURNING id, email, first_name, last_name, phone, created_at, updated_at
      `, [data.email, hashedPassword, data.firstName, data.lastName, data.phone]);

      const user = userResult.rows[0];

      // Create patient record
      const patientResult = await database.query(`
        INSERT INTO patients (
          id, user_id, date_of_birth, gender, address, city, state, zip_code,
          allergies, emergency_contacts, insurance_info, primary_provider_id,
          mrn, status, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, 'active', NOW(), NOW()
        )
        RETURNING *
      `, [
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
        mrn
      ]);

      const patient = patientResult.rows[0];

      await database.query('COMMIT');

      // Audit log
      await AuditLogger.logEvent({
        userId: createdBy,
        action: 'patient_created',
        resourceType: 'patient',
        resourceId: patient.id,
        details: {
          patientId: patient.id,
          mrn: patient.mrn,
          email: user.email
        }
      });

      return {
        id: patient.id,
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: patient.date_of_birth,
        gender: patient.gender,
        address: patient.address,
        city: patient.city,
        state: patient.state,
        zipCode: patient.zip_code,
        allergies: JSON.parse(patient.allergies || '[]'),
        emergencyContacts: JSON.parse(patient.emergency_contacts || '{}'),
        insuranceInfo: JSON.parse(patient.insurance_info || '{}'),
        primaryProviderId: patient.primary_provider_id,
        status: patient.status,
        mrn: patient.mrn,
        createdAt: patient.created_at,
        updatedAt: patient.updated_at
      };
    } catch (error) {
      await database.query('ROLLBACK');
      throw error;
    }
  }

  static async getPatientById(patientId: string): Promise<Patient | null> {
    try {
      const result = await database.query(`
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
          SELECT vital_signs_data as reading_data
          FROM vital_signs
          WHERE patient_id = u.id
          ORDER BY reading_date DESC
          LIMIT 1
        ) latest_vitals ON true
        WHERE p.id = $1
      `, [patientId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
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
        allergies: JSON.parse(row.allergies || '[]'),
        emergencyContacts: JSON.parse(row.emergency_contacts || '{}'),
        insuranceInfo: JSON.parse(row.insurance_info || '{}'),
        primaryProviderId: row.primary_provider_id,
        status: row.status,
        mrn: row.mrn,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        providerName: row.provider_first_name && row.provider_last_name
          ? `${row.provider_first_name} ${row.provider_last_name}`
          : null,
        lastAppointment: row.last_appointment,
        lastVitals: row.reading_data ? JSON.parse(row.reading_data) : null
      };
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  static async updatePatient(patientId: string, data: UpdatePatientRequest, updatedBy: string): Promise<Patient | null> {
    try {
      await database.query('BEGIN');

      // Update user record if needed
      const userFields = ['firstName', 'lastName', 'email', 'phone'];
      const userUpdates = Object.entries(data)
        .filter(([key]) => userFields.includes(key))
        .map(([key, value]) => {
          const dbKey = key === 'firstName' ? 'first_name' : 
                        key === 'lastName' ? 'last_name' : key;
          return { dbKey, value };
        });

      if (userUpdates.length > 0) {
        const setClause = userUpdates.map((update, index) => `${update.dbKey} = $${index + 2}`).join(', ');
        const values = userUpdates.map(update => update.value);
        
        await database.query(`
          UPDATE users 
          SET ${setClause}, updated_at = NOW()
          WHERE id = (SELECT user_id FROM patients WHERE id = $1)
        `, [patientId, ...values]);
      }

      // Update patient record
      const patientFields = [
        'dateOfBirth', 'gender', 'address', 'city', 'state', 'zipCode',
        'allergies', 'emergencyContacts', 'insuranceInfo', 'primaryProviderId', 'status'
      ];
      
      const patientUpdates = Object.entries(data)
        .filter(([key]) => patientFields.includes(key))
        .map(([key, value]) => {
          const dbKey = key === 'dateOfBirth' ? 'date_of_birth' :
                        key === 'zipCode' ? 'zip_code' :
                        key === 'emergencyContacts' ? 'emergency_contacts' :
                        key === 'insuranceInfo' ? 'insurance_info' :
                        key === 'primaryProviderId' ? 'primary_provider_id' :
                        key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          
          // Handle JSON fields
          const processedValue = ['allergies', 'emergency_contacts', 'insurance_info'].includes(dbKey)
            ? JSON.stringify(value)
            : value;
          
          return { dbKey, value: processedValue };
        });

      if (patientUpdates.length > 0) {
        const setClause = patientUpdates.map((update, index) => `${update.dbKey} = $${index + 2}`).join(', ');
        const values = patientUpdates.map(update => update.value);
        
        await database.query(`
          UPDATE patients 
          SET ${setClause}, updated_at = NOW()
          WHERE id = $1
        `, [patientId, ...values]);
      }

      await database.query('COMMIT');

      // Audit log
      await AuditLogger.logEvent({
        userId: updatedBy,
        action: 'patient_updated',
        resourceType: 'patient',
        resourceId: patientId,
        details: {
          updatedFields: Object.keys(data)
        }
      });

      return await this.getPatientById(patientId);
    } catch (error) {
      await database.query('ROLLBACK');
      throw error;
    }
  }

  static async searchPatients(
    filters: PatientSearchFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedPatients> {
    try {
      let whereConditions = ["p.status != 'archived'"];
      let queryParams: any[] = [];
      let paramIndex = 1;

      // Text search across name, email, phone, MRN
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

      // Status filter
      if (filters.status) {
        whereConditions.push(`p.status = $${paramIndex}`);
        queryParams.push(filters.status);
        paramIndex++;
      }

      // Gender filter
      if (filters.gender) {
        whereConditions.push(`p.gender = $${paramIndex}`);
        queryParams.push(filters.gender);
        paramIndex++;
      }

      // Age range filters
      if (filters.ageMin || filters.ageMax) {
        if (filters.ageMin) {
          whereConditions.push(`EXTRACT(YEAR FROM AGE(p.date_of_birth)) >= $${paramIndex}`);
          queryParams.push(filters.ageMin);
          paramIndex++;
        }
        if (filters.ageMax) {
          whereConditions.push(`EXTRACT(YEAR FROM AGE(p.date_of_birth)) <= $${paramIndex}`);
          queryParams.push(filters.ageMax);
          paramIndex++;
        }
      }

      // Provider filter
      if (filters.providerId) {
        whereConditions.push(`p.primary_provider_id = $${paramIndex}`);
        queryParams.push(filters.providerId);
        paramIndex++;
      }

      // Date range filters
      if (filters.lastAppointmentAfter || filters.lastAppointmentBefore) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM appointments a 
          WHERE a.patient_id = u.id 
          ${filters.lastAppointmentAfter ? `AND a.appointment_date >= $${paramIndex++}` : ''}
          ${filters.lastAppointmentBefore ? `AND a.appointment_date <= $${paramIndex++}` : ''}
        )`);
        if (filters.lastAppointmentAfter) queryParams.push(filters.lastAppointmentAfter);
        if (filters.lastAppointmentBefore) queryParams.push(filters.lastAppointmentBefore);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count total results
      const countQuery = `
        SELECT COUNT(*) as total
        FROM patients p
        JOIN users u ON p.user_id = u.id
        ${whereClause}
      `;
      
      const countResult = await database.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Calculate pagination
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      // Fetch paginated results
      const searchQuery = `
        SELECT 
          p.*,
          u.email, u.first_name, u.last_name, u.phone,
          provider.first_name as provider_first_name,
          provider.last_name as provider_last_name,
          latest_apt.appointment_date as last_appointment,
          EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age
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
        ${whereClause}
        ORDER BY u.last_name, u.first_name
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);
      const result = await database.query(searchQuery, queryParams);

      const patients: Patient[] = result.rows.map(row => ({
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
        allergies: JSON.parse(row.allergies || '[]'),
        emergencyContacts: JSON.parse(row.emergency_contacts || '{}'),
        insuranceInfo: JSON.parse(row.insurance_info || '{}'),
        primaryProviderId: row.primary_provider_id,
        status: row.status,
        mrn: row.mrn,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        providerName: row.provider_first_name && row.provider_last_name
          ? `${row.provider_first_name} ${row.provider_last_name}`
          : null,
        lastAppointment: row.last_appointment
      }));

      return {
        patients,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  static async archivePatient(patientId: string, archivedBy: string): Promise<boolean> {
    try {
      const result = await database.query(`
        UPDATE patients 
        SET status = 'archived', updated_at = NOW()
        WHERE id = $1 AND status != 'archived'
      `, [patientId]);

      if (result.rowCount > 0) {
        await AuditLogger.logEvent({
          userId: archivedBy,
          action: 'patient_archived',
          resourceType: 'patient',
          resourceId: patientId,
          details: {}
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error archiving patient:', error);
      throw error;
    }
  }

  static async getPatientStats(): Promise<any> {
    try {
      const result = await database.query(`
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
      console.error('Error fetching patient stats:', error);
      throw error;
    }
  }
}
