/**
 * Billing/EDI Service - Eligibility (270/271) and Claims (837/999/277CA/835)
 *
 * Endpoints:
 * - POST /eligibility/270           -> Build X12 270 from JSON
 * - GET  /eligibility/271/:id       -> Return parsed 271 for given request id
 * - POST /billing/837               -> JSON claim -> X12 837 (queue/export)
 * - POST /billing/ack/999           -> Receive 999 ACK
 * - POST /billing/status/277ca      -> Receive 277CA Claim Status
 * - POST /billing/835               -> Receive 835 ERA (parse)
 */

import Fastify, { FastifyInstance, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import pino from "pino";

const config = {
  port: parseInt(process.env.PORT || "3009"),
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

// Minimal 270 builder (stub)
function buildX12_270(req: any): string {
  const now = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return [
    "ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *" +
      now +
      "*1234*^*00501*000000905*0*T*:~",
    "GS*HS*SENDER*RECEIVER*" + now + "*1234*1*X*005010X279A1~",
    "ST*270*0001*005010X279A1~",
    "BHT*0022*13*REQ0001*" + now + "*1234~",
    "HL*1**20*1~",
    "NM1*PR*2*PAYER NAME*****PI*123456789~",
    "HL*2*1*21*1~",
    "NM1*1P*2*PROVIDER NAME*****XX*1234567893~",
    "HL*3*2*22*0~",
    "NM1*IL*1*" +
      (req?.subscriber?.lastName || "DOE") +
      "*" +
      (req?.subscriber?.firstName || "JOHN") +
      "****MI*" +
      (req?.subscriber?.memberId || "W000000000") +
      "~",
    "DMG*D8*" +
      (req?.subscriber?.dob?.replace(/-/g, "") || "19700101") +
      "*" +
      (req?.subscriber?.gender || "M") +
      "~",
    "DTP*291*D8*" + now + "~",
    "SE*10*0001~",
    "GE*1*1~",
    "IEA*1*000000905~",
  ].join("\n");
}

// Minimal 837 builder (stub)
function buildX12_837(claim: any): string {
  const now = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return [
    "ISA*00*          *00*          *ZZ*SUBMITTER      *ZZ*PAYER          *" +
      now +
      "*1234*^*00501*000000906*0*T*:~",
    "GS*HC*SUBMITTER*PAYER*" + now + "*1234*1*X*005010X222A1~",
    "ST*837*0001*005010X222A1~",
    "BHT*0019*00*" + (claim?.claimId || "CLM0001") + "*" + now + "*1234*CH~",
    "NM1*41*2*SUBMITTER*****46*SUBMITTERID~",
    "NM1*40*2*PAYER*****46*PAYERID~",
    "CLM*" + (claim?.claimId || "CLM0001") + "*100***11:B:1*Y*A*Y*Y~",
    "SE*7*0001~",
    "GE*1*1~",
    "IEA*1*000000906~",
  ].join("\n");
}

server.post("/eligibility/270", async (request, reply) => {
  const body = request.body as any;
  const id = "270_" + Date.now();
  const x12 = buildX12_270(body);
  reply.send({ id, status: "generated", x12Length: x12.length });
});

server.get("/eligibility/271/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  // Stub parsed 271
  reply.send({
    id,
    status: "active",
    coverage: { plan: "PPO", effective: "2024-01-01", copay: 20 },
  });
});

server.post("/billing/837", async (request, reply) => {
  const claim = request.body as any;
  const id = "837_" + Date.now();
  const x12 = buildX12_837(claim);
  // In real impl: store to S3 and enqueue to clearinghouse/SFTP/AS2
  reply.status(202).send({ id, status: "queued", x12Length: x12.length });
});

server.post("/billing/ack/999", async (request, reply) => {
  const ack = request.body as any;
  reply.send({
    status: "accepted",
    errors: [],
    controlNumber: ack?.controlNumber || "0001",
  });
});

server.post("/billing/status/277ca", async (request, reply) => {
  const statusDoc = request.body as any;
  reply.send({ status: "received", claims: statusDoc?.claims?.length || 1 });
});

server.post("/billing/835", async (request, reply) => {
  const remit = request.body as any;
  // Stub parse
  reply.send({
    id: "835_" + Date.now(),
    payments: remit?.payments?.length || 0,
    posted: true,
  });
});

server.get("/health", async () => ({
  status: "healthy",
  service: "billing",
  timestamp: new Date().toISOString(),
}));

async function start() {
  await registerPlugins();
  await server.listen({ port: config.port, host: config.host });
  server.log.info(
    `💼 Billing/EDI service running on http://${config.host}:${config.port}`,
  );
}

if (require.main === module) {
  start().catch((e) => {
    server.log.fatal(e);
    process.exit(1);
  });
}

export { server, start };
