import express from 'express';
import { SimplePatientService, PatientStats } from '../services/patient.service.simple';
import { UpdatePatientRequest } from '../services/patient.service';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Validation rules
const createPatientValidation = [
  body('firstName').notEmpty().trim().isLength({ min: 1, max: 50 }),
  body('lastName').notEmpty().trim().isLength({ min: 1, max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone('any'),
  body('dateOfBirth').isISO8601().toDate(),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  body('address').optional().trim().isLength({ max: 200 }),
  body('city').optional().trim().isLength({ max: 100 }),
  body('state').optional().trim().isLength({ max: 50 }),
  body('zipCode').optional().isPostalCode('any'),
  body('allergies').optional().isArray(),
  body('emergencyContacts').optional().isObject(),
  body('insuranceInfo').optional().isObject(),
  body('primaryProviderId').optional().isUUID(),
  body('password').optional().isLength({ min: 8 })
];

const updatePatientValidation = [
  param('id').isUUID(),
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone('any'),
  body('dateOfBirth').optional().isISO8601().toDate(),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  body('address').optional().trim().isLength({ max: 200 }),
  body('city').optional().trim().isLength({ max: 100 }),
  body('state').optional().trim().isLength({ max: 50 }),
  body('zipCode').optional().isPostalCode('any'),
  body('allergies').optional().isArray(),
  body('emergencyContacts').optional().isObject(),
  body('insuranceInfo').optional().isObject(),
  body('primaryProviderId').optional().isUUID(),
  body('status').optional().isIn(['active', 'inactive', 'archived'])
];

const searchValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('query').optional().trim(),
  query('status').optional().isIn(['active', 'inactive', 'archived']),
  query('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  query('ageMin').optional().isInt({ min: 0, max: 150 }).toInt(),
  query('ageMax').optional().isInt({ min: 0, max: 150 }).toInt(),
  query('providerId').optional().isUUID(),
  query('lastAppointmentAfter').optional().isISO8601().toDate(),
  query('lastAppointmentBefore').optional().isISO8601().toDate()
];

// Authorization helper
const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        requiredRoles: roles 
      });
    }
    next();
  };
};

/**
 * @route GET /api/patients/stats
 * @desc Get patient statistics
 * @access Admin, Doctor, Nurse (or public in development)
 */
router.get('/stats',
  // In development, allow unauthenticated access for demo purposes
  process.env.NODE_ENV === 'production' ? authenticateToken : (req: any, res: any, next: any) => {
    req.user = req.user || { id: 'demo', role: 'admin' };
    next();
  },
  process.env.NODE_ENV === 'production' ? requireRole(['admin', 'doctor', 'nurse']) : (req: any, res: any, next: any) => next(),
  async (req, res) => {
    try {
      const stats = await SimplePatientService.getPatientStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error fetching patient stats:', error);
      res.status(500).json({
        error: 'Failed to fetch patient statistics',
        details: error.message
      });
    }
  }
);

/**
 * @route GET /api/patients/search
 * @desc Search patients with filters and pagination
 * @access Admin, Doctor, Nurse (or public in development)
 */
router.get('/search',
  // In development, allow unauthenticated access for demo purposes
  process.env.NODE_ENV === 'production' ? authenticateToken : (req: any, res: any, next: any) => {
    req.user = req.user || { id: 'demo', role: 'admin' };
    next();
  },
  process.env.NODE_ENV === 'production' ? requireRole(['admin', 'doctor', 'nurse']) : (req: any, res: any, next: any) => next(),
  searchValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        query,
        status,
        gender,
        ageMin,
        ageMax,
        providerId,
        lastAppointmentAfter,
        lastAppointmentBefore
      } = req.query;

      const filters = {
        query: query as string,
        status: status as any,
        gender: gender as string,
        ageMin: ageMin as number,
        ageMax: ageMax as number,
        providerId: providerId as string,
        lastAppointmentAfter: lastAppointmentAfter as string,
        lastAppointmentBefore: lastAppointmentBefore as string
      };

      const result = await SimplePatientService.searchPatients(
        filters,
        page as number,
        limit as number
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error searching patients:', error);
      res.status(500).json({
        error: 'Failed to search patients',
        details: error.message
      });
    }
  }
);

/**
 * @route GET /api/patients
 * @desc Get all patients (paginated)
 * @access Admin, Doctor, Nurse (or public in development)
 */
router.get('/',
  // In development, allow unauthenticated access for demo purposes
  process.env.NODE_ENV === 'production' ? authenticateToken : (req: any, res: any, next: any) => {
    req.user = req.user || { id: 'demo', role: 'admin' };
    next();
  },
  process.env.NODE_ENV === 'production' ? requireRole(['admin', 'doctor', 'nurse']) : (req: any, res: any, next: any) => next(),
  searchValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status = 'active'
      } = req.query;

      const filters = {
        status: status as any
      };

      const result = await SimplePatientService.searchPatients(
        filters,
        page as number,
        limit as number
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      res.status(500).json({
        error: 'Failed to fetch patients',
        details: error.message
      });
    }
  }
);

/**
 * @route POST /api/patients
 * @desc Create a new patient
 * @access Admin, Doctor, Nurse (or public in development)
 */
router.post('/',
  // In development, allow unauthenticated access for demo purposes
  process.env.NODE_ENV === 'production' ? authenticateToken : (req: any, res: any, next: any) => {
    req.user = req.user || { id: 'demo-user', role: 'admin' };
    next();
  },
  process.env.NODE_ENV === 'production' ? requireRole(['admin', 'doctor', 'nurse']) : (req: any, res: any, next: any) => next(),
  createPatientValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      console.log('[Patient Creation] Request received:', {
        body: req.body,
        user: req.user,
        headers: {
          'content-type': req.headers['content-type'],
          'authorization': req.headers.authorization ? 'Present' : 'Missing'
        }
      });

      const patientData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        allergies: req.body.allergies,
        emergencyContacts: req.body.emergencyContacts,
        insuranceInfo: req.body.insuranceInfo,
        primaryProviderId: req.body.primaryProviderId,
        password: req.body.password
      };

      console.log('[Patient Creation] Processed patient data:', patientData);

      const patient = await SimplePatientService.createPatient(patientData, req.user?.id || 'system');

      console.log('[Patient Creation] Patient created successfully:', patient.id);

      res.status(201).json({
        success: true,
        data: patient,
        message: 'Patient created successfully'
      });
    } catch (error: any) {
      console.error('[Patient Creation] Error creating patient:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        errno: error.errno
      });
      
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          error: 'Patient with this email already exists',
          field: 'email'
        });
      }

      res.status(500).json({
        error: 'Failed to create patient',
        details: error.message
      });
    }
  }
);

/**
 * @route GET /api/patients/:id
 * @desc Get patient by ID
 * @access Admin, Doctor, Nurse, Patient (own record), or public in development
 */
router.get('/:id',
  // In development, allow unauthenticated access for demo purposes
  process.env.NODE_ENV === 'production' ? authenticateToken : (req: any, res: any, next: any) => {
    req.user = req.user || { id: 'demo', role: 'admin' };
    next();
  },
  param('id').isUUID().withMessage('Patient ID must be a valid UUID'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const patientId = req.params.id;
      const user = req.user;

      // Check if user can access this patient
      if (user.role === 'patient') {
        // Patients can only access their own record
        const patient = await SimplePatientService.getPatientById(patientId);
        if (!patient || patient.userId !== user.id) {
          return res.status(403).json({
            error: 'Access denied'
          });
        }
      } else if (!['admin', 'doctor', 'nurse'].includes(user.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions'
        });
      }

      console.log(`[Patients] Looking up patient with ID: ${patientId}`);
      const patient = await SimplePatientService.getPatientById(patientId);
      console.log(`[Patients] Patient lookup result:`, patient ? 'Found' : 'Not found');

      if (!patient) {
        console.log(`[Patients] Patient ${patientId} not found`);
        return res.status(404).json({
          error: 'Patient not found',
          patientId: patientId
        });
      }

      res.json({
        success: true,
        data: patient
      });
    } catch (error: any) {
      console.error('Error fetching patient:', error);
      res.status(500).json({
        error: 'Failed to fetch patient',
        details: error.message
      });
    }
  }
);

/**
 * @route PUT /api/patients/:id
 * @desc Update patient
 * @access Admin, Doctor, Nurse, Patient (own record, limited fields)
 */
router.put('/:id',
  authenticateToken,
  updatePatientValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const patientId = req.params.id;
      const user = req.user;

      // Check if user can update this patient
      if (user.role === 'patient') {
        // Patients can only update their own record and limited fields
        const patient = await SimplePatientService.getPatientById(patientId);
        if (!patient || patient.userId !== user.id) {
          return res.status(403).json({
            error: 'Access denied'
          });
        }

        // Restrict fields that patients can update
        const allowedFields = ['phone', 'address', 'city', 'state', 'zipCode', 'emergencyContacts'];
        const restrictedFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
        
        if (restrictedFields.length > 0) {
          return res.status(403).json({
            error: 'Patients can only update: ' + allowedFields.join(', '),
            restrictedFields
          });
        }
      } else if (!['admin', 'doctor', 'nurse'].includes(user.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions'
        });
      }

      const updateData: UpdatePatientRequest = req.body;
      const updatedPatient = await SimplePatientService.updatePatient(patientId, updateData, user.id);

      if (!updatedPatient) {
        return res.status(404).json({
          error: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: updatedPatient,
        message: 'Patient updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating patient:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          error: 'Email already exists',
          field: 'email'
        });
      }

      res.status(500).json({
        error: 'Failed to update patient',
        details: error.message
      });
    }
  }
);

/**
 * @route DELETE /api/patients/:id
 * @desc Archive patient (soft delete)
 * @access Admin, Doctor
 */
router.delete('/:id',
  authenticateToken,
  requireRole(['admin', 'doctor']),
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const patientId = req.params.id;
      const success = await SimplePatientService.archivePatient(patientId, req.user.id);

      if (!success) {
        return res.status(404).json({
          error: 'Patient not found or already archived'
        });
      }

      res.json({
        success: true,
        message: 'Patient archived successfully'
      });
    } catch (error: any) {
      console.error('Error archiving patient:', error);
      res.status(500).json({
        error: 'Failed to archive patient',
        details: error.message
      });
    }
  }
);

/**
 * @route GET /api/patients/:id/appointments
 * @desc Get patient appointments
 * @access Admin, Doctor, Nurse, Patient (own record), or public in development
 */
router.get('/:id/appointments',
  // In development, allow unauthenticated access for demo purposes
  process.env.NODE_ENV === 'production' ? authenticateToken : (req: any, res: any, next: any) => {
    req.user = req.user || { id: 'demo', role: 'admin' };
    next();
  },
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const patientId = req.params.id;
      const user = req.user;

      // Check authorization (same logic as getting patient)
      if (user.role === 'patient') {
        const patient = await SimplePatientService.getPatientById(patientId);
        if (!patient || patient.userId !== user.id) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else if (!['admin', 'doctor', 'nurse'].includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Get patient to validate existence and get user_id
      console.log(`[Appointments] Looking up patient with ID: ${patientId}`);
      const patient = await SimplePatientService.getPatientById(patientId);
      console.log(`[Appointments] Patient lookup result:`, patient ? 'Found' : 'Not found');

      if (!patient) {
        console.log(`[Appointments] Patient ${patientId} not found for appointments`);
        return res.status(404).json({
          error: 'Patient not found',
          patientId: patientId
        });
      }

      // Check if this is a mock intake patient and return mock appointments
      if (patient.id && patient.id.startsWith('550e8400-e29b-41d4-a716')) {
        const mockAppointments = [
          {
            id: `appt-${patientId}-1`,
            patientId: patientId,
            providerId: 'provider-1',
            providerName: 'Dr. Sarah Wilson',
            appointmentDate: '2024-02-20T10:00:00Z',
            appointmentType: 'Follow-up',
            status: 'scheduled',
            duration: 30,
            notes: 'Regular check-up appointment'
          },
          {
            id: `appt-${patientId}-2`,
            patientId: patientId,
            providerId: 'provider-2',
            providerName: 'Dr. Michael Johnson',
            appointmentDate: '2024-02-10T14:30:00Z',
            appointmentType: 'Initial Consultation',
            status: 'completed',
            duration: 60,
            notes: 'Initial patient consultation and assessment'
          }
        ];

        return res.json({
          data: mockAppointments,
          success: true
        });
      }

      // Fetch appointments from database for real patients
      const { database } = require('../utils/database');
      const result = await database.query(`
        SELECT
          a.*,
          provider.first_name as provider_first_name,
          provider.last_name as provider_last_name
        FROM appointments a
        LEFT JOIN users provider ON a.provider_id = provider.id
        WHERE a.patient_id = $1
        ORDER BY a.appointment_date DESC
        LIMIT 50
      `, [patient.userId]);

      const appointments = result.rows.map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        providerId: row.provider_id,
        providerName: row.provider_first_name && row.provider_last_name
          ? `${row.provider_first_name} ${row.provider_last_name}`
          : null,
        appointmentDate: row.appointment_date,
        duration: row.duration,
        status: row.status,
        appointmentType: row.appointment_type,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.json({
        success: true,
        data: appointments
      });
    } catch (error: any) {
      console.error('Error fetching patient appointments:', error);
      res.status(500).json({
        error: 'Failed to fetch appointments',
        details: error.message
      });
    }
  }
);

/**
 * @route GET /api/patients/:id/vitals
 * @desc Get patient vital signs
 * @access Admin, Doctor, Nurse, Patient (own record), or public in development
 */
router.get('/:id/vitals',
  // In development, allow unauthenticated access for demo purposes
  process.env.NODE_ENV === 'production' ? authenticateToken : (req: any, res: any, next: any) => {
    req.user = req.user || { id: 'demo', role: 'admin' };
    next();
  },
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const patientId = req.params.id;
      const user = req.user;
      const { limit = 20, offset = 0 } = req.query;

      // Check authorization
      if (user.role === 'patient') {
        const patient = await SimplePatientService.getPatientById(patientId);
        if (!patient || patient.userId !== user.id) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else if (!['admin', 'doctor', 'nurse'].includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const patient = await SimplePatientService.getPatientById(patientId);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Check if this is a mock intake patient and return mock vitals
      if (patient.id && patient.id.startsWith('550e8400-e29b-41d4-a716')) {
        const mockVitals = [
          {
            id: `vital-${patientId}-1`,
            patientId: patientId,
            recordedAt: '2024-02-15T08:30:00Z',
            bloodPressureSystolic: 120,
            bloodPressureDiastolic: 80,
            heartRate: 72,
            temperature: 98.6,
            respiratoryRate: 16,
            oxygenSaturation: 99,
            weight: 150,
            height: 68,
            bmi: 22.8,
            recordedBy: 'Nurse Williams'
          },
          {
            id: `vital-${patientId}-2`,
            patientId: patientId,
            recordedAt: '2024-02-10T09:15:00Z',
            bloodPressureSystolic: 118,
            bloodPressureDiastolic: 78,
            heartRate: 75,
            temperature: 98.4,
            respiratoryRate: 18,
            oxygenSaturation: 98,
            weight: 152,
            height: 68,
            bmi: 23.1,
            recordedBy: 'Dr. Johnson'
          }
        ];

        return res.json({
          data: mockVitals,
          success: true
        });
      }

      const { database } = require('../utils/database');
      const result = await database.query(`
        SELECT *
        FROM vital_signs
        WHERE patient_id = $1
        ORDER BY reading_date DESC
        LIMIT $2 OFFSET $3
      `, [patient.userId, limit, offset]);

      const vitals = result.rows.map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        readingDate: row.reading_date,
        vitalSignsData: JSON.parse(row.vital_signs_data || '{}'),
        recordedBy: row.recorded_by,
        notes: row.notes,
        createdAt: row.created_at
      }));

      res.json({
        success: true,
        data: vitals
      });
    } catch (error: any) {
      console.error('Error fetching patient vitals:', error);
      res.status(500).json({
        error: 'Failed to fetch vital signs',
        details: error.message
      });
    }
  }
);

export default router;
