import "express-serve-static-core";
import type { Logger } from "../utils/logger";
import type { FeatureFlagMap } from "../config/featureFlags";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
    log?: Logger;
    featureFlags?: FeatureFlagMap;
  }
}
