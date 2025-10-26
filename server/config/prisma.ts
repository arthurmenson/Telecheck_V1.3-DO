/**
 * Prisma Client Initialization
 *
 * This file initializes and exports the Prisma Client instance for database operations.
 * The client is configured with proper logging and connection pooling.
 */

import { PrismaClient } from "@prisma/client";

// Log levels based on environment
const logLevels =
  process.env.NODE_ENV === "production"
    ? ["error", "warn"]
    : ["query", "error", "warn", "info"];

// Initialize Prisma Client with configuration
export const prisma = new PrismaClient({
  log: logLevels as any,
  errorFormat: process.env.NODE_ENV === "production" ? "minimal" : "pretty",
});

// Database connection management
let isConnected = false;

/**
 * Connect to the database
 * Ensures Prisma is connected before making queries
 */
export async function connectDatabase(): Promise<void> {
  if (isConnected) {
    return;
  }

  try {
    await prisma.$connect();
    isConnected = true;
    console.log("✅ Prisma connected to PostgreSQL database");
  } catch (error) {
    console.error("❌ Failed to connect Prisma to database:", error);
    throw error;
  }
}

/**
 * Disconnect from the database
 * Call this during graceful shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await prisma.$disconnect();
    isConnected = false;
    console.log("🔒 Prisma disconnected from database");
  } catch (error) {
    console.error("❌ Error disconnecting Prisma from database:", error);
    throw error;
  }
}

/**
 * Health check for database connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("❌ Prisma health check failed:", error);
    return false;
  }
}

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await disconnectDatabase();
});

// Export Prisma client as default
export default prisma;
