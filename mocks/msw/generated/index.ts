/**
 * Auto-generated MSW helper bindings.
 * This file is created via scripts/generate-msw.mjs.
 */
import { createOpenApiHttp } from "openapi-msw";
import type { paths } from "../../lib/sdk";

export const http = createOpenApiHttp<paths>({ baseUrl: "/api" });

export const generatedHandlers = [] as const;
