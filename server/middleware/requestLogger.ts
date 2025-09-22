import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

import { logger } from "../utils/logger";

const httpLogger = logger.child({ component: "http" });

const millisFromHrTime = (start: bigint) => {
  const diff = process.hrtime.bigint() - start;
  return Number(diff) / 1_000_000;
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startedAt = process.hrtime.bigint();
  const requestId =
    (req.headers["x-request-id"] as string | undefined) || randomUUID();

  const requestLog = httpLogger.child({ requestId });

  req.requestId = requestId;
  req.log = requestLog;
  res.setHeader("x-request-id", requestId);

  requestLog.info("http.request.received", {
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    contentLength: req.get("content-length"),
  });

  const onFinish = () => {
    res.removeListener("close", onClose);
    res.removeListener("error", onError);

    requestLog.info("http.request.completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: millisFromHrTime(startedAt),
      contentLength: res.getHeader("content-length"),
      userId: (req as any).user?.id,
    });
  };

  const onClose = () => {
    res.removeListener("finish", onFinish);
    res.removeListener("error", onError);

    requestLog.warn("http.request.aborted", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      durationMs: millisFromHrTime(startedAt),
    });
  };

  const onError = (error: Error) => {
    res.removeListener("finish", onFinish);
    res.removeListener("close", onClose);

    requestLog.error("http.request.failed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      durationMs: millisFromHrTime(startedAt),
      error: {
        name: error.name,
        message: error.message,
      },
    });
  };

  res.once("finish", onFinish);
  res.once("close", onClose);
  res.once("error", onError);

  next();
};
