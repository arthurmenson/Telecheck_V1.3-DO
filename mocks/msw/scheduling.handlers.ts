import { http, HttpResponse } from "msw";

const u = (s: string) => {
	try { return new URL(s); } catch { return new URL(s, self.location.origin); }
};

export const schedulingHandlers = [
	http.get("/api/ehr/scheduling/slots", ({ request }) => {
		const url = u(request.url);
		if (url.searchParams.get("chaos") === "1") {
			const status = Math.random() < 0.5 ? 500 : 401;
			return HttpResponse.json({ message: "chaos" }, { status });
		}
		return HttpResponse.json({ slots: [{ id: "s1", start: "2025-01-02T09:00:00Z", end: "2025-01-02T09:30:00Z" }] });
	}),
	http.post("/api/ehr/scheduling/book", async ({ request }) => {
		const url = u(request.url);
		if (url.searchParams.get("chaos") === "1") {
			const status = Math.random() < 0.5 ? 500 : 401;
			return HttpResponse.json({ message: "chaos" }, { status });
		}
		return HttpResponse.json({ id: "apt1", status: "booked" });
	}),
	http.post("/api/ehr/scheduling/:id/cancel", async ({ params, request }) => {
		const url = u(request.url);
		if (url.searchParams.get("chaos") === "1") {
			const status = Math.random() < 0.5 ? 500 : 401;
			return HttpResponse.json({ message: "chaos" }, { status });
		}
		return HttpResponse.json({ id: (params as any).id, status: "canceled" });
	}),
	http.post("/api/ehr/scheduling/:id/reschedule", async ({ params, request }) => {
		const url = u(request.url);
		if (url.searchParams.get("chaos") === "1") {
			const status = Math.random() < 0.5 ? 500 : 401;
			return HttpResponse.json({ message: "chaos" }, { status });
		}
		return HttpResponse.json({ id: (params as any).id, status: "rescheduled" });
	}),
	http.get("/api/ehr/scheduling/error", () =>
		HttpResponse.json({ message: "Scheduling error" }, { status: 500 }),
	),
];
