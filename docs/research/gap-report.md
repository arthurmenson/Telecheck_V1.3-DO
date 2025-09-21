# OpenEMR vs Telecheck Gap Report

## Feature Matrix

| Capability | OpenEMR (Current) | Telecheck (Current) | Telecheck Target (Superior) |
| --- | --- | --- | --- |
| **Patient Master & Demographics** | Mature patient registry with configurable demographics, insurance, and multilingual support baked into the core practice management suite.【e034de†L10-L24】 | Express routes expose patient stats/search with validation but rely on a simplified service layer and lack multi-tenant, consent, or audit depth.【190a62†L1-L160】 | Hardened patient service with tenancy boundaries, consent tracking, longitudinal history, and full audit journaling aligned to ONC requirements. |
| **Scheduling & Appointment Flow** | Native appointment calendar, flow board, and recall tools for multi-facility operations.【e034de†L10-L24】 | Front end expects `/ehr/scheduling/*` endpoints yet no backend route exists; mocks emulate responses only.【9ff6d7†L1-L78】【bd47c7†L1-L4】 | Transactional scheduling microservice with slot generation, provider capacity rules, conflict detection, and audit trails exposed via Fastify BFF. |
| **Clinical Charting & Encounters** | Integrated EMR with SOAP, templates, ophthalmology module, and encounter workflows.【e034de†L10-L24】 | Current server focuses on patient and lab primitives; no encounter persistence beyond placeholder services.【190a62†L1-L160】 | Domain-driven encounter service supporting templated notes, program enrollment, structured CCD exports, and compliance snapshots. |
| **Labs & Diagnostics** | Extensive lab interface with procedures, result management, and CCDA exports.【e034de†L10-L24】 | Lab routes support uploads and listing but lack async analysis orchestration or external lab integrations.【19ab2b†L1-L120】 | Labs service pushing uploads to S3, invoking analysis workers, FHIR DiagnosticReport generation, and compliance scanning hooks. |
| **Medications & eRx** | E-prescribing, dispensing, drug search, and interaction checking modules.【e034de†L10-L24】 | Medication API offers CRUD per user but no payer formulary, interaction engine, or eRx clearinghouse connectivity.【5dffe3†L1-L80】 | Medication + pharmacy service integrating with eRx networks, formulary checks, interaction decision support, and pharmacy order fulfillment. |
| **Remote Patient Monitoring** | RPM/CCM not first-class; requires integrations/extensions per community modules (limited evidence). | FE adapters expect vitals/alerts/threshold endpoints, but backend lacks dedicated RPM orchestration; current vitals routes are generic.【8a0aad†L1-L19】【bd47c7†L1-L4】 | Dedicated RPM service handling device ingestion, threshold management, alerts, and patient dashboards with historical analytics. |
| **Billing & EDI** | Supports X12 837/835/270/271/276/277/278 with history management and reports.【48da57†L1-L14】 | No billing or EDI routes implemented; workflows absent from server codebase.【ccd379†L1-L1】 | Billing-EDI service generating 837P/I, ingesting 835 remits, handling acknowledgements, and reconciling AR ledger with companion guide overlays. |
| **Analytics & Reporting** | Built-in reports (clinical quality, AMC, sales, collections) and dashboards.【e034de†L10-L24】 | Analytics limited to placeholder insights; no consolidated dashboards or export pipelines.【d299d0†L1-L14】 | Analytics service delivering configurable dashboards, cohort exports, and compliance scorecards fed by event bus. |
| **Patient Portal & Telehealth** | Portal with secure messaging, appointments, CCDA sharing, and Direct messaging.【94aaba†L1-L34】 | Telemedicine routes mock provider availability/rooms; portal capabilities minimal beyond chat stubs.【a2c196†L1-L120】 | Portal integrated with identity provider, WebRTC consult rooms, payment, and messaging admin with auditing + wellness automations. |
| **Interoperability (FHIR/SMART)** | Full REST + FHIR R4 with SMART-on-FHIR, bulk exports, and provenance support.【08c13e†L1-L34】【d0b2ea†L64-L125】【06cd12†L181-L228】 | Utility functions return synthetic FHIR bundles from in-memory data; lacks real persistence or token enforcement.【0d7366†L1-L112】 | Gateway-managed FHIR service backed by production data stores, capability statements, consent enforcement, and audit logging. |
| **Security, Privacy, Audit** | OAuth2/OIDC with granular scopes, PKCE, and de-identification tools.【39afae†L37-L126】【b9b11b†L362-L389】【37be7e†L1-L23】 | Basic JWT middleware, minimal RBAC, no audit log stream or de-identification tooling integrated.【a2c196†L1-L120】 | Centralized auth/identity service, PHI encryption at rest, append-only audit-observability pipeline, and automated de-identification workflows. |
| **Deployment & Ops** | Runs across Windows/Linux/Mac; community docs for scaling but largely monolithic. | Single Express server with Postgres dependency; lacks IaC, multi-service decomposition, or observability wiring.【a2c196†L1-L120】【05e6b1†L1-L120】 | Modular Fastify services containerized for ECS/EKS, Terraform-managed infra (RDS/Redis/S3/SNS), OTEL tracing, feature flags, and SBOM/CI pipelines. |

## Gap Backlog (MoSCoW Prioritization)

### Must Have
1. **Transactional Scheduling Service** – Provide `/ehr/scheduling/*` endpoints with double-book protection, slot search, and chaos-aware error handling to unblock FE Playwright flows. Tests: unit (slot planner), integration (PG advisory locks), Pact, Playwright `scheduling.book-appointment`.
2. **RPM API Surface** – Implement `/rpm/patients/:id/{vitals,alerts,thresholds}` backed by persistent vitals + threshold models. Tests: vitals domain units, Testcontainers Postgres + Redis, Pact, Playwright `rpm.patient-dashboard`.
3. **Labs Pipeline** – Wire `POST /labs/analyze`, `GET /labs/results`, `GET /labs/trends` with S3-like storage, async jobs, and scan callbacks mirroring MSW contract. Tests: file upload unit mocks, integration with MinIO/Testcontainers, Playwright `labs.analyze-upload`.
4. **Billing-EDI Skeleton** – Deliver `POST /billing/837`, `/billing/ack/999`, `/billing/status/277ca`, `/billing/835` with golden-file fixtures to ensure no GPL contamination. Tests: golden 837 generation, EDI parse units, contract verification.

### Should Have
1. **OpenAPI Contract Suite** – Author `contracts/*.openapi.yaml`, regenerate SDK/mocks, and add openapi-diff gating so FE integrations remain type-safe.
2. **Audit & Observability Service** – Stream request metadata and domain events to append-only store and expose `/audit` APIs for compliance.
3. **Eligibility Microservice** – Build `/eligibility/270` + `/eligibility/271/{id}` bridging JSON ↔ X12 with companion-guide configuration.

### Could Have
1. **Analytics Dashboard APIs** – `/analytics/dashboard`, `/analytics/reports`, `/analytics/export` delivering aggregated metrics with caching.
2. **Messaging Admin Enhancements** – Solidify templates/schedules endpoints with rate limiters and outbox worker integration.

### Won’t Have (This Phase)
- Advanced AI diagnostics and wearables ML pipelines (defer after core EHR parity).

## Acceptance & Test Strategy
- **Contracts:** OpenAPI definitions synchronized with SDK/MSW; `openapi-diff` clean.
- **Unit:** ≥80% coverage on scheduling slot allocators, vitals threshold calculators, lab analyzers, EDI formatters.
- **Integration:** Testcontainers (Postgres, Redis, S3/MinIO) validating transactions, locks, and job orchestration.
- **Contract/Pact:** Provider verification for adapters (`/patients`, `/labs`, `/medications`, new services).
- **E2E:** Existing Playwright suites (`scheduling.book-appointment`, `rpm.patient-dashboard`, `labs.analyze-upload`, UAT smoke) run without FE modifications.
- **Chaos & Resilience:** Simulate `?chaos=1` query path to ensure structured error responses.

## Licensing Guidance
- Maintain strict separation from GPL code: interoperate via API/FHIR/X12 only, design clean-room implementations, and document any reference material; avoid copying OpenEMR source snippets.【45e6dd†L1-L12】【48da57†L1-L14】

