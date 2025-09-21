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
];
