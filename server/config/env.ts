export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  get isProduction() {
    return this.nodeEnv === "production";
  },
  get enableDemoAuthBypass() {
    return process.env.ENABLE_DEMO_AUTH_BYPASS === "true";
  },
};

export const allowDemoAuthBypass =
  !env.isProduction && env.enableDemoAuthBypass;
