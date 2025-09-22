import { randomUUID } from "crypto";

import { env } from "../config/env";

export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

const levelOrder: Record<LogLevel, number> = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const normalizeLevel = (value?: string): LogLevel => {
  if (!value) {
    return env.isProduction ? "info" : "debug";
  }

  const normalized = value.toLowerCase() as LogLevel;
  if (normalized in levelOrder) {
    return normalized;
  }

  return env.isProduction ? "info" : "debug";
};

const configuredLevel = normalizeLevel(env.logLevel);
const forwardEndpoint = env.logForwardEndpoint?.trim();
const forwardAuthHeader = env.logForwardAuth?.trim();
const forwardApiKey = env.logForwardApiKey?.trim();

export type LogContext = Record<string, unknown>;

export interface Logger {
  fatal: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
  trace: (message: string, context?: LogContext) => void;
  child: (context: LogContext) => Logger;
}

interface LogPayload extends LogContext {
  level: LogLevel;
  message: string;
  timestamp: string;
  eventId: string;
  service: string;
  environment: string;
}

const redactKeys = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "password",
  "token",
  "secret",
]);

const sanitizeValue = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      if (redactKeys.has(key.toLowerCase())) {
        sanitized[key] = "[REDACTED]";
        continue;
      }

      sanitized[key] = sanitizeValue(item);
    }

    return sanitized;
  }

  return value;
};

const sanitizeContext = (context?: LogContext): LogContext => {
  if (!context) {
    return {};
  }

  const sanitized: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    sanitized[key] = sanitizeValue(value);
  }

  return sanitized;
};

const writeLog = (payload: LogPayload) => {
  const serialized = JSON.stringify(payload);
  process.stdout.write(serialized + "\n");

  if (!forwardEndpoint) {
    return;
  }

  try {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };

    if (forwardAuthHeader) {
      headers.authorization = forwardAuthHeader;
    } else if (forwardApiKey) {
      headers["x-api-key"] = forwardApiKey;
    }

    void fetch(forwardEndpoint, {
      method: "POST",
      headers,
      body: serialized,
      keepalive: true,
    }).catch((error) => {
      console.error("Failed to forward log entry", error);
    });
  } catch (error) {
    console.error("Failed to schedule log forwarding", error);
  }
};

const shouldLog = (level: LogLevel) =>
  levelOrder[level] <= levelOrder[configuredLevel];

const createLogger = (context: LogContext = {}): Logger => {
  const log = (level: LogLevel, message: string, extra?: LogContext) => {
    if (!shouldLog(level)) {
      return;
    }

    const payload: LogPayload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      eventId: randomUUID(),
      service: process.env.SERVICE_NAME || "telecheck-api",
      environment: env.nodeEnv,
      ...sanitizeContext(context),
      ...sanitizeContext(extra),
    };

    writeLog(payload);
  };

  return {
    fatal: (message, extra) => log("fatal", message, extra),
    error: (message, extra) => log("error", message, extra),
    warn: (message, extra) => log("warn", message, extra),
    info: (message, extra) => log("info", message, extra),
    debug: (message, extra) => log("debug", message, extra),
    trace: (message, extra) => log("trace", message, extra),
    child: (childContext) => createLogger({ ...context, ...childContext }),
  };
};

export const logger = createLogger();
