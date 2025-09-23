import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import pino from "pino";

const config = {
  port: parseInt(process.env.PORT || "3012"),
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

// Catalog
server.get("/commerce/catalog", async () => ({ items: [] }));
// Create order
server.post("/commerce/orders", async () => ({
  id: `ord_${Date.now()}`,
  status: "placed",
}));
// Get order
server.get("/commerce/orders/:id", async (req) => ({
  id: (req.params as any).id,
  status: "placed",
}));
// Search
server.get("/commerce/search", async (request) => {
  const url = new URL(request.url, "http://local");
  const q = url.searchParams.get("q") || "";
  return { items: q ? [{ id: "rx:lipitor", name: "Lipitor" }] : [] };
});
// Health
server.get("/health", async () => ({
  status: "healthy",
  service: "pharmacy",
  timestamp: new Date().toISOString(),
}));

async function start() {
  await registerPlugins();
  await server.listen({ port: config.port, host: config.host });
  server.log.info(
    `🛒 Pharmacy service running on http://${config.host}:${config.port}`,
  );
}

if (require.main === module) {
  start().catch((e) => {
    server.log.fatal(e);
    process.exit(1);
  });
}

export { server, start };
