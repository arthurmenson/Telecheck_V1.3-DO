export function track(event: string, data?: Record<string, any>) {
  try {
    console.debug(`[telemetry] ${event}`, data ?? {});
  } catch {}
}
