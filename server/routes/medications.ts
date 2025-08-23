import { Router, Request, Response } from 'express';
import { dbPool } from '../config/database';
import { 
  validateCreateMedication,
  validateUserId,
  validatePagination
} from '../middleware/validation';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get medications for user
router.get('/:userId?', authenticateToken, validatePagination, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.userId || req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Check if user has permission to access this data
    if (req.user!.role !== 'admin' && req.user!.id !== userId) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const query = `
      SELECT id, user_id, name, dosage, frequency, start_date, end_date, 
             prescribed_by, instructions, side_effects, interactions, is_active, 
             created_at, updated_at
      FROM medications 
      WHERE user_id = $1 AND is_active = true
      ORDER BY start_date DESC 
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) 
      FROM medications 
      WHERE user_id = $1 AND is_active = true
    `;

    const [medicationsResult, countResult] = await Promise.all([
      dbPool.query(query, [userId, limit, offset]),
      dbPool.query(countQuery, [userId])
    ]);

    const totalMedications = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalMedications / limit);

    res.json({
      medications: medicationsResult.rows.map(medication => ({
        id: medication.id,
        userId: medication.user_id,
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        startDate: medication.start_date,
        endDate: medication.end_date,
        prescribedBy: medication.prescribed_by,
        instructions: medication.instructions,
        sideEffects: medication.side_effects || [],
        interactions: medication.interactions || [],
        isActive: medication.is_active,
        createdAt: medication.created_at,
        updatedAt: medication.updated_at
      })),
      pagination: {
        page,
        limit,
        totalMedications,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    });
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Get medication by ID
router.get('/medication/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const medicationId = req.params.id;

    const result = await dbPool.query(
      `SELECT id, user_id, name, dosage, frequency, start_date, end_date, 
              prescribed_by, instructions, side_effects, interactions, is_active, 
              created_at, updated_at
       FROM medications WHERE id = $1`,
      [medicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Medication not found',
        code: 'MEDICATION_NOT_FOUND'
      });
    }

    const medication = result.rows[0];

    // Check if user has permission to access this medication
    if (req.user!.role !== 'admin' && req.user!.id !== medication.user_id) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    res.json({
      medication: {
        id: medication.id,
        userId: medication.user_id,
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        startDate: medication.start_date,
        endDate: medication.end_date,
        prescribedBy: medication.prescribed_by,
        instructions: medication.instructions,
        sideEffects: medication.side_effects || [],
        interactions: medication.interactions || [],
        isActive: medication.is_active,
        createdAt: medication.created_at,
        updatedAt: medication.updated_at
      }
    });
  } catch (error) {
    console.error('Get medication error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Add medication
router.post('/', authenticateToken, validateCreateMedication, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, dosage, frequency, startDate, endDate, prescribedBy, instructions, sideEffects, interactions } = req.body;

    // Check for drug interactions with existing medications
    const existingMedications = await dbPool.query(
      'SELECT name FROM medications WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    const interactionWarnings = [];
    if (existingMedications.rows.length > 0) {
      // Simulate drug interaction checking
      const existingDrugs = existingMedications.rows.map(m => m.name.toLowerCase());
      const newDrug = name.toLowerCase();

      // Simple interaction check (in real implementation, use a drug database)
      if (existingDrugs.includes('warfarin') && newDrug.includes('aspirin')) {
        interactionWarnings.push('Potential interaction: Warfarin and Aspirin may increase bleeding risk');
      }
      if (existingDrugs.includes('simvastatin') && newDrug.includes('amiodarone')) {
        interactionWarnings.push('Potential interaction: Simvastatin and Amiodarone may increase muscle damage risk');
      }
    }

    // Create medication record
    const result = await dbPool.query(
      `INSERT INTO medications (user_id, name, dosage, frequency, start_date, end_date, 
                               prescribed_by, instructions, side_effects, interactions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, user_id, name, dosage, frequency, start_date, end_date, 
                 prescribed_by, instructions, side_effects, interactions, created_at`,
      [userId, name, dosage, frequency, startDate, endDate, prescribedBy, instructions, sideEffects || [], interactions || []]
    );

    const medication = result.rows[0];

    res.status(201).json({
      message: 'Medication added successfully',
      medication: {
        id: medication.id,
        userId: medication.user_id,
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        startDate: medication.start_date,
        endDate: medication.end_date,
        prescribedBy: medication.prescribed_by,
        instructions: medication.instructions,
        sideEffects: medication.side_effects || [],
        interactions: medication.interactions || [],
        createdAt: medication.created_at
      },
      warnings: interactionWarnings
    });
  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Update medication
router.put('/:id', authenticateToken, validateCreateMedication, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const medicationId = req.params.id;
    const { name, dosage, frequency, startDate, endDate, prescribedBy, instructions, sideEffects, interactions } = req.body;

    // Check if medication exists and user has access
    const existingMedication = await dbPool.query(
      'SELECT user_id FROM medications WHERE id = $1',
      [medicationId]
    );

    if (existingMedication.rows.length === 0) {
      return res.status(404).json({
        error: 'Medication not found',
        code: 'MEDICATION_NOT_FOUND'
      });
    }

    const medication = existingMedication.rows[0];

    // Check if user has permission
    if (req.user!.role !== 'admin' && req.user!.id !== medication.user_id) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Update medication
    const result = await dbPool.query(
      `UPDATE medications 
       SET name = COALESCE($1, name),
           dosage = COALESCE($2, dosage),
           frequency = COALESCE($3, frequency),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date),
           prescribed_by = COALESCE($6, prescribed_by),
           instructions = COALESCE($7, instructions),
           side_effects = COALESCE($8, side_effects),
           interactions = COALESCE($9, interactions),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING id, user_id, name, dosage, frequency, start_date, end_date, 
                 prescribed_by, instructions, side_effects, interactions, updated_at`,
      [name, dosage, frequency, startDate, endDate, prescribedBy, instructions, sideEffects, interactions, medicationId]
    );

    const updatedMedication = result.rows[0];

    res.json({
      message: 'Medication updated successfully',
      medication: {
        id: updatedMedication.id,
        userId: updatedMedication.user_id,
        name: updatedMedication.name,
        dosage: updatedMedication.dosage,
        frequency: updatedMedication.frequency,
        startDate: updatedMedication.start_date,
        endDate: updatedMedication.end_date,
        prescribedBy: updatedMedication.prescribed_by,
        instructions: updatedMedication.instructions,
        sideEffects: updatedMedication.side_effects || [],
        interactions: updatedMedication.interactions || [],
        updatedAt: updatedMedication.updated_at
      }
    });
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Delete medication (soft delete)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const medicationId = req.params.id;

    // Check if medication exists and user has access
    const existingMedication = await dbPool.query(
      'SELECT user_id FROM medications WHERE id = $1',
      [medicationId]
    );

    if (existingMedication.rows.length === 0) {
      return res.status(404).json({
        error: 'Medication not found',
        code: 'MEDICATION_NOT_FOUND'
      });
    }

    const medication = existingMedication.rows[0];

    // Check if user has permission
    if (req.user!.role !== 'admin' && req.user!.id !== medication.user_id) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Soft delete - set is_active to false
    await dbPool.query(
      'UPDATE medications SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [medicationId]
    );

    res.json({
      message: 'Medication deactivated successfully'
    });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Check drug interactions
router.get('/interactions/:userId?', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.userId || req.user!.id;

    // Check if user has permission to access this data
    if (req.user!.role !== 'admin' && req.user!.id !== userId) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Get all active medications for the user
    const medications = await dbPool.query(
      'SELECT name, interactions FROM medications WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    if (medications.rows.length === 0) {
      return res.json({
        medications: [],
        interactions: [],
        riskLevel: 'low'
      });
    }

    // Analyze interactions
    const drugNames = medications.rows.map(m => m.name.toLowerCase());
    const interactions = [];
    let riskLevel = 'low';

    // Simulate interaction checking (in real implementation, use a comprehensive drug database)
    if (drugNames.includes('warfarin') && drugNames.includes('aspirin')) {
      interactions.push({
        drugs: ['Warfarin', 'Aspirin'],
        severity: 'high',
        description: 'Increased risk of bleeding',
        recommendation: 'Monitor closely and consider alternative medications'
      });
      riskLevel = 'high';
    }

    if (drugNames.includes('simvastatin') && drugNames.includes('amiodarone')) {
      interactions.push({
        drugs: ['Simvastatin', 'Amiodarone'],
        severity: 'moderate',
        description: 'Increased risk of muscle damage',
        recommendation: 'Monitor for muscle pain and weakness'
      });
      if (riskLevel !== 'high') riskLevel = 'moderate';
    }

    if (drugNames.includes('digoxin') && drugNames.includes('furosemide')) {
      interactions.push({
        drugs: ['Digoxin', 'Furosemide'],
        severity: 'moderate',
        description: 'Risk of digoxin toxicity',
        recommendation: 'Monitor digoxin levels regularly'
      });
      if (riskLevel !== 'high') riskLevel = 'moderate';
    }

    res.json({
      medications: medications.rows.map(med => ({
        name: med.name,
        interactions: med.interactions || []
      })),
      interactions,
      riskLevel,
      totalMedications: medications.rows.length
    });
  } catch (error) {
    console.error('Check interactions error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Get medication statistics
router.get('/stats/overview', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    let query = `
      SELECT 
        COUNT(*) as total_medications,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_medications,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_medications,
        COUNT(CASE WHEN end_date IS NOT NULL AND end_date < CURRENT_DATE THEN 1 END) as expired_medications,
        COUNT(CASE WHEN side_effects IS NOT NULL AND array_length(side_effects, 1) > 0 THEN 1 END) as medications_with_side_effects,
        COUNT(CASE WHEN interactions IS NOT NULL AND array_length(interactions, 1) > 0 THEN 1 END) as medications_with_interactions
      FROM medications
    `;

    let params: any[] = [];

    // If not admin, only show user's medications
    if (req.user!.role !== 'admin') {
      query += ' WHERE user_id = $1';
      params.push(userId);
    }

    const stats = await dbPool.query(query, params);
    const medicationStats = stats.rows[0];

    res.json({
      stats: {
        totalMedications: parseInt(medicationStats.total_medications),
        activeMedications: parseInt(medicationStats.active_medications),
        inactiveMedications: parseInt(medicationStats.inactive_medications),
        expiredMedications: parseInt(medicationStats.expired_medications),
        medicationsWithSideEffects: parseInt(medicationStats.medications_with_side_effects),
        medicationsWithInteractions: parseInt(medicationStats.medications_with_interactions)
      }
    });
  } catch (error) {
    console.error('Get medication stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;