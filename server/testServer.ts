import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import patientRoutes from "./routes/patients";
import { requestLogger } from "./middleware/requestLogger";
import { logger } from "./utils/logger";
import { featureFlagsMiddleware } from "./middleware/featureFlags";

export async function createAuthTestServer() {
  const app = express();

  logger.info("test-server.starting", { featureSet: "auth-only" });

  app.use(requestLogger);
  app.use(featureFlagsMiddleware);
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    }),
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      error: "Too many requests from this IP",
      code: "RATE_LIMIT_EXCEEDED",
    },
  });
  app.use("/api/", limiter);

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.get("/api/ping", (_req, res) => {
    res.json({ message: "auth-test" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/patients", patientRoutes);

  return app;
}
