import express from "express";
// @ts-ignore - optional dependency at runtime
import { createProxyMiddleware } from "http-proxy-middleware";
import { randomUUID } from "crypto";

const UAT = process.env.UAT_API || "https://api-uat.telecheck.health";
const app = express();

app.use((req, _res, next) => {
  if (!req.headers["x-request-id"]) {
    req.headers["x-request-id"] = randomUUID();
  }
  next();
});

app.use(
  "/api",
  createProxyMiddleware({
    target: UAT,
    changeOrigin: true,
    xfwd: true,
    onProxyReq: (proxyReq, req) => {
      const rid = (req.headers["x-request-id"] as string) || randomUUID();
      proxyReq.setHeader("x-request-id", rid);
    },
    onProxyRes: (proxyRes) => {
      if (!proxyRes.headers["x-request-id"]) {
        proxyRes.headers["x-request-id"] = randomUUID();
      }
    },
  }),
);

const PORT = Number(process.env.PORT || 5050);
app.listen(PORT, () => console.log("[dev-proxy] →", UAT));
