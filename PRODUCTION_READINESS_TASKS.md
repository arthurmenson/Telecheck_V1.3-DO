# Production Readiness Taskboard

_Status legend: [done], [in-progress], [todo]_

## 1. Build Pipeline
- [done] Resolve top-level `await` usage in Vite entry bundle (build now succeeds on Node 20).
- [todo] Add CI job for `npm run build:client` and `npm run build:server` to prevent regressions (pending).

## 2. TypeScript Clean-up
- [todo] Client UI fixes (Label conflicts, lucide icon typings, component prop unions, etc.).
- [todo] Shared data models (products dosage/type unions) alignment.
- [todo] React hook/service generics (`usePatients`, `useProgramParticipants`, spread safety).
- [todo] Server route typings (request `user` guards, missing `@shared/types`, audit logger stubs).
- [todo] Database/utility adapters (Postgres adapter return types, messaging service date utils, crypto API updates).
- [todo] Enable `npm run typecheck` in CI once the above are clean.

## 3. Production Hardening
- [done] Align Docker & docs to Node 20.
- [todo] Commit DigitalOcean App Platform spec (`.do/app.yaml`) with env/secret plan.
- [todo] Migrate from local SQLite artifact to managed Postgres (update config + scripts).
- [todo] Add smoke tests for built server (`npm run build` + `node dist/server/node-build.mjs` health check).
- [todo] Document secrets / vault process for deployment.

## 4. Feature & Coverage Gaps
- [in-progress] React Query hooks: optimistic update & pagination tests (in place, expand coverage).
- [todo] Add medication service tests (happy path & interactions).
- [todo] Add billing/eligibility service hooks + tests.
- [todo] Complete eRx backlog (vendor adapter, client hook tests, E2E happy path).
- [todo] Finish reporting export flow (real backend implementation + tests).

## 5. Deployment & Monitoring
- [todo] Provision DigitalOcean pipelines (App Platform spec or Droplet scripts).
- [todo] Add build artifact upload and environment promotion workflow.
- [todo] Integrate log/metric collection for production (DO metrics/APM).
- [todo] Set up alerting for key endpoints (healthcheck, vitals, billing submissions).

## 6. Documentation & Process
- [todo] Update README with verified build/test steps under Node 20.
- [todo] Create runbook for smoke tests & incident response.
- [todo] Review this tracker weekly and update statuses.

_Last updated: $(Get-Date -Format "yyyy-MM-dd")_
