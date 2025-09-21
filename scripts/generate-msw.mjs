import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = join(__dirname, "..", "mocks", "msw", "generated");
const outputFile = join(outputDir, "index.ts");

await fs.mkdir(outputDir, { recursive: true });

const content = `/**
 * Auto-generated MSW helper bindings.
 * This file is created via scripts/generate-msw.mjs.
 */
import { createOpenApiHttp } from "openapi-msw";
import type { paths } from "../../lib/sdk";

export const http = createOpenApiHttp<paths>({ baseUrl: "/api" });

export const generatedHandlers = [] as const;
`;

await fs.writeFile(outputFile, content);

console.log(`✅ Generated MSW helpers at ${outputFile}`);
