import { http, HttpResponse } from "msw";

export const ehrHandlers = [
  // success
  http.get("/api/ehr/patients/:id", ({ params }) =>
    HttpResponse.json({ id: (params as any).id, name: "Jane Doe" }),
  ),
  // empty
  http.get("/api/ehr/patients/empty", () =>
    HttpResponse.json(null, { status: 200 }),
  ),
  // error
  http.post("/api/ehr/intake", async () =>
    HttpResponse.json({ message: "Failed" }, { status: 500 }),
  ),
];
