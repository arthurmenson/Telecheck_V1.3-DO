import { http, HttpResponse } from "msw";

const u = (s: string) => {
	try { return new URL(s); } catch { return new URL(s, self.location.origin); }
};

export const medicationsHandlers = [
	http.get("/api/medications", ({ request }) => {
		const url = u(request.url);
		if (url.searchParams.get("chaos") === "1") {
			const status = Math.random() < 0.5 ? 500 : 401;
			return HttpResponse.json({ message: "chaos" }, { status });
		}
		return HttpResponse.json({ items: [] });
	}),
	http.post("/api/medications", async () =>
		HttpResponse.json({ id: "m1" }, { status: 201 }),
	),
	http.put("/api/medications/:id", async ({ params }) =>
		HttpResponse.json({ id: (params as any).id, status: "updated" }),
	),
	http.delete("/api/medications/:id", async ({ params }) =>
		HttpResponse.json({ id: (params as any).id, status: "deleted" }),
	),
	http.get("/api/medications/interactions", ({ request }) => {
		const url = u(request.url);
		if (url.searchParams.get("chaos") === "1") {
			const status = Math.random() < 0.5 ? 500 : 401;
			return HttpResponse.json({ message: "chaos" }, { status });
		}
		const a = (url.searchParams.get("drugA") || "").toLowerCase();
		const b = (url.searchParams.get("drugB") || "").toLowerCase();
		if ((a === "lipitor" && b === "warfarin") || (a === "warfarin" && b === "lipitor")) {
			return HttpResponse.json({ interactions: [{ pair: [a, b], severity: "major", note: "Monitor INR closely" }] });
		}
		return HttpResponse.json({ interactions: [] });
	}),
	http.get("/api/medications/search", ({ request }) => {
		const url = u(request.url);
		const q = (url.searchParams.get("q") || "").toLowerCase();
		if (q.includes("lipitor")) {
			return HttpResponse.json({ items: [{ id: "lipitor", name: "Lipitor", generic: "atorvastatin" }], q });
		}
		return HttpResponse.json({ items: [], q });
	}),
	http.get("/api/medications/reminders", () =>
		HttpResponse.json({ reminders: [] }),
	),
	http.get("/api/medications/error", () =>
		HttpResponse.json({ message: "Medication error" }, { status: 500 }),
	),
];
