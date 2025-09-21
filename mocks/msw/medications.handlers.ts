import { http, HttpResponse } from "msw";

export const medicationsHandlers = [
  http.get("/api/medications", () => HttpResponse.json({ items: [] })),
  http.post("/api/medications", async () =>
    HttpResponse.json({ id: "m1" }, { status: 201 }),
  ),
  http.put("/api/medications/:id", async ({ params }) =>
    HttpResponse.json({ id: (params as any).id, status: "updated" }),
  ),
  http.delete("/api/medications/:id", async ({ params }) =>
    HttpResponse.json({ id: (params as any).id, status: "deleted" }),
  ),
  http.get("/api/medications/interactions", () =>
    HttpResponse.json({ interactions: [] }),
  ),
  http.get("/api/medications/search", ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json({ items: [], q: url.searchParams.get("q") });
  }),
  http.get("/api/medications/reminders", () =>
    HttpResponse.json({ reminders: [] }),
  ),
  http.get("/api/medications/error", () =>
    HttpResponse.json({ message: "Medication error" }, { status: 500 }),
  ),
];
