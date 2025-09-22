# Telecheck Production-Grade Healthcare Platform Checklist

This checklist consolidates the technical, operational, and compliance controls required to deploy Telecheck as a production-ready healthcare platform. Use it alongside the implementation roadmap below to track readiness by marking each item as complete (`[x]`), in progress (`[~]`), or not started (`[ ]`). Each bullet now includes the **next actionable step** so workstreams can move forward without additional triage.

## Status Legend

- `[ ]` Not started – no engineering or operational effort assigned yet.
- `[~]` In progress – work is underway but exit criteria are unmet.
- `[x]` Complete – engineering shipped, documentation stored, and evidence captured.

## Immediate Implementation Priorities

- [x] Harden patient APIs by removing the default demo auth bypass and gating it behind the `ENABLE_DEMO_AUTH_BYPASS` flag (defaults to `false`).
- [x] Replace seeded super-admin credentials with a scripted bootstrap flow that requires secure, environment-scoped secrets. — _Completed: added `npm run bootstrap:admin` to hash env-scoped credentials and removed hard-coded SQL seed._
- [~] Stand up centralized secrets management (e.g., Doppler, Vault, AWS Secrets Manager) and wire it into the Node/Express config loader. — _Progress: Added a managed secret validation CLI (`npm run secrets:check`), wired configuration loaders to secret references, and now sign AWS Secrets Manager requests directly with SigV4 plus response caching; Next: migrate platform credentials into AWS and enable automated rotation policies._
- [~] Define IaC baselines (Terraform/Pulumi) for staging and production so Phase 1 hardening work has deployment targets. — _Progress: Added `infra/terraform` modules covering VPC, ALB, RDS, ElastiCache, and ECS Fargate service with Secrets Manager integration; Next: configure remote state backends, per-environment workspaces, and CI automation._
- [~] Draft the ONC certification gap assessment and identify which product capabilities need roadmap commitments. — _Progress: Published an initial ONC Cures Update gap analysis in `docs/ONC_GAP_ASSESSMENT.md` covering criteria status and remediation plan; Next: secure cross-functional sign-off and translate gaps into roadmap epics._

## Implementation Roadmap

| Phase                                                  | Objective                                                                     | Key Deliverables                                                                                                                                                                                                                                                                                                          | Owners                                   | Dependencies | Target Timeline |
| ------------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------ | --------------- |
| **0. Foundations & Planning**                          | Establish governance, staffing, and baseline architecture decisions.          | • Appoint security/privacy officer, compliance lead, and release manager.<br>• Finalize hosting region(s), data residency strategy, and IaC baseline.<br>• Approve budget and vendor list (clearinghouse, eRx, monitoring, payments).                                                                                     | Executive sponsor, Compliance, DevOps    | None         | Weeks 1-2       |
| **1. Security, Compliance & Infrastructure Hardening** | Satisfy HIPAA/ONC controls, lock down environments, and automate deployments. | • Complete HIPAA administrative/physical/technical safeguard audits.<br>• Stand up secrets manager, SSO, MFA, centralized logging/SIEM.<br>• Deliver Terraform (or Pulumi) stacks for prod/stage with automated backups and monitoring.<br>• Run third-party penetration test and remediate findings.                     | Security Engineering, DevOps, Compliance | Phase 0      | Weeks 3-8       |
| **2. Clinical Safety & Interoperability**              | Validate clinical workflows, AI governance, and data exchange capabilities.   | • Stand up CDS/AI review board and document validation protocols.<br>• Integrate drug database, formulary, and allergy reconciliation.<br>• Implement FHIR R4 endpoints, SMART-on-FHIR auth, and HL7 interface tests.<br>• Build patient consent flows and accessibility audits (WCAG 2.1 AA).                            | Clinical Ops, Backend, Product, UX       | Phases 0-1   | Weeks 6-12      |
| **3. Revenue Cycle & Practice Management**             | Deliver end-to-end billing, payments, scheduling, and reporting features.     | • Connect clearinghouse for eligibility and claims (270/271, 837/835).<br>• Implement payment gateway (PCI-compliant) and patient billing portal.<br>• Add denial management workflows and financial dashboards.<br>• Ship template-based scheduling with resource management and waitlists.                              | Revenue Cycle Team, Backend, Frontend    | Phases 1-2   | Weeks 10-16     |
| **4. Quality Assurance & Operational Readiness**       | Ensure testing coverage, support readiness, and go-live procedures.           | • Achieve automated test coverage targets (unit, integration, e2e, accessibility).<br>• Complete UAT with clinician sign-off and publish release notes.<br>• Prepare runbooks, on-call rotation, SLAs, and training assets.<br>• Execute disaster recovery drill and performance/load test sign-off.                      | QA, Support, DevOps, Product Enablement  | Phases 1-3   | Weeks 14-18     |
| **5. Commercial Launch & Continuous Compliance**       | Finalize legal/commercial assets and operational monitoring.                  | • Publish updated Terms of Service, Privacy Policy, BAAs, and insurance coverage certificates.<br>• Execute vendor risk assessments and incident response tabletop exercise.<br>• Launch NPS/CSAT program and customer feedback loop.<br>• Schedule quarterly compliance/penetration retests and release cadence reviews. | Legal, Compliance, Customer Success      | Phases 1-4   | Weeks 18-20     |

### Sprint & Tracking Guidance

- Create Jira (or equivalent) epics mirroring each phase with stories tied to the specific checklist items below.
- Gate promotion between environments on completion of the preceding phase’s exit criteria.
- Maintain a centralized dashboard that surfaces checklist status, owner, and evidentiary artifacts (policy docs, test reports, certifications).

## Execution Agents & Action Plans

To convert the checklist into a repeatable execution system, assign the following cross-functional agents (humans or automation owners) and ensure each agent maintains the described runbooks and tooling.

| Agent                               | Scope                                                | Primary Actions                                                                                                               | Cadence      | Tooling                                                          |
| ----------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------- |
| **Readiness Program Manager (RPM)** | Overall delivery, roadmap, and stakeholder alignment | Facilitate weekly steering review, update roadmap milestones, unblock dependencies, publish status digest                     | Weekly       | Jira/Linear, Confluence, Slack updates                           |
| **Compliance & Risk Agent**         | Sections 1 & 9                                       | Maintain regulatory gap tracker, drive policy approvals, track legal/compliance evidence, coordinate ONC & HIPAA deliverables | Bi-weekly    | GRC platform, contract management system, shared evidence folder |
| **Security Engineering Agent**      | Sections 2 & 6                                       | Own secrets manager rollout, IAM/SSO integrations, infrastructure hardening, and penetration test remediation board           | Twice weekly | Terraform repo, SIEM, security findings board                    |
| **Clinical Safety Agent**           | Section 4                                            | Chair CDS/AI governance meetings, ensure clinical validation, coordinate accessibility & consent UX reviews                   | Bi-weekly    | Clinical review workspace, UX research repository                |
| **Interoperability & Data Agent**   | Section 3                                            | Lead FHIR/HL7 implementation, backup/retention design, data migration rehearsal schedule, analytics de-identification plan    | Weekly       | Integration backlog, data architecture diagrams                  |
| **Revenue Cycle Agent**             | Section 5                                            | Drive clearinghouse onboarding, billing workflows, financial dashboard requirements, and payment vendor integration           | Weekly       | Revenue cycle board, finance collaboration workspace             |
| **Quality & Release Agent**         | Section 7                                            | Track automated testing coverage, regression suites, release readiness checklist, and UAT execution                           | Twice weekly | CI dashboards, test analytics, release calendar                  |
| **Operations & Support Agent**      | Section 8                                            | Build runbooks, define support tiers/SLAs, coordinate training and feedback loop instrumentation                              | Weekly       | ITSM tool, knowledge base CMS                                    |

Each agent owns a living backlog with tickets linked to the relevant checklist entries. The RPM validates that every checklist item has a named agent and at least one actionable ticket before work begins.

### Step-by-Step Action Loop

1. **Triage & Breakdown** – RPM and the responsible agent review unchecked items during the readiness intake meeting, documenting acceptance criteria, dependencies, and evidence requirements.
2. **Ticket Creation** – Agents create granular stories/tasks in the shared backlog, tagging the checklist reference (e.g., `PRC-1 HIPAA Technical Safeguards`).
3. **Execution & Evidence Capture** – While executing, agents attach artifacts (policies, screenshots, test logs) to the task and update the checklist placeholder in this document once acceptance criteria are met.
4. **Peer Review & QA** – Another domain expert or QA representative reviews outputs, logs sign-off in the backlog, and verifies automation/monitoring alerts where relevant.
5. **Status Broadcast** – RPM consolidates agent updates into the weekly readiness report, highlighting blockers, upcoming milestones, and new risks.

### Progress Tracking Framework

Maintain a shared “Production Readiness Control Tower” view that syncs with project management tooling. Recommended dashboard structure:

- **Checklist Table View** – Columns: `Domain`, `Checklist Item`, `Agent`, `Status`, `Start Date`, `Target Date`, `Evidence Link`, `Risk/Notes`.
- **Burndown & Timeline Charts** – Visualize remaining unchecked items per phase and projected completion dates.
- **Risk Register** – Track severity/likelihood, owner, mitigation plan, and next review date for obstacles uncovered by any agent.
- **Evidence Repository Index** – Map each completed item to stored artifacts (e.g., `/compliance/hipaa-audit-2024/summary.pdf`).

Automate weekly snapshots of the dashboard (e.g., exporting Jira filters or Notion databases) to preserve audit history. Any deviation from target timelines must include a corrective action, owner, and revised ETA approved during the steering review.

## 1. Regulatory & Compliance

_Primary Roadmap Alignment: Phases 0, 1, and 5_

- [ ] **ONC Certification Roadmap**: Document certification scope (CEHRT criteria, 21st Century Cures updates) and establish timelines with accredited testing labs. — _Next: Draft the gap assessment and align budget/timeline with prospective ONC test labs._
- [ ] **HIPAA Administrative Safeguards**: Implement and document security management process, workforce training, and sanction policies. — _Next: Update the security management policy and schedule mandatory workforce HIPAA training._
- [ ] **HIPAA Physical Safeguards**: Ensure secure hosting facilities, disaster recovery sites, and device/media controls. — _Next: Confirm data center vendor attestations and document media disposal/asset inventory procedures._
- [ ] **HIPAA Technical Safeguards**: Enforce access controls, unique user IDs, automatic logoff, encryption in transit/at rest, and audit trails. — _Next: Audit the authentication stack for MFA coverage and verify encryption-at-rest settings in Postgres and Redis._
- [ ] **MIPS/MACRA Reporting**: Provide workflows for quality measures, Promoting Interoperability, and Improvement Activities reporting. — _Next: Identify priority clinical quality measures and map required data fields to existing schemas._
- [ ] **State-Specific Regulations**: Review telehealth, data residency, consent, and prescription laws for each deployment jurisdiction. — _Next: Compile jurisdictional matrix for the initial launch states with legal review owners._
- [ ] **Business Associate Agreements (BAA)**: Execute BAAs with all vendors handling PHI (cloud infrastructure, analytics, messaging, telehealth). — _Next: Draft BAA templates and send to identified vendors for redlines._
- [ ] **GDPR/International Compliance**: Map data flows, implement data subject rights workflows, and appoint DPO if serving EU residents. — _Next: Produce a data inventory and determine whether EU/UK operations are in scope._
- [ ] **e-Prescribing Certification**: Integrate with networks like Surescripts, complete identity proofing, and certify controlled substance workflows (EPCS). — _Next: Engage eRx vendor for integration sandbox access and list API/identity proofing prerequisites._

## 2. Security & Privacy

_Primary Roadmap Alignment: Phases 0 and 1_

- [ ] **Identity and Access Management**: Enforce RBAC/ABAC, MFA for privileged accounts, and least-privilege policies. — _Next: Implement MFA enforcement in AuthContext and document privileged role provisioning workflows._
- [ ] **SSO Integration**: Support SAML/OIDC for enterprise authentication and centralized provisioning/deprovisioning. — _Next: Evaluate Auth0/Okta integration paths and spike on OIDC provider support within the auth middleware._
- [~] **Secrets Management**: Store credentials and keys in a managed vault service with rotation policies. — _Progress: Messaging configuration now persists secret manager references, the runtime resolver supports file/env providers, and AWS Secrets Manager lookups are signed with SigV4 and cached; Next: migrate service credentials into AWS, enforce IAM policies, and configure automated rotation workflows._
- [~] **Network Security**: Apply VPC segregation, WAF, DDoS protection, and VPN/Zero Trust access for admin interfaces. — _Progress: Terraform now provisions an AWS WAFv2 web ACL with managed rule groups attached to the public ALB; Next: design Shield Advanced onboarding and define VPN/Zero Trust access patterns for administrators._
- [~] **Application Security Testing**: Conduct SAST, DAST, and dependency scanning; remediate findings before release. — _Progress: Added a scripted `npm run security:scan` task that enforces high/critical vulnerability blocks via `npm audit` and wired it into the Readiness CI workflow; Next: integrate SAST/DAST tooling and expand coverage beyond dependency scanning._
- [ ] **Penetration Testing**: Schedule annual third-party penetration tests with remediation tracking. — _Next: Collect vendor quotes and define test window tied to Phase 1 exit._
- [~] **Logging & Monitoring**: Centralize logs with SIEM integrations, alert on anomalous access and PHI exports. — _Progress: Added structured JSON logging with per-request correlation IDs, async HTTPS forwarding hooks, sanitized log redaction, and a protected `/internal/metrics` endpoint that streams Prometheus-style request counters/latency summaries for dashboards; Next: wire the forwarder into the target SIEM, configure alerting dashboards, and document retention policies._
- [~] **Audit Trails**: Capture immutable access and modification logs for patient records, prescriptions, billing events. — _Progress: Persisting events to the structured `audit_logs` Postgres table with unit coverage and exposing secured retrieval/export endpoints for compliance review; Next: extend emitters to billing workflows and wire dashboards to the new APIs._
- [~] **Incident Response Plan**: Define runbooks, communication plans, breach notification templates, and conduct tabletop exercises. — _Progress: Published `docs/INCIDENT_RESPONSE_PLAN.md` detailing roles, severity matrix, workflow, communication cadence, and quarterly tabletop schedule; Next: train on-call responders and automate Jira/PagerDuty integrations before the first tabletop._
- [x] **Demo Authentication Controls**: Default patient-facing API routes to authenticated access with an opt-in `ENABLE_DEMO_AUTH_BYPASS` flag for controlled demos. — _Completed: Middleware updated to require tokens unless the flag is explicitly enabled._

## 3. Data Management & Interoperability

_Primary Roadmap Alignment: Phases 1 and 2_

- [ ] **Database Hardening**: Configure TLS, row-level security, retention policies, and automated backups with point-in-time recovery. — _Next: Enable TLS in Postgres connection settings and design backup automation with retention policies._
- [ ] **Disaster Recovery & BCP**: Establish RPO/RTO targets, secondary regions, and quarterly failover drills. — _Next: Define acceptable RPO/RTO numbers and map infrastructure components that must replicate cross-region._
- [ ] **Data Retention & Purging**: Codify retention schedules for clinical, financial, and messaging data per regulatory requirements. — _Next: Draft policy matrix tying retention timelines to database tables and archival mechanisms._
- [ ] **FHIR/HL7 Interoperability**: Validate FHIR R4 resources, implement SMART-on-FHIR auth, and test HL7v2 interfaces if required. — _Next: Inventory existing API resources and prioritize FHIR resource coverage for MVP certification._
- [ ] **Data Migration Procedures**: Provide tooling and playbooks for importing legacy EMR data with reconciliation checks. — _Next: Prototype CSV/HL7 import scripts and define reconciliation reports for clinicians._
- [ ] **Patient Access APIs**: Offer secure APIs/portals for patient data access and record export per Cures Act regulations. — _Next: Scope patient portal export features and align with authentication requirements._
- [ ] **De-identification & Analytics**: Implement pipelines for generating HIPAA-compliant limited data sets/anonymized datasets. — _Next: Select anonymization techniques and integrate with analytics warehouse design._

## 4. Product & Clinical Safety

_Primary Roadmap Alignment: Phase 2_

- [ ] **Clinical Content Governance**: Establish review boards for AI suggestions, clinical decision support (CDS), and care pathways. — _Next: Formalize governance charter and meeting cadence for CDS/AI reviews._
- [ ] **AI/ML Validation**: Document datasets, training provenance, bias assessments, and human-in-the-loop safeguards. — _Next: Inventory AI models in production and assemble model cards with validation metrics._
- [ ] **Medication Safety**: Integrate drug databases (e.g., First Databank), interaction checking, allergy reconciliation, and formulary management. — _Next: Evaluate drug knowledge base vendors and outline integration architecture._
- [ ] **Order Sets & Templates**: Provide configurable, clinically vetted templates for SOAP notes, orders, and care plans. — _Next: Gather clinician input on priority templates and design configuration UI requirements._
- [ ] **Patient Consent & Education**: Present informed consent flows for telehealth, data sharing, and wearable ingestion. — _Next: Draft consent copy and add UX tickets to integrate flows into patient onboarding._
- [ ] **Accessibility Compliance**: Validate patient and provider UIs against WCAG 2.1 AA standards. — _Next: Run automated accessibility scans (axe, Lighthouse) and queue manual audits._

## 5. Revenue Cycle & Practice Management

_Primary Roadmap Alignment: Phase 3_

- [ ] **Eligibility & Benefits Checks**: Connect to clearinghouses for real-time eligibility verification. — _Next: Select clearinghouse partner and scope API integration for 270/271 transactions._
- [ ] **Claims Management**: Support 837 generation, 835 remittance posting, denial management workflows, and payer rules. — _Next: Map required data elements for 837 files and create backlog items for remittance ingestion._
- [ ] **Coding Compliance**: Maintain updated ICD-10, CPT, HCPCS catalogs with audit trails for code suggestions. — _Next: Integrate a medical coding dataset and ensure AI-suggested codes log provenance._
- [ ] **Patient Billing & Payments**: Offer PCI-compliant payment processing, statements, payment plans, and refund workflows. — _Next: Evaluate payment gateways (Stripe, Adyen, Elavon) with PCI scope analysis._
- [ ] **Financial Reporting**: Deliver dashboards for charges, collections, AR aging, and provider productivity. — _Next: Define core financial KPIs and design data models powering the PMS dashboard._
- [ ] **Scheduling & Resource Management**: Implement template-based provider scheduling, room/equipment assignments, and waitlists. — _Next: Break down scheduling UX requirements and model recurring availability templates._

## 6. Infrastructure & Deployment

_Primary Roadmap Alignment: Phases 0 and 1_

- [~] **Environment Parity**: Standardize dev/staging/prod environments with infrastructure-as-code (Terraform/Pulumi). — _Progress: Established Terraform baseline (`infra/terraform`) provisioning AWS VPC, ALB, RDS, ElastiCache, and ECS/Fargate service plus S3/Dynamo-backed remote state configuration with workspace scaffolding, and added a GitHub Action (`terraform-readiness.yml`) that enforces `terraform fmt`, `init -backend=false`, and `validate` on every change; Next: layer environment-scoped plan/apply jobs with protected approvals and drift detection._
- [ ] **Containerization & Orchestration**: Package services in containers, deploy via Kubernetes/ECS with health probes and autoscaling. — _Next: Harden Dockerfile for production and create Helm chart/Task definition drafts._
- [~] **CI/CD Pipelines**: Automate build, test, security scans, and deployment promotions with manual approval gates for production. — _Progress: The GitHub Actions Readiness CI pipeline now runs formatting checks, executes the full Vitest suite, builds client/server bundles, publishes artifacts, and still validates secrets plus dependency scans on every push/PR, and Terraform changes trigger dedicated fmt/init/validate checks to keep IaC ready for promotion; Next: wire environment-specific deployment jobs with protected manual approvals and drift detection._
- [~] **Observability Stack**: Instrument metrics (APM, RUM), distributed tracing, and SLO dashboards for latency/error budgets. — _Progress: Introduced middleware-backed request metrics with Prometheus text output, enabled environment-controlled scraping guards, and documented configuration knobs; Next: layer application traces/APM exporters and wire metrics into the chosen observability vendor._
- [~] **Feature Flagging**: Enable controlled rollout, blue-green/canary deployments, and rollback procedures. — _Progress: Added an environment- and file-driven flag loader with request middleware plus automated tests, and exposed an authenticated Feature Flag Console (`/admin/feature-flags`) that logs changes to the audit trail so operators can toggle experiences in real time; Next: evaluate managed rollout tooling for multi-tenant segmentation and automate rollback playbooks._
- [~] **Performance & Load Testing**: Benchmark API and realtime services against target concurrency and data volume. — _Progress: Added k6 load scripts for patient workflows (`npm run test:load`) and telehealth + messaging readiness (`npm run test:load:telehealth`) with updated thresholds in the [Performance & Load Test Plan](./PERFORMANCE_TEST_PLAN.md); Next: schedule recurring staging runs with automated summary exports and wire Grafana dashboards into the readiness evidence bundle._

## 7. Quality Assurance & Testing

_Primary Roadmap Alignment: Phase 4_

- [~] **Automated Testing Coverage**: Achieve coverage targets for unit, integration, contract, and end-to-end tests across services. — _Progress: The auth harness now resets its in-memory stores between tests, validates register/login/logout/refresh paths (including invalid token scenarios) without external databases, gracefully skips Postgres setup when it is unavailable to eliminate noisy cleanup warnings in local/CI runs, exercises patient creation, retrieval, search, and statistics flows via the readiness server using an isolated in-memory patient service stub, automatically suppresses repeated connection stack traces when the shared Postgres instance is offline and applies the same treatment to Redis cache fallbacks, and now enforces a targeted `npm run typecheck:server` gate that compiles readiness-critical routes, middleware, and tests; Next: broaden coverage to scheduling and billing APIs while adding negative-path tests and coverage reporting._
- [x] **Test Data Management**: Provide anonymized synthetic datasets and resettable fixtures for QA environments. — _Completed: Added `npm run seed:test-data` to generate anonymized patients/providers and support automatic cleanup via `TEST_DATA_RESET` without touching production migrations._
- [ ] **Regression Suites**: Maintain smoke, functional, accessibility, and visual regression pipelines. — _Next: Configure CI jobs for smoke and accessibility testing on each merge._
- [ ] **User Acceptance Testing (UAT)**: Coordinate clinician-led UAT cycles with documented sign-off. — _Next: Define UAT entry/exit criteria and recruit clinician reviewers._
- [ ] **Release Management**: Define versioning, changelog practices, and release readiness checklists. — _Next: Draft release checklist template and align with product/CS stakeholders._

## 8. Operations & Support

_Primary Roadmap Alignment: Phase 4_

- [~] **Runbooks & SOPs**: Create playbooks for common support scenarios (account issues, sync failures, telehealth outages). — _Progress: Documented Tier 1/Tier 2 runbooks, escalation paths, and evidence expectations in `docs/RUNBOOKS_AND_SUPPORT.md`; Next: socialize with Support/Compliance leadership and capture sign-off._
- [ ] **Support Escalation**: Define tiers, SLAs, and on-call rotations with incident tracking in ITSM tools. — _Next: Select ITSM platform and document escalation matrix with response times._
- [ ] **Training & Enablement**: Provide role-based training materials, certification programs, and sandbox environments. — _Next: Inventory training needs per persona and outline sandbox data requirements._
- [ ] **Customer Feedback Loop**: Integrate NPS/CSAT collection and feature request triage into product planning. — _Next: Choose survey tooling and embed response review cadence into product rituals._
- [ ] **Documentation Portal**: Maintain up-to-date admin, clinician, and patient documentation with version control. — _Next: Stand up documentation site (e.g., Docusaurus) and migrate existing guides._

## 9. Legal & Commercial Readiness

_Primary Roadmap Alignment: Phase 5_

- [ ] **Terms of Service & Privacy Policy**: Align legal documents with actual data practices and regulatory obligations. — _Next: Engage counsel to update policy drafts once data inventory is complete._
- [ ] **Insurance & Liability Coverage**: Secure cyber liability, errors & omissions, and general liability insurance. — _Next: Collect quotes and confirm coverage limits that match contractual commitments._
- [ ] **Pricing & Contracting**: Prepare subscription models, MSAs, SLAs, and data processing agreements. — _Next: Finalize pricing tiers and collaborate with finance on unit economics._
- [ ] **Vendor Risk Management**: Establish third-party assessment program and continuous monitoring. — _Next: Draft vendor questionnaire and integrate tracking into GRC tooling._

---

Regularly review and update this checklist as regulations evolve, new features ship, or customer requirements change.
