# Telecheck Performance & Load Test Plan

This plan establishes the baseline workload model, tooling, and evidence expectations for exercising Telecheck's API under production-like conditions. It complements the broader production readiness checklist by providing a concrete path to execute Phase 1 "Performance & Load Testing" milestones.

## Objectives

- Validate that core authentication and patient workflows meet target latency and error-rate budgets while under concurrent usage.
- Capture time-series metrics (p50/p95 latency, throughput, error rates) for readiness reviews and capacity planning.
- Produce reproducible evidence packages (test inputs, environment configuration, and run summaries) for compliance and go-live sign-off.

## Tooling

- **k6 OSS** for scripting HTTP workloads and exporting Prometheus/JSON metrics.
- **Telecheck readiness API** running in a staging-like environment with seeded admin accounts and data fixtures.
- Optional integrations: k6 Cloud, Grafana, or Prometheus remote-write for centralized dashboards.

## Scenarios Covered

1. **Authentication ramp** – burst of concurrent login requests validating password hashing, token issuance, and refresh flows.
2. **Patient CRUD** – create, fetch, and search patient records to stress PostgreSQL write/read paths and audit logging.
3. **Read-heavy browsing** – paginated patient roster queries to mimic care-team usage during clinic hours.
4. **Telehealth & messaging readiness** – orchestrates virtual visit scheduling, consultation room spin-up, triage, and messaging health checks to validate real-time coordination services.

Additional scenarios (e.g., wearable ingestion) should be added as supporting services harden.

## Workload Model

| Stage     | Duration  | Virtual Users | Description                                             |
| --------- | --------- | ------------- | ------------------------------------------------------- |
| Warm-up   | 2 minutes | 20            | Ramp traffic to steady baseline while caches warm.      |
| Peak ramp | 3 minutes | 50            | Increase concurrency to simulate busy clinic blocks.    |
| Sustained | 2 minutes | 50            | Hold peak to capture steady-state metrics.              |
| Cool down | 2 minutes | 0             | Allow resources to drain and collect cleanup telemetry. |

Target thresholds:

- **p95 latency** < 750 ms for all API requests.
- **Average latency** < 300 ms for core workflows.
- **Error rate** < 1% for HTTP 5xx/4xx (excluding auth validation failures).

## Environment Requirements

- Telecheck API reachable at `TELECHECK_BASE_URL`.
- Test admin credentials (email/password) with permissions to manage patients.
- Dedicated staging database/Redis instances with representative data volume.
- Observability hooks (logs/metrics) accessible for post-run review.

## Running the Load Test

1. Ensure the Telecheck API is running and accessible from the k6 host.
2. Export required environment variables:

   ```bash
   export TELECHECK_BASE_URL="https://staging.telecheck.health"
   export TELECHECK_ADMIN_EMAIL="admin@staging.telecheck.health"
   export TELECHECK_ADMIN_PASSWORD="REDACTED"
   ```

3. Execute the desired k6 script:

   ```bash
   # Core auth + patient workflows
   npm run test:load

   # Telehealth session setup and messaging readiness checks
   npm run test:load:telehealth
   ```

4. Optional: enable k6 summary exports for CI evidence:

   ```bash
   k6 run \
     --summary-trend-stats="avg,min,med,p(90),p(95),max" \
     --summary-export="artifacts/performance-summary.json" \
     tests/performance/patient-api-load-test.js
   ```

## Reporting & Evidence

- Archive the k6 end-of-test summary, raw metrics (JSON/Prometheus), and Grafana dashboards.
- Log the test run in the readiness tracker with date, environment, and pass/fail decision.
- File remediation tickets for any thresholds exceeded, attaching logs and traces that highlight bottlenecks.

## Next Steps

- Capture wearable ingestion and scheduling automation scenarios once those APIs are production-ready.
- Automate nightly smoke-load runs in staging once the baseline passes consistently.
- Integrate with CI/CD to block production deploys if load-test thresholds regress beyond agreed budgets.
