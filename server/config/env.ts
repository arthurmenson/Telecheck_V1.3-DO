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
};

export const allowDemoAuthBypass =
  !env.isProduction && env.enableDemoAuthBypass;
