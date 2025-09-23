import { http, HttpResponse } from "msw";

const u = (s: string) => {
  try {
    return new URL(s);
  } catch {
    return new URL(s, self.location.origin);
  }
};

export const labsHandlers = [
  http.get("/api/labs/results", ({ request }) => {
    const url = u(request.url);
    if (url.searchParams.get("chaos") === "1") {
      const status = Math.random() < 0.5 ? 500 : 401;
      return HttpResponse.json({ message: "chaos" }, { status });
    }
    return HttpResponse.json({ results: [] });
  }),
  http.post("/api/labs/analyze", async ({ request }) => {
    const url = u(request.url);
    if (url.searchParams.get("chaos") === "1") {
      const status = Math.random() < 0.5 ? 500 : 401;
      return HttpResponse.json({ message: "chaos" }, { status });
    }
    return HttpResponse.json({ analysisId: "a1", status: "ok" });
  }),
  http.post("/api/analyze-lab", async ({ request }) => {
    const url = u(request.url);
    if (url.searchParams.get("chaos") === "1") {
      const status = Math.random() < 0.5 ? 500 : 401;
      return HttpResponse.json({ message: "chaos" }, { status });
    }
    return HttpResponse.json({ analysisId: "a1", status: "ok" });
  }),
  http.get("/api/labs/analysis", ({ request }) => {
    const url = u(request.url);
    const id = url.searchParams.get("id");
    return HttpResponse.json({ id, status: "ready", findings: [] });
  }),
  http.post("/api/labs/upload", async ({ request }) => {
    const url = u(request.url);
    if (url.searchParams.get("chaos") === "1") {
      const status = Math.random() < 0.5 ? 500 : 401;
      return HttpResponse.json({ message: "chaos" }, { status });
    }
    return HttpResponse.json({ id: "u1", status: "uploaded" });
  }),
  http.get("/api/labs/trends", ({ request }) => {
    const url = u(request.url);
    if (url.searchParams.get("chaos") === "1") {
      const status = Math.random() < 0.5 ? 500 : 401;
      return HttpResponse.json({ message: "chaos" }, { status });
    }
    return HttpResponse.json({ series: [] });
  }),
  http.get("/api/labs/error", () =>
    HttpResponse.json({ message: "Lab error" }, { status: 500 }),
  ),
];
