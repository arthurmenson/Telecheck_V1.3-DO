import fs from "fs";

const endpoints = [
  "/api/ehr/patients/:id",
  "/api/ehr/intake",
  "/api/rpm/patients/:id/vitals",
  "/api/rpm/patients/:id/alerts",
  "/api/rpm/patients/:id/thresholds",
  "/api/ehr/scheduling/slots",
  "/api/ehr/scheduling/book",
  "/api/medications",
  "/api/medications/search",
  "/api/medications/:id",
  "/api/medications/interactions",
  "/api/labs/results",
  "/api/labs/trends",
  "/api/labs/analyze",
];

const handlersDir = "mocks/msw";
const files = fs.readdirSync(handlersDir).filter((f) => f.endsWith(".handlers.ts"));
const all = files.map((f) => fs.readFileSync(`${handlersDir}/${f}`, "utf8")).join("\n");

const missing = endpoints.filter((e) => !all.includes(e));
if (missing.length) {
  console.error("❌ Missing MSW handlers for:\n" + missing.map((s) => " - " + s).join("\n"));
  process.exit(1);
}
console.log("✅ MSW handlers cover all declared endpoints");
