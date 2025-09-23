/**
 * eRx Service - Electronic prescribing endpoints
 *
 * Endpoints:
 * - POST /erx/prescriptions
 * - GET /erx/prescriptions/:id
 * - POST /erx/prescriptions/:id/cancel
 * - POST /erx/prescriptions/:id/refill
 * - POST /erx/epcs/verify
 * - GET /erx/history/:patientId
 */

import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

const config = {
  port: parseInt(process.env.PORT || "3011"),
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development",
};

const server: FastifyInstance = Fastify({
  logger: {
    level: config.nodeEnv === "production" ? "info" : "debug",
  },
  trustProxy: true,
  requestIdHeader: "x-request-id",
});

async function registerPlugins() {
  await server.register(cors, { origin: true, credentials: true });
  await server.register(helmet, { contentSecurityPolicy: false });
}

// Create prescription
server.post("/erx/prescriptions", async (request, reply) => {
  const body = (request.body as any) || {};
  if (!body.patientId || !body.medication) {
    reply
      .status(400)
      .send({ success: false, error: "patientId and medication are required" });
    return;
  }
  const id = `rx_${Date.now()}`;
  reply.status(201).send({
    success: true,
    data: {
      id,
      status: "queued",
      intent: "order",
      subject: { reference: `Patient/${body.patientId}` },
      medicationCodeableConcept: body.medication,
      authoredOn: new Date().toISOString(),
      requester: {
        reference: `Practitioner/${body.requestedByUserId || "current"}`,
      },
      dosageInstruction: body.dosageInstruction ? [body.dosageInstruction] : [],
      externalId: `ext_${Date.now()}`,
    },
  });
});

// Get prescription
server.get("/erx/prescriptions/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  reply.send({ success: true, data: { id, status: "sent" } });
});

// Cancel prescription
server.post("/erx/prescriptions/:id/cancel", async (request, reply) => {
  const { id } = request.params as { id: string };
  reply.send({ success: true, data: { id, status: "stopped" } });
});

// Refill prescription
server.post("/erx/prescriptions/:id/refill", async (request, reply) => {
  const { id } = request.params as { id: string };
  reply.send({ success: true, data: { id, refillRequested: true } });
});

// EPCS verify
server.post("/erx/epcs/verify", async (request, reply) => {
  const body = (request.body as any) || {};
  if (!body.otp) {
    reply.status(400).send({ success: false, error: "otp is required" });
    return;
  }
  reply.send({ success: true, data: { verified: true } });
});

// Medication history
server.get("/erx/history/:patientId", async (request, reply) => {
  const { patientId } = request.params as { patientId: string };
  reply.send({
    success: true,
    data: [
      {
        id: `rx_${Date.now() - 10000}`,
        status: "completed",
        subject: { reference: `Patient/${patientId}` },
        authoredOn: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  });
});

// Health
server.get("/health", async () => ({
  status: "healthy",
  service: "erx",
  timestamp: new Date().toISOString(),
}));

async function start() {
  await registerPlugins();
  await server.listen({ port: config.port, host: config.host });
  server.log.info(
    `📝 eRx service running on http://${config.host}:${config.port}`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch((e) => {
    server.log.fatal(e);
    process.exit(1);
  });
}

export { server, start };
