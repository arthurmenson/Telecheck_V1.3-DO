# Telecheck Incident Response Plan (IRP)

This incident response plan defines how Telecheck detects, triages, contains, eradicates, and recovers from security or privacy incidents affecting the platform. It aligns with HIPAA Security Rule requirements (§164.308(a)(6)) and supports contractual breach-notification commitments.

## 1. Response Team & Roles

| Role                             | Primary Responsibilities                                                                                  | Named Owners                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Incident Commander (IC)**      | Owns overall response, decision making, communication cadence, and executive updates.                     | Security Engineering Manager (primary), Readiness Program Manager (backup) |
| **Security Lead**                | Leads forensic investigation, logs & evidence preservation, root-cause analysis, and mitigation strategy. | Senior Security Engineer                                                   |
| **Compliance & Privacy Officer** | Ensures HIPAA, contractual, and regulatory obligations are met; manages legal counsel engagement.         | Compliance Lead                                                            |
| **Communications Lead**          | Crafts stakeholder messaging (customers, regulators, media) and coordinates with PR/Legal.                | Head of Communications                                                     |
| **Technical Owner(s)**           | Service-specific SMEs who implement remediation steps and validate fixes.                                 | On-call service owner(s)                                                   |
| **Scribe**                       | Maintains the incident timeline, captures decisions, artifacts, and follow-up actions in the IR tracker.  | Support Operations Analyst                                                 |

Escalation matrix, backup contacts, and on-call rotations are tracked in PagerDuty and mirrored in the Readiness Control Tower dashboard.

## 2. Severity Classification

| Severity | Definition                                                                                                                  | Initial Response Target                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **SEV0** | Confirmed breach of PHI, widespread production outage, or compromise impacting regulated data stores.                       | IC engaged within 15 minutes; executive & legal brief within 30 minutes. |
| **SEV1** | High-risk vulnerability exploited in limited scope, significant service degradation, or near miss involving PHI.            | IC engaged within 30 minutes; stakeholders briefed within 60 minutes.    |
| **SEV2** | Security incident with limited blast radius, suspicious activity requiring investigation, or partner notification required. | Response initiated within 2 hours; update cadence every 4 hours.         |
| **SEV3** | Low-risk alerts, false positives requiring validation, or hygiene issues needing follow-up.                                 | Response initiated within 1 business day.                                |

## 3. Standard Response Workflow

1. **Detection & Intake**
   - Alerts originate from SIEM, IDS/WAF, automated monitoring, customer reports, or employee escalation.
   - All suspected incidents are logged in the Incident Tracker (Jira IR project) with severity placeholder and assigned IC.

2. **Triage & Classification**
   - IC and Security Lead validate indicators, scope affected systems, and confirm severity.
   - Preserve volatile evidence (logs, snapshots) immediately; invoke forensic tooling (AWS CloudTrail, GuardDuty, SIEM queries).

3. **Containment**
   - Apply least-disruptive containment measures first (WAF rule updates, IAM credential revocation, feature flag toggles).
   - For SEV0/SEV1 events, convene the response bridge (Zoom) and assign dedicated comms channel (#incident-<ID>).

4. **Eradication & Recovery**
   - Remove malicious artifacts, patch vulnerabilities, rotate credentials, and restore affected services.
   - Validate recovery with automated tests and targeted smoke/regression suites before closing containment steps.

5. **Notification & Reporting**
   - Compliance Officer manages notification obligations (patients, partners, regulators) based on incident type and jurisdictional requirements.
   - Communications Lead prepares customer updates, status page notices, and executive briefs; Legal reviews all external messaging.

6. **Post-Incident Review**
   - Conduct a blameless postmortem within 5 business days capturing timeline, root cause, contributing factors, and remediation backlog.
   - Track follow-up actions in Jira with clear owners, due dates, and evidence attachments; update readiness checklist status.

## 4. Communication Cadence

- **Internal Bridge:** Dedicated Zoom bridge with chat log archived to the incident ticket. Updates shared every 30 minutes for SEV0/SEV1, hourly for SEV2.
- **Executive Brief:** IC delivers succinct updates to executive leadership at the same cadence as the internal bridge or ad-hoc for critical pivots.
- **Customer Communications:** Status page, customer success emails, and support macros prepared by the Communications Lead once Legal approves messaging.
- **Regulatory Notifications:** Compliance Officer coordinates with legal counsel to submit HIPAA/HITECH notifications within mandated timeframes (≤60 days for PHI breaches).

## 5. Tooling & Evidence Preservation

- **Monitoring:** Datadog (APM & infrastructure), AWS CloudWatch metrics/logs, GuardDuty, WAF logs streamed to S3/SIEM.
- **Case Management:** Jira IR project templates, Confluence post-incident reports, Slack channel exports.
- **Forensics:** AWS snapshot automation, VPC flow logs, container runtime dumps, and database point-in-time recovery snapshots.
- **Evidence Handling:** All artifacts stored in the secure IR evidence bucket with immutable retention policies; access limited to Security Lead and Compliance Officer.

## 6. Tabletop & Readiness Schedule

| Quarter | Exercise                                        | Owner              | Notes                                                                             |
| ------- | ----------------------------------------------- | ------------------ | --------------------------------------------------------------------------------- |
| Q1      | Phishing-induced credential compromise tabletop | Security Lead      | Validate MFA enforcement, credential rotation, and comms flow.                    |
| Q2      | Ransomware attempt on EHR document storage      | Compliance Officer | Test backup restoration, legal notification, and patient communication templates. |
| Q3      | API data exfiltration via partner integration   | Incident Commander | Exercise WAF rule deployment, data-loss prevention alerts, and partner outreach.  |
| Q4      | Telehealth outage due to upstream dependency    | Operations Lead    | Validate disaster recovery, patient rescheduling workflows, and support macros.   |

Tabletop outcomes feed the remediation backlog and readiness checklist. Missed objectives create follow-up tickets with due dates before the next quarter’s exercise.

## 7. Next Steps & Maintenance

- Publish the IRP in the Readiness Control Tower and train all on-call engineers by end of the current sprint.
- Automate incident ticket templates in Jira and integrate PagerDuty incident webhooks for rapid bridge creation.
- Schedule the first tabletop (Q1 scenario) and capture evidence of completion.
- Review and update this plan at least annually or after any SEV0/SEV1 event.

---

For questions or updates, contact the Incident Commander or Compliance Officer. Store signed copies and revisions in the compliance evidence repository.
