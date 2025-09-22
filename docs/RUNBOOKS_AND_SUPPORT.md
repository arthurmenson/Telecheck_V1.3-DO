# Telecheck Support Runbooks & Escalation Playbooks

This guide captures Tier 1/Tier 2 support standard operating procedures so customer-facing teams can triage incidents quickly while maintaining compliance requirements. Each runbook includes the purpose, prerequisites, tooling, and the canonical escalation path.

## 1. Authentication & Access Issues

- **Purpose:** Restore user access when login, MFA, or session problems are reported.
- **Primary Signals:** Login errors in support tickets, elevated 401/403 responses in metrics dashboards, SIEM alerts for failed auth bursts.
- **Prerequisites:** Access to the admin console, ability to impersonate users (with audit logging), PagerDuty access for on-call engineers.
- **Tooling:** Admin portal, structured log dashboard (`auth-*` streams), feature flag console, PagerDuty.
- **Procedure:**
  1. Confirm the user’s identity (two-factor verification) and gather timestamps/locations of failed attempts.
  2. Check the feature flag console to ensure demo bypasses and emergency lockouts are configured correctly.
  3. Review the structured auth logs for the affected user; if tokens are expired, instruct the user to reauthenticate and clear stored refresh tokens.
  4. If the user is locked out due to repeated failures, reset the lockout counter and trigger a password reset via the admin portal.
  5. When MFA problems occur, revoke the current device, issue a temporary bypass code (valid for 15 minutes), and schedule follow-up to reinstate MFA.
  6. If the issue is systemic (e.g., multiple users impacted), escalate to the on-call backend engineer and post updates in the incident channel.
- **Escalation:**
  - Tier 1 → Tier 2 Support Engineer after 15 minutes without resolution.
  - Tier 2 → On-call Backend Engineer + Security Officer if root cause is unclear or involves potential compromise.
  - Document final remediation notes in the incident tracker.

## 2. Telehealth Session Degradation

- **Purpose:** Restore video visit functionality when patients or clinicians report call failures.
- **Primary Signals:** Telehealth quality dashboard alerts, call disconnection metrics from WebRTC provider, support chat transcripts.
- **Prerequisites:** Access to observability dashboards, WebRTC vendor status page, ability to restart signaling services.
- **Tooling:** Grafana/Kibana dashboards, WebRTC provider portal, load balancer console, PagerDuty.
- **Procedure:**
  1. Confirm whether the degradation is localized (single clinic) or system-wide by checking dashboards and recent support tickets.
  2. Validate the health of signaling and TURN services; restart failing pods/tasks if health checks fail.
  3. Review recent deploys or feature flag toggles that may have impacted video services; roll back if necessary.
  4. Communicate status to affected clinicians via the broadcast channel with mitigation steps (e.g., fallback to phone consults).
  5. If degradation stems from a third-party outage, open a vendor support ticket and document case numbers.
  6. After restoration, schedule a post-incident review to capture lessons learned.
- **Escalation:**
  - Tier 1 → Tier 2 Support Engineer immediately for confirmed session failures.
  - Tier 2 → On-call DevOps + Clinical Operations lead when outages exceed 10 minutes.
  - Notify Compliance if PHI exposure is suspected.

## 3. Data Synchronization or Integration Failures

- **Purpose:** Restore FHIR/HL7 data pipelines, wearable ingestion, or billing exports when sync jobs fail.
- **Primary Signals:** Failed job alerts, backlog growth in queue metrics, data freshness alerts in analytics, customer reports of missing updates.
- **Prerequisites:** Access to integration queue dashboards, ability to replay jobs, credentials for partner APIs.
- **Tooling:** Integration monitoring dashboard, job replay CLI, secure secrets manager, partner API consoles.
- **Procedure:**
  1. Identify the affected integration (FHIR export, wearable ingestion, clearinghouse batch) and scope of impact.
  2. Inspect job logs for authentication or schema errors; rotate credentials via secrets manager if expired.
  3. Validate partner API status; if external outage, log vendor ticket and communicate ETA to stakeholders.
  4. Re-run failed batches using the replay CLI; ensure idempotency to avoid duplicate records.
  5. Verify downstream systems (analytics warehouse, billing) receive the replayed data and update the ticket with confirmation.
  6. For recurring failures, create an engineering Jira ticket with stack traces, payload samples, and timestamps for root cause analysis.
- **Escalation:**
  - Tier 1 → Data Integrations Engineer if replay attempts fail twice.
  - Data Integrations → On-call Backend Engineer when code changes are required.
  - Engage Compliance if data loss exceeds defined RPO thresholds.

## 4. Incident Communications & Postmortems

- **Purpose:** Ensure consistent stakeholder communication during incidents and capture remediation actions post-resolution.
- **Primary Signals:** Incident declarations by RPM, PagerDuty high-severity alerts, compliance notifications.
- **Prerequisites:** Incident Response Plan familiarity, access to status page tooling, comms templates.
- **Tooling:** PagerDuty, Jira/Linear, Statuspage (or equivalent), shared communication templates, evidence repository.
- **Procedure:**
  1. Upon incident declaration, assign Incident Commander, Communications Lead, and Scribe roles per the IR plan.
  2. Initiate incident channel, post summary of impact/scope, and update every 15 minutes or as new facts emerge.
  3. Maintain timeline of key events, decisions, and mitigation steps in the incident record.
  4. Once resolved, send final comms to stakeholders (internal/external) with incident summary and follow-up actions.
  5. Schedule a postmortem within 5 business days; capture contributing factors, what went well, and action items with owners/deadlines.
  6. Track remediation work in the readiness program backlog and link evidence to the compliance repository.
- **Escalation:** Incident Commander escalates to executive sponsor if customer impact exceeds SLA commitments or regulatory reporting is required.

## Roles & Escalation Matrix

| Severity                      | Initial Owner                       | Escalates To                                | Target Response | Target Resolution    |
| ----------------------------- | ----------------------------------- | ------------------------------------------- | --------------- | -------------------- |
| Sev 1 (Patient Care Blocking) | Tier 2 Support + Incident Commander | DevOps + Security + Clinical Ops leadership | 5 minutes       | 1 hour or workaround |
| Sev 2 (Major Feature Impact)  | Tier 2 Support                      | On-call Engineer + Product Owner            | 15 minutes      | 4 hours              |
| Sev 3 (Minor Degradation)     | Tier 1 Support                      | Tier 2 Support (business hours)             | 1 hour          | Next business day    |
| Sev 4 (Informational)         | Tier 1 Support                      | N/A                                         | 1 business day  | As prioritized       |

## Evidence & Audit Expectations

- Store completed runbooks, incident timelines, and remediation tickets in the compliance evidence repository.
- Ensure every escalation results in an updated checklist entry with linked artifacts.
- Review runbooks quarterly with Compliance, Security, and Support leadership to keep procedures current with platform changes.
