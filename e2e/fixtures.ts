import { test as base, expect } from "@playwright/test";

const host = process.env.PW_HOST ?? "127.0.0.1";
const port = process.env.PW_PORT ?? "3000";
const rawBase = process.env.PW_BASE_URL ?? `http://${host}:${port}`;
const normalizedBase = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

declare global {
  interface Window {
    __TC_API_BASE__?: string;
  }
}

export const apiBaseUrl = normalizedBase;

export const test = base.extend({
  page: async ({ page }, use) => {
    // Rewrite `fetch("/api/...")` calls to include the test server origin so components
    // using raw fetch continue to work under Playwright.
    await page.addInitScript(
      ({ origin }) => {
        const prefix = origin.endsWith("/") ? origin.slice(0, -1) : origin;
        const originalFetch = window.fetch.bind(window);
        (window as any).__TC_API_BASE__ = prefix;

        const rewrite = (value: string): string | null => {
          if (value.startsWith("/api")) return `${prefix}${value}`;
          if (value.startsWith("api/")) return `${prefix}/${value}`;
          return null;
        };

        window.fetch = (input: any, init?: RequestInit) => {
          if (typeof input === "string") {
            const rewritten = rewrite(input);
            if (rewritten) {
              return originalFetch(rewritten, init);
            }
          }
          return originalFetch(input, init);
        };
      },
      { origin: normalizedBase },
    );

    await use(page);
  },
});

export { expect } from "@playwright/test";
