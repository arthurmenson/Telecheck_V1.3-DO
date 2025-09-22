import type { NextFunction, Request, Response } from "express";

import { metrics } from "../utils/metrics";

const toSeconds = (start: bigint) =>
  Number(process.hrtime.bigint() - start) / 1_000_000_000;

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!metrics.isEnabled) {
    return next();
  }

  const startedAt = process.hrtime.bigint();
  const method = req.method.toUpperCase();
  const route = metrics.getRouteLabel(req);

  metrics.incrementInflight({ method, route });

  let recorded = false;

  const record = (status: number) => {
    if (recorded) {
      return;
    }
    recorded = true;
    metrics.decrementInflight({ method, route });
    metrics.trackRequest({
      method,
      route,
      status,
      durationSeconds: toSeconds(startedAt),
    });
  };

  res.on("finish", () => {
    record(res.statusCode);
  });

  res.on("close", () => {
    record(res.writableEnded ? res.statusCode : 499);
  });

  res.on("error", () => {
    record(500);
  });

  next();
};
