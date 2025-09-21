import { http, HttpResponse } from "msw";

export const scheduleHandlers = [
  http.get("/api/ehr/scheduling/slots", () =>
    HttpResponse.json({ slots: [] }),
  ),
  http.post("/api/ehr/scheduling/book", async () =>
    HttpResponse.json({ id: "apt1", status: "booked" }),
  ),
  http.post("/api/ehr/scheduling/:id/cancel", async ({ params }) =>
    HttpResponse.json({ id: (params as any).id, status: "canceled" }),
  ),
  http.post("/api/ehr/scheduling/:id/reschedule", async ({ params }) =>
    HttpResponse.json({ id: (params as any).id, status: "rescheduled" }),
  ),
  http.get("/api/ehr/scheduling/error", () =>
    HttpResponse.json({ message: "Scheduling error" }, { status: 500 }),
  ),
];
