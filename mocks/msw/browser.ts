import { setupWorker } from "msw/browser";
import { ehrHandlers } from "./ehr.handlers";
import { rpmHandlers } from "./rpm.handlers";
import { labsHandlers } from "./labs.handlers";
import { medicationsHandlers } from "./medications.handlers";
import { pharmacyHandlers } from "./pharmacy.handlers";
import { schedulingHandlers } from "./scheduling.handlers";

export const worker = setupWorker(
	...ehrHandlers,
	...rpmHandlers,
	...labsHandlers,
	...medicationsHandlers,
	...pharmacyHandlers,
	...schedulingHandlers,
);

export const mswStartOptions = {
	serviceWorker: { url: "/mockServiceWorker.js" },
	onUnhandledRequest: ({ request }: any) => {
		try {
			const u = new URL(request.url);
			if (u.hostname.endsWith('builder.io') || u.hostname.endsWith('cdn.builder.io')) return;
		} catch {}
	},
	quiet: false,
} as const;
