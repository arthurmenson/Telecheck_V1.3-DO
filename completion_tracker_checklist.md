## Completion Tracker Checklist

Last updated: 2025-09-21

Legend:
- [x] Complete
- [ ] In progress / planned

### Production Hardening

- [x] Align Node/Docker runtime with CI (upgrade images to Node 20 and verify builds)
- [x] Commit DigitalOcean App Platform spec (e.g., .do/app.yaml) and secret management plan
- [ ] Replace local SQLite artifacts with managed Postgres configuration and migrations
- [ ] Add automated smoke tests for dist/server build and /api/health before deploy
 - [x] Add automated smoke tests for dist/server build and /api/health before deploy

### Backend Microservices

- Auth
  - [x] Service (`services/auth`)
  - [x] Server route (`server/routes/auth.ts`)
  - [x] OpenAPI contract (`contracts/auth.openapi.yaml`)
  - [x] Unit tests (`services/auth/tests/unit`)
  - [ ] Dedicated E2E spec

- Billing
  - [x] Service skeleton (`services/billing`)
  - [x] Routes implemented
  - [ ] Unit tests
  - [ ] Client integration
  - [ ] OpenAPI contract

- EHR
  - [x] Service with routes (`services/ehr/src/routes/*`)
  - [x] OpenAPI contract (`contracts/ehr.openapi.yaml`)
  - [x] Unit tests (`services/ehr/tests/unit`)
  - [x] E2E: Intake (`e2e/ehr.intake.spec.ts`)
  - [x] E2E: Scheduling (`e2e/scheduling.book-appointment.spec.ts`)

- Gateway
  - [x] Service skeleton (`services/gateway`)
  - [x] Public routes
  - [x] Unit tests

- Labs
  - [x] Service (`services/labs`)
  - [x] Server routes (`server/routes/analyze-lab.ts`, `server/routes/labs.ts`)
  - [x] OpenAPI contract (`contracts/labs.openapi.yaml`)
  - [x] Unit tests (`services/labs/tests/unit`)
  - [x] E2E: Upload/Analyze (`e2e/labs.analyze-upload.spec.ts`)

- Medications
  - [x] Service (`services/medications`)
  - [x] Server route (`server/routes/medications.ts`)
  - [x] OpenAPI contract (`contracts/medications.openapi.yaml`)
  - [x] Unit tests (`services/medications/tests/unit`)
  - [x] E2E: Interactions (`e2e/medications.interactions.spec.ts`)

- Messaging Admin
  - [x] Service (`services/messaging-admin`)
  - [x] Server route (`server/routes/messaging-admin.ts`)
  - [x] Unit tests (`services/messaging-admin/tests/unit`)
  - [x] Client integration (`client/services/messagingAdmin.service.ts`)
  - [x] OpenAPI contract

- RPM (Remote Patient Monitoring)
  - [x] Service with routes (`services/rpm/src/routes/*`)
  - [x] OpenAPI contract (`contracts/rpm.openapi.yaml`)
  - [x] Unit tests (`services/rpm/tests/unit`)
  - [x] E2E: Dashboard (`e2e/rpm.patient-dashboard.spec.ts`)
  - [x] Client thresholds integration (`client/services/patientThresholds.service.ts`)

### Server Routes (Platform APIs)

- [x] `server/routes/health.ts` (healthcheck)
- [x] `server/routes/patients.ts` (patients)
- [x] `server/routes/patient-thresholds.ts` (rpm thresholds)
- [x] `server/routes/vitals.ts` (vitals)
- [x] `server/routes/vital-monitoring.ts` (monitoring)
- [x] `server/routes/wearables.ts` (wearables)
- [x] `server/routes/labs.ts`, `analyze-lab.ts` (labs)
- [x] `server/routes/medications.ts` (medications)
- [x] `server/routes/messaging-admin.ts` (messaging admin)
- [x] `server/routes/auth.ts` (auth)
- [x] `server/routes/fhir.ts` (basic integration)
- [x] `server/routes/telemedicine.ts` (basic integration)
- [x] `server/routes/insights.ts` (basic integration)
- [x] `server/routes/chat.ts` (basic integration)
- [x] `server/routes/users.ts` (basic integration)
- [x] `server/routes/webhooks.ts` (basic integration)
- [x] `server/routes/demo.ts` (demo endpoints)
- [x] `server/routes/advanced-ai.ts` (experimental)

- [x] `server/routes/erx.ts` (e-prescribing)
- [x] `server/routes/conditions.ts` (clinical conditions)
- [x] `server/routes/allergies.ts` (clinical allergies)
- [x] `server/routes/immunizations.ts` (immunizations)
- [x] `server/routes/encounters.ts` (encounters)
- [x] `server/routes/orders.ts` (CPOE)
- [x] `server/routes/billing.ts` (claims/ERA)
- [x] `server/routes/eligibility.ts` (270/271)
- [x] `server/routes/smart.ts` (SMART on FHIR)
- [x] `server/routes/hl7.ts` (HL7 v2 ingest/status)
- [x] `server/routes/telehealth-advanced.ts` (video token, consent, check-in, crosswalk)
- [x] `server/routes/cds.ts` (CDS Hooks)

### Client Application

- Services
  - [ ] `client/services/api.service.ts`
    - [x] Replace stubbed analytics export logic with real API calls
    - [x] Add read endpoints (e.g., user preferences) and align hook usage
    - [ ] Extend test coverage for critical domains (medications, programs, billing)
      - [x] Program service endpoint tests
      - [ ] Medication service tests
      - [ ] Billing service tests
  - [x] `client/services/patient.service.ts`
  - [x] `client/services/patientThresholds.service.ts`
  - [x] `client/services/messagingAdmin.service.ts`

- Hooks & Query
  - [ ] React Query API hooks (`client/hooks/api/*`)
    - [x] Import hygiene (add missing `react` and infinite-query helpers)
    - [x] Ensure logout clears all cached data securely
    - [x] Add unit tests covering optimistic updates/pagination flows

- Client Lib
  - [ ] API client hardened (`client/lib/api-client.ts`)
    - [x] Fix `ApiError` typing and handle 204/binary responses
    - [x] Allow multipart/form-data without forcing JSON headers
    - [x] Wire abort signals and retry logging through fetch
- Adapters
  - [x] EHR (`lib/adapters/ehrAdapter.ts`)
  - [x] Labs (`lib/adapters/labsAdapter.ts`)
  - [x] Medications (`lib/adapters/medicationsAdapter.ts`)
  - [x] RPM (`lib/adapters/rpmAdapter.ts`)
  - [x] Scheduling (`lib/adapters/schedulingAdapter.ts`)
  - [x] Pharmacy (`lib/adapters/pharmacyAdapter.ts` adapter present; service/contract done)

- Features (E2E/UAT backed)
  - [x] Patient Intake (`e2e/ehr.intake.spec.ts`)
  - [x] Scheduling (`e2e/scheduling.book-appointment.spec.ts`)
  - [x] RPM Dashboard (`e2e/rpm.patient-dashboard.spec.ts`)
  - [x] Labs Upload/Analyze (`e2e/labs.analyze-upload.spec.ts`)
  - [x] Medications Interactions (`e2e/medications.interactions.spec.ts`)
  - [x] Auth flows (helpers in `e2e/helpers/auth.ts`)

### Contracts & Testing

- OpenAPI
  - [x] Auth (`contracts/auth.openapi.yaml`)
  - [x] EHR (`contracts/ehr.openapi.yaml`)
  - [x] Labs (`contracts/labs.openapi.yaml`)
  - [x] Medications (`contracts/medications.openapi.yaml`)
  - [x] RPM (`contracts/rpm.openapi.yaml`)
  - [x] Messaging Admin
  - [x] Billing

- Contract tests
  - [x] Pact sample (`contracts/pact/patient.get.pact.test.ts`)
  - [x] Billing OpenAPI smoke test

- E2E / UAT
  - [x] Playwright specs (`e2e/*`)
  - [x] UAT reports (`test-results/*`, `UAT_FINAL_REPORT.md`)

### DevOps & Platform

- [x] Dockerfiles & compose (dev/prod)
- [x] Deployment scripts (DigitalOcean / Netlify)
- [x] External DB setup and migrations guides
- [x] Netlify function bridge (`netlify/functions/api.ts`)
- [ ] CI/CD pipelines (GitHub Actions/Netlify Build)

### Observability & Security

- [x] Telemetry hooks (`lib/telemetry.ts`)
- [x] Redaction utilities (`lib/redact.ts`)
- [x] Helmet/CORS hardening
- [ ] APM/Sentry/Datadog integration

### Pending Enhancements / Next Up

- [ ] Billing: client integration, tests, and OpenAPI contract
- [ ] Expose Gateway public routes and add tests
 - [x] Expose Gateway public routes and add tests
- [ ] Add Messaging Admin OpenAPI contract
- [ ] Stand up Pharmacy domain (service, routes, contract, client)
 - [x] Stand up Pharmacy domain (service, routes, contract, client)
- [ ] Add CI/CD pipelines
- [ ] Add observability APM (Sentry/New Relic/Datadog)
- [ ] Load/perf testing (k6/Artillery)
- [ ] Accessibility audit (a11y)
- [ ] i18n/l10n framework
- [ ] Strengthen RBAC across client/server

## OpenEMR Feature Gap Analysis (snapshot)

- Patient demographics/registry: Present (basic). Gaps: richer insurance, multiple identifiers, longitudinal history, contacts.
- Scheduling: Present (double-booking prevention, reminders). Gaps: multi-facility/resource calendars, recurring appts, patient flow board, no-show workflows.
- Clinical chart/EMR: Partial. Gaps: Problems/Conditions, Allergies, Immunizations, Encounters with CPT/ICD, Orders/CPOE, clinical note types, growth charts.
- e-Prescribing (eRx/EPCS): Partial (stubs). No Surescripts/NewCrop/EPCS vendor integration; refill/cancel/change vendor flows; EPCS real 2FA.
- Billing/RCM: Partial RPM/CCM time tracking. Gaps: X12 837/835, 270/271 eligibility, clearinghouse, payer rules/denials, ERA auto-posting, charge capture from encounters.
- Patient portal: Present. Gaps: CCD/C-CDA download, proxy access, online bill pay, refill requests.
- Interoperability: Partial FHIR (Patient/Observation). Gaps: broader FHIR R4 (Encounter, Condition, AllergyIntolerance, Medication/MedicationRequest, Immunization, CarePlan, DocumentReference), SMART on FHIR, HL7 v2 (ADT/ORM/ORU/VXU), C-CDA.
- Labs/Imaging: Partial labs; no HL7 OML/ORU, no DICOM/PACS viewer.
- Clinical decision support: Prototype UI. Gaps: CDS Hooks integration, authoritative drug DBs (RxNorm/SNOMED/First Databank/Lexicomp), override/audit.
- Telehealth: Present basics. Gaps: embedded video vendor, eConsent, eRx from visit, virtual check-in, billing crosswalk (99441-99443).
- Security/RBAC/Audit: Present baseline. Gaps: full audit reporting, break-glass, consent directives, fine-grained PHI masking, ONC 170.315(d) controls.
- Reporting/analytics: Partial. Gaps: MIPS/QPP measures, customizable dashboards, BI exports.
- Localization/i18n: Missing.
- Referrals/orders: Missing (inbound/outbound, e-fax).
- Immunizations: Missing (registry VXU/QBP, schedules).

## Recommended Development Backlog (prioritized)

### Epic 1: e-Prescribing (eRx & EPCS)
- Acceptance criteria:
  - Providers can search RxNorm and submit electronic prescriptions; statuses visible (queued/sent/filled).
  - Controlled substances require EPCS (2FA); full audit trail captured.
  - Refill/cancel/change supported; medication history import where available.
- Implementation mapping:
  - Endpoints: add `EHR.ERX` group in `client/lib/api-endpoints.ts`.
  - Client services/hooks: `client/services/api.service.ts`, `client/hooks/api/useErx*`.
  - Types: extend `shared/types.ts` (Medication, MedicationRequest, PrescriptionStatus).
  - Server: `server/routes/erx.ts`; vendor adapter under `services/medications` or new `services/erx`.
  - Gateway: route prefix in `services/gateway/src/app.ts`.

### Epic 2: Clinical Chart Expansion (Problems/Allergies/Immunizations/Encounters/CPOE)
- Acceptance criteria:
  - CRUD for Condition, AllergyIntolerance, Immunization, Encounter; link to patient.
  - Encounters support ICD-10-CM diagnoses and CPT/HCPCS procedures; orders placed via CPOE.
  - Notes templates (H&P, SOAP, Televisit) with sign/lock and audit.
- Implementation mapping:
  - Endpoints: `EHR.CHARTING`, `EHR.CARE_PLANS` extensions in `client/lib/api-endpoints.ts`.
  - Client services/hooks: `client/services/api.service.ts`, `client/hooks/api/useChart*`.
  - Types: add FHIR-aligned types in `shared/types.ts` (Condition, AllergyIntolerance, Encounter, Immunization, ServiceRequest, Procedure).
  - Server: new routes under `server/routes/*` and/or `services/ehr/src/routes/*`.

### Epic 3: Interoperability (FHIR/SMART/HL7 v2)
- Acceptance criteria:
  - Support FHIR R4 resources: Patient, Encounter, Condition, AllergyIntolerance, Medication/MedicationRequest, Immunization, CarePlan, DocumentReference.
  - SMART on FHIR OAuth flow for apps; scoped access.
  - HL7 v2 interfaces for ADT/ORM/ORU and VXU (immunization registry).
- Implementation mapping:
  - Endpoints: expand `server/routes/fhir.ts`; SMART auth endpoints.
  - Utils: `server/utils/fhirIntegration.ts` enhancements; new HL7 engine utility.
  - Gateway: expose FHIR base path.

### Epic 4: Billing & RCM (837/835/Eligibility/Clearinghouse)
- Acceptance criteria:
  - Generate 837P/837I claims from encounters; upload to clearinghouse; track statuses.
  - Ingest 835 ERA for auto-posting; manage denials; payer rules engine.
  - Real-time eligibility (270/271) with responses surfaced in UI.
- Implementation mapping:
  - Endpoints: `EHR.BILLING` in `client/lib/api-endpoints.ts` (claims, era, eligibility).
  - Client services/hooks: `client/services/api.service.ts`, `client/hooks/api/useBilling*`.
  - Server/services: `services/billing` (claims, eligibility), `server/routes/billing.ts`.
  - Gateway: `/api/billing`, `/api/eligibility` already scaffolded.

### Epic 5: Scheduling Enhancements (multi-facility/resources/flow board)
- Acceptance criteria:
  - Calendars by location, provider, room/device; recurring rules; patient flow board.
  - Automated reminders (SMS/email/voice) with configurable cadence; no-show handling.
- Implementation mapping:
  - Endpoints: extend `EHR.SCHEDULING` in `client/lib/api-endpoints.ts`.
  - Client hooks: `client/hooks/api/useScheduling*`.
  - Server: `services/ehr/src/routes/scheduling.ts` expansions; `server/utils/scheduledMessaging.ts`.

### Epic 6: Telehealth Maturity
- Acceptance criteria: embedded video provider, eConsent capture, virtual check-in, CPT crosswalk.
- Mapping: `server/routes/telemedicine.ts`, `client/pages/*` telehealth, new `useTelehealth*` hooks.

### Epic 7: Patient Portal Enhancements
- Acceptance criteria: CCD/C-CDA export, proxy access, online bill pay, refill requests.
- Mapping: `client/pages/ehr/PatientPortal.tsx`, billing hooks, document download endpoints.

### Epic 8: Clinical Decision Support (CDS Hooks + Drug DB)
- Acceptance criteria: CDS Hooks triggers during orders; override with reason and audit; drug-interaction alerts from external DB.
- Mapping: `client/components/ClinicalDecisionSupport.tsx`, new `server/routes/cds.ts`, vendor adapter.

### Epic 9: Labs & Imaging Integrations
- Acceptance criteria: HL7 OML/ORU orders/results; interface to lab vendors; DICOM viewer/PACS gateway.
- Mapping: `services/labs`, new imaging service, FHIR `ServiceRequest`/`DiagnosticReport`.

### Epic 10: Security/Compliance
- Acceptance criteria: break-glass, consent directives, PHI masking, expanded audit reports; ONC 170.315(d) controls.
- Mapping: audit in `services/ehr/src/app.ts`, new consent module, admin audit UI.

### Epic 11: Reporting/Analytics
- Acceptance criteria: MIPS/QPP measures; customizable dashboards; exports for BI tools.
- Mapping: expand `ANALYTICS` endpoints/hooks; measure calculators service.

### Epic 12: Localization/i18n
- Acceptance criteria: i18n framework, language packs, RTL support, locale formats.
- Mapping: `client` i18n setup, server locale handling.

Note: Follow repo API architecture best practices: define endpoints in `client/lib/api-endpoints.ts`, implement domain services in `client/services/api.service.ts`, expose React Query hooks under `client/hooks/api/`, and add shared models to `shared/types.ts`. Wire server routes under `server/routes/*` or dedicated microservices in `services/*`, and register prefixes via `services/gateway/src/app.ts`.

---

## Detailed Tickets: Epics 1â€“3

### Epic 1: e-Prescribing (eRx & EPCS)
- [x] Server: Create `server/routes/erx.ts` with endpoints: POST `/api/erx/prescriptions`, GET `/api/erx/prescriptions/:id`, POST `/api/erx/prescriptions/:id/cancel`, POST `/api/erx/prescriptions/:id/refill`, POST `/api/erx/epcs/verify`, GET `/api/erx/history/:patientId`
- [x] Service: Add vendor adapter `services/erx` (search drugs, submit Rx, check status, refill/cancel)
- [x] Gateway: Register `/api/erx` route in `services/gateway/src/app.ts`
- [x] Client endpoints: Add `EHR.ERX` to `client/lib/api-endpoints.ts`
- [x] Client services: Methods in `client/services/api.service.ts` (createRx, getRx, cancel, refill, epcsVerify, history)
- [x] Hooks: `client/hooks/api/index.ts` (queries/mutations with React Query)
- [x] UI: Basic Rx composer and status panel; tie to `MedicationRequest`
- [x] Types: Extend `shared/types.ts` with FHIR `MedicationRequest` minimal fields
- [x] Contracts: Draft `contracts/erx.openapi.yaml`
- [x] Tests: Unit tests for service/route; E2E for eRx happy path

### Epic 2: Clinical Chart Expansion (Problems/Allergies/Immunizations/Encounters/CPOE)
- [x] Types: Add FHIR-aligned types (Condition, AllergyIntolerance, Immunization, Encounter, ServiceRequest)
- [x] Endpoints: Add `EHR.CONDITIONS`, `EHR.ALLERGIES`, `EHR.IMMUNIZATIONS`, `EHR.ENCOUNTERS`, `EHR.ORDERS` to `client/lib/api-endpoints.ts`
- [x] Server routes: CRUD routes under `server/routes/*` (conditions, allergies, immunizations, encounters, orders)
- [x] Client services/hooks: `client/services/api.service.ts`, `client/hooks/api/index.ts`
- [ ] UI: Simple registry tables + detail drawers; link to encounters
- [ ] Coding: Support ICD-10-CM and CPT capture in Encounter
- [ ] Contracts: Update `contracts/ehr.openapi.yaml` with new schemas/paths
- [ ] Tests: Unit tests and minimal E2E for CRUD operations

### Epic 3: Interoperability (FHIR/SMART/HL7 v2)
- [x] FHIR: Expand `server/routes/fhir.ts` for key resources and bundle export/import
- [x] SMART: Add OAuth endpoints (discovery, authorize, token); scopes controlled per role (stubs)
- [x] Client endpoints: Add `FHIR.*` and `SMART.*` to `client/lib/api-endpoints.ts`
- [x] HL7 v2: Create interface utility (ADT/ORM/ORU/VXU) and config; basic queue/ack (stubs)
- [x] Audit: Log all exports/imports with PHI redaction per policy
- [ ] Tests: Contract tests for FHIR resources; unit tests for SMART auth flows

### Epic 4: Billing & RCM (837/835/Eligibility/Clearinghouse)
- [x] 837P generator & claim status endpoints (`/api/billing/claims/837p`, `/api/billing/claims/:id/status`)
- [x] Eligibility 270 endpoint and 271 response (`/api/eligibility/check`)
- [x] 835 ERA ingestion stub (`/api/billing/era/835`)
- [x] Clearinghouse adapter configuration (`server/utils/clearinghouseAdapter.ts`)
- [x] Charge capture UI (`client/components/RCMChargeCapture.tsx`)
- [x] Denial management dashboard (`client/components/RCMDenialDashboard.tsx`)
- [ ] Client services/hooks for billing & eligibility
 - [x] Client services/hooks for billing & eligibility
- [ ] OpenAPI contracts for billing/eligibility
- [ ] Unit tests (billing/eligibility)
- [ ] E2E happy paths (837P, eligibility, ERA posting)

### Epic 5: Scheduling Enhancements (multi-facility/resources/flow board)
- [x] Multi-facility & resource calendars (provider/room/device views)
- [x] Recurring appointment rules
- [x] Patient flow board (arrived/roomed/with provider/complete)
- [ ] No-show workflows and reconciliation
- [x] Enhanced reminders (SMS/email/voice cadence & templates)

### Epic 6: Telehealth Maturity
- [ ] Embedded video SDK integration
- [x] eConsent capture during visit
- [x] Virtual check-in flow
- [x] CPT crosswalk for telehealth billing

### Epic 7: Patient Portal Enhancements
- [x] CCD/C-CDA export/download (server route)
- [x] Proxy access management (server route)
 - [x] Online bill pay (server route)
 - [x] Refill requests from portal (server route)

### Epic 8: Clinical Decision Support (CDS Hooks + Drug DB)
- [x] CDS Hooks service & triggers during ordering
- [x] External drug database integration (interactions/contraindications)
- [ ] Alert override with reason & audit trail
  - [x] Server override capture endpoint

### Epic 9: Labs & Imaging Integrations
- [x] HL7 v2 OML/ORU lab orders/results integration (server routes)
- [x] DICOM viewer for imaging (server route)
- [x] PACS connector configuration (server route)

### Epic 10: Security/Compliance
- [x] Break-glass access flow (server route)
- [x] Consent directives enforcement (server route)
- [ ] Per-field PHI masking policy & implementation
- [ ] Audit reports UI & export (admin)

### Epic 11: Reporting/Analytics
- [x] MIPS/QPP measure calculators (server route)
- [x] Custom dashboard builder (client)
- [x] Data export for BI tools (CSV/XLSX) (client stub)

### Epic 12: Localization/i18n
- [x] i18n framework & language packs (client)
- [x] RTL support & locale-based formatting

### Ticket Backlog (live)

- [x] Finalize eRx server routes and request validation
- [ ] Implement eRx vendor adapter service (sandbox)
- [ ] Add eRx client service tests and mocks
- [ ] Build Rx composer UI and status panel
- [ ] Create eRx React Query hooks tests
- [ ] Write e2e happy-path for eRx createâ†’verifyâ†’send
- [x] Implement Conditions CRUD (server routes, types, client, hooks, UI)
- [x] Implement Allergies CRUD (server routes, client, hooks, UI)
- [x] Implement Immunizations CRUD + registry fields
- [x] Implement Encounters CRUD with ICD-10/CPT capture
- [x] Add Orders/CPOE routes for labs/imaging/meds
- [x] Expand FHIR R4 resources (Encounter, Condition, Allergy, Immunization, Med/MedRequest)
- [x] Implement SMART on FHIR authorize/token endpoints
- [x] Scaffold HL7 v2 interface (ADT/ORM/ORU/VXU) with queue/ack
- [x] Audit import/export events with PHI redaction
- [ ] Add contract tests for FHIR resource endpoints
- [x] Generate 837P claims from Encounters (server service)
- [x] Integrate 270/271 eligibility checks
- [x] Ingest 835 ERA and auto-post payments
- [x] Implement clearinghouse adapter configuration
- [x] Add charge capture UI in Encounter workflow
- [x] Build denial management dashboard
- [ ] Add multi-facility/resource scheduling views
- [ ] Support recurring appointments rules
- [ ] Implement patient flow board with statuses
- [ ] Add no-show workflows and reconciliation
- [ ] Enhance reminders (voice/SMS/email cadence)
- [ ] Integrate embedded video SDK for telehealth
- [x] Add eConsent capture to telehealth visit
- [x] Implement virtual check-in flow
- [x] Map telehealth visits to CPT billing crosswalk
- [ ] Enable CCD/C-CDA export in patient portal
- [ ] Add proxy access management
- [ ] Implement online bill pay in portal
- [ ] Allow refill requests from portal
- [x] Implement CDS Hooks service and triggers
- [ ] Integrate external drug DB for interactions
- [ ] Add alert override with reason and audit
- [ ] Add HL7 OML/ORU lab orders/results integration
- [ ] Add DICOM viewer for imaging
- [ ] Implement PACS connector configuration
- [ ] Implement break-glass access flow
- [ ] Add consent directives enforcement
- [ ] Per-field PHI masking rules and policy
- [ ] Audit reports UI and export
- [x] Audit reports UI and export
- [ ] Implement MIPS/QPP measure calculators
- [ ] Add custom dashboard builder
- [x] Add custom dashboard builder
- [ ] Data export to BI tools (CSV/XLSX)
- [x] Data export to BI tools (CSV/XLSX)
- [ ] Add i18n framework and language packs
- [ ] Enable RTL and locale formatting


Maintenance: This file is a living checklist. Update it whenever modules advance (new routes, contracts, tests, or e2e coverage). The assistant will keep it current on each change request.


