/**
 * Medications Service - Medication management and interactions
 *
 * Endpoints (match MSW handlers):
 * - GET /medications
 * - POST /medications
 * - PUT /medications/:id
 * - DELETE /medications/:id
 * - GET /medications/interactions
 * - GET /medications/search
 * - GET /medications/reminders
 * - GET /medications/error (500)
 */

import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
const config = {
  port: parseInt(process.env.PORT || "3005"),
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development",
};

const server: FastifyInstance = Fastify({
  logger: { level: config.nodeEnv === "production" ? "info" : "debug" },
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
}

// List medications
server.get("/medications", async (request, reply) => {
  const url = new URL(request.url, "http://local");
  if (chaos(reply, Object.fromEntries(url.searchParams))) return;
  reply.send({ items: [] });
});

// Create medication
server.post("/medications", async (_request, reply) => {
  reply.status(201).send({ id: "m1" });
});

// Update medication
server.put("/medications/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  reply.send({ id, status: "updated" });
});

// Delete medication
server.delete("/medications/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  reply.send({ id, status: "deleted" });
});

// Interactions
server.get("/medications/interactions", async (request, reply) => {
  const url = new URL(request.url, "http://local");
  if (chaos(reply, Object.fromEntries(url.searchParams))) return;
  const a = (url.searchParams.get("drugA") || "").toLowerCase();
  const b = (url.searchParams.get("drugB") || "").toLowerCase();
  if (
    (a === "lipitor" && b === "warfarin") ||
    (a === "warfarin" && b === "lipitor")
  ) {
    reply.send({
      interactions: [
        { pair: [a, b], severity: "major", note: "Monitor INR closely" },
      ],
    });
    return;
  }
  reply.send({ interactions: [] });
});

// Search
server.get("/medications/search", async (request, reply) => {
  const url = new URL(request.url, "http://local");
  const q = (url.searchParams.get("q") || "").toLowerCase();
  if (q.includes("lipitor")) {
    reply.send({
      items: [{ id: "lipitor", name: "Lipitor", generic: "atorvastatin" }],
      q,
    });
    return;
  }
  reply.send({ items: [], q });
});

// Reminders
server.get("/medications/reminders", async (_request, reply) => {
  reply.send({ reminders: [] });
});

// Error test
server.get("/medications/error", async (_request, reply) => {
  reply.status(500).send({ message: "Medication error" });
});

// Health
server.get("/health", async () => ({
  status: "healthy",
  service: "medications",
  timestamp: new Date().toISOString(),
}));

async function start() {
  await registerPlugins();
  await server.listen({ port: config.port, host: config.host });
  server.log.info(
    `💊 Medications service running on http://${config.host}:${config.port}`,
  );
}

if (require.main === module) {
  start().catch((e) => {
    server.log.fatal(e);
    process.exit(1);
  });
}

export { server, start };
