/**
 * Labs Service - Lab analysis and results
 *
 * Endpoints (match MSW handlers):
 * - GET /labs/results
 * - POST /labs/analyze
 * - POST /analyze-lab (legacy)
 * - GET /labs/analysis?id=...
 * - POST /labs/upload
 * - GET /labs/trends
 * - GET /labs/error (500)
 */

import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
// Optional multipart plugin during tests
let multipart: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  multipart = require("@fastify/multipart");
} catch {}

const config = {
  port: parseInt(process.env.PORT || "3004"),
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development",
};

const server: FastifyInstance = Fastify({
  logger:
    config.nodeEnv === "test"
      ? false
      : { level: config.nodeEnv === "production" ? "info" : "debug" },
  trustProxy: true,
  requestIdHeader: "x-request-id",
});

function chaos(reply: FastifyReply, query: any): boolean {
  if (query?.chaos === "1") {
    const status = Math.random() < 0.5 ? 500 : 401;
    reply.status(status).send({ message: "chaos" });
    return true;
  }
  return false;
}

async function registerPlugins() {
  await server.register(cors, { origin: true, credentials: true });
  await server.register(helmet, { contentSecurityPolicy: false });
  if (multipart) {
    await server.register(multipart);
  } else {
    server.log.warn("@fastify/multipart not installed; skipping file upload plugin");
  }
}

// Results
server.get("/labs/results", async (request, reply) => {
  const url = new URL(request.url, "http://local");
  if (chaos(reply, Object.fromEntries(url.searchParams))) return;
  reply.send({ results: [] });
});

// Analyze (multipart not strictly required by MSW here, but support it)
server.post("/labs/analyze", async (request, reply) => {
  const url = new URL(request.url, "http://local");
  if (chaos(reply, Object.fromEntries(url.searchParams))) return;
  // In real impl: store to S3 and enqueue analysis job
  reply.send({ analysisId: "a1", status: "ok" });
});

// Legacy analyze endpoint
server.post("/analyze-lab", async (request, reply) => {
  const url = new URL(request.url, "http://local");
  if (chaos(reply, Object.fromEntries(url.searchParams))) return;
  reply.send({ analysisId: "a1", status: "ok" });
});

// Analysis status
server.get("/labs/analysis", async (request, reply) => {
  const url = new URL(request.url, "http://local");
  const id = url.searchParams.get("id");
  reply.send({ id, status: "ready", findings: [] });
});

// Upload
server.post("/labs/upload", async (request, reply) => {
  const url = new URL(request.url, "http://local");
  if (chaos(reply, Object.fromEntries(url.searchParams))) return;
  reply.send({ id: "u1", status: "uploaded" });
});

// Trends
server.get("/labs/trends", async (request, reply) => {
  const url = new URL(request.url, "http://local");
  if (chaos(reply, Object.fromEntries(url.searchParams))) return;
  reply.send({ series: [] });
});

// Error test
server.get("/labs/error", async (_request, reply) => {
  reply.status(500).send({ message: "Lab error" });
});

// Health
server.get("/health", async () => ({
  status: "healthy",
  service: "labs",
  timestamp: new Date().toISOString(),
}));

async function start() {
  await registerPlugins();
  await server.listen({ port: config.port, host: config.host });
  server.log.info(
    `🧪 Labs service running on http://${config.host}:${config.port}`,
  );
}

if (require.main === module) {
  start().catch((e) => {
    server.log.fatal(e);
    process.exit(1);
  });
}

export { server, start };
