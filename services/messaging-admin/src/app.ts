/**
 * Messaging Admin Service - Configuration, analytics, schedules, templates, care-team, audit logs, wellness-check
 * Base path (via gateway): /api/admin/messaging
 */

import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import pino from "pino";

const config = {
  port: parseInt(process.env.PORT || "3010"),
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development",
};

const logger = pino({
  level: config.nodeEnv === "production" ? "info" : "debug",
});
const server: FastifyInstance = Fastify({
  logger,
  trustProxy: true,
  requestIdHeader: "x-request-id",
});

async function registerPlugins() {
  await server.register(cors, { origin: true, credentials: true });
  await server.register(helmet, { contentSecurityPolicy: false });
}

// Config
server.get("/config", async () => ({
  success: true,
  config: {
    primaryProvider: "telnyx",
    enableSMS: true,
    enableVoice: true,
    enableScheduled: true,
    quietHoursStart: "21:00",
    quietHoursEnd: "07:00",
    maxRetries: 3,
    retryDelay: 1000,
    auditLogging: true,
    thresholds: {
      glucoseLow: 70,
      glucoseHigh: 180,
      bpSystolicHigh: 140,
      bpDiastolicHigh: 90,
      heartRateHigh: 120,
      heartRateLow: 50,
      temperatureHigh: 100.4,
      temperatureLow: 95,
      oxygenSatLow: 92,
    },
    careTeam: {
      enableAlerts: true,
      escalationTimeout: 30,
      maxEscalationLevels: 3,
    },
  },
}));

server.post("/config", async (request) => ({ success: true }));

// Test
server.post("/test", async (request) => ({
  success: true,
  result: { provider: "telnyx", type: "sms", delivered: true },
}));

// Analytics
server.get("/analytics", async (request) => ({
  success: true,
  analytics: {
    period:
      new URL(request.url, "http://local").searchParams.get("period") || "24h",
    overview: {
      totalMessages: 120,
      successfulMessages: 115,
      failedMessages: 5,
      successRate: "95.8%",
    },
    providerStats: [
      { provider: "telnyx", type: "sms", count: 100, success_rate: 0.96 },
      { provider: "twilio", type: "voice", count: 20, success_rate: 0.9 },
    ],
    scheduling: {
      totalActiveJobs: 42,
      messagesSentToday: 18,
      messagesFailedToday: 1,
      activePatients: 28,
    },
  },
}));

// Schedules
server.get("/schedules", async () => ({
  success: true,
  schedules: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
}));
server.post("/schedules/:id", async () => ({ success: true }));

// Templates
server.get("/templates", async () => ({ success: true, templates: [] }));
server.post("/templates/:id", async () => ({ success: true }));

// Care Team
server.get("/care-team", async () => ({
  success: true,
  careTeam: { members: [], escalationRules: [] },
}));
server.post("/care-team/:id", async () => ({ success: true }));

// Audit Logs
server.get("/audit-logs", async () => ({
  success: true,
  logs: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
}));

// Wellness Check
server.post("/wellness-check", async () => ({ success: true }));

// Health
server.get("/health", async () => ({
  status: "healthy",
  service: "messaging-admin",
  timestamp: new Date().toISOString(),
}));

async function start() {
  await registerPlugins();
  await server.listen({ port: config.port, host: config.host });
  server.log.info(
    `📣 Messaging Admin service running on http://${config.host}:${config.port}`,
  );
}

if (require.main === module) {
  start().catch((e) => {
    server.log.fatal(e);
    process.exit(1);
  });
}

export { server, start };
