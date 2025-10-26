import { Router, Request, Response } from "express";
import { dbPool } from "../config/database";
import {
  validateLabReport,
  validateUserId,
  validatePagination,
} from "../middleware/validation";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const isDbConfigured = !!dbPool;
const passthroughAuth: any = (
  _req: AuthenticatedRequest,
  _res: Response,
  next: any,
) => {
  _req.user =
    _req.user ||
    ({
      id: "demo-user",
      email: "demo@example.com",
      role: "doctor",
      permissions: [],
    } as any);
  next();
};

const requireAuth = isDbConfigured ? authenticateToken : passthroughAuth;

const mockLabResults: any[] = [
  {
    id: "lab-1",
    test: "Glucose",
    value: 95,
    unit: "mg/dL",
    status: "normal",
    interpretation: "Within expected range",
    date: new Date().toISOString().slice(0, 10),
  },
];
import multer from "multer";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, JPEG, and PNG files are allowed.",
        ),
      );
    }
  },
});

// Get lab reports for user
router.get(
  "/reports/:userId?",
  requireAuth,
  validatePagination,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isDbConfigured) {
        return res.json({
          reports: [],
          pagination: {
            page: 1,
            limit: 0,
            totalReports: 0,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
        });
      }

      const userId = req.params.userId || req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      // Check if user has permission to access this data
      if (req.user!.role !== "admin" && req.user!.id !== userId) {
        return res.status(403).json({
          error: "Insufficient permissions",
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }

      const query = `
      SELECT id, user_id, file_name, file_size, file_url, upload_date, 
             analysis_status, ai_summary, confidence, created_at, updated_at
      FROM lab_reports 
      WHERE user_id = $1
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;

      const countQuery = `
      SELECT COUNT(*) 
      FROM lab_reports 
      WHERE user_id = $1
    `;

      const [reportsResult, countResult] = await Promise.all([
        dbPool.query(query, [userId, limit, offset]),
        dbPool.query(countQuery, [userId]),
      ]);

      const totalReports = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalReports / limit);

      res.json({
        reports: reportsResult.rows.map((report) => ({
          id: report.id,
          userId: report.user_id,
          fileName: report.file_name,
          fileSize: report.file_size,
          fileUrl: report.file_url,
          uploadDate: report.upload_date,
          analysisStatus: report.analysis_status,
          aiSummary: report.ai_summary,
          confidence: report.confidence,
          createdAt: report.created_at,
          updatedAt: report.updated_at,
        })),
        pagination: {
          page,
          limit,
          totalReports,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      });
    } catch (error) {
      console.error("Get lab reports error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Get lab report by ID
router.get(
  "/reports/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isDbConfigured) {
        return res.json({ results: mockLabResults });
      }

      const reportId = req.params.id;

      const result = await dbPool!.query(
        `SELECT id, user_id, file_name, file_size, file_url, upload_date, 
              analysis_status, ai_summary, confidence, created_at, updated_at
       FROM lab_reports WHERE id = $1`,
        [reportId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Lab report not found",
          code: "REPORT_NOT_FOUND",
        });
      }

      const report = result.rows[0];

      // Check if user has permission to access this report
      if (req.user!.role !== "admin" && req.user!.id !== report.user_id) {
        return res.status(403).json({
          error: "Insufficient permissions",
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }

      res.json({
        report: {
          id: report.id,
          userId: report.user_id,
          fileName: report.file_name,
          fileSize: report.file_size,
          fileUrl: report.file_url,
          uploadDate: report.upload_date,
          analysisStatus: report.analysis_status,
          aiSummary: report.ai_summary,
          confidence: report.confidence,
          createdAt: report.created_at,
          updatedAt: report.updated_at,
        },
      });
    } catch (error) {
      console.error("Get lab report error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Upload and analyze lab report
router.post(
  "/upload",
  requireAuth,
  upload.single("labReport"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          error: "No file uploaded",
          code: "NO_FILE",
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.originalname}`;

      // In a real implementation, you would upload to cloud storage (S3, etc.)
      // For now, we'll simulate file storage
      const fileUrl = `/uploads/${fileName}`;

      // Create lab report record
      const result = await dbPool.query(
        `INSERT INTO lab_reports (user_id, file_name, file_size, file_url, analysis_status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id, user_id, file_name, file_size, file_url, analysis_status, created_at`,
        [userId, file.originalname, file.size, fileUrl],
      );

      const report = result.rows[0];

      // Start AI analysis in background (simulated)
      setTimeout(async () => {
        try {
          // Simulate AI analysis
          const aiSummary = `AI analysis of ${file.originalname} completed. This appears to be a standard lab report with normal ranges.`;
          const confidence = 0.85;

          await dbPool.query(
            `UPDATE lab_reports 
           SET analysis_status = 'completed', ai_summary = $1, confidence = $2, updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
            [aiSummary, confidence, report.id],
          );
        } catch (error) {
          console.error("AI analysis error:", error);
          await dbPool.query(
            `UPDATE lab_reports 
           SET analysis_status = 'failed', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
            [report.id],
          );
        }
      }, 5000); // Simulate 5-second processing time

      res.status(201).json({
        message: "Lab report uploaded successfully. Analysis in progress.",
        report: {
          id: report.id,
          userId: report.user_id,
          fileName: report.file_name,
          fileSize: report.file_size,
          fileUrl: report.file_url,
          analysisStatus: report.analysis_status,
          createdAt: report.created_at,
        },
      });
    } catch (error) {
      console.error("Upload lab report error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Get lab results for a specific report
router.get(
  "/results/:reportId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const reportId = req.params.reportId;

      // First check if report exists and user has access
      const reportResult = await dbPool.query(
        "SELECT id, user_id FROM lab_reports WHERE id = $1",
        [reportId],
      );

      if (reportResult.rows.length === 0) {
        return res.status(404).json({
          error: "Lab report not found",
          code: "REPORT_NOT_FOUND",
        });
      }

      const report = reportResult.rows[0];

      // Check if user has permission to access this report
      if (req.user!.role !== "admin" && req.user!.id !== report.user_id) {
        return res.status(403).json({
          error: "Insufficient permissions",
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }

      // Get lab results
      const results = await dbPool!.query(
        `SELECT id, lab_report_id, test_name, value, unit, reference_range, 
              status, test_date, lab_name, doctor_notes, created_at
       FROM lab_results 
       WHERE lab_report_id = $1
       ORDER BY test_name`,
        [reportId],
      );

      res.json({
        results: results.rows.map((result) => ({
          id: result.id,
          labReportId: result.lab_report_id,
          testName: result.test_name,
          value: result.value,
          unit: result.unit,
          referenceRange: result.reference_range,
          status: result.status,
          testDate: result.test_date,
          labName: result.lab_name,
          doctorNotes: result.doctor_notes,
          createdAt: result.created_at,
        })),
      });
    } catch (error) {
      console.error("Get lab results error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Add lab results manually
router.post(
  "/results",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isDbConfigured) {
        const mockResult = {
          id: `lab-${Date.now()}`,
          ...req.body,
        };
        mockLabResults.push(mockResult);
        return res.status(201).json({
          message: "Lab result recorded (mock)",
          result: mockResult,
        });
      }

      const {
        labReportId,
        testName,
        value,
        unit,
        referenceRange,
        status,
        testDate,
        labName,
        doctorNotes,
      } = req.body;

      // Validate required fields
      if (
        !labReportId ||
        !testName ||
        !value ||
        !unit ||
        !referenceRange ||
        !status
      ) {
        return res.status(400).json({
          error: "Missing required fields",
          code: "MISSING_FIELDS",
        });
      }

      // Check if report exists and user has access
      const reportResult = await dbPool.query(
        "SELECT user_id FROM lab_reports WHERE id = $1",
        [labReportId],
      );

      if (reportResult.rows.length === 0) {
        return res.status(404).json({
          error: "Lab report not found",
          code: "REPORT_NOT_FOUND",
        });
      }

      const report = reportResult.rows[0];

      // Check if user has permission
      if (req.user!.role !== "admin" && req.user!.id !== report.user_id) {
        return res.status(403).json({
          error: "Insufficient permissions",
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }

      // Add lab result
      const result = await dbPool.query(
        `INSERT INTO lab_results (lab_report_id, test_name, value, unit, reference_range, status, test_date, lab_name, doctor_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, lab_report_id, test_name, value, unit, reference_range, status, test_date, lab_name, doctor_notes, created_at`,
        [
          labReportId,
          testName,
          value,
          unit,
          referenceRange,
          status,
          testDate,
          labName,
          doctorNotes,
        ],
      );

      const labResult = result.rows[0];

      res.status(201).json({
        message: "Lab result added successfully",
        result: {
          id: labResult.id,
          labReportId: labResult.lab_report_id,
          testName: labResult.test_name,
          value: labResult.value,
          unit: labResult.unit,
          referenceRange: labResult.reference_range,
          status: labResult.status,
          testDate: labResult.test_date,
          labName: labResult.lab_name,
          doctorNotes: labResult.doctor_notes,
          createdAt: labResult.created_at,
        },
      });
    } catch (error) {
      console.error("Add lab result error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Delete lab report
router.delete(
  "/reports/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const reportId = req.params.id;

      // Check if report exists and user has access
      const reportResult = await dbPool.query(
        "SELECT user_id FROM lab_reports WHERE id = $1",
        [reportId],
      );

      if (reportResult.rows.length === 0) {
        return res.status(404).json({
          error: "Lab report not found",
          code: "REPORT_NOT_FOUND",
        });
      }

      const report = reportResult.rows[0];

      // Check if user has permission
      if (req.user!.role !== "admin" && req.user!.id !== report.user_id) {
        return res.status(403).json({
          error: "Insufficient permissions",
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }

      // Delete lab results first (due to foreign key constraint)
      await dbPool.query("DELETE FROM lab_results WHERE lab_report_id = $1", [
        reportId,
      ]);

      // Delete lab report
      await dbPool.query("DELETE FROM lab_reports WHERE id = $1", [reportId]);

      res.json({
        message: "Lab report deleted successfully",
      });
    } catch (error) {
      console.error("Delete lab report error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Get lab analysis statistics
router.get(
  "/stats/overview",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      let query = `
      SELECT
        COUNT(*) as total_reports,
        COUNT(CASE WHEN analysis_status = 'completed' THEN 1 END) as completed_reports,
        COUNT(CASE WHEN analysis_status = 'pending' THEN 1 END) as pending_reports,
        COUNT(CASE WHEN analysis_status = 'processing' THEN 1 END) as processing_reports,
        COUNT(CASE WHEN analysis_status = 'failed' THEN 1 END) as failed_reports,
        AVG(confidence) as avg_confidence
      FROM lab_reports
    `;

      let params: any[] = [];

      // If not admin, only show user's reports
      if (req.user!.role !== "admin") {
        query += " WHERE user_id = $1";
        params.push(userId);
      }

      const stats = await dbPool.query(query, params);
      const reportStats = stats.rows[0];

      res.json({
        stats: {
          totalReports: parseInt(reportStats.total_reports),
          completedReports: parseInt(reportStats.completed_reports),
          pendingReports: parseInt(reportStats.pending_reports),
          processingReports: parseInt(reportStats.processing_reports),
          failedReports: parseInt(reportStats.failed_reports),
          averageConfidence: reportStats.avg_confidence
            ? parseFloat(reportStats.avg_confidence)
            : 0,
        },
      });
    } catch (error) {
      console.error("Get lab stats error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Get all lab results for a user (for dashboard display)
router.get(
  "/results",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isDbConfigured) {
        // Return mock data for non-configured database
        const mockResults = [
          {
            id: "lab-1",
            testName: "Total Cholesterol",
            value: "245",
            unit: "mg/dL",
            referenceRange: "< 200",
            status: "high",
            date: new Date().toISOString().split("T")[0],
            orderedBy: "Dr. Demo",
            trend: "up",
            flagged: true,
            priority: "medium",
          },
          {
            id: "lab-2",
            testName: "HDL",
            value: "38",
            unit: "mg/dL",
            referenceRange: "> 40",
            status: "low",
            date: new Date().toISOString().split("T")[0],
            orderedBy: "Dr. Demo",
            trend: "down",
            flagged: true,
            priority: "medium",
          },
          {
            id: "lab-3",
            testName: "Glucose",
            value: "110",
            unit: "mg/dL",
            referenceRange: "70-100",
            status: "borderline",
            date: new Date().toISOString().split("T")[0],
            orderedBy: "Dr. Demo",
            trend: "up",
            flagged: true,
            priority: "low",
          },
          {
            id: "lab-4",
            testName: "Vitamin D",
            value: "45",
            unit: "ng/mL",
            referenceRange: "30-100",
            status: "normal",
            date: new Date().toISOString().split("T")[0],
            orderedBy: "Dr. Demo",
            trend: "neutral",
            flagged: false,
            priority: "low",
          },
        ];
        return res.json({
          success: true,
          results: mockResults,
        });
      }

      const userId = (req.query.userId as string) || req.user!.id;

      // Check if user has permission to access this data
      if (req.user!.role !== "admin" && req.user!.id !== userId) {
        return res.status(403).json({
          error: "Insufficient permissions",
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }

      // Get all lab results across all reports for the user
      const query = `
        SELECT
          lr.id,
          lr.test_name,
          lr.value,
          lr.unit,
          lr.reference_range,
          lr.status,
          lr.test_date,
          lr.lab_name,
          lr.doctor_notes,
          lr.created_at
        FROM lab_results lr
        INNER JOIN lab_reports lrep ON lr.lab_report_id = lrep.id
        WHERE lrep.user_id = $1
        ORDER BY lr.test_date DESC, lr.created_at DESC
        LIMIT 50
      `;

      const result = await dbPool.query(query, [userId]);

      // Transform database results to match the dashboard interface
      const results = result.rows.map((row) => {
        const status = row.status.toLowerCase();
        const flagged = status === "high" || status === "low";
        const priority =
          status === "high" ? "high" : status === "low" ? "medium" : "low";

        // Determine trend (would ideally compare to previous values)
        const trend =
          status === "high" ? "up" : status === "low" ? "down" : "neutral";

        return {
          id: row.id,
          testName: row.test_name,
          value: row.value,
          unit: row.unit || "",
          referenceRange: row.reference_range || "",
          status: status,
          date: row.test_date
            ? new Date(row.test_date).toISOString().split("T")[0]
            : new Date(row.created_at).toISOString().split("T")[0],
          orderedBy: row.lab_name || "Unknown",
          trend: trend,
          flagged: flagged,
          priority: priority,
        };
      });

      res.json({
        success: true,
        results: results,
      });
    } catch (error) {
      console.error("Get all lab results error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

export default router;
