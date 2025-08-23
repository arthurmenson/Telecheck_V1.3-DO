import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
      code: 'VALIDATION_ERROR'
    });
  }
  next();
};

// Authentication validation rules
export const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('firstName').trim().isLength({ min: 1, max: 100 }),
  body('lastName').trim().isLength({ min: 1, max: 100 }),
  body('role').isIn(['patient', 'doctor', 'pharmacist', 'admin']),
  body('phone').optional().isMobilePhone(),
  handleValidationErrors
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors
];

export const validatePasswordReset = [
  body('email').isEmail().normalizeEmail(),
  handleValidationErrors
];

// User management validation rules
export const validateUpdateProfile = [
  body('firstName').optional().trim().isLength({ min: 1, max: 100 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 100 }),
  body('phone').optional().isMobilePhone(),
  handleValidationErrors
];

export const validateUserId = [
  param('id').isUUID(),
  handleValidationErrors
];

// Patient validation rules
export const validateCreatePatient = [
  body('dateOfBirth').isISO8601().toDate(),
  body('gender').isIn(['male', 'female', 'other']),
  body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('allergies').optional().isArray(),
  body('emergencyContacts').optional().isArray(),
  body('insuranceInfo').optional().isObject(),
  handleValidationErrors
];

// Lab validation rules
export const validateLabReport = [
  body('fileName').trim().isLength({ min: 1, max: 255 }),
  body('fileSize').isInt({ min: 1, max: 10485760 }), // 10MB max
  handleValidationErrors
];

// Medication validation rules
export const validateCreateMedication = [
  body('name').trim().isLength({ min: 1, max: 255 }),
  body('dosage').trim().isLength({ min: 1, max: 100 }),
  body('frequency').trim().isLength({ min: 1, max: 100 }),
  body('startDate').isISO8601().toDate(),
  body('endDate').optional().isISO8601().toDate(),
  body('prescribedBy').trim().isLength({ min: 1, max: 255 }),
  body('instructions').optional().trim(),
  body('sideEffects').optional().isArray(),
  body('interactions').optional().isArray(),
  handleValidationErrors
];

// Appointment validation rules
export const validateCreateAppointment = [
  body('patientId').isUUID(),
  body('providerId').isUUID(),
  body('dateTime').isISO8601().toDate(),
  body('duration').optional().isInt({ min: 15, max: 480 }), // 15 min to 8 hours
  body('type').isIn(['consultation', 'follow-up', 'emergency']),
  body('notes').optional().trim(),
  handleValidationErrors
];

export const validateAppointmentId = [
  param('id').isUUID(),
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors
];

// Search validation
export const validateSearch = [
  query('q').optional().trim().isLength({ min: 1, max: 100 }),
  handleValidationErrors
];
