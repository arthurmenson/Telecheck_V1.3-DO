import { http, HttpResponse } from "msw";

export const rpmHandlers = [
  http.get("/api/vitals/trends", () =>
    HttpResponse.json({ series: [{ name: "glucose", data: [] }] }),
  ),
  http.get("/api/vitals", () => HttpResponse.json({ items: [] })),
  http.get("/api/vitals/empty", () => HttpResponse.json({ items: [] })),
  http.get("/api/vitals/error", () =>
    HttpResponse.json({ message: "Server error" }, { status: 500 }),
  ),
  // Additional RPM endpoints per spec
  http.get("/api/rpm/patients/:id/vitals", ({ params, request }) => {
    const url = (() => { try { return new URL(request.url); } catch { return new URL(request.url, self.location.origin); } })();
    const days = url.searchParams.get("days") ?? "7";
    return HttpResponse.json({ patientId: (params as any).id, days, vitals: [] });
  }),
  http.get("/api/rpm/patients/:id/alerts", ({ params }) =>
    HttpResponse.json({ patientId: (params as any).id, alerts: [] }),
  ),
  http.get("/api/rpm/patients/:id/thresholds", ({ params }) =>
    HttpResponse.json({ patientId: (params as any).id, fsr: {}, hr: {} }),
  ),
];
