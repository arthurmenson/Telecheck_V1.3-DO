# ONC Certification Gap Assessment

This document captures Telecheck's progress toward the ONC Health IT Certification Program (2015 Edition Cures Update) and highlights the implementation and evidence gaps that must be closed before seeking certification.

## Summary of Findings

- Telecheck delivers strong foundations in patient demographics, vitals, clinical documentation, and patient access but lacks certified e-prescribing, clinical quality measurement, and standardized APIs that are mandatory for certification.
- Security, privacy, and transparency controls (e.g., audit logging, access reporting, consent management) require additional automation and policy evidence to satisfy certification test scripts.
- Substantial interoperability work (FHIR R4, bulk data export, USCDI v1 coverage) remains outstanding, as do public health interfaces for immunization and syndromic surveillance reporting.

## Assessment Methodology

1. Reviewed ONC 2015 Edition Cures Update certification criteria by capability family (e.g., §170.315(a) Clinical Processes, §170.315(b) Care Coordination).
2. Mapped each criterion to Telecheck features, infrastructure, policies, or external services.
3. Identified whether Telecheck currently meets the requirement, has a partial implementation, or lacks coverage.
4. Recorded recommended actions, dependencies, and potential vendors or service integrations.
5. Prioritized remediation based on regulatory criticality and implementation lead time.

## Criteria Status Overview

| Criterion | Description | Status | Evidence / Gaps | Recommended Next Steps |
| --- | --- | --- | --- | --- |
| §170.315(a)(1) CPOE – Medications | Support ordering medications via CPOE with structured data capture. | ❌ Gap | Telecheck tracks medications but lacks certified CPOE workflows and e-prescribing network connectivity. | Integrate certified eRx network (e.g., Surescripts), implement CDS checks, capture order audit trails. |
| §170.315(a)(2) CPOE – Laboratory | Order lab tests and incorporate results. | ⚠️ Partial | Lab ordering UI exists; however, standardized ordering messages/results (LOINC/HL7) are missing. | Implement LOINC-coded ordering, HL7 v2 ORU processing, and structured results reconciliation. |
| §170.315(a)(3) CPOE – Diagnostic Imaging | Order and track imaging studies. | ❌ Gap | No imaging order workflows present. | Extend ordering service with imaging modalities, integrate DICOM/RIS partners. |
| §170.315(a)(4) Drug-Drug, Drug-Allergy Interaction Checks | Provide real-time interaction checking with governance. | ⚠️ Partial | UI references interaction checking but lacks integrated drug database and governance policies. | License drug knowledge base, implement governance logs, expose clinician override workflow. |
| §170.315(a)(5) Demographics | Capture demographics including race, ethnicity, language, sexual orientation, gender identity. | ⚠️ Partial | Basic demographics captured; missing extended SOGI fields and structured vocabularies. | Extend data model and UI, map to CDC/OMB vocabularies. |
| §170.315(a)(6) Problem List | Maintain active problem list with SNOMED CT coding. | ❌ Gap | No structured problem list feature. | Implement diagnosis module with SNOMED CT terminology services. |
| §170.315(a)(7) Medication List | Maintain medication list with RxNorm coding. | ⚠️ Partial | Medications tracked without RxNorm-coded entries. | Add RxNorm vocab integration and reconciliation workflows. |
| §170.315(a)(8) Medication Allergy List | Maintain allergy list with coded entries. | ❌ Gap | Allergies not represented in schema. | Add allergy data model, UI, and SNOMED/UNII coding. |
| §170.315(a)(9) Clinical Decision Support | Deliver rule-based CDS with intervention tracking. | ⚠️ Partial | AI insights exist but lack rule management, override logging, or evidence linking. | Implement CDS rules engine with clinician acknowledgement logging. |
| §170.315(a)(10) Drug-Formulary Checks | Provide formulary checks for medication orders. | ❌ Gap | No formulary integration. | Integrate plan-specific formulary service. |
| §170.315(a)(11) Smoking Status | Record smoking status per standard codes. | ❌ Gap | Social history not implemented. | Add structured social history module with LOINC-coded responses. |
| §170.315(a)(12) Family Health History | Record family health history. | ❌ Gap | Feature absent. | Implement data structures and UI for family history. |
| §170.315(a)(13) Patient-Specific Education | Provide context-aware education materials. | ⚠️ Partial | Wellness education exists but lacks coded triggers and metadata. | Integrate knowledge base with coded context linking (SNOMED/LOINC). |
| §170.315(a)(14) Implantable Device List | Record UDI data for implantable devices. | ❌ Gap | No implantable device tracking. | Add UDI capture, scanning workflows, and FDA GUDID lookup. |
| §170.315(a)(15) Social, Psychological, and Behavioral Data | Capture additional social determinants. | ❌ Gap | No structured SDOH capture. | Implement PRAPARE or Gravity Project data elements. |
| §170.315(a)(16) Electronic Medication Administration Record (eMAR) | Document medication administration events. | ❌ Gap | No eMAR feature. | Build MAR timeline and barcode scanning integrations. |
| §170.315(a)(17) Secure Messaging | Enable patient-provider secure messaging. | ✅ Ready | Secure messaging exists with audit logging and RBAC. | Harden encryption policies and retention. |
| §170.315(a)(18) Automated Numerator Recording | Automate quality measure numerator calculations. | ❌ Gap | No CQMs implemented. | Integrate quality measure engine (eCQMs). |
| §170.315(a)(19) Automated Measure Calculation | Automate numerator/denominator calculations. | ❌ Gap | Same as above. | Same action as (a)(18). |
| §170.315(a)(20) Clinical Quality Measures – Filter | Provide filtering for measure calculations. | ❌ Gap | No CQM tooling. | Depends on eCQM engine. |
| §170.315(b)(1) Transitions of Care | Create, send, and receive C-CDA documents. | ❌ Gap | No C-CDA generation/ingestion. | Implement CCD composer/parser, integrate DirectTrust HISP. |
| §170.315(b)(2) Clinical Information Reconciliation | Support reconciliation of meds, allergies, problems. | ❌ Gap | Underlying modules missing. | Implement per modules above. |
| §170.315(b)(3) Electronic Prescribing | Send prescriptions to pharmacies, receive fill status. | ❌ Gap | No eRx integration. | Integrate certified e-prescribing vendor. |
| §170.315(b)(6) Data Export | Provide single/multi-patient export in C-CDA or FHIR. | ⚠️ Partial | FHIR export endpoints exist but uncertified; bulk export lacking. | Expand to USCDI v1 coverage, implement asynchronous bulk export. |
| §170.315(c)(1) Clinical Quality Measures – Record and Export | Record, calculate, export CQMs. | ❌ Gap | No CQM support. | Adopt CQM engine, align data capture. |
| §170.315(d) Privacy & Security | Access control, audit, integrity, encryption, authentication. | ⚠️ Partial | RBAC, audit logging, and SIEM integration underway; lacks end-user disclosures, integrity verification, and automated access reports. | Complete SIEM integration, add tamper-proof logging, publish access reports, implement multi-factor auth with SSO. |
| §170.315(e)(1) View/Download/Transmit to Third Party | Patient portal access and export. | ⚠️ Partial | Patient portal exists, but download/transmit workflows not verified. | Implement direct download, API export, and third-party transmit workflows with consent. |
| §170.315(f) Public Health Reporting | Immunization, syndromic surveillance, lab reporting. | ❌ Gap | No public health interfaces. | Integrate state registries and HL7 v2 reporting feeds. |
| §170.315(g)(7)-(10) API for Patient and Population Services | FHIR R4/SMART APIs with bulk data support. | ⚠️ Partial | FHIR-friendly exports but lacking SMART-on-FHIR auth, Bulk FHIR. | Implement OAuth 2.0 SMART profile, finalize FHIR resource coverage, add $export endpoints. |

## Cross-Cutting Gaps

- **Governance & Documentation**: Need formal policies for CDS governance, patient education curation, security risk analysis, and transparency statements.
- **Testing & Certification Evidence**: Establish traceability matrix linking features to certification criteria, plus automated tests mirroring ONC test scripts.
- **Vendor Partnerships**: Select clearinghouse, e-prescribing, drug knowledge base, and public health gateways aligned with certification requirements.

## Recommended Action Plan

1. **Foundational Data Models** – Prioritize implementation of problem lists, allergies, social history, and structured vocabularies (SNOMED CT, RxNorm, LOINC, USCDI v1) to unlock downstream certification items.
2. **Interoperability Investments** – Build FHIR R4 endpoints with SMART-on-FHIR authorization, C-CDA generation, and Direct Secure Messaging to satisfy care coordination requirements.
3. **Medication & Order Management** – Integrate a certified e-prescribing network, formulary checks, and eMAR workflows while adopting drug-interaction knowledge bases.
4. **Quality Measures & Reporting** – Adopt or build a CQM engine capable of recording, calculating, and exporting eCQMs with automated numerator/denominator tracking.
5. **Public Health & Reporting Interfaces** – Implement immunization registry, syndromic surveillance, and electronic case reporting feeds per jurisdictional requirements.
6. **Security & Transparency Enhancements** – Complete SIEM integrations, publish access report tooling, adopt multi-factor authentication/SSO, and finalize incident response and risk analysis documentation.
7. **Certification Readiness Program** – Create a certification traceability matrix, assign owners, schedule mock certification tests, and engage an ONC-ATL for pre-assessment.

## Next Steps

- Review and approve this assessment with Compliance, Clinical Operations, and Product leadership.
- Translate each gap into Jira epics linked to checklist items (e.g., `PRC-ONC-a1`, `PRC-ONC-b1`).
- Establish timelines aligned with the production readiness roadmap, prioritizing regulatory blockers before commercial launch.
- Revisit the assessment quarterly or upon major feature releases to ensure certification alignment remains current.
