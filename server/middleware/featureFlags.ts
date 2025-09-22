import type { Request, Response, NextFunction } from "express";

import { getAllFeatureFlags } from "../config/featureFlags";

export const featureFlagsMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const flags = getAllFeatureFlags();
  Object.defineProperty(req, "featureFlags", {
    value: Object.freeze({ ...flags }),
    configurable: false,
    enumerable: true,
    writable: false,
  });

  next();
};
