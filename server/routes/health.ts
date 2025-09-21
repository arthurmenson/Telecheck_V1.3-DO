import { Router } from "express";
import { healthCheck, getDatabaseInfo } from "../config/database";

const router = Router();

// Basic health check endpoint
router.get("/health", async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    const dbInfo = getDatabaseInfo();

    const response = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: {
        ...dbHealth,
        ...dbInfo,
      },
      version: process.env.npm_package_version || "1.0.0",
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Detailed system info (for debugging)
router.get("/health/detailed", async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    const dbInfo = getDatabaseInfo();

    const response = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        port: process.env.PORT || 8080,
        hasRedis: !!process.env.REDIS_URL,
        hasPostgres: !!(process.env.DATABASE_URL || process.env.DB_HOST),
        hasTelnyx: !!process.env.TELNYX_API_KEY,
        hasTwilio: !!(
          process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
        ),
      },
      database: {
        ...dbHealth,
        ...dbInfo,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

export default router;
