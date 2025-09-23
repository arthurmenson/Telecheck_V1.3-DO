/**
 * Auth Service - Authentication and Identity
 * Endpoints:
 * - POST /auth/login    -> { user, token }
 * - POST /auth/refresh  -> { user, token }
 * - POST /auth/logout   -> { success }
 * - GET  /auth/me       -> { user }
 */

import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
const config = {
  port: parseInt(process.env.PORT || "3001"),
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

async function registerPlugins() {
  await server.register(cors, { origin: true, credentials: true });
  await server.register(helmet, { contentSecurityPolicy: false });
}

function signToken(user: any): string {
  // Stub token for gateway to validate (gateway uses its own secret)
  return Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: [],
    }),
  ).toString("base64");
}

server.post("/auth/login", async (request, reply) => {
  const body = request.body as any;
  const user = {
    id: "user_123",
    email: body?.email || "user@example.com",
    name: "Test User",
    role: "patient",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  reply.send({
    user,
    token: signToken(user),
    refreshToken: "rt_" + Date.now(),
    expiresIn: 3600,
  });
});

server.post("/auth/refresh", async (_request, reply) => {
  const user = {
    id: "user_123",
    email: "user@example.com",
    name: "Test User",
    role: "patient",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  reply.send({
    user,
    token: signToken(user),
    refreshToken: "rt_" + Date.now(),
    expiresIn: 3600,
  });
});

server.post("/auth/logout", async (_request, reply) => {
  reply.send({ success: true, message: "Logged out successfully" });
});

server.get("/auth/me", async (_request, reply) => {
  const user = {
    id: "user_123",
    email: "user@example.com",
    name: "Test User",
    role: "patient",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  reply.send(user);
});

server.get("/health", async () => ({
  status: "healthy",
  service: "auth",
  timestamp: new Date().toISOString(),
}));

async function start() {
  await registerPlugins();
  await server.listen({ port: config.port, host: config.host });
  server.log.info(
    `🔐 Auth service running on http://${config.host}:${config.port}`,
  );
}

if (require.main === module) {
  start().catch((e) => {
    server.log.fatal(e);
    process.exit(1);
  });
}

export { server, start };
