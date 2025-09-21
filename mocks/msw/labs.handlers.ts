import { http, HttpResponse } from "msw";

export const labsHandlers = [
  http.get("/api/labs/results", () => HttpResponse.json({ results: [] })),
  http.post("/api/labs/analyze", async () =>
    HttpResponse.json({ analysisId: "a1", status: "ok" }),
  ),
  http.get("/api/labs/analysis", ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    return HttpResponse.json({ id, status: "ready", findings: [] });
  }),
  http.post("/api/labs/upload", async () =>
    HttpResponse.json({ id: "u1", status: "uploaded" }),
  ),
  http.get("/api/labs/trends", () => HttpResponse.json({ series: [] })),
  http.get("/api/labs/error", () =>
    HttpResponse.json({ message: "Lab error" }, { status: 500 }),
  ),
];
