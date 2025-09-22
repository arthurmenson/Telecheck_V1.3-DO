import type { Request } from "express";

import { env } from "../config/env";

const DEFAULT_CONTENT_TYPE = "text/plain; version=0.0.4; charset=utf-8";

const escapeLabelValue = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const defaultLabels: Record<string, string> = {
  service: process.env.SERVICE_NAME || "telecheck-api",
  environment: env.nodeEnv,
};

type CounterKey = `${string}|${string}|${string}`;

type SummaryKey = `${string}|${string}`;

const requestCounters = new Map<CounterKey, number>();
const requestDuration = new Map<SummaryKey, { count: number; sum: number }>();
const inflightRequests = new Map<SummaryKey, number>();

const formatLabels = (labels: Record<string, string>) =>
  `{${Object.entries({ ...defaultLabels, ...labels })
    .map(([key, value]) => `${key}="${escapeLabelValue(value)}"`)
    .join(",")}}`;

const normalizeDynamicSegments = (value: string) =>
  value.replace(/\d+/g, ":id").replace(/[0-9a-f]{8,}/gi, ":id");

const sanitizePath = (path: string) => {
  if (!path) {
    return "/";
  }

  const basePath = path.split("?")[0] || "/";

  if (basePath === "/") {
    return basePath;
  }

  return normalizeDynamicSegments(basePath);
};

const getRouteLabel = (req: Request) => {
  const explicitRoute = req.route?.path;
  const baseUrl = req.baseUrl || "";

  if (explicitRoute) {
    return sanitizePath(`${baseUrl}${explicitRoute}`);
  }

  return sanitizePath(req.originalUrl || req.url || "/");
};

const recordDuration = (key: SummaryKey, durationSeconds: number) => {
  const current = requestDuration.get(key) || { count: 0, sum: 0 };
  requestDuration.set(key, {
    count: current.count + 1,
    sum: current.sum + durationSeconds,
  });
};

const observeInflight = (key: SummaryKey, delta: number) => {
  const current = inflightRequests.get(key) || 0;
  const next = current + delta;

  if (next <= 0) {
    inflightRequests.delete(key);
    return;
  }

  inflightRequests.set(key, next);
};

const exportCounters = () => {
  const lines = [
    "# HELP telecheck_http_requests_total Total number of HTTP requests",
    "# TYPE telecheck_http_requests_total counter",
  ];

  for (const [key, value] of requestCounters.entries()) {
    const [method, route, status] = key.split("|");
    lines.push(
      `telecheck_http_requests_total${formatLabels({
        method,
        route,
        status,
      })} ${value}`,
    );
  }

  return lines;
};

const exportSummary = () => {
  const lines = [
    "# HELP telecheck_http_request_duration_seconds Request duration in seconds",
    "# TYPE telecheck_http_request_duration_seconds summary",
  ];

  for (const [key, { count, sum }] of requestDuration.entries()) {
    const [method, route] = key.split("|");
    lines.push(
      `telecheck_http_request_duration_seconds_count${formatLabels({
        method,
        route,
      })} ${count}`,
    );
    lines.push(
      `telecheck_http_request_duration_seconds_sum${formatLabels({
        method,
        route,
      })} ${sum}`,
    );
  }

  return lines;
};

const exportInflight = () => {
  const lines = [
    "# HELP telecheck_http_requests_in_flight Active HTTP requests",
    "# TYPE telecheck_http_requests_in_flight gauge",
  ];

  for (const [key, value] of inflightRequests.entries()) {
    const [method, route] = key.split("|");
    lines.push(
      `telecheck_http_requests_in_flight${formatLabels({
        method,
        route,
      })} ${value}`,
    );
  }

  return lines;
};

const formatSnapshot = () =>
  [
    ...exportCounters(),
    ...exportSummary(),
    ...exportInflight(),
    `telecheck_metrics_last_snapshot${formatLabels({})} ${Date.now() / 1000}`,
  ].join("\n");

export const metrics = {
  get isEnabled() {
    return env.metricsEnabled;
  },
  get contentType() {
    return DEFAULT_CONTENT_TYPE;
  },
  trackRequest({
    method,
    route,
    status,
    durationSeconds,
  }: {
    method: string;
    route: string;
    status: number;
    durationSeconds: number;
  }) {
    if (!env.metricsEnabled) {
      return;
    }

    const counterKey: CounterKey = `${method}|${route}|${status}`;
    requestCounters.set(counterKey, (requestCounters.get(counterKey) || 0) + 1);

    const summaryKey: SummaryKey = `${method}|${route}`;
    recordDuration(summaryKey, durationSeconds);
  },
  incrementInflight({ method, route }: { method: string; route: string }) {
    if (!env.metricsEnabled) {
      return;
    }

    const summaryKey: SummaryKey = `${method}|${route}`;
    observeInflight(summaryKey, 1);
  },
  decrementInflight({ method, route }: { method: string; route: string }) {
    if (!env.metricsEnabled) {
      return;
    }

    const summaryKey: SummaryKey = `${method}|${route}`;
    observeInflight(summaryKey, -1);
  },
  async snapshot() {
    if (!env.metricsEnabled) {
      return "";
    }

    return formatSnapshot();
  },
  sanitizePath,
  getRouteLabel,
  resetForTests() {
    requestCounters.clear();
    requestDuration.clear();
    inflightRequests.clear();
  },
};
