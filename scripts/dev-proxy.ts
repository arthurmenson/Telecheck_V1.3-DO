import express from "express";
// @ts-ignore - optional dependency at runtime
import { createProxyMiddleware } from "http-proxy-middleware";

const UAT = process.env.UAT_API || "https://api-uat.telecheck.health";
const app = express();

app.use(
  "/api",
  createProxyMiddleware({ target: UAT, changeOrigin: true, xfwd: true }),
);

const PORT = Number(process.env.PORT || 5050);
app.listen(PORT, () => console.log("[dev-proxy] →", UAT));
