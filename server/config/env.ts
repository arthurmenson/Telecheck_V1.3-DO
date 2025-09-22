export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  get isProduction() {
    return this.nodeEnv === "production";
  },
  get enableDemoAuthBypass() {
    return process.env.ENABLE_DEMO_AUTH_BYPASS === "true";
  },
  logLevel:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  logForwardEndpoint: process.env.LOG_FORWARD_ENDPOINT,
  logForwardAuth: process.env.LOG_FORWARD_AUTH,
  logForwardApiKey: process.env.LOG_FORWARD_API_KEY,
  get isLogForwardingEnabled() {
    return !!process.env.LOG_FORWARD_ENDPOINT;
  },
  get metricsEnabled() {
    const explicit = process.env.METRICS_ENABLED;
    if (explicit === "true") {
      return true;
    }

    if (explicit === "false") {
      return false;
    }

    return !this.isProduction;
  },
  metricsToken: process.env.METRICS_TOKEN?.trim(),
  get metricsAllowedIps() {
    const raw = process.env.METRICS_ALLOWED_IPS;
    if (!raw) {
      return [] as string[];
    }

    return raw
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  },
};

export const allowDemoAuthBypass =
  !env.isProduction && env.enableDemoAuthBypass;
