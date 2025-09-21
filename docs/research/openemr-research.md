# OpenEMR Research Pack

## Project Snapshot
- **License:** GNU GPL (copyleft) governs redistribution and derivative work obligations.【45e6dd†L1-L12】
- **Core Scope:** Open source EHR & practice management suite featuring integrated clinical records, scheduling, billing, and internationalization with multi-platform deployment.【e034de†L1-L24】
- **FHIR/API Support:** JSON REST APIs include standard and patient-portal surfaces plus a FHIR R4 stack aligned to US Core 3.1, SMART-on-FHIR launch, and Bulk Export operations.【08c13e†L1-L34】【d0b2ea†L64-L125】

## Key Capability Areas

| Domain | Evidence |
| --- | --- |
| **Interoperability** | OIDC-backed API with granular scopes for patient, user, and system access; FHIR export/import, SMART-on-FHIR registration, bulk data exports, and provenance support.【39afae†L37-L126】【06cd12†L181-L228】【657667†L299-L329】 |
| **Billing & EDI** | Built-in tooling for X12 health-care transactions covering 837 claims, 835 remits, 270/271 eligibility, 276/277 claim status, 278 authorizations, and 999 acknowledgements via the edi_history subsystem.【48da57†L1-L14】 |
| **Security & Compliance** | TLS-required API posture, PKCE for public apps, manual OAuth client approval controls, token revocation endpoints, and explicit de-identification workflows for PHI redaction/reconstitution.【b9b11b†L362-L389】【37be7e†L1-L23】 |
| **Clinical Data Handling** | Lab report ingestion with configurable uploads, AI summarization fields, and audit-friendly pagination; FHIR export converts internal records to observation bundles.【19ab2b†L1-L120】【0d7366†L57-L112】 |

## Observations & Notable Notes
- **Bulk Data & Analytics:** Bulk FHIR exports (system, patient, group) and NDJSON delivery support payer/regulator handoffs and population analytics workflows.【d0b2ea†L70-L123】
- **SMART App Ecosystem:** Native registration UI enables third-party SMART apps surfaced directly inside the patient summary workflow, with refresh tokens and offline access policies documented.【06cd12†L214-L228】
- **Messaging & Direct Exchange:** Direct messaging integration supports MU2 objectives with phiMail connectors, audit logging, and portal/provider transmission tracking.【94aaba†L1-L34】
- **Data Governance:** De-identification utilities (shell-based) and re-identification scripts emphasize operational controls for data sharing, including manual cleanup guidance to avoid PHI leakage.【37be7e†L1-L23】

## Source References
1. OpenEMR README (feature overview).【e034de†L1-L24】
2. FHIR_README (FHIR scope & bulk export).【08c13e†L1-L34】【d0b2ea†L64-L125】
3. API_README (API authorization & security posture).【39afae†L37-L126】【06cd12†L181-L228】【657667†L299-L329】【b9b11b†L362-L389】
4. Documentation/Readme_edihistory.html (EDI transaction coverage).【48da57†L1-L14】
5. Documentation/Direct_Messaging_README.txt (Direct exchange).【94aaba†L1-L34】
6. Documentation/de_identification_readme.txt (De-identification workflows).【37be7e†L1-L23】
7. Server-side lab and FHIR modules (Telecheck current implementation snapshot).【19ab2b†L1-L120】【0d7366†L57-L112】
8. OpenEMR LICENSE (GPL obligations).【45e6dd†L1-L12】
