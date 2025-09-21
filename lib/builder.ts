let builderRef: any = null;

export function builderWarning(msg: string) {
  try { console.warn(msg); } catch {}
}

export async function ensureBuilder() {
  if (builderRef) return builderRef;
  const mod = await import('@builder.io/react').catch(() => null as any);
  if (!mod?.builder) {
    builderWarning('[builder] SDK not installed; skipping init');
    return null;
  }
  const KEY = (import.meta as any).env?.VITE_BUILDER_API_KEY || (globalThis as any).NEXT_PUBLIC_BUILDER_API_KEY;
  if (!KEY) builderWarning('[builder] Missing API key env: VITE_BUILDER_API_KEY / NEXT_PUBLIC_BUILDER_API_KEY');
  mod.builder.init(KEY || '');
  try {
    const cfg = await import('../lib/config');
    mod.builder.setUserAttributes({ env: (cfg as any).CFG?.mode });
  } catch {}
  builderRef = mod.builder;
  return builderRef;
}

export { builderRef as builder };
