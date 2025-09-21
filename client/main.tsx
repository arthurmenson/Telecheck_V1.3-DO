if ((import.meta as any).env?.VITE_MODE === "MOCK") {
	const { worker, mswStartOptions } = await import("../mocks/msw/browser");
	await worker.start(mswStartOptions as any);
}

await import("./builder/registry");

await import("./App.tsx");
