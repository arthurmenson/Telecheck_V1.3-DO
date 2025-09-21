import { http, HttpResponse } from "msw";

export const pharmacyHandlers = [
  http.get("/api/medications/search", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    return HttpResponse.json({ items: [], q });
  }),
  http.get("/api/medications", () => HttpResponse.json({ items: [] })),
  http.get("/api/medications/error", () =>
    HttpResponse.json({ message: "Search failed" }, { status: 500 }),
  ),
];
